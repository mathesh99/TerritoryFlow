import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InteractiveMap from './components/InteractiveMap';
import MobileSimulator from './components/MobileSimulator';
import { BRANCH_INFO, SALES_OFFICERS, CUSTOMERS, MANUAL_ALLOCATIONS } from './utils/mockData';
import { solveTerritoryAllocation } from './utils/routingSolver';
import { Compass, Users, CheckCircle, MapPin, UploadCloud, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  const [branch, setBranch] = useState(BRANCH_INFO);
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [salesOfficers, setSalesOfficers] = useState(SALES_OFFICERS);
  const [selectedSOId, setSelectedSOId] = useState(null);
  const [optimizationMode, setOptimizationMode] = useState("manual");
  const [roadCondition, setRoadCondition] = useState("clear");
  const [isDragging, setIsDragging] = useState(false);

  // Geolocation trigger to update center location dynamically
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Calculate delta displacement from default Satara branch
          const latDiff = latitude - BRANCH_INFO.lat;
          const lngDiff = longitude - BRANCH_INFO.lng;

          // If the shift is zero or extremely tiny, do nothing
          if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
            return;
          }
          
          setBranch(prev => {
            if (prev.lat === latitude && prev.lng === longitude) return prev;
            return {
              ...prev,
              lat: latitude,
              lng: longitude,
              name: "AceN Mumbai Branch"
            };
          });
          
          setCustomers(prev => {
            const expectedLat = CUSTOMERS[0].lat + latDiff;
            if (prev.length > 0 && Math.abs(prev[0].lat - expectedLat) < 0.0001) {
              return prev; // already shifted
            }
            return prev.map(c => ({
              ...c,
              lat: c.lat + latDiff,
              lng: c.lng + lngDiff
            }));
          });
          
          setSalesOfficers(prev => {
            const expectedLat = SALES_OFFICERS[0].initialLat + latDiff;
            if (prev.length > 0 && Math.abs(prev[0].initialLat - expectedLat) < 0.0001) {
              return prev; // already shifted
            }
            return prev.map(so => ({
              ...so,
              initialLat: so.initialLat + latDiff,
              initialLng: so.initialLng + lngDiff
            }));
          });
        },
        (error) => {
          console.warn("Geolocation unavailable or denied. Operating in default Maharashtra mode.", error);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }, []);

  // Calculate allocations based on current state (Active SOs & selected mode & weather conditions)
  const allocations = useMemo(() => {
    const activeSOs = salesOfficers.filter(so => so.active);
    
    if (optimizationMode === 'manual') {
      const activeAlloc = {};
      activeSOs.forEach(so => {
        if (MANUAL_ALLOCATIONS[so.id]) {
          let multiplier = 1.0;
          if (roadCondition === 'muddy') multiplier = 1.94;
          else if (roadCondition === 'flooded') multiplier = 4.375;

          const baseAlloc = MANUAL_ALLOCATIONS[so.id];
          const visitTime = baseAlloc.customerIds.length * 15;
          const travelTime = Math.max(0, baseAlloc.timeMinutes - visitTime);
          const scaledTime = Math.round(travelTime * multiplier + visitTime);

          activeAlloc[so.id] = {
            ...baseAlloc,
            timeMinutes: scaledTime
          };
        }
      });
      return activeAlloc;
    } else {
      // Dynamic cluster solver with weather awareness
      return solveTerritoryAllocation(customers, salesOfficers, branch, roadCondition);
    }
  }, [customers, salesOfficers, optimizationMode, branch, roadCondition]);

  // Calculate high-fidelity metrics dynamically based on allocations
  const metrics = useMemo(() => {
    const activeSOs = salesOfficers.filter(so => so.active);
    
    // 1. Calculate Coverage
    const uniqueAssigned = new Set();
    Object.keys(allocations).forEach(soId => {
      allocations[soId].customerIds.forEach(id => {
        uniqueAssigned.add(id);
      });
    });
    const coverage = Math.round((uniqueAssigned.size / customers.length) * 100);

    // 2. Calculate Overlaps
    let overlapCount = 0;
    const customerAssignments = {};
    Object.keys(allocations).forEach(soId => {
      allocations[soId].customerIds.forEach(id => {
        customerAssignments[id] = (customerAssignments[id] || 0) + 1;
      });
    });
    Object.keys(customerAssignments).forEach(id => {
      if (customerAssignments[id] > 1) {
        overlapCount += (customerAssignments[id] - 1);
      }
    });

    // 3. Calculate Travel Distance
    let totalDistance = 0;
    Object.keys(allocations).forEach(soId => {
      totalDistance += allocations[soId].distanceKm;
    });
    totalDistance = parseFloat(totalDistance.toFixed(1));

    // 4. Planning Time
    const planningTime = optimizationMode === 'manual' ? "2 hours" : "0.5 sec";

    return {
      coverage,
      overlaps: overlapCount,
      distance: totalDistance,
      planningTime,
      totalCustomers: customers.length
    };
  }, [customers, salesOfficers, allocations, optimizationMode]);

  // Enrich sales officers metadata with current route statistics for Sidebar UI list
  const enrichedSalesOfficers = useMemo(() => {
    return salesOfficers.map(so => {
      const alloc = allocations[so.id] || { customerIds: [], distanceKm: 0, timeMinutes: 0 };
      return {
        ...so,
        assignedCount: alloc.customerIds.length,
        routeDistance: alloc.distanceKm,
        routeTime: alloc.timeMinutes
      };
    });
  }, [salesOfficers, allocations]);

  // Callbacks
  const handleToggleSO = (soId) => {
    setSalesOfficers(prev => 
      prev.map(so => {
        if (so.id === soId) {
          // If we are deactivating the currently selected SO, select another active one
          if (so.active && selectedSOId === soId) {
            const nextActive = prev.find(o => o.id !== soId && o.active);
            setSelectedSOId(nextActive ? nextActive.id : null);
          } else if (!so.active && !selectedSOId) {
            setSelectedSOId(soId);
          }
          return { ...so, active: !so.active };
        }
        return so;
      })
    );
  };

  const handleCustomerCheckIn = (custId, status) => {
    setCustomers(prev => 
      prev.map(c => c.id === custId ? { ...c, status } : c)
    );
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Officers Sheet
    const officersData = [
      { id: "so-1", name: "Rahul Shinde", initials: "RS", color: "#4f46e5", phone: "+91 98231 44521", vehicle: "Hero Splendor", efficiency: "94%" },
      { id: "so-2", name: "Priya Patil", initials: "PP", color: "#db2777", phone: "+91 95452 77810", vehicle: "Honda Activa", efficiency: "96%" },
      { id: "so-3", name: "Amit Deshmukh", initials: "AD", color: "#854d0e", phone: "+91 91580 33425", vehicle: "Bajaj Pulsar", efficiency: "88%" },
      { id: "so-4", name: "Savita Kamble", initials: "SK", color: "#d97706", phone: "+91 88884 11209", vehicle: "TVS XL100", efficiency: "91%" },
      { id: "so-5", name: "Vikram Jadhav", initials: "VJ", color: "#0891b2", phone: "+91 90901 22334", vehicle: "TVS Apache", efficiency: "92%" },
      { id: "so-6", name: "Deepali Pawar", initials: "DP", color: "#a855f7", phone: "+91 81812 33445", vehicle: "Suzuki Access", efficiency: "95%" }
    ];
    const wsOfficers = XLSX.utils.json_to_sheet(officersData);
    XLSX.utils.book_append_sheet(wb, wsOfficers, "Officers");

    // 2. Customers Sheet (Bandra West template coordinates)
    const customersData = [
      { id: "cust-1", name: "Balasaheb Pawar", village: "Khar Danda", lat: 19.1040, lng: 72.8709, loanType: "KCC Loan", amount: "₹1,50,000", phone: "+91 98220 12345" },
      { id: "cust-2", name: "Sunita Jadhav", village: "Khar Danda", lat: 19.1075, lng: 72.8749, loanType: "MSME Loan", amount: "₹2,00,000", phone: "+91 99600 54321" },
      { id: "cust-3", name: "Tukaram Shinde", village: "Santacruz West", lat: 19.1165, lng: 72.9009, loanType: "Dairy Loan", amount: "₹1,20,000", phone: "+91 94220 98765" },
      { id: "cust-4", name: "Anjali Bhosale", village: "Santacruz West", lat: 19.1200, lng: 72.8969, loanType: "Group Loan", amount: "₹50,000", phone: "+91 98811 22334" },
      { id: "cust-5", name: "Vitthal Jagtap", village: "Juhu Lane", lat: 19.1505, lng: 72.8639, loanType: "Tractor Finance", amount: "₹4,50,000", phone: "+91 95522 33445" }
    ];
    const wsCustomers = XLSX.utils.json_to_sheet(customersData);
    XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");

    XLSX.writeFile(wb, "AceN_Territory_Template.xlsx");
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Parse Officers
        const officersSheet = workbook.Sheets['Officers'];
        let importedOfficers = [];
        if (officersSheet) {
          const json = XLSX.utils.sheet_to_json(officersSheet);
          importedOfficers = json.map(row => ({
            id: row.id ? String(row.id) : `so-${Math.random().toString(36).substr(2, 9)}`,
            name: row.name || 'Unnamed Officer',
            initials: row.initials || 'SO',
            color: row.color || '#6366f1',
            phone: row.phone || '',
            vehicle: row.vehicle || '',
            efficiency: row.efficiency || '90%',
            active: true,
            initialLat: branch.lat,
            initialLng: branch.lng
          }));
        }

        // Parse Customers
        const customersSheet = workbook.Sheets['Customers'];
        let importedCustomers = [];
        if (customersSheet) {
          const json = XLSX.utils.sheet_to_json(customersSheet);
          importedCustomers = json.map(row => ({
            id: row.id ? String(row.id) : `cust-${Math.random().toString(36).substr(2, 9)}`,
            name: row.name || 'Unnamed Customer',
            village: row.village || 'Unknown Location',
            lat: parseFloat(row.lat) || branch.lat,
            lng: parseFloat(row.lng) || branch.lng,
            loanType: row.loanType || 'Micro Loan',
            amount: row.amount || '₹50,000',
            phone: row.phone || '',
            status: 'Pending'
          }));
        }

        if (importedOfficers.length > 0) {
          setSalesOfficers(importedOfficers);
          if (!importedOfficers.some(so => so.id === selectedSOId)) {
            setSelectedSOId(importedOfficers[0].id);
          }
        }
        if (importedCustomers.length > 0) {
          setCustomers(importedCustomers);
        }

        alert(`Successfully imported ${importedOfficers.length} Sales Officers and ${importedCustomers.length} Customers!`);
      } catch (error) {
        console.error("Failed to parse Excel file", error);
        alert("Failed to parse Excel file. Please ensure it matches the template format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle full-window file dragging for drag-and-drop Excel loading
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleExcelImport({ target: { files } });
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [branch]);

  const handleExportDispatch = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Dispatch Summary Sheet
      const summaryRows = salesOfficers
        .filter(so => so.active)
        .map(so => {
          const alloc = allocations[so.id] || { customerIds: [], distanceKm: 0, timeMinutes: 0 };
          return {
            "Officer ID": so.id,
            "Officer Name": so.name,
            "Vehicle Registration": so.vehicle,
            "Efficiency Rating": so.efficiency,
            "Assigned Visits": alloc.customerIds.length,
            "Total Distance (km)": alloc.distanceKm,
            "Est. Duration": `${Math.floor(alloc.timeMinutes / 60)}h ${alloc.timeMinutes % 60}m`
          };
        });
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Dispatch Summary");

      // 2. Detailed Stop Sequence Sheet
      const detailsRows = [];
      salesOfficers
        .filter(so => so.active)
        .forEach(so => {
          const alloc = allocations[so.id];
          if (!alloc || !alloc.customerIds) return;

          alloc.customerIds.forEach((custId, idx) => {
            const cust = customers.find(c => c.id === custId);
            if (cust) {
              detailsRows.push({
                "Officer Name": so.name,
                "Stop Number": idx + 1,
                "Customer Name": cust.name,
                "Village/Neighborhood": cust.village,
                "Loan Product": cust.loanType,
                "Loan Amount": cust.amount,
                "Contact Phone": cust.phone,
                "Status": cust.status
              });
            }
          });
        });
      const wsDetails = XLSX.utils.json_to_sheet(detailsRows);
      XLSX.utils.book_append_sheet(wb, wsDetails, "Detailed Stops Sequence");

      XLSX.writeFile(wb, "AceN_Final_Dispatch_Schedule.xlsx");
    } catch (err) {
      console.error("Failed to export schedule to Excel", err);
      alert("An error occurred while exporting the schedule.");
    }
  };

  const selectedSO = salesOfficers.find(so => so.id === selectedSOId);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Compass size={22} />
          </div>
          <div className="logo-title-area">
            <div className="logo-title-row">
              <h1>TerritoryFlow</h1>
              <span className="logo-tag">PROBLEM 1</span>
            </div>
            <span className="logo-subtitle">
              📍 {branch.name} • {branch.district}
            </span>
          </div>
        </div>

        {/* Center Header Status Notification */}
        <div className={`header-notification ${optimizationMode === 'manual' ? 'manual' : 'optimized'}`}>
          {optimizationMode === 'manual' ? (
            <span>⚠️ Manual scheduling has overlaps and leaves outlying locations uncovered.</span>
          ) : (
            <span>✅ Optimization complete! Distinct sectors assigned. 0 overlaps.</span>
          )}
        </div>

        <div className="header-controls">
          <div className="excel-actions">
            <button className="template-btn" onClick={handleDownloadTemplate} title="Download Excel Template">
              <Download size={13} />
              Template
            </button>
            <label className="import-btn" title="Import Excel Sheet">
              <UploadCloud size={13} style={{ cursor: 'pointer' }} />
              Import
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleExcelImport} 
                style={{ display: 'none' }} 
              />
            </label>
            <button className="export-btn" onClick={handleExportDispatch} title="Export Final Dispatch Schedule">
              <CheckCircle size={13} />
              Export Dispatch
            </button>
            <select 
              className="weather-select"
              value={roadCondition} 
              onChange={(e) => setRoadCondition(e.target.value)}
              title="Simulate Road Conditions"
            >
              <option value="clear">☀️ Clear Road</option>
              <option value="muddy">🌧️ Monsoon Mud</option>
              <option value="flooded">🌊 Severe Flood</option>
            </select>
          </div>

          <div className="toggle-container">
            <button 
              className={`toggle-btn ${optimizationMode === 'manual' ? 'active manual' : ''}`}
              onClick={() => setOptimizationMode('manual')}
            >
              Manual Dispatch
            </button>
            <button 
              className={`toggle-btn ${optimizationMode === 'optimized' ? 'active optimized' : ''}`}
              onClick={() => setOptimizationMode('optimized')}
            >
              🚀 AI Optimized
            </button>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="dashboard-layout">
        {/* Left Side Controls & List */}
        <Sidebar 
          salesOfficers={enrichedSalesOfficers}
          onToggleSO={handleToggleSO}
          selectedSOId={selectedSOId}
          onSelectSO={(soId) => setSelectedSOId(prev => prev === soId ? null : soId)}
          metrics={metrics}
          optimizationMode={optimizationMode}
        />

        {/* Central Map View */}
        <InteractiveMap 
          branchInfo={branch}
          customers={customers}
          salesOfficers={salesOfficers}
          allocations={allocations}
          optimizationMode={optimizationMode}
          selectedSOId={selectedSOId}
          onOptimize={() => setOptimizationMode('optimized')}
          onReset={() => setOptimizationMode('manual')}
        />

        {/* Right Side Simulator */}
        <MobileSimulator 
          selectedSO={selectedSO}
          allocations={allocations}
          customers={customers}
          onCustomerCheckIn={handleCustomerCheckIn}
          optimizationMode={optimizationMode}
          onExitSimulator={() => setSelectedSOId(null)}
          branch={branch}
        />
      </div>

      {isDragging && (
        <div className="drag-overlay">
          <div className="drag-overlay-card">
            <UploadCloud size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
            <h2>Drop Excel File to Load Data</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Import Sales Officers & Customers instantly
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
