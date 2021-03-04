const application = require('../controllers/application.controller')

const auth = require('../auth')
const access = require('../access')

module.exports = app => {
  app.post('/api/v1/applications', auth, application.create)
  app.get('/api/v1/applications', auth, application.list)
  app.get('/api/v1/applications/:aid', auth, access.validateApplication, application.get)
  app.post('/api/v1/applications/:aid', auth, access.validateApplication, application.update)
  app.delete('/api/v1/applications/:aid', auth, access.validateApplication, application.delete)
}
