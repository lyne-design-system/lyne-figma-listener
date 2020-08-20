const request = require("request");
const express = require('express');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

const triggerTravis = () => {
  const travisUrl = 'https://api.travis-ci.org/repo/lyne-design-system%2Flyne-design-tokens/requests';
  const travisToken = process.env.TRAVIS_TOKEN;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Travis-API-Version': '3',
    'Authorization': `token ${travisToken}`
  };

  const body = {
    request: {
      message: 'Triggered from Figma Library update'
    }
  }

  request({
    uri: travisUrl,
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });
};

app.get('/', (req, res) => {
  res.send('Lyne Design System. Simple express server to listen to webhooks send from Figma. Figma webhook will send POST requests to /figma-change');
})

app.post('/figma-change', (req, res) => {
  const isCorrectFile = req.file_name == process.env.FIGMA_FILE_NAME;
  const isCorrectPasscode = req.passcode == process.env.FIGMA_PASSCODE;

  if (!isCorrectFile || !isCorrectPasscode) {
    //res.sendStatus(400);
    res.status(400).send(req.file_name)

  } else {
    triggerTravis();

    // Figma needs status code 200 as answer
    res.sendStatus(200);
  }
})

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}.`);
})
