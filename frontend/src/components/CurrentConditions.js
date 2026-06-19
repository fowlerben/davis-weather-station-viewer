import React from 'react';
import './CurrentConditions.css';

function CurrentConditions({ data }) {
  if (!data) {
    return <div className="current-conditions">No data available</div>;
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getWeatherIcon = (temp) => {
    if (temp < 32) return '❄️';
    if (temp < 50) return '🌤️';
    if (temp < 70) return '⛅';
    if (temp < 85) return '☀️';
    return '🔥';
  };

  return (
    <div className="current-conditions">
      <div className="condition-header">
        <div className="temperature-display">
          <div className="temp-icon">{getWeatherIcon(data.temp)}</div>
          <div className="temp-value">{data.temp?.toFixed(1)}°F</div>
        </div>
        <div className="last-updated">
          Last updated: {formatTime(data.timestamp)}
        </div>
      </div>

      <div className="condition-grid">
        <div className="condition-card">
          <div className="condition-label">Humidity</div>
          <div className="condition-value">{data.humidity?.toFixed(0)}%</div>
        </div>

        <div className="condition-card">
          <div className="condition-label">Wind Speed</div>
          <div className="condition-value">{data.windSpeed?.toFixed(1)} mph</div>
        </div>

        <div className="condition-card">
          <div className="condition-label">Wind Direction</div>
          <div className="condition-value">{data.windDir?.toFixed(0)}°</div>
        </div>

        <div className="condition-card">
          <div className="condition-label">Pressure</div>
          <div className="condition-value">{data.pressure?.toFixed(2)} inHg</div>
        </div>

        <div className="condition-card">
          <div className="condition-label">Rain Rate</div>
          <div className="condition-value">{data.rainRate?.toFixed(2)} in/hr</div>
        </div>

        <div className="condition-card">
          <div className="condition-label">Solar Radiation</div>
          <div className="condition-value">{data.solarRad?.toFixed(0)} W/m²</div>
        </div>

        <div className="condition-card">
          <div className="condition-label">UV Index</div>
          <div className="condition-value">{data.uvIndex?.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

export default CurrentConditions;
