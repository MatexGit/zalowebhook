
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const data = req.body;
  fs.appendFileSync('log.txt', JSON.stringify(data) + '\n');
  res.status(200).send('Webhook received');
});

app.get('/', (req, res) => {
  res.send('Zalo Webhook server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
