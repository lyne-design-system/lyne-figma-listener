# About

Express server listening to webhooks from Figma.

- The webhook is triggered as soon as the Figma library is changed an published.
- If received with correct payload, the travis job to build and publish design tokens is triggered. The payload must match the name and passcode defined as env variables.
- The server listens to POST requests on the route ```figma-change```.

# Env variables
`TRAVIS_TOKEN`: get it from user account settings on Travis. Used to trigger a build on Travis via API.
`FIGMA_FILE_NAME`: The name of the library in Figma.
`FIGMA_PASSCODE`: Passcode defined in Figma webhook during creation.

# Figma API

Webhooks for Figma are can be defined per Team. Webhooks can only be managed via the console.

## Get existing webhooks
```bash
curl -H 'X-FIGMA-TOKEN: TOKEN' 'https://api.figma.com/v2/teams/TEAM-ID/webhooks'
```

## Get requests for a specific webhook

curl -H 'X-FIGMA-TOKEN: TOKEN' 'https://api.figma.com/v2/webhooks/WEBHOOK-ID/requests'

## Delete webhook
```bash
curl -X DELETE -H 'X-FIGMA-TOKEN: TOKEN' 'https://api.figma.com/v2/webhooks/WEBHOOK-ID'
```

## Create a webhook
```bash
curl -X POST -H 'X-FIGMA-TOKEN: TOKEN' -H "Content-Type: application/json" 'https://api.figma.com/v2/webhooks' -d '{"event_type":"LIBRARY_PUBLISH","team_id":"TEAM-ID","endpoint":"https://powerful-harbor-93786.herokuapp.com/figma-change","passcode":"PASSCODE"}'
```

# Express Server

The express server is hosted on Heroku. If you use Heroku for the first time, install the cli tool first and login after installation:

## Setup and develop

```bash
npm install -g heroku
heroku login
```

To create a new app, run:

```bash
heroku create
```

As soon as your ready to deploy the app, run:

```bash
git push heroku master
```

For the initial deployment, make sure that at least one instance of the app is running:

```bash
heroku ps:scale web=1 (scaling... make sure at least one instance of the app is running)
```

If you need live logs from all the requests the server is processing, use the following command on the command line:

```bash
heroku logs --tail
```


## URL

The deployed server is running under:

https://powerful-harbor-93786.herokuapp.com

# CI/CD

After the webhook from Figma (with the correct payload) is received by the server, the Travis job to build and deploy the design tokens is triggered. To test it locally during development, run the following curl command on the command line:

```bash
body='{
"request": {
"branch":"master"
}}'

curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token TOKEN" \
   -d "$body" \
   https://api.travis-ci.org/repo/lyne-design-system%2Flyne-design-tokens/requests
```

# Todo

- linting
- enable dependABot
- initially, tried to deploy to vercel. Vercel did create an environment on github which is no longer needed. Find a way to remove it.
