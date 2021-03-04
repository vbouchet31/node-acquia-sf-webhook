const sql = require('../db')

const Subscription = function(subscription) {
  this.token = subscription.token
}

Subscription.create = async (subscription) => {
  const result = await sql.query(`INSERT INTO subscriptions SET ?`, subscription)

  return result[0]
}

Subscription.getFromToken = async (token) => {
  const result = await sql.query('SELECT * FROM subscriptions WHERE token = ?', [token])

  return result[0][0]
}

module.exports = Subscription
