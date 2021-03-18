const fetch = require('node-fetch')
const iterator = require('batch-iterator')

const job = require('./job')
const logger = require('./app/logger')
const sql = require('./app/db')

const PERIOD = process.env.PERIOD || 60
const BATCH_SIZE = process.env.BATCH_SIZE || 5

const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME
const HEROKU_API_KEY = process.env.HEROKU_API_KEY
const HEROKU_MAX_LOOP = process.env.HEROKU_MAX_LOOP

const sleep = async function (duration) {
  await new Promise(r => setTimeout(r, duration));
}

async function worker() {
  let cache = []
  let loopCount = 0

  // In case we are balancing load over various Heroku applications, kill the
  // worker of the balancing app.
  if (HEROKU_APP_NAME && HEROKU_API_KEY) {
    logger.info('Killing the balancing app worker before starting.')
    await fetch(
      `https://api.heroku.com/apps/${ HEROKU_APP_NAME }/formation/worker`,
      {
        headers: {
          'Authorization': `Bearer ${ HEROKU_API_KEY }`,
          'Content-type': 'application/json',
          'Accept': 'application/vnd.heroku+json; version=3'
        },
        method: 'PATCH',
        body: JSON.stringify({'quantity': 0})
      }
    )
  }

  while (true) {
    let loopStart = Date.now()

    logger.info('Worker execution started.')

    // Get all the webhooks which must be processed.
    let webhooks = await sql.getTable('webhooks').then(results => {
      return results.filter(result => {
        return result.status == 1
      })
    })

    // Get all the application ids which must be fetched.
    let aids = []
    webhooks.forEach(webhook => { aids.push(webhook.aid) })
    aids = [ ...new Set(aids)]

    // Get all the application details.
    let applications = await sql.getTable('applications').then(results => {
      return results.filter(result => {
        return aids.includes(result.aid)
      })
    })

    // Enrich the application objects with their related webhooks.
    applications.forEach(application => {
      application.webhooks = webhooks.filter(webhook => {
        return webhook.aid == application.aid
      })
    })

    // Enrich the application objects with their related ongoing tasks from
    // previous worker execution.
    applications.forEach(application => {
      application.previousTasks = []
      application.previousTimestamp = 0
      cache.forEach(item => {
        if (item.aid == application.aid) {
          application.previousTasks = item.tasks
          application.previousTimestamp = item.timestamp
        }
      })
    })

    // Process all applications by batches.
    await iterator(applications, BATCH_SIZE, function(application) {
      return job.process(application)
    }).then(responses => {
      cache = responses
    })

    // Calculate how long we should wait before running the loop again.
    logger.info('Worker execution completed.')
    let loopEnd = Date.now()
    let timeBeforeNext = PERIOD*1000 - (loopEnd - loopStart)
    if (timeBeforeNext <= 0.1*PERIOD) {
      logger.warn('Next worker execution in ' + timeBeforeNext + 'ms. May need to add more ressource to shorten the worker execution time.')
    }
    await sleep(timeBeforeNext)

    // In case we are balancing load over various Heroku applications and that
    // we have reached the limit here, he start the worker of the balancing app.
    // The balancing app will be responsible of killing this current worker.
    // We are adding an extra pause to give enough time for the balancing worker
    // to start and kill us.
    loopCount++
    if (HEROKU_APP_NAME && HEROKU_API_KEY && HEROKU_MAX_LOOP <= loopCount) {
      logger.info('Starting the second app worker.')

      await fetch(
        `https://api.heroku.com/apps/${ HEROKU_APP_NAME }/formation/worker`,
        {
          headers: {
            'Authorization': `Bearer ${ HEROKU_API_KEY }`,
            'Content-type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3'
          },
          method: 'PATCH',
          body: JSON.stringify({'quantity': 1})
        }
      )
      await sleep(60000)
      return
    }
  }
}

worker()
