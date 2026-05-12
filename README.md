# LifeStream V3 - Smart Blood Network

A cutting-edge "Uber for Blood" logistics and dispatch platform built for rapid emergency medical response. 

## Features
- **Live GPS Radar Map**: Powered by Leaflet.js, visualizing hospitals and donors in real-time without API keys.
- **Autonomous Dispatch Tracking**: Simulates the real-time movement of medical drones or transports on the map.
- **AI Match Confidence Scoring**: Evaluates geospatial proximity, 56-day medical cooldowns, and reliability to rank donors.
- **Cold-Chain IoT Simulation**: Monitors blood temperature to ensure medical compliance during active transport.
- **Anonymized Proxy Communication**: Protects donor privacy by masking contact details during dispatch.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Leaflet.js
- **Backend**: Node.js, Express.js
- **Database**: Local JSON persistence (`db.json`)

## Getting Started

1. Clone the repository and navigate to the project directory:
   ```bash
   cd blood-match-api
   ```

2. Install the backend dependencies:
   ```bash
   npm install
   ```

3. Start the dispatch server:
   ```bash
   node src/server.js
   ```

4. Open `frontend/index.html` in your web browser.

## Architecture Highlights
This system bypasses heavy database configurations by using a fast, file-based JSON database (`db.json`), ensuring it can run immediately on any machine without complex Docker or PostgreSQL setups. 

The frontend logic uses the Haversine formula for geospatial proximity and interfaces seamlessly with the tracking endpoints to provide smooth 1.5-second polling intervals for live map animations.
