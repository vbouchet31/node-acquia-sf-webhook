const subscription = require('../controllers/subscription.controller')
const auth = require('../auth')

module.exports = app => {
  app.post('/api/v1/register', subscription.register)
}
