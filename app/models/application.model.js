const sql = require('../db')

const Application = function(application) {
  this.sid = application.sid
  this.env = application.env
  this.subscription = application.subscription
  this.token = application.token
  this.username = application.username
}

Application.get = async (aid) => {
  const result = await sql.query('SELECT * FROM applications WHERE aid = ?', [aid])

  return result[0][0]
}

Application.list = async () => {
  const result = await sql.query('SELECT * FROM applications')

  return result[0]
}

Application.listFromSid = async (sid) => {
  const result = await sql.query('SELECT * FROM applications WHERE sid = ?', [sid])

  return result[0]
}

Application.create = async (application) => {
  const result = await sql.query('INSERT INTO applications SET ?', application)

  return result[0]
}

Application.update = async (aid, application) => {
  const result = await sql.query('UPDATE applications SET env = ?, subscription = ?, token = ?, username = ? WHERE aid = ?',
  [application.env, application.subscription, application.token, application.username, aid])

  return result[0]
}

Application.delete = async (aid) => {
  const result = await sql.query('DELETE FROM applications WHERE aid = ?', [aid])

  return result[0]
}

module.exports = Application;
