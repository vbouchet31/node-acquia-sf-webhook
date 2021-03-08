const fetch = require('node-fetch')
const iterator = require('batch-iterator')
const sf = require('node-acquia-sf-client')

const acsf = require('./app/acsf')
const events = require('./app/events')

const BATCH_SIZE = process.env.BATCH_SIZE || 5

const sleep = async function (duration) {
  await new Promise(r => setTimeout(r, duration));
}

let job = {}

job.process = async (application) => {
  return new Promise((resolve, reject) => {
    (async() => {
      // TO BE REMOVED, ONLY TO SIMULATE SOME PROCESSING TIME.
      //let execTime = Math.random()*10000
      //console.log(new Date().toISOString() + ' - Processing application ' + application.aid + ' in ' + execTime + 'ms.')
      //await sleep(execTime)

      const sfClient = new sf.Client({
        env: application.env,
        subscription: application.subscription,
        username: application.username,
        token: application.token
      })

      let tasks = []
      let timestamp = application.previousTimestamp

      // If both previous variables are empty, that means it is the first
      // execution. We can't compare anything so we only fetch the first 5 pages
      // of tasks we take a snapshot of the ongoing ones to be compared during
      // the next execution.
      if (!application.previousTasks.length && !application.previousTimestamp) {
        await iterator([...Array(5).keys()], BATCH_SIZE, function(page) {
          return sfClient.api.tasks.list({ page: page })
        }).then(responses => {
          responses.forEach(response => {
            tasks = tasks.concat(acsf.filterGenericTasks(response))
          })
        })

        // Determine the currentExecutionTime by finding the most recent timestamp
        // in the list of tasks.
        timestamp = acsf.getMostRecentTaskTimestamp(tasks)

        // Filter out all the completed tasks.
        tasks = tasks.filter(task => {
          return task.completed == '0'
        })

        resolve({ aid: application.aid, tasks: tasks, timestamp: timestamp })
        return
      }

      // If the previous tasks array is empty, that means all the tasks was
      // completed at that time. In that case, we need to fetch all the tasks
      // which have been added since that time.
      if (!application.previousTasks.length) {
        tasks = await sfClient.helper.tasks.getAllTasksUntilAttr('added', application.previousTimestamp, '<')
      }
      else {
        // Find the oldest (smaller) taskId in the not completed tasks.
        let oldestTask
        application.previousTasks.forEach(task => {
          if (oldestTask === undefined || task.id < oldestTask.id) {
            oldestTask = task
          }
        })

        // Get all the tasks since the oldest task.
        tasks = await sfClient.helper.tasks.getAllTasksSinceTask(oldestTask.id)
      }

      // Filter out the generic tasks which may be considered demon.
      tasks = acsf.filterGenericTasks(tasks)

      // Keep only the tasks which are not completed or which have completed
      // since the previous execution.
      tasks = tasks.filter(task => {
        return task.completed == '0' || task.completed > application.previousTimestamp
      })

      // Determine the currentExecutionTime by finding the most recent timestamp
      // in the list of tasks.
      timestamp = tasks.length ? acsf.getMostRecentTaskTimestamp(tasks) : application.previousTimestamp

      // TODO: Compare tasks and application.previousTasks to get the ones which changed.
      let updatedTasks = []
      tasks.forEach(task => {
        let pushed = false
        application.previousTasks.forEach(previousTask => {
          if (task.id == previousTask.id) {
            updatedTasks.push({
              'previous': previousTask,
              'now': task
            })
            pushed = true
          }
        })

        // If we have not found any related task in the previous list, that
        // means it is a new task.
        if (!pushed) {
          updatedTasks.push({
            'previous': false,
            'now': task
          })
        }
      })

      updatedTasks.forEach(updatedTask => {
        let payload = events.execute(updatedTask.now, updatedTask.previous)

        if (payload) {
          application.webhooks.forEach(webhook => {
            if (webhook.events.includes(payload.event)) {
              fetch(webhook.endpoint, {
                headers: {
                  'User-Agent': 'node-acquia-sf-client',
                  'Content-type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify(payload)
              })
            }
          })
        }
      })

      // Filter out all the completed tasks before saving these for the next
      // execution.
      tasks = tasks.filter(task => {
        return task.completed == '0'
      })

      resolve({ aid: application.aid, tasks: tasks, timestamp: timestamp })
      return
    })();
  })
}

module.exports = job