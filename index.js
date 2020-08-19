const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Lyne Design System. Simple express server to listen to webhooks send from Figma. Figma webhook will send POST requests to /figma-change');
})

app.get('/figma-change', (req, res) => {
  res.send('Figma changed')
})

app.listen(port, () => {
  console.log(`Listening to http://localhost:${port}.`);
})
