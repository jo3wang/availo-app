# Availo - Study Space Tracker

Real-time occupancy tracking for study spaces and cafes using LoRaWAN sensors.

## Development Commands

```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run web version
npm run lint        # ESLint checks

# Cloud Functions
cd functions
npm run build       # Compile TypeScript
npm run deploy      # Deploy to Firebase
```

## Architecture

### Tech Stack
- **Frontend**: React Native + Expo 53, Expo Router, NativeWind (Tailwind)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Hardware**: ESP32 LoRaWAN sensors -> TTN -> Firebase webhook

### Data Flow
```
ESP32 Sensor -> LoRaWAN Gateway -> TTN -> processTTNWebhook -> Firestore -> App
```

### Firestore Collections
- `lounge_status` - Real-time occupancy (public read)
- `devices` - Device registry and health
- `occupancy_history` - Historical data for analytics
- `daily_analytics` - Aggregated daily statistics

### App Structure
```
app/
├── _layout.tsx           # Root layout + AuthProvider
├── auth.tsx              # Login/signup screen
├── index.tsx             # Entry redirect
├── spot-details.tsx      # Spot detail view
└── (tabs)/
    ├── radar.tsx         # Main dashboard
    ├── map.tsx           # Map view
    ├── search.tsx        # Search/filter
    └── profile.tsx       # User profile

contexts/AuthContext.tsx  # Firebase auth state
hooks/useStudySpots.ts    # Firestore real-time listener
functions/src/index.ts    # Cloud Functions (TTN webhook)
```

## TTN Webhook Configuration

**URL**: `https://us-central1-studyspace-tracker-app.cloudfunctions.net/processTTNWebhook`

Configure in TTN Console:
1. Applications -> cafetracker-application -> Integrations -> Webhooks
2. Add webhook with above URL, JSON format, Uplink enabled

## Design System

- Primary: #3C2415 (espresso)
- Secondary: #F7F3E9 (cream)
- Accent: #D4621A (burnt orange)
- Status: #87A96B (available), #C65D4F (busy), #8B4B61 (full)

## Development Notes

- Cloud Functions write to Firestore via Admin SDK (bypasses security rules)
- Frontend uses real-time listeners on `lounge_status` collection
- Test payload `DEADBEEF` simulates occupancy data during development
