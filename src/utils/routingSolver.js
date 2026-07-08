// Utility for calculating geographical distance and solving routing (K-Means Clustering + Greedy TSP)

// Calculate distance in km between two coordinates using Haversine formula
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Solves the allocation and creates optimized routes
export function solveTerritoryAllocation(customers, salesOfficers, branch, roadCondition = 'clear') {
  const activeSOs = salesOfficers.filter(so => so.active);
  if (activeSOs.length === 0) return {};

  // Dynamically assign initial centroids relative to the current branch coordinates
  // to ensure K-Means partitions correctly at any latitude/longitude (Mumbai, Satara, or Live GPS)
  const sectorSeeds = {
    "so-1": { lat: branch.lat + 0.025, lng: branch.lng },        // North
    "so-2": { lat: branch.lat,        lng: branch.lng + 0.025 },  // East
    "so-3": { lat: branch.lat - 0.025, lng: branch.lng },        // South
    "so-4": { lat: branch.lat,        lng: branch.lng - 0.025 },  // West
    "so-5": { lat: branch.lat + 0.02,  lng: branch.lng + 0.02 },  // North-East
    "so-6": { lat: branch.lat - 0.02,  lng: branch.lng - 0.02 },  // South-West
    "so-7": { lat: branch.lat + 0.02,  lng: branch.lng - 0.02 },  // North-West
    "so-8": { lat: branch.lat - 0.02,  lng: branch.lng + 0.02 },  // South-East
    "so-9": { lat: branch.lat + 0.012, lng: branch.lng + 0.022 }, // East-North-East
    "so-10": { lat: branch.lat - 0.012, lng: branch.lng - 0.022 } // West-South-West
  };

  const centroids = {};
  activeSOs.forEach(so => {
    centroids[so.id] = sectorSeeds[so.id] || { lat: so.initialLat, lng: so.initialLng };
  });

  // Step 2: K-Means Iterations with Capacitated (Even) Assignment constraints
  let assignments = {};
  
  for (let iter = 0; iter < 5; iter++) {
    // Reset assignments
    assignments = {};
    activeSOs.forEach(so => {
      assignments[so.id] = [];
    });

    // Calculate maximum capacity per officer with 15% headroom
    // to ensure a similar number of visits while prioritizing distance
    const maxCapacity = Math.ceil((customers.length / activeSOs.length) * 1.15);

    // Compute distances for all customer-officer candidate pairs
    const candidates = [];
    customers.forEach(customer => {
      activeSOs.forEach(so => {
        const dist = getHaversineDistance(
          customer.lat,
          customer.lng,
          centroids[so.id].lat,
          centroids[so.id].lng
        );
        candidates.push({ customer, soId: so.id, dist });
      });
    });

    // Sort combinations by distance ascending to allocate closest customers first
    candidates.sort((a, b) => a.dist - b.dist);

    const assignedCustIds = new Set();
    const soCounts = {};
    activeSOs.forEach(so => {
      soCounts[so.id] = 0;
    });

    // Allocate customers greedily under capacity constraints
    candidates.forEach(cand => {
      if (assignedCustIds.has(cand.customer.id)) return;
      if (soCounts[cand.soId] >= maxCapacity) return;

      assignments[cand.soId].push(cand.customer);
      assignedCustIds.add(cand.customer.id);
      soCounts[cand.soId]++;
    });

    // Fallback: allocate any unassigned customer to the nearest available under-capacity officer
    customers.forEach(customer => {
      if (!assignedCustIds.has(customer.id)) {
        let minDistance = Infinity;
        let bestSOId = null;

        activeSOs.forEach(so => {
          if (soCounts[so.id] < maxCapacity) {
            const dist = getHaversineDistance(
              customer.lat,
              customer.lng,
              centroids[so.id].lat,
              centroids[so.id].lng
            );
            if (dist < minDistance) {
              minDistance = dist;
              bestSOId = so.id;
            }
          }
        });

        // absolute fallback to closest if all capacities are filled due to numeric rounding
        if (!bestSOId) {
          activeSOs.forEach(so => {
            const dist = getHaversineDistance(
              customer.lat,
              customer.lng,
              centroids[so.id].lat,
              centroids[so.id].lng
            );
            if (dist < minDistance) {
              minDistance = dist;
              bestSOId = so.id;
            }
          });
        }

        assignments[bestSOId].push(customer);
        assignedCustIds.add(customer.id);
        soCounts[bestSOId]++;
      }
    });

    // Update centroids based on average lat/lng of assigned customers
    activeSOs.forEach(so => {
      const assigned = assignments[so.id];
      if (assigned.length > 0) {
        let sumLat = 0;
        let sumLng = 0;
        assigned.forEach(c => {
          sumLat += c.lat;
          sumLng += c.lng;
        });
        centroids[so.id] = {
          lat: sumLat / assigned.length,
          lng: sumLng / assigned.length
        };
      } else {
        // Empty cluster fallback: Reassign centroid to a random customer to kickstart allocation
        const randomIndex = Math.floor((so.id.charCodeAt(so.id.length - 1) * 7) % customers.length);
        const fallbackCust = customers[randomIndex] || customers[0];
        if (fallbackCust) {
          centroids[so.id] = { lat: fallbackCust.lat, lng: fallbackCust.lng };
        }
      }
    });
  }

  // Step 3: Solve TSP for each officer's assigned customers (Greedy Nearest Neighbor)
  const results = {};

  activeSOs.forEach(so => {
    const assignedCustomers = [...assignments[so.id]];
    const route = [];
    let currentLat = branch.lat;
    let currentLng = branch.lng;
    let totalDistance = 0;

    while (assignedCustomers.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < assignedCustomers.length; i++) {
        const dist = getHaversineDistance(
          currentLat,
          currentLng,
          assignedCustomers[i].lat,
          assignedCustomers[i].lng
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      const nextCustomer = assignedCustomers.splice(nearestIndex, 1)[0];
      route.push(nextCustomer.id);
      totalDistance += minDistance;
      currentLat = nextCustomer.lat;
      currentLng = nextCustomer.lng;
    }

    // Add distance back to the branch
    if (route.length > 0) {
      totalDistance += getHaversineDistance(currentLat, currentLng, branch.lat, branch.lng);
    }

    // Dynamic speed based on road conditions (Clear/Dry: 35km/h, Muddy: 18km/h, Flooded: 8km/h)
    let speed = 35;
    if (roadCondition === 'muddy') speed = 18;
    else if (roadCondition === 'flooded') speed = 8;

    const travelTimeMinutes = (totalDistance / speed) * 60;
    const visitTimeMinutes = route.length * 15;
    const totalTimeMinutes = Math.round(travelTimeMinutes + visitTimeMinutes);

    results[so.id] = {
      customerIds: route,
      distanceKm: parseFloat(totalDistance.toFixed(1)),
      timeMinutes: totalTimeMinutes
    };
  });

  return results;
}
