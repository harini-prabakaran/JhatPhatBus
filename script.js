// Punjab Bus Tracking System
let map;
let sourceMarker, destinationMarker;
let routePolyline;
let buses = [];
let busMarkers = [];
let selectedBus = null;
let busMovementInterval;
let activeBus = null;
let routeLines = [];



// Punjab locations with real coordinates
const punjabLocations = [
  // Chandigarh – Mohali – Panchkula belt
  { name: "ISBT Sector 17, Chandigarh", lat: 30.7415, lng: 76.7821 },
  { name: "ISBT Sector 43, Chandigarh", lat: 30.7123, lng: 76.7548 },
  { name: "Phase 7 Bus Stand, Mohali", lat: 30.7046, lng: 76.7179 },
  { name: "Kharar Bus Stand", lat: 30.7463, lng: 76.6460 },

  // Amritsar region
  { name: "Amritsar Bus Stand", lat: 31.6339, lng: 74.8656 },
  { name: "Ajnala", lat: 31.8447, lng: 74.7610 },
  { name: "Tarn Taran", lat: 31.4516, lng: 74.9273 },

  // Ludhiana region
  { name: "Ludhiana Bus Stand", lat: 30.9140, lng: 75.8524 },
  { name: "Jagraon", lat: 30.7866, lng: 75.4739 },
  { name: "Khanna", lat: 30.7043, lng: 76.2210 },
  { name: "Samrala", lat: 30.8358, lng: 76.1906 },

  // Jalandhar region
  { name: "Jalandhar Bus Stand", lat: 31.3260, lng: 75.5762 },
  { name: "Phillaur", lat: 31.0314, lng: 75.7852 },
  { name: "Nakodar", lat: 31.1240, lng: 75.4742 },

  // Patiala region
  { name: "Patiala Bus Stand", lat: 30.3398, lng: 76.3869 },
  { name: "Rajpura", lat: 30.4833, lng: 76.5928 },
  { name: "Nabha", lat: 30.3755, lng: 76.1520 },

  // Malwa belt
  { name: "Bathinda Bus Stand", lat: 30.2109, lng: 74.9455 },
  { name: "Mansa", lat: 29.9886, lng: 75.4016 },
  { name: "Barnala", lat: 30.3819, lng: 75.5431 },
  { name: "Sangrur", lat: 30.2458, lng: 75.8421 },
  { name: "Malerkotla", lat: 30.5293, lng: 75.8787 },

  // Doaba belt
  { name: "Hoshiarpur Bus Stand", lat: 31.5318, lng: 75.9063 },
  { name: "Garhshankar", lat: 31.2164, lng: 76.1420 },
  { name: "Mukerian", lat: 31.9516, lng: 75.6150 }
];


function getOccupancyStatus(occ) {
    if (occ < 50) return "Free";
    if (occ <= 80) return "Moderate";
    return "Heavy";
}



