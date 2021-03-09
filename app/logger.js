let logger = {}

logger = require('console-log-level')({
  prefix: function(level) {
    return new Date().toISOString() + ' -'
  },
  level: process.env.LOG_LEVEL || 'trace'
})

module.exports = logger
