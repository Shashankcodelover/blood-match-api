const express = require('express');
const { readDB, writeDB } = require('../db');
const { getDistanceMiles } = require('../services/matchingEngine');
const { updateDispatchPosition } = require('../services/telemetry');

const router = express.Router();

// POST /api/dispatch — Initialize blood transport dispatch
router.post('/', (req, res) => {
  const { donorId, hospitalId, transportType } = req.body;
  const db = readDB();

  const donor = db.donors.find(d => d.id === Number(donorId));
  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const hospital = db.hospitals.find(h => h.id === (hospitalId || 'HOSP-01')) || db.hospitals[0];

  // Remove existing active dispatches for this donor
  db.dispatches = db.dispatches.filter(d => d.donorId !== donor.id);

  const initialDistance = getDistanceMiles(hospital.lat, hospital.lng, donor.lat, donor.lng);

  const newDispatch = {
    id: `DSP-${Date.now().toString().slice(-6)}`,
    donorId: donor.id,
    donorName: donor.name,
    donorBloodType: donor.bloodType,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    transportType: transportType || 'Autonomous Drone', // Autonomous Drone | Emergency Transport | Volunteer
    currentLat: donor.lat,
    currentLng: donor.lng,
    targetLat: hospital.lat,
    targetLng: hospital.lng,
    status: 'En Route',
    remainingMiles: Number(initialDistance.toFixed(2)),
    etaMinutes: Math.ceil(initialDistance * 2),
    tempCelsius: 4.0, // Standard cold-chain blood transport temp (2°C - 6°C)
    batteryPct: 98,
    speedMph: transportType === 'Autonomous Drone' ? 45 : 35,
    altitudeMeters: transportType === 'Autonomous Drone' ? 150 : 0,
    startTime: new Date().toISOString()
  };

  db.dispatches.unshift(newDispatch);
  writeDB(db);

  res.status(201).json(newDispatch);
});

// GET /api/dispatch/track/:id — Live polling telemetry update
router.get('/track/:id', (req, res) => {
  const db = readDB();
  const dispatch = db.dispatches.find(d => d.id === req.params.id);

  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  const updated = updateDispatchPosition(dispatch);
  writeDB(db);

  res.json(updated);
});

// GET /api/dispatch/active — List active dispatches
router.get('/active', (req, res) => {
  const db = readDB();
  res.json(db.dispatches.filter(d => d.status !== 'Arrived'));
});

module.exports = router;
