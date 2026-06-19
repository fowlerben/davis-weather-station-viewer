const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './data.db';

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
  }
  return db;
}

function initialize() {
  const database = getDb();
  
  // Create measurements table
  database.exec(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      temp REAL,
      humidity REAL,
      windSpeed REAL,
      windDir REAL,
      pressure REAL,
      rainRate REAL,
      solarRad REAL,
      uvIndex REAL,
      raw TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create index on timestamp for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_measurements_timestamp 
    ON measurements(timestamp)
  `);
  
  console.log('Database initialized successfully');
}

function insertMeasurement(data) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO measurements 
    (timestamp, temp, humidity, windSpeed, windDir, pressure, rainRate, solarRad, uvIndex, raw) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.timestamp,
    data.temp,
    data.humidity,
    data.windSpeed,
    data.windDir,
    data.pressure,
    data.rainRate,
    data.solarRad,
    data.uvIndex,
    data.raw
  );
  
  return result;
}

function getLatestMeasurement() {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM measurements 
    ORDER BY timestamp DESC 
    LIMIT 1
  `);
  return stmt.get();
}

function cleanup() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDb,
  initialize,
  insertMeasurement,
  getLatestMeasurement,
  cleanup
};
