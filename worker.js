const iterator = require('batch-iterator');

const job = require('./job')
const logger = require('./app/logger')
const sql = require('./app/db')

const PERIOD = process.env.PERIOD || 1
const BATCH_SIZE = process.env.BATCH_SIZE || 5

const sleep = async function (duration) {
  await new Promise(r => setTimeout(r, duration));
}

async function worker() {
  let cache = []

  while (true) {
    let loopStart = Date.now()

    logger.info('Worker execution started.')

    // Get all the webhooks which must be processed.
    let webhooks = await sql.query('SELECT * FROM webhooks WHERE status = 1').then(result => {
      return result[0]
    })

    // Get all the application ids which must be fetched.
    let aids = []
    webhooks.forEach(webhook => { aids.push(webhook.aid) })
    aids = [ ...new Set(aids)]

    // Get all the application details.
    let applications = await sql.query('SELECT * FROM applications WHERE aid IN (?)', [aids]).then(result => {
      return result[0]
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
    let timeBeforeNext = PERIOD*60*1000 - (loopEnd - loopStart)
    if (timeBeforeNext < 5000) {
      logger.warning('Next worker execution in ' + timeBeforeNext + 'ms. May need to add more ressource to shorten the worker execution time.')
    }
    await sleep(timeBeforeNext)
  }
}

worker()
