const webhook = require('../controllers/webhook.controller')

const auth = require('../auth')
const access = require('../access')

module.exports = app => {
  app.post('/api/v1/applications/:aid/webhooks', auth, access.validateApplication, webhook.create)
  app.get('/api/v1/applications/:aid/webhooks', auth, access.validateApplication, webhook.list)
  app.get('/api/v1/applications/:aid/webhooks/:wid', auth, access.validateApplication, access.validateWebhook, webhook.get)
  app.post('/api/v1/applications/:aid/webhooks/:wid', auth, access.validateApplication, access.validateWebhook, webhook.update)
  app.delete('/api/v1/applications/:aid/webhooks/:wid', auth, access.validateApplication, access.validateWebhook, webhook.delete)
}
