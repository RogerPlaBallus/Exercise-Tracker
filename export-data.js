const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./Gym.db', async (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }

  try {
    // Get all exercises
    const exercises = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM exercises', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Get all data
    const data = await new Promise((resolve, reject) => {
      const query = `
        SELECT ed.id, e.name as exercise, ed.date, ed.value
        FROM exercise_data ed
        JOIN exercises e ON ed.exercise_id = e.id
        ORDER BY ed.date DESC, e.name
      `;
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Write JSON files
    fs.writeFileSync(path.join(dataDir, 'exercises.json'), JSON.stringify(exercises, null, 2));
    fs.writeFileSync(path.join(dataDir, 'data.json'), JSON.stringify(data, null, 2));

    console.log('✓ Data exported successfully!');
    console.log(`  - ${exercises.length} exercises saved to data/exercises.json`);
    console.log(`  - ${data.length} records saved to data/data.json`);

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error exporting data:', error);
    db.close();
    process.exit(1);
  }
});
