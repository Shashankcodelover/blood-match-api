const express = require('express');
const { readDB, writeDB } = require('../db');
const { filterEligibleDonors, findHospitalSurplusMatches } = require('../services/matchingEngine');

const router = express.Router();

// GET /api/requests — List patient emergency blood requests
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.requests || []);
});

// POST /api/requests — Submit emergency blood request from patient / hospital ER
router.post('/', (req, res) => {
  const { patientName, bloodType, unitsRequired, urgency, hospitalId, contactPhone, medicalReason } = req.body;

  if (!patientName || !bloodType) {
    return res.status(400).json({ error: 'Patient name and bloodType are required.' });
  }

  const db = readDB();
  const hospital = db.hospitals.find(h => h.id === (hospitalId || 'HOSP-01')) || db.hospitals[0];

  const newRequest = {
    id: `REQ-${Date.now().toString().slice(-5)}`,
    patientName,
    bloodType: bloodType.toUpperCase(),
    unitsRequired: Number(unitsRequired) || 1,
    urgency: urgency || 'critical',
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    status: 'In Progress',
    contactPhone: contactPhone || '+1 415-555-0911',
    medicalReason: medicalReason || 'STAT Emergency Blood Requirement',
    createdAt: new Date().toISOString()
  };

  if (!db.requests) db.requests = [];
  db.requests.unshift(newRequest);

  // If critical, also auto-create a system alert
  if (urgency === 'critical') {
    if (!db.alerts) db.alerts = [];
    db.alerts.unshift({
      id: `ALT-${Date.now().toString().slice(-4)}`,
      hospitalId: hospital.id,
      bloodType: bloodType.toUpperCase(),
      urgency: 'critical',
      message: `EMERGENCY STAT: ${unitsRequired || 1} units of ${bloodType.toUpperCase()} needed for patient ${patientName} at ${hospital.name}.`,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);

  // Return request along with instant AI matches
  const matches = filterEligibleDonors(db.donors, newRequest.bloodType, hospital.lat, hospital.lng, true);
  const hospitalSurplus = findHospitalSurplusMatches(db.hospitals, hospital.id, newRequest.bloodType);

  res.status(201).json({
    request: newRequest,
    matchingDonors: matches.slice(0, 5),
    hospitalSurplus
  });
});

// GET /api/requests/:id — Fetch request details with live donor & surplus matching
router.get('/:id', (req, res) => {
  const db = readDB();
  const request = (db.requests || []).find(r => r.id === req.params.id);

  if (!request) return res.status(404).json({ error: 'Emergency request not found' });

  const hospital = db.hospitals.find(h => h.id === request.hospitalId) || db.hospitals[0];
  const matchingDonors = filterEligibleDonors(db.donors, request.bloodType, hospital.lat, hospital.lng, request.urgency === 'critical');
  const hospitalSurplus = findHospitalSurplusMatches(db.hospitals, hospital.id, request.bloodType);

  res.json({
    request,
    hospital,
    matchingDonors,
    hospitalSurplus
  });
});

// PATCH /api/requests/:id/status — Update request lifecycle status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const request = (db.requests || []).find(r => r.id === req.params.id);

  if (!request) return res.status(404).json({ error: 'Emergency request not found' });

  request.status = status || 'Fulfilled';
  if (status === 'Fulfilled') request.fulfilledAt = new Date().toISOString();
  writeDB(db);

  res.json(request);
});

module.exports = router;
