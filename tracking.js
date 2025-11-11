// Phone Tracking App - Main JavaScript File
// Uses Leaflet.js and Geolocation API

// Global variables
let map;
let currentMarker;
let accuracyCircle;
let watchId = null;
let isTracking = false;
let locationHistory = [];
let pathPolyline;
let currentLayer;
let geofences = [];
let heatmapLayer = null;
let isHeatmapVisible = false;
let savedRoutes = [];
let playbackInterval = null;
let playbackIndex = 0;
let isPlaybackPaused = false;
let playbackMarker = null;

// Map layer definitions
const mapLayers = {
    street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    }),
    hybrid: L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri',
            maxZoom: 19
        }),
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        })
    ]),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap',
        maxZoom: 17
    }),
    night: L.layerGroup([
        L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
            attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
            bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
            minZoom: 1,
            maxZoom: 8,
            format: 'jpg',
            time: '',
            tilematrixset: 'GoogleMapsCompatible_Level'
        }),
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        })
    ])
};

// Initialize the map
function initMap() {
    // Create map centered on default location
    map = L.map('map').setView([0, 0], 2);

    // Add default street map layer
    currentLayer = mapLayers.street;
    currentLayer.addTo(map);

    // Initialize polyline for path
    pathPolyline = L.polyline([], {
        color: '#3388ff',
        weight: 3,
        opacity: 0.7
    }).addTo(map);
}

// Update location display
function updateLocationInfo(position) {
    const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
    
    document.getElementById('latitude').textContent = latitude.toFixed(6);
    document.getElementById('longitude').textContent = longitude.toFixed(6);
    
    // Color-code accuracy indicator
    const accuracyElement = document.getElementById('accuracy');
    accuracyElement.textContent = `±${accuracy.toFixed(0)}m`;
    if (accuracy <= 20) {
        accuracyElement.style.color = '#4caf50'; // Green - Excellent
        document.getElementById('gpsQuality').textContent = '🟢 Excellent';
        document.getElementById('gpsQuality').style.color = '#4caf50';
    } else if (accuracy <= 50) {
        accuracyElement.style.color = '#8bc34a'; // Light green - Good
        document.getElementById('gpsQuality').textContent = '🟡 Good';
        document.getElementById('gpsQuality').style.color = '#8bc34a';
    } else if (accuracy <= 100) {
        accuracyElement.style.color = '#ff9800'; // Orange - Fair
        document.getElementById('gpsQuality').textContent = '🟠 Fair';
        document.getElementById('gpsQuality').style.color = '#ff9800';
    } else {
        accuracyElement.style.color = '#f44336'; // Red - Poor
        document.getElementById('gpsQuality').textContent = '🔴 Poor';
        document.getElementById('gpsQuality').style.color = '#f44336';
    }
    
    document.getElementById('altitude').textContent = altitude ? `${altitude.toFixed(0)}m` : 'N/A';
    document.getElementById('speed').textContent = speed ? `${(speed * 3.6).toFixed(1)} km/h` : '0 km/h';
    
    // Display heading/direction
    if (heading !== null && heading !== undefined) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(heading / 45) % 8;
        document.getElementById('heading').textContent = `${heading.toFixed(0)}° (${directions[index]})`;
    } else {
        document.getElementById('heading').textContent = 'N/A';
    }
    
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
}

// Update map with new position
function updateMap(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const latLng = [latitude, longitude];

    // Remove old marker and circle
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    if (accuracyCircle) {
        map.removeLayer(accuracyCircle);
    }

    // Add new marker
    currentMarker = L.marker(latLng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #4285f4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map);

    // Add accuracy circle
    accuracyCircle = L.circle(latLng, {
        radius: accuracy,
        color: '#4285f4',
        fillColor: '#4285f4',
        fillOpacity: 0.1,
        weight: 1
    }).addTo(map);

    // Update path
    locationHistory.push({
        lat: latitude,
        lng: longitude,
        timestamp: new Date(),
        accuracy: accuracy
    });

    pathPolyline.setLatLngs(locationHistory.map(loc => [loc.lat, loc.lng]));

    // Update history list
    updateHistoryList();
}

// Update history list in UI
function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    const last5 = locationHistory.slice(-5).reverse();
    
    historyList.innerHTML = last5.map((loc, index) => `
        <div class="history-item">
            <strong>#${locationHistory.length - index}</strong>
            <span>${loc.timestamp.toLocaleTimeString()}</span>
            <span>${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}</span>
        </div>
    `).join('');
}

