const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const { startPoller } = require('./poller');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
db.initialize();

// Routes

// Get current conditions
app.get('/api/current', (req, res) => {
  try {
    const stmt = db.getDb().prepare(`
      SELECT * FROM measurements 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    const current = stmt.get();
    
    if (!current) {
      return res.status(404).json({ error: 'No data available yet' });
    }
    
    res.json({
      timestamp: current.timestamp,
      temp: current.temp,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      windDir: current.windDir,
      pressure: current.pressure,
      rainRate: current.rainRate,
      solarRad: current.solarRad,
      uvIndex: current.uvIndex
    });
  } catch (error) {
    console.error('Error fetching current conditions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get historical data
app.get('/api/history', (req, res) => {
  try {
    const { start, end, metric = 'temp', limit = 1000 } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters required' });
    }
    
    const validMetrics = ['temp', 'humidity', 'windSpeed', 'windDir', 'pressure', 'rainRate', 'solarRad', 'uvIndex'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ error: `Invalid metric. Valid options: ${validMetrics.join(', ')}` });
    }
    
    const stmt = db.getDb().prepare(`
      SELECT timestamp, ${metric} as value 
      FROM measurements 
      WHERE timestamp >= ? AND timestamp <= ?
      AND ${metric} IS NOT NULL
      ORDER BY timestamp ASC
      LIMIT ?
    `);
    
    const data = stmt.all(start, end, parseInt(limit));
    
    res.json({
      metric,
      data: data.map(row => ({
        timestamp: row.timestamp,
        value: row.value
      }))
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/stats', (req, res) => {
  try {
    const { start, end, metric = 'temp' } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters required' });
    }
    
    const validMetrics = ['temp', 'humidity', 'windSpeed', 'windDir', 'pressure', 'rainRate', 'solarRad', 'uvIndex'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ error: `Invalid metric. Valid options: ${validMetrics.join(', ')}` });
    }
    
    const stmt = db.getDb().prepare(`
      SELECT 
        MIN(${metric}) as min,
        MAX(${metric}) as max,
        AVG(${metric}) as avg,
        COUNT(${metric}) as count
      FROM measurements 
      WHERE timestamp >= ? AND timestamp <= ?
      AND ${metric} IS NOT NULL
    `);
    
    const stats = stmt.get(start, end);
    
    res.json({
      metric,
      start,
      end,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Start the poller
startPoller();

module.exports = app;
