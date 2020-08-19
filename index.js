const express = require('express');
const app = express();
const port = 3000;

app.get('/figma-change', (req, res) => {
  res.send('Figma changed')
})

app.listen(port, () => {
  console.log(`Listening to http://localhost:${port}.`);
})
