import React from 'react';
import MetricCard from './MetricCard';
import { ToggleLeft, ToggleRight, Bike, Users, Clock, Compass } from 'lucide-react';

export default function Sidebar({ 
  salesOfficers, 
  onToggleSO, 
  selectedSOId, 
  onSelectSO, 
  metrics,
  optimizationMode 
}) {
  return (
    <aside className="left-panel">
      <div>
        <h3 className="panel-title">Analytical Performance ({metrics.totalCustomers} Customers)</h3>
        <div className="metrics-grid">
          <MetricCard 
            label="Coverage Rate" 
            value={`${metrics.coverage}%`} 
            changeText={optimizationMode === 'optimized' ? `+${metrics.coverage - 48}%` : null}
            changeDirection="up"
            changeTrend="up"
            type={metrics.coverage > 80 ? "success" : "warning"}
            subtext={`of ${metrics.totalCustomers} total customers`}
          />
          <MetricCard 
            label="Daily Overlaps" 
            value={`${metrics.overlaps}`} 
            changeText={optimizationMode === 'optimized' ? `-${6 - metrics.overlaps}` : null}
            changeDirection="down"
            changeTrend="up"
            type={metrics.overlaps === 0 ? "success" : "danger"}
            subtext="duplicate visits flagged"
          />
          <MetricCard 
            label="Planning Time" 
            value={metrics.planningTime} 
            type="info"
            subtext="required by manager"
          />
          <MetricCard 
            label="Travel Distance" 
            value={`${metrics.distance} km`} 
            changeText={optimizationMode === 'optimized' ? `-${Math.max(0, Math.round(253.5 - metrics.distance))}km` : null}
            changeDirection="down"
            changeTrend="up"
            type="primary"
            subtext="cumulative fuel index"
          />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 className="panel-title">
          <span>Sales Officers ({salesOfficers.filter(so => so.active).length} Active)</span>
        </h3>
        
        <div className="roster-container">
          {salesOfficers.map(so => {
            const isSelected = selectedSOId === so.id;
            return (
              <div 
                key={so.id} 
                className={`so-card ${isSelected ? 'active-selected' : ''}`}
                onClick={() => onSelectSO(so.id)}
              >
                <div className="so-header">
                  <div className="so-info-main">
                    <div 
                      className="so-avatar" 
                      style={{ backgroundColor: so.color }}
                    >
                      {so.initials}
                    </div>
                    <div className="so-name-section">
                      <span className="so-name">{so.name}</span>
                      <span className="so-vehicle">
                        {so.vehicle.split(' ')[0]} {/* Bike brand */}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`so-status-badge ${so.active ? 'active' : 'inactive'}`}>
                      {so.active ? 'Active' : 'Sick/Off'}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSO(so.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: so.active ? 'var(--success)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={so.active ? "Set to Sick/Offline" : "Set to Active"}
                    >
                      {so.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>
                </div>

                <div className="so-metrics">
                  <div className="so-metric-item">
                    <span className="so-metric-lbl">Assigned</span>
                    <span className="so-metric-val">{so.assignedCount || 0} visits</span>
                  </div>
                  <div className="so-metric-item" style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                    <span className="so-metric-lbl">Distance</span>
                    <span className="so-metric-val">{so.routeDistance || 0} km</span>
                  </div>
                  <div className="so-metric-item">
                    <span className="so-metric-lbl">Est. Time</span>
                    <span className="so-metric-val">
                      {so.routeTime ? `${Math.floor(so.routeTime / 60)}h ${so.routeTime % 60}m` : '0m'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
