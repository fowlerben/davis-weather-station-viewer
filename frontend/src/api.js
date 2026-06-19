import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const getCurrentConditions = async () => {
  try {
    const response = await api.get('/api/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current conditions:', error);
    throw error;
  }
};

export const getHistoricalData = async (start, end, metric = 'temp', limit = 1000) => {
  try {
    const response = await api.get('/api/history', {
      params: { start, end, metric, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const getStatistics = async (start, end, metric = 'temp') => {
  try {
    const response = await api.get('/api/stats', {
      params: { start, end, metric }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

export default api;
