const express = require('express');
const app = express();

app.get('/', function(req, res) {
  res.send('Hello World');
});

app.listen(5001, () => {
  console.log('Server running on port 5001');
});