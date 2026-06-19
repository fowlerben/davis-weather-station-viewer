import React, { useState } from 'react';
import './DateRangeSelector.css';

function DateRangeSelector({ dateRange, onChange }) {
  const handleStartChange = (e) => {
    const newStart = e.target.value;
    onChange({
      ...dateRange,
      start: new Date(newStart).toISOString()
    });
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    onChange({
      ...dateRange,
      end: new Date(newEnd).toISOString()
    });
  };

  const formatDateTimeLocal = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleQuickRange = (hours) => {
    const end = new Date();
    const start = new Date(Date.now() - hours * 60 * 60 * 1000);
    onChange({
      start: start.toISOString(),
      end: end.toISOString()
    });
  };

  return (
    <div className="date-range-selector">
      <div className="range-inputs">
        <div className="input-group">
          <label htmlFor="start-date">From:</label>
          <input
            type="datetime-local"
            id="start-date"
            value={formatDateTimeLocal(dateRange.start)}
            onChange={handleStartChange}
          />
        </div>

        <div className="input-group">
          <label htmlFor="end-date">To:</label>
          <input
            type="datetime-local"
            id="end-date"
            value={formatDateTimeLocal(dateRange.end)}
            onChange={handleEndChange}
          />
        </div>
      </div>

      <div className="quick-ranges">
        <button className="quick-btn" onClick={() => handleQuickRange(1)}>1h</button>
        <button className="quick-btn" onClick={() => handleQuickRange(6)}>6h</button>
        <button className="quick-btn" onClick={() => handleQuickRange(24)}>24h</button>
        <button className="quick-btn" onClick={() => handleQuickRange(7 * 24)}>7d</button>
        <button className="quick-btn" onClick={() => handleQuickRange(30 * 24)}>30d</button>
      </div>
    </div>
  );
}

export default DateRangeSelector;
