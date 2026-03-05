const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'gif', 'ico', 'db']
}));

// SPA fallback - serve index.html for routes without file extensions
app.use((req, res) => {
  // Don't serve index.html for paths with extensions or API routes
  if (path.extname(req.path) || req.path.startsWith('/api')) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
