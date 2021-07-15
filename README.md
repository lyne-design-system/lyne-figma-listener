[![Build Status](https://travis-ci.com/lyne-design-system/lyne-figma-listener.svg?branch=master)](https://travis-ci.com/lyne-design-system/lyne-figma-listener) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) ![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/lyne-design-system/lyne-figma-listener?label=release)

# About

Express server listening to webhooks from Figma.

- The webhook is triggered as soon as one of the Figma libraries is changed an published.
- If received with correct payload, the travis job to build and publish design tokens or the the job to build and publish the icons is triggered. The payload must match one of the file names and passcode defined as env variables.
- The server listens to POST requests on the route ```figma-change```.

# Env variables
`TRAVIS_TOKEN`: get it from user account settings on Travis. Used to trigger a build on Travis via API.
`FIGMA_FILE_ID_TOKENS`: The name of the deisgn token library in Figma.
`FIGMA_FILE_ID_ICONS`: The name of the icons library in Figma.
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

The express server is hosted on Heroku. If you use Heroku for the first time and want to test it locally, install the cli tool first and login after installation:

## Setup and develop locally

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

## Deployment

The Server is automatically deployed on Heroku via Travis CI as soon as changes are pushed to git.

# CI/CD

After the webhook from Figma (with the correct payload) is received by the server, the Travis job to build and deploy the design tokens or icons is triggered. Based on the filename, either the job for design tokens or the job for the icons is triggered.

To test for example the trigger of Lyne Design Tokens locally during development, run the following curl command on the command line:

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
   https://api.travis-ci.com/repo/lyne-design-system%2Flyne-design-tokens/requests
```
