# GeoSnap - Store Submission Guide

## Overview

This guide covers everything needed to publish GeoSnap to the Apple App Store and Google Play Store.

---

## 📁 Generated Files

| File | Purpose |
|------|---------|
| `/app/frontend/app.json` | Expo configuration with all store requirements |
| `/app/frontend/eas.json` | EAS Build configuration |
| `/app/frontend/public/manifest.json` | PWA manifest |
| `/app/frontend/public/service-worker.js` | PWA service worker |
| `/app/docs/PRIVACY_POLICY.md` | Privacy policy (required by stores) |
| `/app/docs/APP_STORE_LISTING.md` | Apple App Store metadata |
| `/app/docs/GOOGLE_PLAY_LISTING.md` | Google Play Store metadata |
| `/app/docs/ICON_REQUIREMENTS.md` | Icon size specifications |

---

## 🔐 Permissions Configured

### iOS (Info.plist)
```
✓ NSCameraUsageDescription
✓ NSPhotoLibraryUsageDescription
✓ NSPhotoLibraryAddUsageDescription
✓ NSLocationWhenInUseUsageDescription
✓ NSLocationAlwaysAndWhenInUseUsageDescription
✓ ITSAppUsesNonExemptEncryption = false
```

### Android (AndroidManifest.xml)
```
✓ android.permission.CAMERA
✓ android.permission.ACCESS_FINE_LOCATION
✓ android.permission.ACCESS_COARSE_LOCATION
✓ android.permission.READ_EXTERNAL_STORAGE
✓ android.permission.WRITE_EXTERNAL_STORAGE
✓ android.permission.READ_MEDIA_IMAGES
✓ android.permission.INTERNET
✓ android.permission.ACCESS_NETWORK_STATE
```

---

## 🛠️ Build Options

### Option 1: Expo EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### Option 2: Native Wrapper Services

For wrapping the web app as native:

1. **Median.co** (https://median.co)
   - Paste your deployment URL
   - Configure native permissions
   - Download .ipa and .aab files

2. **Natively.dev** (https://natively.dev)
   - Similar process
   - Good for PWA conversion

3. **Capacitor** (https://capacitorjs.com)
   - Add native layer to Expo project
   - More control over native code

---

## 📱 Store Requirements

### Apple App Store

| Requirement | Status |
|-------------|--------|
| Apple Developer Account ($99/yr) | ❓ You need |
| Bundle ID: `com.geosnap.app` | ✅ Configured |
| iOS 13.0+ | ✅ Configured |
| Privacy labels | ✅ In app.json |
| Screenshots (6.7" & 12.9") | ❓ You need |
| App icon 1024x1024 | ❓ You need |
| Review guidelines compliance | ✅ No issues expected |

### Google Play Store

| Requirement | Status |
|-------------|--------|
| Google Play Console ($25 one-time) | ❓ You need |
| Package: `com.geosnap.app` | ✅ Configured |
| Android 6.0+ (API 23) | ✅ Default |
| Privacy policy URL | ✅ Documented |
| Screenshots (phone & tablet) | ❓ You need |
| Feature graphic 1024x500 | ❓ You need |
| Content rating questionnaire | ❓ You complete |

---

## 📸 Screenshot Requirements

### iPhone 6.7" Display (1290 x 2796 px)
Required screens:
1. Home/War Room - Explorer stats and quick actions
2. AI Identification - Camera capture mode
3. Results - Specimen analysis display
4. Deep Time - Timeline visualization
5. Strata AI - Chat interface
6. The Vault - Collection grid
7. Field Notebook - Note detail
8. Profile - Explorer's Path progress

### iPad 12.9" Display (2048 x 2732 px)
Required screens:
1. Home landscape
2. Collection with detail panel
3. Field notebook full view

### Android Phone (1080 x 1920 px minimum)
Same screens as iPhone

---

## 🎨 Icon Generation

### Quick Generation
Use these online tools:
- https://makeappicon.com
- https://appicon.co
- https://easyappicon.com

Upload a 1024x1024 PNG and get all sizes automatically.

### Design Guidelines
- Central element: Crystal/compass hybrid
- Colors: Amber (#FF8C00), Brass Gold (#C9A227)
- Background: Deep Obsidian (#0a0a0c)
- No text in icon (doesn't scale)

---

## 🚀 Submission Checklist

### Before Building

- [ ] Create Apple Developer account
- [ ] Create Google Play Console account
- [ ] Generate app icons (all sizes)
- [ ] Take screenshots on device/simulator
- [ ] Host privacy policy at public URL
- [ ] Configure backend for production API URL

### Apple App Store

1. [ ] Log into App Store Connect
2. [ ] Create new app with Bundle ID `com.geosnap.app`
3. [ ] Fill in metadata from `/app/docs/APP_STORE_LISTING.md`
4. [ ] Upload screenshots
5. [ ] Submit privacy policy URL
6. [ ] Upload .ipa via Transporter or EAS Submit
7. [ ] Complete App Review Information
8. [ ] Submit for review

### Google Play Store

1. [ ] Log into Google Play Console
2. [ ] Create new app
3. [ ] Fill in metadata from `/app/docs/GOOGLE_PLAY_LISTING.md`
4. [ ] Upload screenshots and feature graphic
5. [ ] Complete content rating questionnaire
6. [ ] Upload .aab to Production track
7. [ ] Submit for review

---

## 🔗 Useful Commands

```bash
# Download source code
cd /app && zip -r geosnap-source.zip frontend backend docs -x "node_modules/*" -x ".expo/*"

# Generate native project (if needed)
npx expo prebuild

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build APK locally (requires Android Studio)
cd android && ./gradlew assembleRelease

# Build IPA locally (requires Xcode)
cd ios && xcodebuild -workspace GeoSnap.xcworkspace -scheme GeoSnap archive
```

---

## 📞 Support Links to Configure

Replace these placeholders before submission:

| Placeholder | Replace With |
|-------------|--------------|
| `YOUR_APPLE_ID@email.com` | Your Apple ID |
| `YOUR_APP_STORE_CONNECT_APP_ID` | From App Store Connect |
| `YOUR_APPLE_TEAM_ID` | From Apple Developer portal |
| `https://geosnap.app/privacy` | Your hosted privacy policy |
| `https://geosnap.app/support` | Your support page |
| `privacy@geosnap.app` | Your privacy email |
| `support@geosnap.app` | Your support email |

---

## 💰 In-App Purchase Setup

### Apple App Store Connect

Create these subscription products:
1. `geosnap.explorer.monthly` - $4.99/month
2. `geosnap.explorer.yearly` - $39.99/year
3. `geosnap.pro.monthly` - $9.99/month
4. `geosnap.pro.yearly` - $79.99/year

Create these consumables:
1. `geosnap.pack.gemstone` - $4.99
2. `geosnap.pack.fossil` - $4.99
3. `geosnap.pack.meteorite` - $6.99
4. `geosnap.pack.crystal` - $3.99

### Google Play Console

Create same products with matching IDs in "Monetize > Products"

---

## ⏱️ Timeline Estimate

| Phase | Duration |
|-------|----------|
| Icon & screenshot creation | 1-2 days |
| Build generation | 30 min (EAS) |
| Store listing setup | 2-3 hours |
| Apple review | 24-48 hours |
| Google review | 1-3 days |
| **Total** | **~1 week** |

---

Good luck with your submission! 🚀🪨
