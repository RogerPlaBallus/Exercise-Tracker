const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./Gym.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  // Exercises table
  db.run(`CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);

  // Data table with foreign key and cascade delete
  db.run(`CREATE TABLE IF NOT EXISTS exercise_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    value REAL NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  )`);
});

// Routes

// Get all exercises
app.get('/api/exercises', (req, res) => {
  db.all('SELECT * FROM exercises', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add exercise
app.post('/api/exercises', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO exercises (name) VALUES (?)', [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name });
  });
});

// Delete exercise
app.delete('/api/exercises/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM exercises WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Get all data
app.get('/api/data', (req, res) => {
  const query = `
    SELECT ed.id, e.name as exercise, ed.date, ed.value
    FROM exercise_data ed
    JOIN exercises e ON ed.exercise_id = e.id
    ORDER BY ed.date DESC, e.name
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add data
app.post('/api/data', (req, res) => {
  const { date, data } = req.body; // data is an object {exerciseId: value}
  const stmt = db.prepare('INSERT INTO exercise_data (exercise_id, date, value) VALUES (?, ?, ?)');

  let inserted = 0;
  for (const [exerciseId, value] of Object.entries(data)) {
    if (value !== '') {
      stmt.run([exerciseId, date, parseFloat(value)], function(err) {
        if (err) {
          console.error('Error inserting data:', err.message);
        } else {
          inserted++;
        }
      });
    }
  }
  stmt.finalize();
  res.json({ inserted });
});

// Delete data entry
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM exercise_data WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Get data for chart
app.get('/api/chart-data', (req, res) => {
  const query = `
    SELECT e.name as exercise, ed.date, ed.value
    FROM exercise_data ed
    JOIN exercises e ON ed.exercise_id = e.id
    ORDER BY ed.date, e.name
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Group by exercise
    const data = {};
    rows.forEach(row => {
      if (!data[row.exercise]) {
        data[row.exercise] = { dates: [], values: [] };
      }
      data[row.exercise].dates.push(row.date);
      data[row.exercise].values.push(row.value);
    });

    res.json(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