// Predefined bus routes in Punjab
const busRoutes = [
  {
    id: "PRTC-332",
    name: "Chandigarh Express",
    route: "ISBT Sector 17 → Ludhiana Bus Stand",
    path: [
      [30.7415, 76.7821],   // ISBT Sector 17, Chandigarh
      [30.7123, 76.7548],   // ISBT Sector 43
      [30.7463, 76.6460],   // Kharar
      [30.7043, 76.2210],   // Khanna
      [30.9140, 75.8524]    // Ludhiana Bus Stand
    ],
    speed: 45,
    occupancy: 75,
    color: "#5182ecff"
  },

  {
    id: "PRTC-102",
    name: "Amritsar Shuttle",
    route: "Amritsar Bus Stand → Jalandhar Bus Stand",
    path: [
      [31.6339, 74.8656],   // Amritsar Bus Stand
      [31.4516, 74.9273],   // Tarn Taran
      [31.1240, 75.4742],   // Nakodar
      [31.3260, 75.5762]    // Jalandhar Bus Stand
    ],
    speed: 35,
    occupancy: 60,
    color: "#137d72ff"
  },

  {
    id: "PRTC-403",
    name: "Patiala Connector",
    route: "Patiala → Bathinda Bus Stand",
    path: [
      [30.3398, 76.3869],   // Patiala Bus Stand
      [30.3755, 76.1520],   // Nabha
      [30.2458, 75.8421],   // Sangrur
      [30.3819, 75.5431],   // Barnala
      [30.2109, 74.9455]    // Bathinda Bus Stand
    ],
    speed: 40,
    occupancy: 80,
    color: "#6f1d1cff"
  },

  {
    id: "PRTC-234",
    name: "Mohali Local",
    route: "Mohali – Kharar – Mohali",
    path: [
      [30.7046, 76.7179],   // Phase 7 Bus Stand, Mohali
      [30.7463, 76.6460],   // Kharar
      [30.7123, 76.7548],   // ISBT Sector 43
      [30.7046, 76.7179]    // Back to Mohali
    ],
    speed: 25,
    occupancy: 45,
    color: "#ee5113ff"
  },

  {
    id: "PRTC-345",
    name: "Inter-City Fast",
    route: "Ludhiana → Patiala",
    path: [
      [30.9140, 75.8524],   // Ludhiana Bus Stand
      [30.7866, 75.4739],   // Jagraon
      [30.7043, 76.2210],   // Khanna
      [30.4833, 76.5928],   // Rajpura
      [30.3398, 76.3869]    // Patiala Bus Stand
    ],
    speed: 50,
    occupancy: 70,
    color: "#6226eda0"
  },
  {
  id: "PRTC-401",
  name: "Doaba Connector",
  route: "Jalandhar → Hoshiarpur",
  path: [
    [31.3260, 75.5762],   // Jalandhar Bus Stand
    [31.2500, 75.6500],   // Adampur
    [31.2000, 75.8000],   // Bhogpur
    [31.5318, 75.9063]    // Hoshiarpur Bus Stand
  ],
  speed: 40,
  occupancy: 65,
  color: "#6ebc8aff"
},

{
  id: "PRTC-278",
  name: "Malwa Local",
  route: "Bathinda → Mansa",
  path: [
    [30.2109, 74.9455],   // Bathinda Bus Stand
    [30.1500, 75.1000],   // Rampura Phul
    [29.9886, 75.4016]    // Mansa
  ],
  speed: 35,
  occupancy: 55,
  color: "#dc2626"
},

{
  id: "PRTC-319",
  name: "Border Shuttle",
  route: "Amritsar → Tarn Taran",
  path: [
    [31.6339, 74.8656],   // Amritsar Bus Stand
    [31.5500, 74.9000],   // Chabal
    [31.4516, 74.9273]    // Tarn Taran
  ],
  speed: 30,
  occupancy: 60,
  color: "#f59e0b"
},

{
  id: "PRTC-507",
  name: "Capital Link",
  route: "Chandigarh → Rupnagar",
  path: [
    [30.7415, 76.7821],   // ISBT Sector 17, Chandigarh
    [30.7123, 76.7548],   // ISBT Sector 43
    [30.8500, 76.5000],   // Kurali
    [30.9667, 76.5333]    // Rupnagar
  ],
  speed: 45,
  occupancy: 68,
  color: "#2563eb"
},

{
  id: "PRTC-366",
  name: "Shivalik Local",
  route: "Hoshiarpur → Mukerian",
  path: [
    [31.5318, 75.9063],   // Hoshiarpur
    [31.6500, 75.8000],   // Talwara
    [31.9516, 75.6150]    // Mukerian
  ],
  speed: 32,
  occupancy: 50,
  color: "#8b5cf6"
},

{
  id: "PRTC-421",
  name: "Royal Patiala",
  route: "Patiala → Nabha",
  path: [
    [30.3398, 76.3869],   // Patiala Bus Stand
    [30.3755, 76.1520]    // Nabha
  ],
  speed: 28,
  occupancy: 48,
  color: "#0ea5e9"
},

{
  id: "PRTC-389",
  name: "Grain Belt Express",
  route: "Sangrur → Barnala",
  path: [
    [30.2458, 75.8421],   // Sangrur
    [30.3000, 75.7000],   // Sehna
    [30.3819, 75.5431]    // Barnala
  ],
  speed: 38,
  occupancy: 62,
  color: "#22c55e"
}

];


