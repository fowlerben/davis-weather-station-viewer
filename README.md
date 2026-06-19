# Davis Weather Station Viewer

A full-stack web application to display real-time and historical weather data from your Davis WeatherLink Live station on your local network.

## Features

- **Real-time Dashboard**: Display current weather conditions (temperature, humidity, wind, rainfall, solar radiation, UV index)
- **Historical Charts**: View weather trends over time with interactive charts
- **Local Network Only**: Polls your Davis station directly via local IP (no cloud dependency)
- **Data Storage**: SQLite database stores historical readings for analysis
- **Responsive UI**: Works on desktop and mobile browsers
- **Docker Support**: Easy deployment with Docker and docker-compose

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/fowlerben/davis-weather-station-viewer.git
   cd davis-weather-station-viewer
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` and set:
   - `STATION_URL=http://192.168.1.103/v1/current_conditions`
   - `STATION_TOKEN=2FC1C7EE3F1A48D48DCF66EC9E5335B0` (if required)

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the web viewer**
   - Open `http://localhost:3000` in your browser

### Option 2: Local Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm start
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

## Configuration

Edit `backend/.env`:
```
STATION_URL=http://192.168.1.103/v1/current_conditions
STATION_TOKEN=2FC1C7EE3F1A48D48DCF66EC9E5335B0
POLL_INTERVAL=60000
PORT=4000
DB_PATH=./data.db
```

## API Endpoints

- `GET /api/current` - Latest weather reading
- `GET /api/history?start=ISO&end=ISO&metric=temp` - Historical data
- `GET /api/stats?start=ISO&end=ISO&metric=temp` - Min/max/avg statistics

## Security

⚠️ Keep your `.env` file with `STATION_TOKEN` private and out of version control.

## Troubleshooting

- Verify station IP: `ping 192.168.1.103`
- Check backend: `curl http://localhost:4000/api/current`
- Clear browser cache if frontend won't load
