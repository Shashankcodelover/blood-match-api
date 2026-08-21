const express = require('express');
const { readDB } = require('../db');

const router = express.Router();

// GET /api/hospitals — List medical centers & blood inventory
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.hospitals);
});

// GET /api/hospitals/alerts — List emergency blood shortage alerts
router.get('/alerts', (req, res) => {
  const db = readDB();
  res.json(db.alerts);
});

module.exports = router;
