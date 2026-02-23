# GeoSnap App Icon Requirements

## Design Concept

The GeoSnap icon should embody:
- **Adventure**: Compass/exploration motif
- **Geology**: Crystal/rock formation elements
- **Technology**: Modern, clean lines
- **Mystery**: Deep earth tones with amber glow

## Color Palette

- **Primary**: Amber/Gold (#FF8C00, #C9A227)
- **Background**: Deep Obsidian (#0a0a0c)
- **Accent**: Brass Gold (#C9A227)
- **Glow**: Volcanic Orange (#FF4500)

## Required Sizes

### iOS App Store
| Size | Usage |
|------|-------|
| 1024x1024 | App Store listing |
| 180x180 | iPhone (60pt @3x) |
| 167x167 | iPad Pro (83.5pt @2x) |
| 152x152 | iPad (76pt @2x) |
| 120x120 | iPhone (60pt @2x) |
| 87x87 | iPhone Spotlight (29pt @3x) |
| 80x80 | iPad Spotlight (40pt @2x) |
| 76x76 | iPad (76pt @1x) |
| 60x60 | iPhone (60pt @1x) |
| 58x58 | iPhone Settings (29pt @2x) |
| 40x40 | iPad Spotlight (40pt @1x) |
| 29x29 | iPhone Settings (29pt @1x) |
| 20x20 | iPhone Notification (20pt @1x) |

### Android/Google Play
| Size | Usage |
|------|-------|
| 512x512 | Google Play Store |
| 192x192 | XXXHDPI |
| 144x144 | XXHDPI |
| 96x96 | XHDPI |
| 72x72 | HDPI |
| 48x48 | MDPI |
| 36x36 | LDPI |

### Android Adaptive Icon
- Foreground: 432x432 (with 66dp safe zone)
- Background: Solid #0a0a0c or gradient

### Web/PWA
| Size | Usage |
|------|-------|
| 512x512 | PWA manifest |
| 384x384 | PWA manifest |
| 192x192 | PWA manifest |
| 152x152 | Apple touch icon |
| 144x144 | MS Tile |
| 128x128 | Chrome Web Store |
| 96x96 | PWA manifest |
| 72x72 | PWA manifest |
| 32x32 | Favicon |
| 16x16 | Favicon |

## Icon Design Specifications

### Primary Icon Concept
```
┌─────────────────────────┐
│                         │
│      ╱╲    (compass)    │
│     ╱  ╲                │
│    ◇ ⬡ ◇  (crystal)    │
│     ╲  ╱                │
│      ╲╱                 │
│                         │
│   [amber glow ring]     │
│                         │
└─────────────────────────┘
```

### Elements
1. **Central Crystal**: Hexagonal gem shape
2. **Compass Points**: N/S/E/W markers
3. **Brass Ring**: Circular border with aged brass texture
4. **Amber Glow**: Subtle orange gradient from center
5. **Deep Background**: Obsidian black (#0a0a0c)

## Splash Screen

### iOS Launch Screen
- **Size**: Various (use Storyboard for adaptive)
- **Background**: #0a0a0c
- **Logo**: Centered, 200px width
- **Style**: Minimal, just logo with subtle amber glow

### Android Splash
- **Background**: #0a0a0c
- **Icon**: Centered, adaptive sizing
- **Animation**: Optional fade-in (500ms)

## File Formats

- **iOS**: PNG (no transparency for app icon)
- **Android**: PNG (transparency supported)
- **Adaptive Icon**: Vector drawable preferred
- **Web**: PNG, ICO for favicon

## Generation Tools

Recommended tools to generate all sizes:
1. **Figma/Sketch**: Design master icon at 1024x1024
2. **App Icon Generator**: makeappicon.com or appicon.co
3. **Expo CLI**: `npx expo export --platform ios` for icons
4. **Android Studio**: Image Asset Studio for adaptive icons

## Quality Checklist

- [ ] No text in icon (doesn't scale well)
- [ ] Recognizable at 29x29
- [ ] Consistent with app theme
- [ ] No transparency on iOS app icon
- [ ] Safe zone respected for Android adaptive
- [ ] Tested on light and dark backgrounds
