const Subscription = require('../models/subscription.model');

exports.register = (req, res) => {
  const subscription = new Subscription({
    token: require('crypto').randomBytes(20).toString('hex'),
  });

  Subscription.create(subscription, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the subscription."
      });
    }

    res.status(200).json(data)
  })
};
