const Application = require('../models/application.model');

// Check if can create a helper method to sanitize the application objects
// before returning (remove sid, anonymize the token, ...)

exports.create = (req, res) => {
  let application = new Application({
    sid: req.subscription.sid,
    env: req.body.env,
    subscription: req.body.subscription,
    token: req.body.token,
    username: req.body.username
  })

  Application.create(application).then(data => {
    if (!data) {
      res.status(422).json({
        message: 'Impossible to create the application.'
      })
    }
    else {
      delete application.sid
      application.aid = data.insertId
      application.token = application.token.substr(0, 5) + '*******************************' + application.token.substr(35)
      res.status(200).json(application)
    }
  })
}

exports.list = (req, res) => {
  Application.listFromSid(req.subscription.sid).then(applications => {
    applications.map(application => {
      delete application.sid
      application.token = application.token.substr(0, 5) + '*******************************' + application.token.substr(35)
    })
    res.status(200).json(applications)
  })
}

exports.get = (req, res) => {
  Application.get(req.params.aid).then(application => {
    if (!application) {
      res.status(422).json({
        message: `Unprocessable Entity: Could not load the application with id ${req.params.aid}.`
      })
    }
    else {
      delete application.sid
      application.token = application.token.substr(0, 5) + '*******************************' + application.token.substr(35)
      res.status(200).json(application)
    }
  })
}

exports.update = (req, res) => {
  let application = new Application({
    sid: req.subscription.sid,
    env: req.body.env,
    subscription: req.body.subscription,
    token: req.body.token,
    username: req.body.username
  })

  Application.update(req.params.aid, application).then(data => {
    if (!data) {
      res.status(422).json({
        message: 'Impossible to update the application.'
      })
    }
    else {
      delete application.sid
      application.aid = req.params.aid
      application.token = application.token.substr(0, 5) + '*******************************' + application.token.substr(35)
      res.status(200).json(application)
    }
  })
}

exports.delete = (req, res) => {
  Application.delete(req.params.aid).then(data => {
    if (!data) {
      res.status(422).json({
        message: 'Impossible to delete the application.'
      })
    }
    else {
      res.status(200).json({
        message: 'The application has been deleted'
      })
    }
  })
}
