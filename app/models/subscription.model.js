const sql = require('../db')

const Subscription = function(subscription) {
  this.token = subscription.token
}

Subscription.create = async (subscription, result) => {
  sql.query(`INSERT INTO subscriptions SET ?`, subscription, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }

    result(null, { sid: res.insertId, ...subscription });
  })
}

Subscription.getFromToken = async (token) => {
  const result = await sql.query('SELECT * FROM subscriptions WHERE token = ?', [token])

  return result[0][0]
}

/*Subscription.getFromToken = async (token, result) => {
  try {
    sql.query('SELECT * FROM subscriptions WHERE token = ?',
    [token],
    (err, res) => {
      if (res && res.length) {
        result(null, res[0])
        return
      }

      result({ kind: "not_found" }, null);
      return
    })
  }
  catch (error) {
    result({ kind: "not_found" }, null);
    return
  }
}*/

module.exports = Subscription
