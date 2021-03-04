const Application = require('./models/application.model')
const Webhook = require('./models/webhook.model')

let access = {}

// This validate the given aid belongs the subscription attached to the token.
access.validateApplication = async (req, res, next) => {
  Application.get(req.params.aid).then(application => {
    if (application && application.sid == req.subscription.sid) {
      next()
      return
    }

    return res.status(400).send({
      status: false,
      response: 'Invalid application id.'
    })
  })
}

// This validate the given webhook belongs the given application. The validation
// of the application happens in validateApplication().
access.validateWebhook = async (req, res, next) => {
  Webhook.get(req.params.wid).then(webhook => {
    if (webhook && webhook.aid == req.params.aid) {
      next()
      return
    }

    return res.status(400).send({
      status: false,
      response: 'Invalid webhook id.'
    })
  })
}

module.exports = access
