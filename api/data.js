const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function getDatabase() {
  const dbPath = path.join(process.cwd(), 'Gym.db');
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

  const db = getDatabase();

  try {
    if (req.method === 'GET') {
      const query = `
        SELECT ed.id, e.name as exercise, ed.date, ed.value
        FROM exercise_data ed
        JOIN exercises e ON ed.exercise_id = e.id
        ORDER BY ed.date DESC, e.name
      `;
      const rows = await queryDB(db, query, []);
      res.json(rows);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
};
