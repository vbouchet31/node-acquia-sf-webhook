const cache = require('./events/cache')
const release = require('./events/release')
const varnish = require('./events/varnish')

const events = {}

events.eventTypes = [cache, release, varnish]

events.execute = function (taskNow, taskBefore) {
  let eventName = false

  // @TODO: Check to stop the loops as soon as an eventName is returned.
  events.eventTypes.forEach(eventType => {
    if (!eventName) {
      if (eventType.classes.includes(taskNow.class)) {
        eventType.events.forEach(event => {
          if (!eventName) {
            eventName = eventType[event](taskNow, taskBefore)
          }
        })
      }
    }
  })

  return eventName
}

module.exports = events
