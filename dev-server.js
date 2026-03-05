const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Note: This server is for local development only.
// On Vercel, serverless functions in /api folder handle all requests.

// Serve index.html for all non-file routes (SPA)
app.use((req, res, next) => {
  // If not an API route and not a file, serve index.html
  if (!req.path.startsWith('/api') && !path.extname(req.path)) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

