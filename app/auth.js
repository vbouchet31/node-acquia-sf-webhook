const Subscription = require('./models/subscription.model')

// This validates the token exists and it adds the related subscription to the
// request so it can be used in later process.
const clientTokenValidation = async (req, res, next) => {
  let token = req.query.token

  if (!token) {
    return res.status(400).send({
      status: false,
      response: 'Token is mandatory.'
    })
  }

  try {
    await Subscription.getFromToken(token).then(subscription => {
      if (subscription) {
        req.subscription = subscription
        next()
        return
      }

      return res.status(400).send({
        status: false,
        response: 'Token is invalid.'
      })
    })
  }
  catch (error) {
    return res.status(400).send({
      status: false,
      response: 'Token is invalid.'
    })
  }
}

module.exports = clientTokenValidation
