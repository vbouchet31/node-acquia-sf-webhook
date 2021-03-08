const sql = require('../db')

const Webhook = function(webhook) {
  this.aid = webhook.aid
  this.events = webhook.events
  this.options = webhook.options
  this.endpoint = webhook.endpoint
  this.status = webhook.status || true
}

Webhook.get = async (wid) => {
  const result = await sql.query('SELECT * FROM webhooks WHERE wid = ?', [wid])

  return result[0][0]
}

Webhook.list = async (aid) => {
  const result = await sql.query('SELECT * FROM webhooks WHERE aid = ?', [aid])

  return result[0]
}

Webhook.create = async (webhook) => {
  const result = await sql.query('INSERT INTO webhooks SET aid = ?, events = ?, options = ?, endpoint = ?, status = ?',
  [webhook.aid, JSON.stringify(webhook.events), JSON.stringify(webhook.options), webhook.endpoint, webhook.status])

  return result[0]
}

Webhook.update = async (wid, webhook) => {
  const result = await sql.query('UPDATE webhooks SET events = ?, options = ?, endpoint = ?, status = ? WHERE wid = ?',
  [JSON.stringify(webhook.events), JSON.stringify(webhook.options), webhook.endpoint, webhook.status, wid])

  return result[0]
}

Webhook.delete = async (wid) => {
  const result = await sql.query('DELETE FROM webhooks WHERE wid = ?', [wid])

  return result[0]
}

module.exports = Webhook
