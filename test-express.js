const express = require('express');
const app = express();
app.use((req, res, next) => {
  console.log("Method:", req.method, "Query:", req.query);
  if (req.query._method && req.method === 'POST') {
    req.method = req.query._method.toUpperCase();
  }
  next();
});
app.put('/api/test', (req, res) => res.send('PUT works'));
app.post('/api/test', (req, res) => res.send('POST works'));
app.listen(3002, () => console.log('started'));
