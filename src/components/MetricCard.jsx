import React from 'react';

export default function MetricCard({ label, value, subtext, type = "primary", changeText, changeDirection, changeTrend = "up" }) {
  return (
    <div className={`metric-card ${type}`}>
      <span className="metric-label">{label}</span>
      <div className="metric-value">
        {value}
        {changeText && (
          <span className={`metric-change ${changeTrend}`}>
            {changeDirection === 'up' ? '↑' : '↓'} {changeText}
          </span>
        )}
      </div>
      {subtext && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{subtext}</span>}
    </div>
  );
}
