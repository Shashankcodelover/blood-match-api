# LifeStream V3.2 Pro — Smart Emergency Blood Network & Autonomous Drone Dispatch

LifeStream V3.2 Pro ("Uber for Blood") is an enterprise emergency medical logistics and autonomous drone dispatch platform designed for STAT trauma response, cross-hospital blood balancing, and IoT cold-chain compliance.

```
blood-match-api/
├── src/            Node.js + Express REST API (AI matching, cold-chain telemetry, inter-hospital transfers)
└── frontend/       Vite + React 18, Tailwind CSS, Leaflet.js Radar Map, Web Audio Synthesizer
```

## ✨ Core Features & Architectural Upgrades

- 🚨 **STAT Emergency Blood Requests**: Patient & ER doctor intake portal generating broadcasted emergency tickets with auto-donor matching.
- 🚁 **Autonomous Multi-Drone & Ground Vectors**: Real-time 1.5s multi-vehicle telemetry (speed, altitude, battery, weather dynamics, and waypoint polylines).
- 🌡️ **Cold-Chain IoT Monitoring**: Strict thermal surveillance (medical safe zone 2.0°C - 6.0°C) ensuring blood viability during active flight.
- 🩸 **Clinical Cross-Match Matrix**: Interactive visual calculator detailing Red Blood Cell and Plasma compatibility charts, universal donors (O-), and universal recipients (AB+).
- 🏥 **Inter-Hospital Autonomous Payload Transfers**: Automatic surplus blood scanning across 5 regional trauma centers with 1-click inter-hospital drone transfer.
- 🏆 **Community Blood Hero Leaderboard**: Gamified rankings, badge achievements, lives saved metrics, and simulated emergency SMS dispatch pings.
- 🩺 **5-Point Donor Health Pre-Screening**: Real-time clinical clearance check (age, weight, 56-day donation interval, general wellness).
- 🛡️ **Administrator Command Suite**: Root operations dashboard for donor verification toggling, live inventory +/- adjusting, dispatch log auditing, and emergency shortage broadcasts.
- 🔊 **Web Audio Synthesizer**: Procedural audio alerts for mission launch sonars, critical emergency beacons, and rooftop landing chimes.

## Getting Started

### 1. Backend Server
```bash
cd blood-match-api
npm install
npm start          # Running on http://localhost:3000
```

### 2. Frontend Development Server
```bash
cd blood-match-api/frontend
npm install
npm run dev        # Running on http://localhost:5174
```

## Architecture Highlights
- **Geospatial Proximity & Cooldown Engine**: Haversine distance calculations with donor reliability weighting and 56-day donation interval enforcement.
- **Vite + Tailwind Frontend**: Responsive glassmorphism interface, pulsing radar markers, and interactive multi-dispatch telemetry overlays.
- **RESTful Endpoints**:
  - `/api/donors/matches/:bloodType` — Proximity matching relative to selected trauma center
  - `/api/donors/leaderboard` & `/api/donors/check-eligibility` — Community rankings & health screening
  - `/api/donors/ping/:id` — Emergency SMS dispatch alert simulator
  - `/api/requests` — Patient STAT emergency blood request submission & ticket generation
  - `/api/hospitals` & `/api/hospitals/surplus/:hospitalId/:bloodType` — Inventory levels & surplus scanner
  - `/api/hospitals/transfer` — Inter-hospital autonomous drone payload transfer
  - `/api/dispatch/track-all` & `/api/dispatch/:id/confirm-receipt` — Multi-vector telemetry & hospital intake protocol
  - `/api/admin/stats` — Operations metrics, verified donor ratios, and aggregate blood bank units