// Success callback for geolocation
function onLocationSuccess(position) {
    const accuracy = position.coords.accuracy;
    
    // Filter out low-quality positions (optional - only accept accurate readings)
    if (accuracy > 100 && locationHistory.length > 0) {
        console.warn('Low accuracy position ignored:', accuracy + 'm');
        updateStatus(`GPS accuracy: ${accuracy.toFixed(0)}m (waiting for better signal)`, false);
        return;
    }
    
    updateLocationInfo(position);
    updateMap(position);
    checkGeofences(position);
    
    // Update status based on accuracy
    if (accuracy <= 20) {
        updateStatus('GPS: Excellent accuracy', true);
    } else if (accuracy <= 50) {
        updateStatus('GPS: Good accuracy', true);
    } else {
        updateStatus('GPS: Fair accuracy', true);
    }
    
    // Center map on first location or if requested
    if (locationHistory.length === 1) {
        map.setView([position.coords.latitude, position.coords.longitude], 18);
    }
    
    // Update heatmap if visible
    if (isHeatmapVisible && heatmapLayer) {
        map.removeLayer(heatmapLayer);
        const heatData = locationHistory.map(loc => [loc.lat, loc.lng, 0.5]);
        heatmapLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17
        }).addTo(map);
    }
}

// Error callback for geolocation
function onLocationError(error) {
    let message = 'Location error: ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Permission denied. Please allow location access.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Position unavailable.';
            break;
        case error.TIMEOUT:
            message += 'Request timeout.';
            break;
        default:
            message += 'Unknown error.';
    }
    
    updateStatus(message, false);
    console.error('Location error:', error);
}

// Update status indicator
function updateStatus(text, isOnline) {
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.querySelector('.status-indicator');
    
    statusText.textContent = text;
    statusIndicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
}

// Start tracking
function startTracking() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    const options = {
        enableHighAccuracy: true,      // Use GPS instead of network/WiFi
        timeout: 10000,                 // Wait up to 10 seconds
        maximumAge: 0                   // Don't use cached position
    };

    updateStatus('Acquiring GPS signal...', false);

    // Get initial position with high accuracy
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, options);

    // Watch position continuously with high accuracy
    watchId = navigator.geolocation.watchPosition(onLocationSuccess, onLocationError, options);

    isTracking = true;
    
    document.getElementById('startTracking').disabled = true;
    document.getElementById('stopTracking').disabled = false;
}

// Stop tracking
function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    isTracking = false;
    updateStatus('Tracking stopped', false);
    
    document.getElementById('startTracking').disabled = false;
    document.getElementById('stopTracking').disabled = true;
}

// Center map on current location
function centerMap() {
    if (locationHistory.length > 0) {
        const lastLocation = locationHistory[locationHistory.length - 1];
        map.setView([lastLocation.lat, lastLocation.lng], 16);
    } else {
        alert('No location data available yet');
    }
}

// Clear history
function clearHistory() {
    if (confirm('Clear all location history?')) {
        locationHistory = [];
        pathPolyline.setLatLngs([]);
        document.getElementById('historyList').innerHTML = '<p>No history available</p>';
    }
}

