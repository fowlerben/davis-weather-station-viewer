const fetch = require('node-fetch');
const db = require('./db');

const STATION_URL = process.env.STATION_URL || 'http://192.168.1.103/v1/current_conditions';
const STATION_TOKEN = process.env.STATION_TOKEN || '';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 60000; // 60 seconds

let pollInterval = null;
let isPolling = false;

/**
 * Parse Davis WeatherLink Live API response
 * Adapts to the JSON structure returned by the local API
 */
function parseStationData(payload) {
  try {
    // Extract the conditions array from the API response
    const conditions = payload.data?.conditions?.[0];
    
    if (!conditions) {
      console.warn('No conditions data found in station response');
      return null;
    }
    
    // Map Davis API fields to our measurement schema
    return {
      timestamp: new Date(conditions.ts * 1000).toISOString(), // Convert Unix timestamp to ISO string
      temp: conditions.temp ?? null, // Temperature in °F
      humidity: conditions.hum ?? null, // Humidity in %
      windSpeed: conditions.wind_speed_last ?? null, // Wind speed in mph
      windDir: conditions.wind_dir_last ?? null, // Wind direction in degrees
      pressure: conditions.barometer ?? null, // Barometric pressure
      rainRate: conditions.rain_rate_last ?? null, // Rain rate in in/hr
      solarRad: conditions.solar_rad ?? null, // Solar radiation in W/m²
      uvIndex: conditions.uv ?? null, // UV index
      raw: JSON.stringify(conditions) // Store original data
    };
  } catch (error) {
    console.error('Error parsing station data:', error);
    return null;
  }
}

/**
 * Fetch current data from the Davis station
 */
async function fetchStationData() {
  try {
    const headers = {};
    if (STATION_TOKEN) {
      headers['Authorization'] = `Bearer ${STATION_TOKEN}`;
    }
    
    const response = await fetch(STATION_URL, { headers });
    
    if (!response.ok) {
      console.error(`Station API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station data:', error.message);
    return null;
  }
}

/**
 * Poll the station and store data
 */
async function poll() {
  if (isPolling) {
    console.warn('Poll already in progress, skipping...');
    return;
  }
  
  isPolling = true;
  
  try {
    console.log(`[${new Date().toISOString()}] Polling station...`);
    
    const stationData = await fetchStationData();
    if (!stationData) {
      console.error('Failed to fetch station data');
      isPolling = false;
      return;
    }
    
    const measurement = parseStationData(stationData);
    if (!measurement) {
      console.error('Failed to parse station data');
      isPolling = false;
      return;
    }
    
    // Insert into database
    const result = db.insertMeasurement(measurement);
    console.log(`Inserted measurement: ${measurement.timestamp}, Temp: ${measurement.temp}°F, Humidity: ${measurement.humidity}%`);
    
  } catch (error) {
    console.error('Error in poll cycle:', error);
  } finally {
    isPolling = false;
  }
}

/**
 * Start the polling interval
 */
function startPoller() {
  console.log(`Starting poller (interval: ${POLL_INTERVAL}ms)`);
  console.log(`Station URL: ${STATION_URL}`);
  
  // Poll immediately on startup
  poll();
  
  // Then set up recurring polls
  pollInterval = setInterval(() => {
    poll();
  }, POLL_INTERVAL);
  
  console.log('Poller started successfully');
}

/**
 * Stop the polling interval
 */
function stopPoller() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('Poller stopped');
  }
}

module.exports = {
  startPoller,
  stopPoller,
  poll
};
