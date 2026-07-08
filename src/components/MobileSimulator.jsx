import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Check, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Navigation, 
  RefreshCw, 
  CloudLightning,
  AlertTriangle,
  Compass
} from 'lucide-react';

export default function MobileSimulator({ 
  selectedSO, 
  allocations, 
  customers, 
  onCustomerCheckIn,
  optimizationMode,
  onExitSimulator,
  branch
}) {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]); // [{ custId, status }]
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const alloc = selectedSO ? allocations[selectedSO.id] : null;
  const assignedCustomerIds = alloc ? alloc.customerIds : [];
  
  // Get customer objects in order
  const assignedCustomers = assignedCustomerIds
    .map(id => customers.find(c => c.id === id))
    .filter(Boolean);

  // Set first job as active by default if activeJobId is not set
  useEffect(() => {
    if (assignedCustomers.length > 0 && !activeJobId) {
      setActiveJobId(assignedCustomers[0].id);
    }
  }, [assignedCustomers, activeJobId]);

  // Handle Toast message fading
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync queue to parent when toggled back online
  const toggleOfflineMode = () => {
    if (isOffline) {
      // Going online: trigger synchronization of queued items
      if (offlineQueue.length > 0) {
        setIsSyncing(true);
        setToastMessage("Network restored. Syncing offline data...");
        
        setTimeout(() => {
          // Process all queued items
          offlineQueue.forEach(item => {
            onCustomerCheckIn(item.custId, item.status);
          });
          setOfflineQueue([]);
          setIsSyncing(false);
          setToastMessage("Data synced successfully!");
        }, 1500);
      } else {
        setToastMessage("Back online.");
      }
      setIsOffline(false);
    } else {
      setIsOffline(true);
      setToastMessage("Offline Mode: Data will be queued.");
    }
  };

  const handleAction = (custId, newStatus) => {
    if (isOffline) {
      // Add or update in offline queue
      const existingIndex = offlineQueue.findIndex(q => q.custId === custId);
      const newQueue = [...offlineQueue];
      
      if (existingIndex > -1) {
        newQueue[existingIndex] = { custId, status: newStatus };
      } else {
        newQueue.push({ custId, status: newStatus });
      }
      
      setOfflineQueue(newQueue);
      setToastMessage(`Saved locally: visit marked as ${newStatus}`);
    } else {
      // Trigger parent callback immediately
      onCustomerCheckIn(custId, newStatus);
      setToastMessage(`Updated: marked as ${newStatus}`);
    }
  };

  // Helper to determine status based on state + offline queue
  const getSimulatedStatus = (cust) => {
    const queuedItem = offlineQueue.find(q => q.custId === cust.id);
    if (queuedItem) return queuedItem.status;
    return cust.status;
  };

  const renderJobList = () => {
    if (assignedCustomers.length === 0) {
      return (
        <div className="mobile-empty-state">
          <p>No customers allocated for today.</p>
          <p style={{ fontSize: '10px' }}>
            {optimizationMode === 'manual' 
              ? "All active field routes are manually mapped. Check other officer tabs." 
              : "Optimization completed, adjust active status to assign."}
          </p>
        </div>
      );
    }

    return (
      <div className="mobile-job-list">
        {assignedCustomers.map((cust, index) => {
          const isActive = activeJobId === cust.id;
          const status = getSimulatedStatus(cust);
          const isQueued = offlineQueue.some(q => q.custId === cust.id);

          return (
            <div 
              key={cust.id} 
              className={`job-card ${isActive ? 'active-job' : ''}`}
              onClick={() => setActiveJobId(cust.id)}
            >
              <div className="job-header">
                <div className="job-index">{index + 1}</div>
                <div className="job-info">
                  <span className="job-cust-name">{cust.name}</span>
                  <span className="job-village">{cust.village}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isQueued && (
                    <CloudLightning size={10} style={{ color: 'var(--warning)' }} title="Queued Offline" />
                  )}
                  <div className={`job-status-dot ${status}`}></div>
                </div>
              </div>

              {isActive && (
                <div className="job-details-expand">
                  <div className="job-detail-row">
                    <span className="lbl">Product:</span>
                    <span className="val">{cust.loanType}</span>
                  </div>
                  <div className="job-detail-row">
                    <span className="lbl">Req. Amt:</span>
                    <span className="val" style={{ fontWeight: '700' }}>{cust.amount}</span>
                  </div>
                  <div className="job-detail-row">
                    <span className="lbl">Phone:</span>
                    <span className="val">{cust.phone}</span>
                  </div>

                  <div className="job-actions">
                    <button 
                      className="job-act-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setToastMessage(`Calling ${cust.name}...`);
                      }}
                    >
                      <Phone size={10} /> Call
                    </button>
                    <button 
                      className="job-act-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (branch && cust) {
                          const origin = `${branch.lat},${branch.lng}`;
                          const destination = `${cust.lat},${cust.lng}`;
                          const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=two-wheeler`;
                          window.open(mapUrl, '_blank');
                          setToastMessage(`Opening real-time navigation to ${cust.name}...`);
                        }
                      }}
                    >
                      <Navigation size={10} /> Route
                    </button>
                  </div>

                  {status !== 'Visited' ? (
                    <div className="job-actions" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '8px' }}>
                      <button 
                        className="job-act-btn success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(cust.id, 'Visited');
                        }}
                      >
                        <Check size={11} /> Verify Visit
                      </button>
                      <button 
                        className="job-act-btn secondary"
                        style={{ color: 'var(--warning)', borderColor: 'var(--warning-glow)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(cust.id, 'Postponed');
                        }}
                      >
                        <Clock size={11} /> Delay
                      </button>
                    </div>
                  ) : (
                    <div style={{ 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: 'var(--success)', 
                      fontSize: '10px', 
                      padding: '6px', 
                      borderRadius: '4px', 
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontWeight: '600'
                    }}>
                      <CheckCircle size={12} /> Visit Verified Successfully
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="right-panel">
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>Field Officer App</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulating device on the ground</p>
      </div>

      <div className="mobile-simulator-frame">
        <div className="mobile-screen">
          {/* Status Bar */}
          <div className="mobile-status-bar">
            <span>09:41 AM</span>
            <div className="mobile-status-icons">
              {isOffline ? <WifiOff size={11} style={{ color: 'var(--warning)' }} /> : <Wifi size={11} />}
              <div className="network-strength">
                <div className="network-bar h1"></div>
                <div className="network-bar h2"></div>
                <div className="network-bar h3" style={{ background: isOffline ? 'var(--text-muted)' : 'inherit' }}></div>
                <div className="network-bar h4" style={{ background: isOffline ? 'var(--text-muted)' : 'inherit' }}></div>
              </div>
              <Battery size={11} />
            </div>
          </div>

          {/* Syncing State */}
          {isSyncing && (
            <div className="syncing-overlay">
              <RefreshCw size={10} className="sync-spinner" />
              <span>Synchronizing field data...</span>
            </div>
          )}

          {/* Offline Warning Banner */}
          {isOffline && !isSyncing && (
            <div className="offline-banner">
              <AlertTriangle size={11} />
              <span>Offline Database Active (Queued: {offlineQueue.length})</span>
            </div>
          )}

          {/* App Header */}
          {selectedSO ? (
            <div className="mobile-app-header">
              <div className="mobile-profile-info">
                <h5>{selectedSO.name}</h5>
                <span>Vehicle: {selectedSO.vehicle.split(' ')[0]}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  className={`mobile-offline-toggle ${isOffline ? 'offline-active' : ''}`}
                  onClick={toggleOfflineMode}
                >
                  {isOffline ? <WifiOff size={10} /> : <Wifi size={10} />}
                  {isOffline ? 'Offline' : 'Online'}
                </button>

                <button 
                  onClick={onExitSimulator}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  title="Exit Field Simulator"
                >
                  <XCircle size={14} style={{ cursor: 'pointer' }} />
                </button>
              </div>
            </div>
          ) : null}

          {/* Toast Notification inside screen */}
          {toastMessage && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '9.5px',
              padding: '6px 12px',
              borderRadius: '20px',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              {toastMessage}
            </div>
          )}

          {/* App Body */}
          {selectedSO ? (
            renderJobList()
          ) : (
            <div className="mobile-empty-state">
              <Compass size={32} style={{ color: 'var(--text-muted)' }} />
              <p>Select a Sales Officer from the roster list to load their field itinerary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