// Initialize map
function initMap() {
    map = L.map('map').setView([30.7333, 76.7794], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

}

// Initialize buses
function initBuses() {
    buses = busRoutes.map(busRoute => ({
        ...busRoute,
        currentPosition: 0,
        currentLat: busRoute.path[0][0],
        currentLng: busRoute.path[0][1]
    }));
    
    updateBusesList();
    createBusMarkers();
}

// Create bus markers on map
function createBusMarkers() {
    buses.forEach(bus => {
        const busIcon = L.divIcon({
            html: `<div class="live-bus-marker">🚌</div>`,
            className: 'bus-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([bus.currentLat, bus.currentLng], { icon: busIcon })
            .addTo(map)
            .bindPopup(createBusPopup(bus));
        
        busMarkers.push(marker);
    });
}
function drawAllRoutes() {
    busRoutes.forEach(route => {
        route.polyline = L.polyline(route.path, {
            color: route.color,
            weight: 4,
            opacity: 0.6,
            smoothFactor: 1
        }).addTo(map);

        route.polyline.bindPopup(`
            <b>${route.name}</b><br>
            ${route.route}
        `);
    });
}
function highlightRoute(routeId) {
    busRoutes.forEach(route => {
        if (route.id === routeId) {
            route.polyline.setStyle({
                weight: 6,
                opacity: 1
            });
        } else {
            route.polyline.setStyle({
                weight: 4,
                opacity: 0.3
            });
        }
    });
}



// Create bus popup content
function createBusPopup(bus) {
    const eta = calculateETA(bus);

    return `
        <div class="bus-popup">
            <h4>${bus.name} (${bus.id})</h4>
            <p><strong>Route:</strong> ${bus.route}</p>
            <p><strong>Speed:</strong> ${bus.speed} km/h</p>
            <p><strong>Occupancy:</strong> ${bus.occupancy}%</p>
        </div>
    `;
}
function getETAMinutes(bus) {
    if (!window.selectedSource) return Infinity;

    const distanceKm = calculateDistance(
        bus.currentLat,
        bus.currentLng,
        window.selectedSource.lat,
        window.selectedSource.lng
    );

    return (distanceKm / bus.speed) * 60; // minutes (float)
}

function calculateETA(bus) {
    if (!window.selectedSource || !bus) return "Select source";

    const distanceKm = calculateDistance(
        bus.currentLat,
        bus.currentLng,
        window.selectedSource.lat,
        window.selectedSource.lng
    );

    const totalMinutes = Math.round((distanceKm / bus.speed) * 60);

    if (totalMinutes <= 1) return "Arriving";

    if (totalMinutes < 60) {
        return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes === 0
        ? `${hours} hr`
        : `${hours} hr ${minutes} min`;
}

  


// Calculate distance using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Move buses along their routes
function moveBuses() {
    buses.forEach((bus, index) => {
        // Move to next position on path
        bus.currentPosition += 0.02;

        if (bus.currentPosition >= 1) {
            bus.currentPosition = 0;
        }

        const pathIndex = Math.floor(bus.currentPosition * (bus.path.length - 1));
        const nextIndex = Math.min(pathIndex + 1, bus.path.length - 1);
        const segmentProgress =
            (bus.currentPosition * (bus.path.length - 1)) - pathIndex;

        const currentPoint = bus.path[pathIndex];
        const nextPoint = bus.path[nextIndex];

        bus.currentLat =
            currentPoint[0] +
            (nextPoint[0] - currentPoint[0]) * segmentProgress;

        bus.currentLng =
            currentPoint[1] +
            (nextPoint[1] - currentPoint[1]) * segmentProgress;

        // ✅ UPDATE MARKER POSITION
        if (busMarkers[index]) {
            busMarkers[index].setLatLng([bus.currentLat, bus.currentLng]);

            // 🔥 ETA ONLY FOR ACTIVE BUS
            const eta =
                bus === activeBus
                    ? calculateETA(bus)
                    : null;

            busMarkers[index].setPopupContent(
                createBusPopup(bus, eta)
            );
        }
    });

    updateBusesList();
    updateRouteInfo();
}


// Update buses list in sidebar
function updateBusesList() {
    const busesList = document.getElementById('busesList');

    if (buses.length === 0) {
        busesList.innerHTML = '<div class="loading">No buses available</div>';
        return;
    }

    // 🔥 SORT BUSES BY ETA (NEAREST FIRST)
    const sortedBuses = [...buses].sort((a, b) => {
        return getETAMinutes(a) - getETAMinutes(b);
    });

    busesList.innerHTML = sortedBuses.map((bus, index) => {
        const eta = calculateETA(bus);
        const isActive = selectedBus && selectedBus.id === bus.id;
        const isNearest = index === 0 && window.selectedSource;

        return `
            <div class="bus-card ${isActive ? 'active' : ''} ${isNearest ? 'nearest' : ''}"
                 onclick="selectBus('${bus.id}')">
                <div class="bus-card-header">
                    <span class="bus-number">${bus.id}</span>
                    <span class="bus-status moving">● LIVE</span>
                </div>
                <div class="bus-route">${bus.route}</div>
                <div class="bus-details">
                    <span>Speed: ${bus.speed} km/h</span>
                    <span class="eta">ETA: ${eta}</span>
                </div>
            </div>
        `;
    }).join('');
}


// Select a bus
function selectBus(busId) {
    selectedBus = buses.find(bus => bus.id === busId);
    const busIndex = buses.findIndex(bus => bus.id === busId);
    
    // Update UI
    document.querySelectorAll('.bus-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelectorAll('.bus-card')[busIndex]?.classList.add('active');
    
    // Center map on selected bus
    if (selectedBus) {
        map.setView([selectedBus.currentLat, selectedBus.currentLng], 10);
        busMarkers[busIndex].openPopup();
    }
    highlightRoute(busId);
    updateBusesList();
    updateRouteInfo();
}

// Auto-select nearest bus to source
function autoSelectNearestBus() {
    const sourceInput = document.getElementById('source');
    const sourceName = sourceInput.value.trim();
    
    if (!sourceName || buses.length === 0) return;
    
    const source = punjabLocations.find(loc => 
        loc.name.toLowerCase() === sourceName.toLowerCase()
    );
    
    if (!source) return;
    
    // Find nearest bus
    let nearestBus = null;
    let minDistance = Infinity;
    
    buses.forEach(bus => {
        const distance = calculateDistance(
            source.lat, source.lng,
            bus.currentLat, bus.currentLng
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestBus = bus;
        }
    });
    
    if (nearestBus) {
        selectBus(nearestBus.id);
    }
}

// Update route information
function updateRouteInfo() {
    const routeInfo = document.getElementById('routeInfo');
    const sourceInput = document.getElementById('source');
    const destinationInput = document.getElementById('destination');
    
    const sourceName = sourceInput.value.trim();
    const destName = destinationInput.value.trim();
    
    if (!sourceName && !destName) {
        routeInfo.innerHTML = '<p>Select source and destination to view route details</p>';
        return;
    }
    
    let html = '<div class="route-info-container">';
    function highlightFastestRouteInList(routeId) {
    document.querySelectorAll('.route-card').forEach(card => {
        card.classList.remove('fastest');
        if (card.dataset.routeId === routeId) {
            card.classList.add('fastest');
        }
    });
}

    
    if (sourceName) {
        html += `
            <div class="route-info-item">
                <span>From:</span>
                <span class="route-info-value">${sourceName}</span>
            </div>
        `;
    }
    
    if (destName) {
        html += `
            <div class="route-info-item">
                <span>To:</span>
                <span class="route-info-value">${destName}</span>
            </div>
        `;
    }
    
    if (selectedBus) {
        const eta = calculateETA(selectedBus);
        html += `
            <div class="route-info-item">
                <span>Selected Bus:</span>
                <span class="route-info-value">${selectedBus.name}</span>
            </div>
            <div class="route-info-item">
                <span>ETA:</span>
                <span class="route-info-value">${eta}</span>
            </div>
        `;
    }
    
    if (sourceName && destName) {
        const source = punjabLocations.find(loc => 
            loc.name.toLowerCase() === sourceName.toLowerCase()
        );
        const dest = punjabLocations.find(loc => 
            loc.name.toLowerCase() === destName.toLowerCase()
        );
        
        if (source && dest) {
            const distance = calculateDistance(
                source.lat, source.lng,
                dest.lat, dest.lng
            );
            html += `
                <div class="route-info-item">
                    <span>Distance:</span>
                    <span class="route-info-value">${distance.toFixed(1)} km</span>
                </div>
            `;
        }
    }
    
    html += '</div>';
    routeInfo.innerHTML = html;
}

// Search locations with autocomplete
function searchStops(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const query = input.value.trim().toLowerCase();
    
    if (query.length < 1) {
        dropdown.classList.remove('active');
        return;
    }
    
    const matches = punjabLocations.filter(loc => 
        loc.name.toLowerCase().includes(query)
    );
    
    if (matches.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item">No matches found</div>';
        dropdown.classList.add('active');
        return;
    }
    
    dropdown.innerHTML = matches.map(loc => `
        <div class="dropdown-item" onclick="selectStop('${inputId}', '${loc.name}', ${loc.lat}, ${loc.lng})">
            ${loc.name}
        </div>
    `).join('');
    
    dropdown.classList.add('active');
}

// Select a location from dropdown
function selectStop(inputId, name, lat, lng) {
    const input = document.getElementById(inputId);
    const dropdown = inputId === 'source' ? 'sourceDropdown' : 'destDropdown';

    input.value = name;
    document.getElementById(dropdown).classList.remove('active');

    if (inputId === 'source') {
        if (sourceMarker) sourceMarker.remove();

        sourceMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`🟢 ${name}`)
            .openPopup();

        window.selectedSource = {
            name,
            lat: Number(lat),
            lng: Number(lng)
        };

    } else {
        if (destinationMarker) destinationMarker.remove();

        destinationMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`🔴 ${name}`)
            .openPopup();

        window.selectedDestination = {
            name,
            lat: Number(lat),
            lng: Number(lng)
        };
        
        autoSelectNearestBus();
        showFastestRoute();
        updateFastestRouteUI();

    }
}

    
    // Draw route if both markers exist
    if (sourceMarker && destinationMarker) {
        drawRoute();
        autoSelectNearestBus();
    }
    
    updateRouteInfo();


// Draw route between source and destination
function drawRoute() {
    if (!sourceMarker || !destinationMarker) return;
    
    const sourceLatLng = sourceMarker.getLatLng();
    const destLatLng = destinationMarker.getLatLng();
    
    if (routePolyline) {
        routePolyline.remove();
    }
    
    routePolyline = L.polyline([
        [sourceLatLng.lat, sourceLatLng.lng],
        [destLatLng.lat, destLatLng.lng]
    ], {
        color: '#2563eb',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Auto-zoom to fit route
    const group = new L.featureGroup([sourceMarker, destinationMarker]);
    map.fitBounds(group.getBounds().pad(0.1));
}

// Clear route and markers
function clearRoute() {
    if (sourceMarker) {
        sourceMarker.remove();
        sourceMarker = null;
    }
    
    if (destinationMarker) {
        destinationMarker.remove();
        destinationMarker = null;
    }
    
    if (routePolyline) {
        routePolyline.remove();
        routePolyline = null;
    }
    
    document.getElementById('source').value = '';
    document.getElementById('destination').value = '';
    selectedBus = null;
    window.selectedSource = null;
    window.selectedDestination = null;
    
    // Reset map view
    map.setView([30.7333, 76.7794], 7);
    
    updateBusesList();
    updateRouteInfo();
}
function findClosestPointIndex(path, lat, lng) {
    let minDist = Infinity;
    let index = -1;

    path.forEach((point, i) => {
        const d = calculateDistance(point[0], point[1], lat, lng);
        if (d < minDist) {
            minDist = d;
            index = i;
        }
    });

    return index;
}
function calculateRouteTravelMinutes(route, source, destination) {
    const srcIndex = findClosestPointIndex(route.path, source.lat, source.lng);
    const destIndex = findClosestPointIndex(route.path, destination.lat, destination.lng);

    if (srcIndex === -1 || destIndex === -1 || srcIndex >= destIndex) {
        return Infinity; // invalid route
    }

    let distanceKm = 0;
    for (let i = srcIndex; i < destIndex; i++) {
        const [lat1, lng1] = route.path[i];
        const [lat2, lng2] = route.path[i + 1];
        distanceKm += calculateDistance(lat1, lng1, lat2, lng2);
    }

    return (distanceKm / route.speed) * 60;
}

function calculateTotalTravelTime(bus, route) {
    if (!window.selectedSource || !window.selectedDestination) {
        return Infinity;
    }

    // ETA to source
    const etaToSource = getETAMinutes(bus);

    // Route travel time
    const routeMinutes = calculateRouteTravelMinutes(
        route,
        window.selectedSource,
        window.selectedDestination
    );

    return etaToSource + routeMinutes;
}
function findFastestRoute() {
    let fastest = null;
    let minTime = Infinity;

    buses.forEach(bus => {
        const route = busRoutes.find(r => r.id === bus.id);
        if (!route) return;

        const totalMinutes = calculateTotalTravelTime(bus, route);

        if (totalMinutes < minTime) {
            minTime = totalMinutes;
            fastest = { bus, route, totalMinutes };
        }
    });

    return fastest;
}
function showFastestRoute() {
    if (!window.selectedSource || !window.selectedDestination) return;

    const fastest = findFastestRoute();
    if (!fastest) return;

    // Highlight on map
    highlightRoute(fastest.route.id);

    // Select bus
    selectBus(fastest.bus.id);

    // Update Routes tab UI
    highlightFastestRouteInList(fastest.route.id);

    console.log(
        `Fastest route: ${fastest.route.name} (${Math.round(fastest.totalMinutes)} min)`
    );
}



// Swap source and destination
function swapLocations() {
    const sourceInput = document.getElementById('source');
    const destInput = document.getElementById('destination');
    
    const temp = sourceInput.value;
    sourceInput.value = destInput.value;
    destInput.value = temp;
    
    // Swap markers
    const tempMarker = sourceMarker;
    sourceMarker = destinationMarker;
    destinationMarker = tempMarker;
    
    // Re-add swapped markers
    if (sourceMarker) {
        const latLng = sourceMarker.getLatLng();
        sourceMarker = L.marker([latLng.lat, latLng.lng])
            .addTo(map)
            .bindPopup(`🟢 ${sourceInput.value}`);
    }
    
    if (destinationMarker) {
        const latLng = destinationMarker.getLatLng();
        destinationMarker = L.marker([latLng.lat, latLng.lng])
            .addTo(map)
            .bindPopup(`🔴 ${destInput.value}`);
    }
    
    // Redraw route
    if (sourceMarker && destinationMarker) {
        drawRoute();
    }
    
    updateRouteInfo();
}

// Close dropdowns when clicking outside
function closeDropdowns(event) {
    if (!event.target.closest('.input-wrapper')) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initBuses();
    drawAllRoutes();
    
    // Start bus movement
    busMovementInterval = setInterval(moveBuses, 2000);
    
    // Search functionality
    document.getElementById('source').addEventListener('input', () => {
        searchStops('source', 'sourceDropdown');
    });
    
    document.getElementById('destination').addEventListener('input', () => {
        searchStops('destination', 'destDropdown');
    });
    
    // Action buttons
    document.getElementById('swapBtn').addEventListener('click', swapLocations);
    document.getElementById('clearBtn').addEventListener('click', clearRoute);
    
    // Close dropdowns on outside click
    document.addEventListener('click', closeDropdowns);
    
    // Prevent closing dropdown when clicking inside
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', (e) => e.stopPropagation());
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (busMovementInterval) {
        clearInterval(busMovementInterval);
    }
});

//find nearest bus
function findNearestBusToSource() {
    if (!window.selectedSource || buses.length === 0) return null;

    let nearestBus = null;
    let minDistance = Infinity;

    buses.forEach(bus => {
        const distance = calculateDistance(
            bus.currentLat,
            bus.currentLng,
            window.selectedSource.lat,
            window.selectedSource.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestBus = bus;
        }
    });

    return nearestBus;
}

function autoSelectNearestBus() {
    const nearestBus = findNearestBusToSource();
    if (!nearestBus) return;

    activeBus = nearestBus;

    // Highlight marker (visual feedback)
    buses.forEach(bus => {
        bus.marker.setOpacity(bus === nearestBus ? 1 : 0.4);
    });

    // Optional popup
    nearestBus.marker.openPopup();

    console.log("AUTO-SELECTED BUS:", nearestBus.id);
}

function updateFastestRouteUI() {
    if (!window.selectedSource || !window.selectedDestination) return;

    const fastest = findFastestRoute();
    if (!fastest) return;

    document.getElementById("fastestRouteCard").style.display = "block";

    document.getElementById("fastestFrom").textContent =
        window.selectedSource.name;

    document.getElementById("fastestTo").textContent =
        window.selectedDestination.name;

    document.getElementById("fastestRouteName").textContent =
        fastest.route.name;

    document.getElementById("fastestBus").textContent =
        fastest.bus.name;

    document.getElementById("fastestETA").textContent =
        calculateETA(fastest.bus);

    document.getElementById("fastestTime").textContent =
        `${Math.round(fastest.totalMinutes)} min`;

    // Optional: highlight on map
    highlightRoute(fastest.route.id);
}
