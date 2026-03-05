const express = require('express');
const path = require('path');
const cors = require('cors');

module.exports = express()
  .use(cors())
  .use(express.json())
  .use(express.static(path.join(__dirname)))
  .get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
