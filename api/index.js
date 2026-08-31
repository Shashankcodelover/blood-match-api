// Vercel Serverless Entry Point
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Modular routes
const { router: authRouter } = require('../src/routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/donors', require('../src/routes/donors'));
app.use('/api/dispatch', require('../src/routes/dispatch'));
app.use('/api/hospitals', require('../src/routes/hospitals'));
app.use('/api/requests', require('../src/routes/requests'));
app.use('/api/admin', require('../src/routes/admin'));

app.get('/health', (req, res) => res.status(200).json({ status: 'LifeStream V4.0 Vercel Serverless Online', timestamp: new Date().toISOString() }));
app.get('/api/ping', (req, res) => res.status(200).json({ pong: true, timestamp: Date.now() }));

module.exports = app;
