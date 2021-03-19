# WARNING - BRANCH SPECIFICS
On this branch, the storage for subscriptions, applications and webhooks are not
a MySQL database but a Google Spreadsheet instead. All the endpoints to manage
(CRUD) the various entities are not working.

This branch also has some optional Heroku specificities. Because a worker need
to run 24/7 and because free Heroku dynos are limited to ~500hours per month,
the worker has some capacity to start another app worker after a certain amount
of loop. To setup this balacing process, create 2 different heroku apps. On
each app, give the other app information as environment variables so they can
start and stop each other when needed.

***
This service is monitoring the tasks on ACSF and triggers webhooks when events are
detected. It can monitor as many ACSF subscription and environment than needed.

# Setup
- Create a Google Spreadsheet using the `webhook.xlsx` template.
- Create a service account on Google and grant him access to the spreadsheet.
- Execute the `node worker.js` with appropriate environment variables. This script
is looping over the registered applications and responsible of monitoring the
ACSF tasks to trigger webhook events based on tasks status. Mandatory environment
variables are `GDRIVE_DB_FILE` and `GDRIVE_CLIENT_EMAIL`+`GDRIVE_PRIVATE_KEY` or `GDRIVE_CREDENTIALS_FILENAME`

## Spreadsheet Content
### Applications
It contains the information to use the ACSF API.
`aid`: Should be incremented from the previous line. Will be used to find the
webhooks related to this application.
`env`: The environment prefix (dev, test, prod). Use prod for production/live.
`subscription`: The factory name (https://<env>-<subscription>.acsitefactory.com).
`token`: The token of a user who can access the API.
`username`: The username of a use who can access the API.

/!\ Token & username must come from the same account. Be aware that the API key
may differs across the environments for a same username. Be aware that the API
endpoints accessible depend on the account role.

### Webhooks
It contains the information about which event to monitor and which url to invoke.
`aid`: The application id which the webhook relates to.
`events`: An array of the events to be detected to trigger the webhook. (["event1", "event2"])
`options`: Some options to enrich the payload. Available options are `parents` and `site` ({"parents": true, "site": false})
`endpoint`: The endpoint which will receive the payload when the event is detected.
`status`: Either the webhook is active or not. (1 means active, 0 inactive)

## Environment variables
- Gdrive:
  - `GDRIVE_DB_FILE` (the id of the spreadsheet to use as a storage - mandatory)
  - `GDRIVE_CLIENT_EMAIL` (the email address of the service account)
  - `GDRIVE_PRIVATE_KEY` (the private key of the service account)
  - `GDRIVE_CREDENTIALS_FILENAME` (the JSON file generated when the service account has been created. file must be added at the root of the project)
- Worker:
  - `PERIOD` (worker frequency in seconds - default to 60)
  - `BATCH_SIZE` (number of application/http request to be processed at the same time - default to 5)
  - `HEROKU_APP_NAME` (the heroku's application name used for balancing - optional)
  - `HEROKU_API_KEY` (the API key to manage the heroku's application used for balancing - optional)
  - `HEROKU_MAX_LOOP` (the number of loop to execute before balancing to the second application - optional)
- ACSF API:
  - `LIMIT` (number of items fetch per pages - default to 100)

# Available events
## Cache
- Cache clear started (cache cleared triggered via the ACSF UI or ACSF API) (`cache_clear_started`)
- Cache clear completed (`cache_clear_completed`)

## Code release
- Hotfix release started (`release_hotfix_started`)
- Hotfix release completed (`release_hotfix_completed`)
- Code+update release started (`release_update_started`)
- Code+update release completed (`release_update_completed`)

## Site update
- Site update started (`site_update_started`)
- Site update completed (`site_update_completed`)

## Varnish
- Varnish clear completed (`varnish_flush_completed`)

## More events?
To enrich the detected events:
- Create a new file in `app/events`.
- List down the classes which should be used to identify the tasks used by the events.
- List down the functions which are detecting events.
- Write the functions with the business logic to detect events. Each function
should return a string with the event name when detected.

Example:
```
const myEvent = {}

myEvent.classes = [
  'Acquia\\SfSite\\ClassExample'
]

myEvent.events = ['eventExampleStarted']

myEvent.eventExampleStarted = (taskNow, taskBefore) => {
  if (!taskBefore && taskNow.status !== '16') {
    return 'example_started'
  }
}

module.exports = myEvent
```

# TODO
- Add some debug/logging capacity.
- Log each job execution and result (tasks before, tasks now, triggered webhooks, ...)
