const sql = require('../db')

const Webhook = function(webhook) {
  this.aid = webhook.aid
  this.events = webhook.events
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
  /*(err, res) => {
    if (err) {
      result(null, err);
      return;
    }

    res.map(webhook => {
      webhook.events = JSON.parse(webhook.events)
    })

    result(null, res);
  })*/
}

Webhook.create = async (webhook) => {
  const result = await sql.query('INSERT INTO webhooks SET aid = ?, events = ?, endpoint = ?, status = ?',
  [webhook.aid, JSON.stringify(webhook.events), webhook.endpoint, webhook.status])

  return result[0]
}

Webhook.update = async (wid, webhook) => {
  const result = await sql.query('UPDATE webhooks SET events = ?, endpoint = ?, status = ? WHERE wid = ?',
  [JSON.stringify(webhook.events), webhook.endpoint, webhook.status, wid])

  return result[0]
}

Webhook.delete = async (wid) => {
  const result = await sql.query('DELETE FROM webhooks WHERE wid = ?', [wid])

  return result[0]
}

module.exports = Webhook
