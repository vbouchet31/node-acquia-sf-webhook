# Setup
- Create a database using the schema.sql file.
- Execute the `index.js` with appropriate environment variables. This script
provides the webserver to register applications and configure webhooks.
- Execute the `worker.js` with appropriate environment variables. This script
is looping over the registered applications and responsible of monitoring the
ACSF tasks to trigger webhook events based on tasks status.

## Environment variables:
`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

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
    "events": ["release_started", "hotfix_started", "site_update_completed"],
    "endpoint": "https://domain.tld"
}
```
It will return the webhook object enriched with the webhook id (wid).

See the other available endpoints to manage applications and webhooks.

# Endpoints
## Anonymous
Register a new subscription: POST `api/v1/register`

## Authenticated
Token query argument is mandatory for the following endpoints.
### Applications
- Get all the applications: GET `api/v1/applications`
- Create a new application: POST `api/v1/applications`
- Get an application: GET `api/v1/applications/:aid`
- Update an application: POST `api/v1/applications/:aid`
- Delete an application: DELETE `api/v1/applications/:aid`

### Webhooks
- Get all the webhooks: GET `api/v1/applications/:aid/webhooks`
- Create a new webhook: POST `api/v1/applications/:aid/webhooks`
- Get a webhook: GET `api/v1/applications/:aid/webhooks/:wid`
- Update a webhook: POST `api/v1/applications/:aid/webhooks/:wid`
- Delete a webhook: DELETE `api/v1/applications/:aid/webhooks/:wid`

# TODO
- Document the available webhook's events.
- Validate the application details on creation and update by doing an API request to `api/v1/tasks`.
- Fix the `status` attribute for webhook object. Not updated via API.
