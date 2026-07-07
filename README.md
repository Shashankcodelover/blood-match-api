# 🩸 LifeStream V3: Smart Blood Network

A cutting-edge geospatial medical logistics and dispatch platform designed for rapid emergency blood response. By integrating real-time map tracking, IoT cold-chain simulation, and AI-assisted match scoring, it accelerates the connection between traumatic trauma incidents and blood centers while protecting privacy.

## 🚀 Key Features

* **Leaflet-Powered Live Radar Map:** High-fidelity interactive mapping tracking emergency hospitals, active dispatch medical drones, and nearby eligible donors.
* **Double-Factor Biological Gate:** Restricts matches based on biological blood group compatibility and enforces the mandatory 56-day donor cooldown period (with a coordinator "Critical Urgency" override to bypass cooldowns during critical life-saving operations).
* **AI Match Confidence Scoring:** Ranks potential donors using a geospatial proximity algorithm (Haversine Formula) balanced against historical donor reliability metrics.
* **IoT Cold-Chain Telemetry Simulation:** Simulates ambient and container temperature fluctuations ($2.5^\circ\text{C}$ to $5.5^\circ\text{C}$) to guarantee blood supply compliance, triggering alerts if temperatures deviate.
* **Anonymized Proxy Security:** Protects sensitive medical records by masking donor phone numbers and addresses with secure communications routing.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Leaflet.js (Map tracking)
* **Backend:** Node.js, Express.js (v4+)
* **Input Validation:** Zod schema enforcement
* **Database:** Zero-dependency local JSON file persistence (`db.json`) for lightweight setups

---

## 📦 Project Structure

```text
📦 lifestream-blood-network
 ┣ 📂 frontend       # React client map interface
 ┣ 📂 src            # Express routing and simulation schemas
 ┣ 📜 db.json        # Atomic JSON file database store
 ┣ 📜 package.json   # Backend manifest
 ┗ 📜 README.md      # Platform documentation
```

---

## 🚦 Getting Started

### Backend Setup
1. Navigate to the root directory:
   ```bash
   cd lifestream-blood-network
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dispatch server:
   ```bash
   node src/server.js
   ```

### Frontend Setup
1. Open the local static front-end page directly in a browser:
   - `frontend/index.html`
2. Ensure the backend server is running on `http://localhost:5000` (or configured port) to handle API requests and map queries.
