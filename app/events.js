const cache = require('./events/cache')
const release = require('./events/release')
const update = require('./events/update')
const varnish = require('./events/varnish')

const events = {}

events.eventTypes = [cache, release, update, varnish]

events.execute = function (taskNow, taskBefore) {
  for (const eventType of events.eventTypes) {
    if (eventType.classes.includes(taskNow.class)) {
      for (const event of eventType.events) {
        eventName = eventType[event](taskNow, taskBefore)

        if (typeof eventName !== 'undefined') {
          return eventName
        }
      }
    }
  }

  return false
}

module.exports = events
