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

  request({
    uri: travisUrl,
    method: 'POST',
    headers: headers
  });
};

app.get('/', (req, res) => {
  res.send('Lyne Design System. Simple express server to listen to webhooks send from Figma. Figma webhook will send POST requests to /figma-change');
})

app.post('/figma-change', (req, res) => {
  triggerTravis();

  // Figma needs status code 200 as answer
  // res.sendStatus(200);
  res.send(req.file_name);
})

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}.`);
})
