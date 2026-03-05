const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    const dbPath = path.join(process.cwd(), 'Gym.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database at:', dbPath);
        resolve(db);
      }
    });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await initDB();

    if (req.method === 'GET') {
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
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
