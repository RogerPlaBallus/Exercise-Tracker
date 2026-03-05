const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

function getDatabase() {
  // Try multiple possible paths for the database
  const possiblePaths = [
    path.join(__dirname, '..', 'Gym.db'),
    path.join(process.cwd(), 'Gym.db'),
    '/var/task/Gym.db'
  ];

  let dbPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbPath = p;
      break;
    }
  }

  if (!dbPath) {
    throw new Error(`Database not found. Tried: ${possiblePaths.join(', ')}`);
  }

  return new sqlite3.Database(dbPath);
}

function queryDB(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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

  let db;
  try {
    db = getDatabase();

    if (req.method === 'GET') {
      const query = `
        SELECT e.name as exercise, ed.date, ed.value
        FROM exercise_data ed
        JOIN exercises e ON ed.exercise_id = e.id
        ORDER BY ed.date, e.name
      `;
      const rows = await queryDB(db, query, []);

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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    if (db) db.close();
  }
};
