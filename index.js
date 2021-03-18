const express = require('express')
const logger = require('./app/logger')

const PORT = process.env.PORT || 5000

let app = express()
  .use(express.json())
  .use(function(req, res, next) {
    let message = req.method + ' ' + req.path
    message += Object.keys(req.body).length ? ' ' + JSON.stringify(req.body) : ''

    logger.info(message)
    next()
  })

//require('./app/routes/subscription.routes')(app);
//require('./app/routes/application.routes')(app);
//require('./app/routes/webhook.routes')(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
