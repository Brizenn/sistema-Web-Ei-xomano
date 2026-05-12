const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db/banco.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database schema applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  }
}

run();
