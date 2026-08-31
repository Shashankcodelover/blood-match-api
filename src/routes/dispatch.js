const express = require('express');
const { readDB, writeDB } = require('../db');
const { getDistanceMiles } = require('../services/matchingEngine');
const { updateDispatchPosition } = require('../services/telemetry');

const router = express.Router();

// POST /api/dispatch — Initialize blood transport dispatch (Drone / Ambulance / Inter-Hospital)
router.post('/', (req, res) => {
  const { donorId, hospitalId, transportType } = req.body;
  const db = readDB();

  const donor = db.donors.find(d => d.id === Number(donorId));
  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const hospital = db.hospitals.find(h => h.id === (hospitalId || 'HOSP-01')) || db.hospitals[0];

  const initialDistance = getDistanceMiles(hospital.lat, hospital.lng, donor.lat, donor.lng);
  const type = transportType || 'Autonomous Drone';

  const newDispatch = {
    id: `DSP-${Date.now().toString().slice(-5)}`,
    donorId: donor.id,
    donorName: donor.name,
    donorBloodType: donor.bloodType,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    transportType: type,
    currentLat: donor.lat,
    currentLng: donor.lng,
    targetLat: hospital.lat,
    targetLng: hospital.lng,
    status: 'En Route',
    remainingMiles: Number(initialDistance.toFixed(2)),
    etaMinutes: Math.max(1, Math.ceil(initialDistance * (type === 'Autonomous Drone' ? 1.5 : 2.5))),
    tempCelsius: 4.0, // Cold-chain target 4.0°C
    batteryPct: 98,
    speedMph: type === 'Autonomous Drone' ? 48 : 35,
    altitudeMeters: type === 'Autonomous Drone' ? 150 : 0,
    startTime: new Date().toISOString(),
    weather: { condition: 'Optimal Clearance', windSpeedMph: 8, ambientTempC: 18 }
  };

  if (!db.dispatches) db.dispatches = [];
  db.dispatches.unshift(newDispatch);
  writeDB(db);

  res.status(201).json(newDispatch);
});

// GET /api/dispatch/track/:id — Live polling telemetry update for single dispatch
router.get('/track/:id', (req, res) => {
  const db = readDB();
  const dispatch = (db.dispatches || []).find(d => d.id === req.params.id);

  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  const updated = updateDispatchPosition(dispatch);
  writeDB(db);

  res.json(updated);
});

// GET /api/dispatch/track-all — Live polling batch update for ALL active dispatches
router.get('/track-all', (req, res) => {
  const db = readDB();
  if (!db.dispatches) db.dispatches = [];

  const active = db.dispatches.filter(d => d.status === 'En Route');
  active.forEach(d => updateDispatchPosition(d));

  writeDB(db);
  res.json(db.dispatches);
});

// GET /api/dispatch/active — List active dispatches
router.get('/active', (req, res) => {
  const db = readDB();
  res.json((db.dispatches || []).filter(d => d.status !== 'Arrived' && d.status !== 'Cancelled'));
});

// POST /api/dispatch/:id/confirm-receipt — Hospital intake signature confirmation
router.post('/:id/confirm-receipt', (req, res) => {
  const { nurseName, tempVerified, badgeId } = req.body;
  const db = readDB();
  const dispatch = (db.dispatches || []).find(d => d.id === req.params.id);

  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  dispatch.status = 'Arrived';
  dispatch.intakeConfirmation = {
    receivedBy: nurseName || 'Nurse Practitioner On-Duty',
    badgeId: badgeId || 'RN-9082',
    intakeTemp: dispatch.tempCelsius,
    tempCompliance: (dispatch.tempCelsius >= 2.0 && dispatch.tempCelsius <= 6.0) ? 'PASSED' : 'INSPECT',
    timestamp: new Date().toISOString()
  };

  // Increment hospital inventory on intake
  const hospital = db.hospitals.find(h => h.id === dispatch.hospitalId);
  if (hospital && hospital.inventory) {
    hospital.inventory[dispatch.donorBloodType] = (hospital.inventory[dispatch.donorBloodType] || 0) + 1;
  }

  writeDB(db);

  res.json({
    message: `Blood unit successfully received into ${dispatch.hospitalName} bank inventory.`,
    dispatch
  });
});

module.exports = router;
