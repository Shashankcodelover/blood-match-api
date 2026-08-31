const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Register modular API routes
app.use('/api/donors', require('./routes/donors'));
app.use('/api/dispatch', require('./routes/dispatch'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/admin', require('./routes/admin'));

// Backward compatibility endpoints for legacy frontend compatibility
app.get('/api/matches/:bloodType', (req, res) => {
  res.redirect(`/api/donors/matches/${req.params.bloodType}?urgency=${req.query.urgency || ''}`);
});

app.get('/api/track/:dispatchId', (req, res) => {
  res.redirect(`/api/dispatch/track/${req.params.dispatchId}`);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'LifeStream V3.1 Active', service: 'blood-match-api' }));

app.listen(PORT, () => {
  console.log(`🚀 LifeStream V3.1 (Smart Blood Network) API running on http://localhost:${PORT}`);
});
