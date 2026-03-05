const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve index.html for all non-file requests (SPA fallback)
app.use((req, res, next) => {
  if (!path.extname(req.path)) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

module.exports = app;