// Change map view
function changeMapView(viewType) {
    // Remove current layer
    if (currentLayer) {
        map.removeLayer(currentLayer);
    }
    
    // Add new layer
    currentLayer = mapLayers[viewType];
    currentLayer.addTo(map);
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('darkModeToggle').textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

// Share location
function shareLocation() {
    if (locationHistory.length === 0) {
        alert('No location available to share');
        return;
    }
    
    const lastLocation = locationHistory[locationHistory.length - 1];
    const shareUrl = `https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}`;
    const shareText = `My location: ${lastLocation.lat.toFixed(6)}, ${lastLocation.lng.toFixed(6)}\n${shareUrl}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Location',
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Location link copied to clipboard!\n\n' + shareText);
        }).catch(() => {
            prompt('Copy this location link:', shareText);
        });
    }
}

// Geofencing
function createGeofence() {
    const name = document.getElementById('geofenceName').value.trim();
    const radius = parseInt(document.getElementById('geofenceRadius').value);
    
    if (!name) {
        alert('Please enter a name for the geofence');
        return;
    }
    
    if (!radius || radius < 10) {
        alert('Radius must be at least 10 meters');
        return;
    }
    
    if (locationHistory.length === 0) {
        alert('No current location available. Start tracking first.');
        return;
    }
    
    const lastLocation = locationHistory[locationHistory.length - 1];
    const geofence = {
        id: Date.now(),
        name: name,
        lat: lastLocation.lat,
        lng: lastLocation.lng,
        radius: radius,
        inside: false
    };
    
    geofences.push(geofence);
    
    // Draw geofence on map
    const circle = L.circle([geofence.lat, geofence.lng], {
        radius: geofence.radius,
        color: '#ff9800',
        fillColor: '#ff9800',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(map);
    
    geofence.circle = circle;
    
    // Add label
    const marker = L.marker([geofence.lat, geofence.lng], {
        icon: L.divIcon({
            className: 'geofence-label',
            html: `<div style="background: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; border: 2px solid #ff9800;">${name}</div>`,
            iconSize: [100, 40]
        })
    }).addTo(map);
    
    geofence.marker = marker;
    
    updateGeofenceList();
    
    // Clear inputs
    document.getElementById('geofenceName').value = '';
    document.getElementById('geofenceRadius').value = '100';
    
    // Save to localStorage
    saveGeofences();
}

function updateGeofenceList() {
    const list = document.getElementById('geofenceList');
    list.innerHTML = geofences.map(fence => `
        <div class="geofence-item">
            <div class="geofence-item-info">
                <div class="geofence-item-name">${fence.name}</div>
                <div class="geofence-item-details">
                    ${fence.lat.toFixed(6)}, ${fence.lng.toFixed(6)} • ${fence.radius}m radius
                </div>
            </div>
            <div class="geofence-item-actions">
                <button class="btn-small btn-locate" onclick="locateGeofence(${fence.id})">📍</button>
                <button class="btn-small btn-delete" onclick="deleteGeofence(${fence.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function locateGeofence(id) {
    const fence = geofences.find(f => f.id === id);
    if (fence) {
        map.setView([fence.lat, fence.lng], 16);
    }
}

function deleteGeofence(id) {
    const fence = geofences.find(f => f.id === id);
    if (fence) {
        map.removeLayer(fence.circle);
        map.removeLayer(fence.marker);
        geofences = geofences.filter(f => f.id !== id);
        updateGeofenceList();
        saveGeofences();
    }
}

function checkGeofences(position) {
    const { latitude, longitude } = position.coords;
    
    geofences.forEach(fence => {
        const distance = calculateDistance(latitude, longitude, fence.lat, fence.lng);
        const wasInside = fence.inside;
        const isInside = distance <= fence.radius;
        
        if (isInside && !wasInside) {
            showNotification(`Entered geofence: ${fence.name}`, 'success');
            fence.inside = true;
        } else if (!isInside && wasInside) {
            showNotification(`Left geofence: ${fence.name}`, 'warning');
            fence.inside = false;
        }
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

function showNotification(message, type) {
    // Request notification permission
    if (Notification.permission === 'granted') {
        new Notification('Location Alert', {
            body: message,
            icon: '📍'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Location Alert', {
                    body: message,
                    icon: '📍'
                });
            }
        });
    }
    
    // Also show in-app alert
    alert(message);
}

function saveGeofences() {
    const fencesData = geofences.map(f => ({
        id: f.id,
        name: f.name,
        lat: f.lat,
        lng: f.lng,
        radius: f.radius
    }));
    localStorage.setItem('geofences', JSON.stringify(fencesData));
}

function loadGeofences() {
    const saved = localStorage.getItem('geofences');
    if (saved) {
        const fencesData = JSON.parse(saved);
        fencesData.forEach(data => {
            const geofence = {
                id: data.id,
                name: data.name,
                lat: data.lat,
                lng: data.lng,
                radius: data.radius,
                inside: false
            };
            
            const circle = L.circle([geofence.lat, geofence.lng], {
                radius: geofence.radius,
                color: '#ff9800',
                fillColor: '#ff9800',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map);
            
            const marker = L.marker([geofence.lat, geofence.lng], {
                icon: L.divIcon({
                    className: 'geofence-label',
                    html: `<div style="background: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; border: 2px solid #ff9800;">${geofence.name}</div>`,
                    iconSize: [100, 40]
                })
            }).addTo(map);
            
            geofence.circle = circle;
            geofence.marker = marker;
            geofences.push(geofence);
        });
        updateGeofenceList();
    }
}

// Heatmap
function toggleHeatmap() {
    if (locationHistory.length < 3) {
        alert('Need at least 3 location points for heatmap');
        return;
    }
    
    if (isHeatmapVisible) {
        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
        }
        isHeatmapVisible = false;
        document.getElementById('toggleHeatmap').textContent = '🔥 Heatmap';
    } else {
        const heatData = locationHistory.map(loc => [loc.lat, loc.lng, 0.5]);
        heatmapLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17
        }).addTo(map);
        isHeatmapVisible = true;
        document.getElementById('toggleHeatmap').textContent = '❌ Hide Heatmap';
    }
}

