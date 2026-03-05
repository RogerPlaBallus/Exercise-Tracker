const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// SPA fallback - serve index.html for non-file routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
