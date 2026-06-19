const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const STATION_URL = 'http://192.168.1.103/v1/current_conditions';
const STATION_TOKEN = '2FC1C7EE3F1A48D48DCF66EC9E5335B0';
const DATA_FILE = path.join(__dirname, 'weather-data.json');
const PORT = 3001;

// Fetch data from Davis station
function fetchWeatherData() {
  return new Promise((resolve, reject) => {
    const url = `${STATION_URL}?api_token=${STATION_TOKEN}`;
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse station response: ' + e.message));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Transform Davis data to dashboard format
function transformData(stationData) {
  const conditions = stationData.data?.conditions?.[0] || {};
  
  return {
    timestamp: new Date().toISOString(),
    temp: conditions.temp_f || 0,
    humidity: conditions.humidity || 0,
    windSpeed: conditions.wind_speed_mph || 0,
    windDir: conditions.wind_dir || 0,
    pressure: conditions.barometric_pressure_in || 0,
    rainRate: conditions.rainfall_in || 0,
    solarRad: conditions.solar_radiation || 0,
    uvIndex: conditions.uv_index || 0,
    rawData: stationData
  };
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`[${new Date().toLocaleString()}] Data saved successfully`);
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// Start HTTP server to serve the data
function startServer() {
  const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.url === '/data') {
      try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.writeHead(200);
        res.end(data);
      } catch (err) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'No data available yet' }));
      }
    } else if (req.url === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
  
  server.listen(PORT, () => {
    console.log(`Weather bridge running on http://localhost:${PORT}`);
    console.log(`Serving data at http://localhost:${PORT}/data`);
  });
}

// Main polling loop
async function poll() {
  console.log(`\n[${new Date().toLocaleString()}] Fetching weather data...`);
  
  try {
    const stationData = await fetchWeatherData();
    const transformed = transformData(stationData);
    saveData(transformed);
    console.log(`✓ Temperature: ${transformed.temp}°F`);
    console.log(`✓ Humidity: ${transformed.humidity}%`);
    console.log(`✓ Wind Speed: ${transformed.windSpeed} mph`);
  } catch (err) {
    console.error(`✗ Error: ${err.message}`);
  }
}

// Start server
startServer();

// Initial poll
poll();

// Poll every 60 seconds
setInterval(poll, 60000);

console.log('\n=================================');
console.log('Davis Weather Station Bridge');
console.log('=================================');
console.log(`Station URL: ${STATION_URL}`);
console.log(`Polling interval: 60 seconds`);
console.log(`Data file: ${DATA_FILE}`);
console.log('=================================\n');

process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  process.exit(0);
});