// Route recording and playback
function saveRoute() {
    if (locationHistory.length === 0) {
        alert('No route data to save');
        return;
    }
    
    const name = prompt('Enter route name:', `Route ${new Date().toLocaleString()}`);
    if (!name) return;
    
    const route = {
        name: name,
        date: new Date().toISOString(),
        locations: locationHistory
    };
    
    savedRoutes.push(route);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    
    // Download as JSON
    const dataStr = JSON.stringify(route, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();
    
    alert('Route saved and downloaded!');
}

function loadRoute() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const route = JSON.parse(event.target.result);
                if (route.locations && Array.isArray(route.locations)) {
                    locationHistory = route.locations;
                    pathPolyline.setLatLngs(locationHistory.map(loc => [loc.lat, loc.lng]));
                    
                    if (locationHistory.length > 0) {
                        map.setView([locationHistory[0].lat, locationHistory[0].lng], 14);
                    }
                    
                    updateHistoryList();
                    
                    // Enable playback
                    document.getElementById('playbackRoute').disabled = false;
                    document.getElementById('playbackSpeed').disabled = false;
                    
                    alert(`Route loaded: ${route.name}\n${locationHistory.length} points`);
                } else {
                    alert('Invalid route file format');
                }
            } catch (error) {
                alert('Error loading route: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function playbackRoute() {
    if (locationHistory.length === 0) {
        alert('No route to playback');
        return;
    }
    
    playbackIndex = 0;
    isPlaybackPaused = false;
    document.getElementById('playbackRoute').disabled = true;
    document.getElementById('pausePlayback').disabled = false;
    
    startPlayback();
}

function startPlayback() {
    const speed = parseInt(document.getElementById('playbackSpeed').value);
    const interval = 1000 / speed;
    
    if (playbackMarker) {
        map.removeLayer(playbackMarker);
    }
    
    playbackInterval = setInterval(() => {
        if (isPlaybackPaused) return;
        
        if (playbackIndex >= locationHistory.length) {
            stopPlayback();
            return;
        }
        
        const loc = locationHistory[playbackIndex];
        
        if (playbackMarker) {
            map.removeLayer(playbackMarker);
        }
        
        playbackMarker = L.marker([loc.lat, loc.lng], {
            icon: L.divIcon({
                className: 'playback-marker',
                html: '<div style="background-color: #f44336; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        }).addTo(map);
        
        map.setView([loc.lat, loc.lng], map.getZoom());
        
        playbackIndex++;
    }, interval);
}

function pausePlayback() {
    isPlaybackPaused = !isPlaybackPaused;
    document.getElementById('pausePlayback').textContent = isPlaybackPaused ? '▶️ Resume' : '⏸️ Pause';
}

function stopPlayback() {
    if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
    }
    
    if (playbackMarker) {
        map.removeLayer(playbackMarker);
        playbackMarker = null;
    }
    
    document.getElementById('playbackRoute').disabled = false;
    document.getElementById('pausePlayback').disabled = true;
    document.getElementById('pausePlayback').textContent = '⏸️ Pause';
    playbackIndex = 0;
    isPlaybackPaused = false;
}

// Update playback speed
function updatePlaybackSpeed() {
    const speed = document.getElementById('playbackSpeed').value;
    document.getElementById('playbackSpeedLabel').textContent = `Speed: ${speed}x`;
    
    if (playbackInterval && !isPlaybackPaused) {
        stopPlayback();
        startPlayback();
    }
}

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    // Load saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }
    
    // Load saved geofences
    loadGeofences();
    
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    document.getElementById('startTracking').addEventListener('click', startTracking);
    document.getElementById('stopTracking').addEventListener('click', stopTracking);
    document.getElementById('centerMap').addEventListener('click', centerMap);
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
    document.getElementById('mapViewSelect').addEventListener('change', function(e) {
        changeMapView(e.target.value);
    });
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('shareLocation').addEventListener('click', shareLocation);
    document.getElementById('toggleHeatmap').addEventListener('click', toggleHeatmap);
    document.getElementById('createGeofence').addEventListener('click', createGeofence);
    document.getElementById('saveRoute').addEventListener('click', saveRoute);
    document.getElementById('loadRoute').addEventListener('click', loadRoute);
    document.getElementById('playbackRoute').addEventListener('click', playbackRoute);
    document.getElementById('pausePlayback').addEventListener('click', pausePlayback);
    document.getElementById('playbackSpeed').addEventListener('input', updatePlaybackSpeed);
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
        updateStatus('Geolocation not supported', false);
    }
});

// Export location history as JSON
function exportHistory() {
    const dataStr = JSON.stringify(locationHistory, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `location-history-${Date.now()}.json`;
    link.click();
}
