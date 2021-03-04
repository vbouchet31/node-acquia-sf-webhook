const express = require('express')

const PORT = process.env.PORT || 5000

let app = express().use(express.json())

require('./app/routes/subscription.routes')(app);
require('./app/routes/application.routes')(app);
require('./app/routes/webhook.routes')(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
