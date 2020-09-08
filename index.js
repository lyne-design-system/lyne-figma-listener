const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv')
  .config();

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const triggerTravis = (commitMessage, travisUrl) => {
  const travisToken = process.env.TRAVIS_TOKEN;
  const headers = {
    'Accept': 'application/json',
    'Authorization': `token ${travisToken}`,
    'Content-Type': 'application/json',
    'Travis-API-Version': '3'
  };

  const body = {
    request: {
      message: `${commitMessage} (triggered from Figma)`
    }
  };

  request({
    body: JSON.stringify(body),
    headers,
    method: 'POST',
    uri: travisUrl
  });
};

app.get('/', (req, res) => {
  res.send('Lyne Design System. Simple express server to listen to webhooks send from Figma. Figma webhook will send POST requests to /figma-change');
});

app.post('/figma-change', (req, res) => {
  const isFileTokens = req.body.file_name === process.env.FIGMA_FILE_NAME_TOKENS;
  const isFileIcons = req.body.file_name === process.env.FIGMA_FILE_NAME_ICONS;
  const isValidFile = isFileTokens || isFileIcons;
  const isCorrectPasscode = req.body.passcode === process.env.FIGMA_PASSCODE;

  if (!isValidFile || !isCorrectPasscode) {
    res.sendStatus(400);
  } else {

    let travisUrl;

    if (isFileTokens === 'tokens') {
      travisUrl = 'https://api.travis-ci.org/repo/lyne-design-system%2Flyne-design-tokens/requests';
    } else {
      travisUrl = 'https://api.travis-ci.org/repo/lyne-design-system%2Flyne-icons/requests'
    }

    triggerTravis(req.body.description, travisUrl);

    // Figma needs status code 200 as answer
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}.`);
})
