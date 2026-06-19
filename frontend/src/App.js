import React, { useState, useEffect } from 'react';
import CurrentConditions from './components/CurrentConditions';
import HistoryChart from './components/HistoryChart';
import DateRangeSelector from './components/DateRangeSelector';
import './App.css';

function App() {
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('temp');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/current');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setCurrentData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching current conditions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📊 Davis Weather Station Viewer</h1>
        <p>Real-time weather data and historical analysis</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading weather data...</div>
        ) : (
          <>
            <section className="current-section">
              <CurrentConditions data={currentData} />
            </section>

            <section className="history-section">
              <div className="history-header">
                <h2>Historical Data</h2>
              </div>
              
              <DateRangeSelector 
                dateRange={dateRange}
                onChange={handleDateRangeChange}
              />

              <div className="metric-selector">
                <label htmlFor="metric">Select Metric:</label>
                <select 
                  id="metric"
                  value={selectedMetric} 
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  <option value="temp">Temperature (°F)</option>
                  <option value="humidity">Humidity (%)</option>
                  <option value="windSpeed">Wind Speed (mph)</option>
                  <option value="windDir">Wind Direction (°)</option>
                  <option value="pressure">Barometric Pressure (inHg)</option>
                  <option value="rainRate">Rain Rate (in/hr)</option>
                  <option value="solarRad">Solar Radiation (W/m²)</option>
                  <option value="uvIndex">UV Index</option>
                </select>
              </div>

              <HistoryChart 
                metric={selectedMetric}
                start={dateRange.start}
                end={dateRange.end}
              />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Davis Weather Station Viewer • Local Network Only</p>
      </footer>
    </div>
  );
}

export default App;
