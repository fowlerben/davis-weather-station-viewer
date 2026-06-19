import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './HistoryChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function HistoryChart({ metric, start, end }) {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch historical data
        const historyRes = await fetch(
          `/api/history?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&metric=${metric}&limit=1000`
        );
        
        if (!historyRes.ok) {
          throw new Error(`History API error: ${historyRes.status}`);
        }
        
        const historyData = await historyRes.json();

        // Fetch statistics
        const statsRes = await fetch(
          `/api/stats?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&metric=${metric}`
        );
        
        if (!statsRes.ok) {
          throw new Error(`Stats API error: ${statsRes.status}`);
        }
        
        const statsData = await statsRes.json();
        setStats(statsData);

        // Process chart data
        if (historyData.data && historyData.data.length > 0) {
          const labels = historyData.data.map(d => {
            const date = new Date(d.timestamp);
            return date.toLocaleTimeString();
          });
          
          const values = historyData.data.map(d => d.value);
          
          const metricLabels = {
            temp: '°F',
            humidity: '%',
            windSpeed: 'mph',
            windDir: '°',
            pressure: 'inHg',
            rainRate: 'in/hr',
            solarRad: 'W/m²',
            uvIndex: 'UV'
          };

          setChartData({
            labels,
            datasets: [
              {
                label: `${metric} (${metricLabels[metric]})`,
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
                pointBackgroundColor: '#667eea',
              }
            ]
          });
        } else {
          setError('No data available for the selected time range');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [metric, start, end]);

  if (loading) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  if (!chartData) {
    return <div className="chart-error">No data to display</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="history-chart-container">
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
      
      {stats && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Min:</span>
            <span className="stat-value">{stats.min?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max:</span>
            <span className="stat-value">{stats.max?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg:</span>
            <span className="stat-value">{stats.avg?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Count:</span>
            <span className="stat-value">{stats.count || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryChart;
