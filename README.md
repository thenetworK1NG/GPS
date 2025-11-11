# 🌐 Multi-Device Tracking System with Authentication

Track multiple phones, tablets, or devices in real-time using Firebase with secure user accounts!

## 📁 Files Created

Located in the `multi-device` folder:
- **index.html** - Main landing page with login/register
- **tracker.html** - Install on devices you want to track
- **viewer.html** - Monitor all tracked devices on one screen
- **account.html** - Manage your account and devices
- **tracker-style.css** - Styling for all pages

## 🚀 Quick Start Guide

### Step 1: Create Your Account

1. **Open index.html** in your web browser
2. **Register** a new account with email and password
3. **Login** to access the tracking system

### Step 2: Setup Tracking Devices

1. From the home page, click **"Tracker"** icon
2. **Enter a device name** (e.g., "Mom's Phone", "My Car", "Kid's Tablet")
3. **Click "Start Sharing Location"**
4. **Allow location permissions** when prompted
5. The device will now share its location under YOUR account!

### Step 3: View All Your Devices

1. From the home page, click **"Viewer"** icon
2. **See all YOUR devices** on the map in real-time
3. **Track movements** with path history
4. **Click on markers** for detailed device info

### Step 4: Share with Others (Optional)

1. Other people must create their own accounts
2. Give them your login to track your devices
3. Or create separate accounts for family members

## 🎯 Features

### 🔐 Authentication System (NEW!)
- ✅ **User accounts** - Each user has their own account
- ✅ **Email/Password login** - Secure authentication
- ✅ **Privacy** - Only see YOUR devices
- ✅ **Account management** - Manage devices and settings
- ✅ **Secure data** - Devices tied to user accounts

### Index Page (home dashboard):
- ✅ Beautiful landing page with two main options
- ✅ User profile display
- ✅ Quick stats (active devices count)
- ✅ Easy navigation to tracker or viewer
- ✅ Account settings access
- ✅ Logout functionality

### Tracker Page (for tracked devices):
- ✅ Simple setup - just enter a name
- ✅ Real-time GPS tracking
- ✅ Shows location accuracy
- ✅ Speed and battery monitoring
- ✅ Automatic Firebase sync
- ✅ Persistent tracking (survives page refresh)
- ✅ Linked to your user account
- ✅ Quick link to open viewer

### Viewer Page (monitoring dashboard):
- ✅ **Multi-device map** - see all YOUR devices at once
- ✅ **Color-coded markers** - each device has unique color
- ✅ **Path history** - see where devices have been
- ✅ **Device sidebar** - list of all active devices
- ✅ **Live updates** - positions update in real-time
- ✅ **Device info popups** - click markers for details
- ✅ **Multiple map styles** - street, satellite, dark mode
- ✅ **Show/Hide controls** - toggle devices on/off
- ✅ **Fit all** - zoom to show all devices
- ✅ **Battery levels** - monitor device batteries
- ✅ **Activity status** - see which devices are recently active
- ✅ **Privacy** - Only shows devices from YOUR account

### Account Settings Page:
- ✅ View profile information
- ✅ See all your devices
- ✅ Delete individual devices
- ✅ Share tracking link
- ✅ Delete all devices
- ✅ Delete account (with confirmation)

## 🔧 Setup Instructions

### Your Firebase is Already Configured! ✅

The system uses your Firebase database:
```
Database: tracking-75c9a-default-rtdb.firebaseio.com
Project: tracking-75c9a
```

### Firebase Security Rules (REQUIRED!)

**IMPORTANT:** You MUST enable Firebase Authentication and set security rules!

#### Step 1: Enable Authentication
1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method

#### Step 2: Set Database Security Rules
Go to Firebase Console → Realtime Database → Rules and set:

```json
{
  "rules": {
    "devices": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$deviceId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || !data.exists())",
        ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid)"
      }
    }
  }
}
```

**What these rules do:**
- ✅ Users must be authenticated to read/write
- ✅ Users can only read their own devices
- ✅ Users can only modify their own devices
- ✅ Prevents unauthorized access

## 📱 How to Use on Multiple Devices

### Method 1: Direct Access
1. Upload the `multi-device` folder to a web server
2. Share the tracker.html URL with devices you want to track
3. Open viewer.html on your monitoring device

### Method 2: Local Network
1. Run a local web server in the multi-device folder:
   ```bash
   python -m http.server 8000
   ```
