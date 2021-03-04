const Webhook = require('../models/webhook.model');

exports.list = (req, res) => {
  Webhook.list(req.params.aid).then(webhooks => {
    webhooks.map(webhook => {
      delete webhook.aid
    })
    res.status(200).json(webhooks)
  })
}

exports.get = (req, res) => {
  Webhook.get(req.params.wid).then(webhook => {
    if (!webhook) {
      res.status(422).json({
        message: `Unprocessable Entity: Could not load the webhook with id ${req.params.wid}.`
      })
    }
    else {
      delete webhook.aid
      res.status(200).json(webhook)
    }
  })
}

exports.create = (req, res) => {
  let webhook = new Webhook({
    aid: req.params.aid,
    events: req.body.events,
    endpoint: req.body.endpoint,
    status: req.body.status
  })

  Webhook.create(webhook).then(data => {
    if (!data) {
      res.status(422).json({
        message: 'Impossible to create the webhook.'
      })
    }
    else {
      delete webhook.aid
      webhook.wid = data.insertId
      res.status(200).json(webhook)
    }
  })
}

exports.update = (req, res) => {
  let webhook = new Webhook({
    events: req.body.events,
    endpoint: req.body.endpoint,
    status: req.body.status
  })

  Webhook.update(req.params.wid, webhook).then(data => {
    if (!data) {
      res.status(422).json({
        message: 'Impossible to update the webhook.'
      })
    }
    else {
      webhook.wid = req.params.wid
      res.status(200).json(webhook)
    }
  })
}

exports.delete = (req, res) => {
  Webhook.delete(req.params.wid).then(data => {
    if (!data) {
      res.status(422).json({
        message: 'Impossible to delete the webhook.'
      })
    }
    else {
      res.status(200).json({
        message: 'The webhook has been deleted.'
      })
    }
  })
}
