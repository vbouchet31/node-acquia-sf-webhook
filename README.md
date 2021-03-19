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

Once configured, the ACSF subscription is monitored via an API call to /api/v1/tasks
every minute (configurable). The result is compared with the previous execution
in order to detect the events which happened. The detected events will then be
compared with the configured webhooks to trigger POST request to configured url.

# Setup
- Create a database using the schema.sql file.
- Execute the `node index.js` with appropriate environment variables. This script
provides the webserver to register applications and configure webhooks. By default,
it listens on port 5000.
- Execute the `node worker.js` with appropriate environment variables. This script
is looping over the registered applications and responsible of monitoring the
ACSF tasks to trigger webhook events based on tasks status.

## Environment variables
- Webserver: `PORT`
- Worker:
  - `PERIOD` (worker frequency in seconds)
  - `BATCH_SIZE` (number of application/http request to be processed at the same time)
  - `HEROKU_APP_NAME` (the heroku's application name used for balancing)
  - `HEROKU_API_KEY` (the API key to manage the heroku's application used for balancing)
  - `HEROKU_MAX_LOOP` (the number of loop to execute before balancing to the second application)
- ACSF API:
  - `LIMIT` (number of items fetch per pages)
- Gdrive:
  - `GDRIVE_DB_FILE` (the id of the spreadsheet to use as a storage)

# Usage
- Register a new subscription via a POST request to `api/v1/register` to get a token.
- Register a new application via a POST request to `api/v1/applications?token=:token`.
```
{
  "env": "dev",
  "subscription": "mycustomer",
  "username": "user.name",
  "token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```
It will return the application object enriched with the application id (aid).

/!\ Don't be confused with the token returned by `api/v1/register` which is used
to manage objects via this API and the token in the application object which is
the token used to connect to ACSF.
- Register a new webhook via a POST request to `api/v1/applications/:aid/webhooks?token=:token`.
```
{
    "events": ["release_update_started", "cache_clear_completed"],
    "endpoint": "https://domain.tld?secret=12345"
}
```
It will return the webhook object enriched with the webhook id (wid).

See the other available endpoints to manage applications and webhooks.

# Endpoints
## Anonymous
Register a new subscription: POST `api/v1/register`

## Authenticated
Token query argument (?token=xxxxxxx) is mandatory for the following endpoints.

### Applications
- Get all the applications: GET `api/v1/applications`
- Create a new application: POST `api/v1/applications`
- Get an application: GET `api/v1/applications/:aid`
- Update an application: POST `api/v1/applications/:aid`
- Delete an application: DELETE `api/v1/applications/:aid`

### Webhooks
- Get all the webhooks: GET `api/v1/applications/:aid/webhooks`
- Create a new webhook: POST `api/v1/applications/:aid/webhooks`
```
{
  "events": ["cacheClearCompleted", "varnishFlushCompleted"],
  "endpoint": "https://www.domain.tld/webhook/cacheClear",
}
```
- Get a webhook: GET `api/v1/applications/:aid/webhooks/:wid`
- Update a webhook: POST `api/v1/applications/:aid/webhooks/:wid`
- Delete a webhook: DELETE `api/v1/applications/:aid/webhooks/:wid`

# Available events
## Cache
- Cache clear started (cache cleared triggered via the ACSF UI or ACSF API)
- Cache clear completed

## Code release
- Hotfix release started
- Hotfix release completed
- Code+update release started
- Code+update release completed

## Site update
- Site update started
- Site update completed

## Varnish
- Varnish clear started
- Varnish clear completed

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
- Validate the application details on creation and update by doing an API request to `api/v1/tasks`.
- Fix the `status` attribute for webhook object. Not updated via API.
- Add some debug/logging capacity.
- Log each job execution and result (tasks before, tasks now, triggered webhooks, ...)
