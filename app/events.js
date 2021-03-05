const cache = require('./events/cache')
const release = require('./events/release')

const events = {}

events.eventTypes = [cache, release]

events.execute = function (taskNow, taskBefore) {
  let payload = false

  // @TODO: Check to stop the loops as soon as a payload is returned.
  events.eventTypes.forEach(eventType => {
    if (!payload) {
      if (eventType.classes.includes(taskNow.class)) {
        eventType.events.forEach(event => {
          if (!payload) {
            payload = eventType[event](taskNow, taskBefore)
          }
        })
      }
    }
  })

  return payload
}

module.exports = events
