const express = require('express');
const { readDB, writeDB } = require('../db');
const { findHospitalSurplusMatches, getDistanceMiles } = require('../services/matchingEngine');

const router = express.Router();

// GET /api/hospitals — List medical centers & blood inventory
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.hospitals);
});

// GET /api/hospitals/alerts — List emergency blood shortage alerts
router.get('/alerts', (req, res) => {
  const db = readDB();
  res.json(db.alerts || []);
});

// GET /api/hospitals/surplus/:hospitalId/:bloodType — Find surplus blood units in neighboring hospitals
router.get('/surplus/:hospitalId/:bloodType', (req, res) => {
  const db = readDB();
  const { hospitalId, bloodType } = req.params;
  const matches = findHospitalSurplusMatches(db.hospitals, hospitalId, bloodType.toUpperCase());
  res.json(matches);
});

// POST /api/hospitals/transfer — Initiate emergency Inter-Hospital Drone Transfer
router.post('/transfer', (req, res) => {
  const { sourceHospitalId, targetHospitalId, bloodType, units } = req.body;
  const db = readDB();

  const sourceHosp = db.hospitals.find(h => h.id === sourceHospitalId);
  const targetHosp = db.hospitals.find(h => h.id === targetHospitalId);

  if (!sourceHosp || !targetHosp) {
    return res.status(404).json({ error: 'Source or target hospital not found' });
  }

  const bType = bloodType ? bloodType.toUpperCase() : 'O-';
  const qty = Number(units) || 1;

  // Check source inventory
  const available = (sourceHosp.inventory && sourceHosp.inventory[bType]) || 0;
  if (available < qty) {
    return res.status(400).json({ error: `Source hospital only has ${available} units of ${bType} available.` });
  }

  // Deduct from source hospital
  sourceHosp.inventory[bType] -= qty;

  const distance = getDistanceMiles(sourceHosp.lat, sourceHosp.lng, targetHosp.lat, targetHosp.lng);

  // Create dispatch mission for inter-hospital drone
  const transferDispatch = {
    id: `XFER-${Date.now().toString().slice(-5)}`,
    donorId: `HOSP-${sourceHosp.code || 'SRC'}`,
    donorName: `${sourceHosp.name} (Surplus Bank)`,
    donorBloodType: bType,
    hospitalId: targetHosp.id,
    hospitalName: targetHosp.name,
    transportType: 'Inter-Hospital Drone',
    currentLat: sourceHosp.lat,
    currentLng: sourceHosp.lng,
    targetLat: targetHosp.lat,
    targetLng: targetHosp.lng,
    status: 'En Route',
    remainingMiles: Number(distance.toFixed(2)),
    etaMinutes: Math.max(1, Math.ceil(distance * 1.8)),
    tempCelsius: 4.0,
    batteryPct: 98,
    speedMph: 52,
    altitudeMeters: 160,
    payloadUnits: qty,
    startTime: new Date().toISOString()
  };

  if (!db.dispatches) db.dispatches = [];
  db.dispatches.unshift(transferDispatch);

  if (!db.transfers) db.transfers = [];
  db.transfers.unshift({
    id: `TRF-${Date.now().toString().slice(-4)}`,
    dispatchId: transferDispatch.id,
    sourceHospitalId: sourceHosp.id,
    sourceHospitalName: sourceHosp.name,
    targetHospitalId: targetHosp.id,
    targetHospitalName: targetHosp.name,
    bloodType: bType,
    units: qty,
    timestamp: new Date().toISOString()
  });

  writeDB(db);

  res.status(201).json({
    message: `Initiated autonomous drone transfer of ${qty} units of ${bType} from ${sourceHosp.name} to ${targetHosp.name}.`,
    dispatch: transferDispatch,
    sourceHospital: sourceHosp,
    targetHospital: targetHosp
  });
});

module.exports = router;
