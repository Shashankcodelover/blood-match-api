const express = require('express');
const { readDB, writeDB } = require('../db');
const { filterEligibleDonors } = require('../services/matchingEngine');

const router = express.Router();

// GET /api/donors/matches/:bloodType?urgency=critical&hospitalId=HOSP-01
router.get('/matches/:bloodType', (req, res) => {
  const recipientType = req.params.bloodType.toUpperCase();
  const isCritical = req.query.urgency === 'critical';
  const hospitalId = req.query.hospitalId || 'HOSP-01';

  const db = readDB();
  const hospital = db.hospitals.find(h => h.id === hospitalId) || db.hospitals[0];

  const matches = filterEligibleDonors(db.donors, recipientType, hospital.lat, hospital.lng, isCritical);
  res.json({ hospital, matches });
});

// POST /api/donors — Register a new donor
router.post('/', (req, res) => {
  const { name, bloodType, phone, lat, lng } = req.body;
  if (!name || !bloodType) return res.status(400).json({ error: 'Name and bloodType are required' });

  const db = readDB();
  const newDonor = {
    id: Date.now(),
    name,
    bloodType: bloodType.toUpperCase(),
    phone: phone || '+1 415-555-9999',
    lastDonation: null,
    lat: lat || (37.7749 + (Math.random() - 0.5) * 0.05),
    lng: lng || (-122.4194 + (Math.random() - 0.5) * 0.05),
    isVerified: true,
    reliabilityScore: 90,
    totalDonations: 1,
  };

  db.donors.unshift(newDonor);
  writeDB(db);

  res.status(201).json(newDonor);
});

module.exports = router;
