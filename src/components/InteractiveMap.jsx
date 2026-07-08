import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, RefreshCw } from 'lucide-react';

// Custom Map recentering component
function MapRecenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Markers definitions
const branchIcon = L.divIcon({
  className: 'branch-marker-icon',
  html: `<div style="background: radial-gradient(circle, #06b6d4 0%, #3b82f6 80%); width: 28px; height: 28px; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 0 15px rgba(6, 182, 212, 0.8); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: white; font-family: 'Outfit';">H</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const getCustomerIcon = (status, isAssigned, soColor) => {
  let bgColor = '#ef4444'; // default unassigned
  let glowColor = 'rgba(239, 68, 68, 0.7)';

  if (status === 'Visited') {
    bgColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.8)';
  } else if (status === 'Postponed') {
    bgColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.8)';
  } else if (isAssigned && soColor) {
    bgColor = soColor;
    glowColor = soColor;
  }

  return L.divIcon({
    className: 'customer-marker-icon',
    html: `<div style="background-color: ${bgColor}; width: 13px; height: 13px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 8px ${glowColor};"></div>`,
    iconSize: [13, 13],
    iconAnchor: [6.5, 6.5]
  });
};

const getSOIcon = (initials, color) => {
  return L.divIcon({
    className: 'so-marker-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: white; box-shadow: 0 0 12px ${color}; font-family: 'Outfit';">${initials}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export default function InteractiveMap({
  branchInfo,
  customers,
  salesOfficers,
  allocations,
  optimizationMode,
  selectedSOId,
  onOptimize,
  onReset
}) {
  const mapCenter = [branchInfo.lat, branchInfo.lng];

  // Helper to draw routes for each active officer
  const renderRoutes = () => {
    return salesOfficers
      .filter(so => so.active)
      .map(so => {
        const alloc = allocations[so.id];
        if (!alloc || !alloc.customerIds || alloc.customerIds.length === 0) return null;

        // Route coordinates list (starts at branch, goes through customers, returns to branch)
        const coords = [mapCenter];
        
        alloc.customerIds.forEach(id => {
          const cust = customers.find(c => c.id === id);
          if (cust) coords.push([cust.lat, cust.lng]);
        });
        
        coords.push(mapCenter); // Loop back to branch

        const hasSelection = selectedSOId !== null;
        const isSelected = selectedSOId === so.id;

        return (
          <Polyline
            key={so.id}
            positions={coords}
            pathOptions={{
              color: so.color,
              weight: hasSelection ? (isSelected ? 4.5 : 1.5) : 3,
              opacity: hasSelection ? (isSelected ? 0.95 : 0.12) : 0.75,
              dashArray: optimizationMode === 'manual' ? "8, 8" : null,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        );
      });
  };

  // Find center coordinate of active sales officer if selected
  const getSelectedSOCenter = () => {
    if (!selectedSOId) return mapCenter;
    const selectedSO = salesOfficers.find(so => so.id === selectedSOId);
    if (!selectedSO || !selectedSO.active) return mapCenter;
    
    const alloc = allocations[selectedSOId];
    if (alloc && alloc.customerIds && alloc.customerIds.length > 0) {
      // Return the coordinates of their first customer
      const firstCust = customers.find(c => c.id === alloc.customerIds[0]);
      if (firstCust) return [firstCust.lat, firstCust.lng];
    }
    return [selectedSO.initialLat, selectedSO.initialLng];
  };

  return (
    <div className="center-panel">

      {/* Quick Action Optimize trigger */}
      <div className="optimizer-banner">
        {optimizationMode === 'manual' ? (
          <button className="optimize-btn" onClick={onOptimize}>
            <Compass size={16} />
            Auto-Optimize Territory
          </button>
        ) : (
          <button className="optimize-btn active-opt" onClick={onReset}>
            <RefreshCw size={16} />
            Reset to Manual Layout
          </button>
        )}
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        scrollWheelZoom={true}
        zoomControl={false}
        zoomSnap={0.5}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={90}
        wheelDebounceTime={80}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={selectedSOId ? getSelectedSOCenter() : null} />

        {/* Branch Circle Radius (12 km) */}
        <Circle
          center={mapCenter}
          radius={branchInfo.coverageRadiusKm * 1000}
          pathOptions={{
            color: 'rgba(99, 102, 241, 0.15)',
            fillColor: 'rgba(99, 102, 241, 0.03)',
            fillOpacity: 0.5,
            weight: 1
          }}
        />

        {/* Branch Hub Marker */}
        <Marker position={mapCenter} icon={branchIcon}>
          <Popup>
            <div className="map-popup-card">
              <span className="map-popup-title">{branchInfo.name}</span>
              <span className="map-popup-subtitle">Regional Branch Hub</span>
              <div className="map-popup-row">
                <span className="lbl">Manager:</span>
                <span className="val">{branchInfo.manager}</span>
              </div>
              <div className="map-popup-row">
                <span className="lbl">Address:</span>
                <span className="val" style={{ fontSize: '8px' }}>{branchInfo.address}</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Sales Officer Depot Symbols (distributed in a ring around the branch hub to avoid clumping) */}
        {salesOfficers
          .filter(so => so.active)
          .map((so, index, arr) => {
            const angle = (index * 2 * Math.PI) / arr.length;
            const offsetRadius = 0.0012; // ~130m displacement ring
            const pos = [
              branchInfo.lat + Math.sin(angle) * offsetRadius,
              branchInfo.lng + Math.cos(angle) * offsetRadius
            ];

            return (
              <Marker key={so.id} position={pos} icon={getSOIcon(so.initials, so.color)}>
                <Popup>
                  <div className="map-popup-card">
                    <span className="map-popup-title" style={{ color: so.color }}>{so.name}</span>
                    <span className="map-popup-subtitle">Field Sales Officer</span>
                    <div className="map-popup-row">
                      <span className="lbl">Vehicle:</span>
                      <span className="val">{so.vehicle}</span>
                    </div>
                    <div className="map-popup-row">
                      <span className="lbl">Phone:</span>
                      <span className="val">{so.phone}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Customer Markers */}
        {customers.map(cust => {
          // Determine if customer is assigned to anyone
          let assignedSO = null;
          salesOfficers.forEach(so => {
            if (so.active && allocations[so.id]?.customerIds?.includes(cust.id)) {
              assignedSO = so;
            }
          });

          // In manual mode, we also have duplicate assignments
          // check if multiple SOs are assigned to this customer
          let isOverlapped = false;
          let assignedCount = 0;
          let overlappingSOs = [];
          if (optimizationMode === 'manual') {
            salesOfficers.forEach(so => {
              if (so.active && allocations[so.id]?.customerIds?.includes(cust.id)) {
                assignedCount++;
                overlappingSOs.push(so.name);
              }
            });
            isOverlapped = assignedCount > 1;
          }

          const icon = getCustomerIcon(cust.status, !!assignedSO, isOverlapped ? '#ef4444' : assignedSO?.color);

          // Determine opacity for Route Isolation UX
          let markerOpacity = 1.0;
          const isAssignedToAny = assignedSO !== null;

          if (selectedSOId !== null) {
            const isAssignedToSelected = allocations[selectedSOId]?.customerIds?.includes(cust.id);
            if (isAssignedToSelected) {
              markerOpacity = 1.0;
            } else if (isAssignedToAny) {
              markerOpacity = 0.2; // fade out other officers' customers
            } else {
              markerOpacity = 0.45; // slightly fade unassigned
            }
          } else {
            markerOpacity = 1.0; // Show all at full opacity when no officer is selected
          }

          return (
            <Marker key={cust.id} position={[cust.lat, cust.lng]} icon={icon} opacity={markerOpacity}>
              <Popup>
                <div className="map-popup-card">
                  <span className="map-popup-title">{cust.name}</span>
                  <span className="map-popup-subtitle">Village: {cust.village}</span>
                  <div className="map-popup-row">
                    <span className="lbl">Loan Product:</span>
                    <span className="val">{cust.loanType}</span>
                  </div>
                  <div className="map-popup-row">
                    <span className="lbl">Req. Amount:</span>
                    <span className="val" style={{ fontWeight: '700' }}>{cust.amount}</span>
                  </div>
                  <div className="map-popup-row">
                    <span className="lbl">Status:</span>
                    <span className="val" style={{ color: cust.status === 'Visited' ? 'var(--success)' : cust.status === 'Postponed' ? 'var(--warning)' : 'inherit' }}>
                      {cust.status}
                    </span>
                  </div>
                  
                  {isOverlapped && (
                    <div style={{ color: 'var(--danger)', fontSize: '9px', fontWeight: '700', marginTop: '6px', borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '4px' }}>
                      ⚠️ Overlap: Assigned to {overlappingSOs.join(' & ')}
                    </div>
                  )}

                  {assignedSO && !isOverlapped && (
                    <div style={{ color: assignedSO.color, fontSize: '9px', fontWeight: '600', marginTop: '4px' }}>
                      👤 Allocated to: {assignedSO.name}
                    </div>
                  )}
                  
                  {!assignedSO && (
                    <div style={{ color: 'var(--danger)', fontSize: '9px', fontWeight: '700', marginTop: '4px' }}>
                      ❌ Out of Bounds (Uncovered Gap)
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Visual routing polylines */}
        {renderRoutes()}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker unassigned"></div>
          <span>Unassigned / Overlapped</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker visited"></div>
          <span>Check-in Verified</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker postponed"></div>
          <span>Followup Postponed</span>
        </div>
        <div className="legend-item">
          <div style={{ width: '12px', height: '2px', background: 'var(--primary)' }}></div>
          <span>Active Officer Tour</span>
        </div>
      </div>
    </div>
  );
}