2. Find your PC's local IP (e.g., 192.168.1.100)
3. On other devices, open: `http://192.168.1.100:8000/tracker.html`
4. On your PC, open: `http://localhost:8000/viewer.html`

### Method 3: File Access (Testing)
- Open tracker.html directly on each device
- Open viewer.html on your monitoring device
- Both will connect to Firebase automatically

## 🎨 Map Controls

### Viewer Page Controls:
- **🔄 Refresh** - Reload all devices
- **🎯 Fit All** - Zoom to show all devices
- **Show All / Hide All** - Toggle all device markers
- **🏷️ Toggle Labels** - Show/hide device names
- **📍 Toggle Paths** - Show/hide movement trails
- **Map Style** - Switch between street/satellite/dark

### Device Actions:
- **📍 Locate** - Zoom to specific device
- **👁️ Toggle** - Show/hide individual device

## 🔒 Privacy & Security

### Implemented Security Features:
- ✅ **Firebase Authentication** - Email/password login required
- ✅ **User accounts** - Each user has isolated data
- ✅ **Database security rules** - Users can only see their own devices
- ✅ **HTTPS encryption** - All data transfer is encrypted
- ✅ **Device ownership** - Devices are tied to user accounts
- ✅ **Privacy controls** - Account management and deletion options

### How Privacy Works:
1. **User Registration** - Each person creates their own account
2. **Device Association** - Devices are linked to the user who created them
3. **Isolated Data** - You can ONLY see devices from YOUR account
4. **Sharing Control** - Share your login with trusted people only

### Sharing Your Tracking:
To let someone else see your tracked devices:
1. **Option 1:** Share your login credentials (not recommended for security)
2. **Option 2:** They create their own account and track separately
3. **Option 3:** Use the same account on all devices you manage

## 📊 Data Structure

Firebase stores data like this with user ownership:
```
devices/
  └── device_1234567890_abc123/
      ├── name: "Mom's Phone"
      ├── latitude: 40.7128
      ├── longitude: -74.0060
      ├── accuracy: 15
      ├── speed: 5.5
      ├── battery: 85
      ├── timestamp: 1699123456789
      ├── lastUpdate: "2025-11-11T10:30:00Z"
      ├── userId: "abc123xyz456..." ← Links device to user
      └── userEmail: "user@example.com"
```

## 🐛 Troubleshooting

### Device Not Showing Up?
- Check location permissions are granted
- Ensure internet connection is active
- Verify Firebase rules allow read/write
- Check browser console for errors

### Location Not Accurate?
- Go outdoors with clear sky view
- Wait 30-60 seconds for GPS lock
- Enable high-accuracy mode
- Check device GPS settings

### Firebase Not Connecting?
- Verify internet connection
- Check Firebase Console for database status
- Ensure database rules are set correctly
- Check browser console for errors

## 🎯 Use Cases

Perfect for:
- 👨‍👩‍👧‍👦 **Family tracking** - Keep tabs on family members
- 🚗 **Fleet management** - Track company vehicles
- 👴 **Elder care** - Monitor elderly relatives
- 📦 **Delivery tracking** - Follow delivery drivers
- 🏃 **Group activities** - Coordinate hiking/biking groups
- 🐕 **Pet tracking** - Track pets with GPS collars
- 🚲 **Asset tracking** - Monitor valuable equipment

## 🔄 Auto-Cleanup

Devices remain in Firebase until:
- User clicks "Stop Sharing"
- Browser localStorage is cleared
- You manually delete from Firebase Console

## 📈 Scaling

Current setup supports:
- ✅ Unlimited devices (Firebase free tier: 100 simultaneous)
- ✅ Real-time updates every ~1 second
- ✅ Last 100 location points per device

## 🆘 Support

### Common Issues:

**"No devices found"**
- Make sure at least one tracker.html is open and tracking
- Check Firebase database in console

**"Location access denied"**
- Enable location permissions in browser settings
- Try HTTPS or localhost instead of file://

**"Not updating"**
- Check internet connection
- Verify Firebase database is online
- Refresh the page

## 📝 Next Steps

Want to enhance it? Add:
- 🔐 User authentication
- 📧 Email alerts for geofence crossing
- 📊 Historical data visualization
- 📱 Mobile app with React Native
- 🔔 Push notifications
- 📸 Photo sharing from devices
- 💬 Chat between devices

## 🎉 You're All Set!

Your multi-device tracking system is ready to use! Just open tracker.html on devices you want to track, and viewer.html to monitor them all.

---

**Happy Tracking!** 🗺️📍
