# 📱 Phone Tracking App

A real-time phone tracking application built with HTML, JavaScript, and open-source mapping technology.

## 🗺️ Technology Stack

- **Mapping**: Leaflet.js (open-source JavaScript library)
- **Map Tiles**: OpenStreetMap (free, open-source map data)
- **Geolocation**: HTML5 Geolocation API
- **Frontend**: Pure HTML5, CSS3, and JavaScript (no frameworks required)

## ✨ Features

- ✅ Real-time GPS location tracking
- ✅ Interactive map with zoom and pan controls
- ✅ Visual path history showing movement
- ✅ Location accuracy indicator
- ✅ Speed and altitude display
- ✅ Location history with timestamps
- ✅ Export location data as JSON
- ✅ Responsive design for desktop and mobile
- ✅ No server required - runs entirely in browser

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Location services enabled on your device
- HTTPS connection or localhost (required for Geolocation API)

### Installation

1. **Clone or download** the files to your computer:
   - `index.html`
   - `tracking.js`
   - `styles.css`

2. **Open the app**:
   - Simply double-click `index.html` to open it in your browser
   - Or use a local web server (recommended for best results)

### Using a Local Web Server (Recommended)

For full functionality, especially on mobile devices, use a local web server:

**Option 1: Python**
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

**Option 2: Node.js (http-server)**
```bash
npm install -g http-server
http-server -p 8000

# Then open: http://localhost:8000
```

**Option 3: VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click `index.html` and select "Open with Live Server"

## 📖 How to Use

1. **Start Tracking**
   - Click the "Start Tracking" button
   - Allow location permissions when prompted
   - Your current location will appear on the map

2. **View Information**
   - See real-time coordinates, accuracy, speed, and altitude
   - Watch your movement path drawn on the map
   - Check the history panel for recent locations

3. **Controls**
   - **Stop Tracking**: Stops location updates
   - **Center on Location**: Zooms map to your current position
   - **Clear History**: Removes all saved location points

4. **Mobile Usage**
   - Open the app on your phone's browser
   - Works best when accessing via HTTPS or local network
   - Enable high-accuracy GPS for best results

## 🔧 Customization

### Change Map Style
Edit `tracking.js` to use different tile providers:

```javascript
// Dark mode
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CARTO'
}).addTo(map);

// Satellite view (requires different provider)
// Example: Esri World Imagery (check their terms)
```

### Adjust Tracking Accuracy
Modify options in `tracking.js`:

```javascript
const options = {
    enableHighAccuracy: true,  // Use GPS (true) or network (false)
    timeout: 5000,             // Wait time for position (ms)
    maximumAge: 0              // Cache time for position (ms)
};
```

### Change Update Frequency
The app uses `watchPosition()` which updates automatically. To add manual intervals:

```javascript
// Update every 5 seconds
setInterval(() => {
    if (isTracking) {
        navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
    }
}, 5000);
```

## 📱 Mobile App Alternative

To create a mobile app version:

1. **Progressive Web App (PWA)**
   - Add a `manifest.json` file
   - Add service worker for offline support
   - Users can "Add to Home Screen"

2. **PhoneGap/Cordova**
   - Wrap the HTML/JS in a native container
   - Build for iOS/Android

3. **Electron (Desktop)**
   - Package as a desktop application
   - Works on Windows, macOS, Linux

## 🔒 Privacy & Security

- All tracking happens locally in your browser
- No data is sent to external servers
- Location data is stored only in browser memory
- Clear history to remove all tracking data
- Use HTTPS in production to secure location data

## ⚠️ Important Notes

1. **Location Permissions**: Browser will ask for location access - must allow
2. **HTTPS Required**: Geolocation API requires secure connection (except localhost)
3. **Battery Usage**: Continuous GPS tracking drains battery quickly
4. **Accuracy**: GPS accuracy varies (5-50m typical, can be worse indoors)
5. **Browser Support**: Works in all modern browsers with Geolocation API

## 🐛 Troubleshooting

**Location not working?**
- Check location permissions in browser settings
- Ensure GPS/location services enabled on device
- Try HTTPS or localhost instead of file://
- Check browser console for error messages

**Map not loading?**
- Check internet connection (needed for map tiles)
- Verify no ad-blockers blocking Leaflet.js or OpenStreetMap
- Check browser console for errors

**Poor accuracy?**
- Enable high-accuracy mode in device settings
- Move to area with clear sky view
- Disable WiFi-only location mode

## 📊 Features Roadmap

- [ ] Save/load tracking sessions
- [ ] Distance and duration calculations
- [ ] Geofencing alerts
- [ ] Multiple device tracking
- [ ] Offline map caching
- [ ] Route replay feature

## 📄 License

This project uses open-source libraries:
- **Leaflet.js**: BSD 2-Clause License
- **OpenStreetMap**: Open Data Commons Open Database License (ODbL)

Your custom code can be licensed as you prefer.

## 🤝 Contributing

Feel free to modify and enhance this app:
- Add new map providers
- Implement data export formats (GPX, KML)
- Add location sharing features
- Improve mobile UI/UX

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify all files are in the same directory
3. Ensure location permissions are granted
4. Test on different browsers/devices

---

**Enjoy tracking!** 🗺️📍
