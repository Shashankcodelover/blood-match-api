/**
 * LifeStream V3.2 - Master Persistent Database Store
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db.json');

const INITIAL_DATA = {
  hospitals: [
    { id: 'HOSP-01', name: 'SF General Trauma Center', code: 'SFG', lat: 37.7749, lng: -122.4194, phone: '+1 415-206-8000', helipad: true, inventory: { 'O-': 2, 'O+': 5, 'A+': 8, 'A-': 3, 'B+': 4, 'B-': 1, 'AB+': 6, 'AB-': 2 } },
    { id: 'HOSP-02', name: 'UCSF Medical Center Parnassus', code: 'UCSF', lat: 37.7631, lng: -122.4578, phone: '+1 415-476-1000', helipad: true, inventory: { 'O-': 0, 'O+': 3, 'A+': 6, 'A-': 1, 'B+': 2, 'B-': 0, 'AB+': 4, 'AB-': 1 } },
    { id: 'HOSP-03', name: 'St. Mary Regional Medical Center', code: 'SMR', lat: 37.7735, lng: -122.4539, phone: '+1 415-750-5500', helipad: false, inventory: { 'O-': 1, 'O+': 4, 'A+': 5, 'A-': 2, 'B+': 3, 'B-': 1, 'AB+': 3, 'AB-': 0 } },
    { id: 'HOSP-04', name: 'Kaiser Permanente Emergency Hub', code: 'KP-SF', lat: 37.7831, lng: -122.4412, phone: '+1 415-833-2000', helipad: true, inventory: { 'O-': 3, 'O+': 7, 'A+': 9, 'A-': 4, 'B+': 5, 'B-': 2, 'AB+': 5, 'AB-': 2 } },
    { id: 'HOSP-05', name: 'CPMC Van Ness Trauma Pavilion', code: 'CPMC', lat: 37.7865, lng: -122.4215, phone: '+1 415-600-6000', helipad: true, inventory: { 'O-': 1, 'O+': 2, 'A+': 4, 'A-': 1, 'B+': 1, 'B-': 1, 'AB+': 2, 'AB-': 1 } }
  ],
  donors: [
    { id: 1, name: 'John Doe', bloodType: 'O-', phone: '+1 415-555-0192', lastDonation: '2025-01-01', lat: 37.7749, lng: -122.4194, isVerified: true, reliabilityScore: 98, totalDonations: 12, badges: ['Life Saver', 'Universal O- Vanguard', 'Fast Responder'] },
    { id: 2, name: 'Jane Smith', bloodType: 'A+', phone: '+1 415-555-0183', lastDonation: '2026-05-01', lat: 37.7849, lng: -122.4094, isVerified: true, reliabilityScore: 85, totalDonations: 4, badges: ['Community Hero'] },
    { id: 3, name: 'Alex River', bloodType: 'O+', phone: '+1 415-555-0144', lastDonation: '2025-08-01', lat: 37.7649, lng: -122.4294, isVerified: true, reliabilityScore: 92, totalDonations: 9, badges: ['Life Saver', 'Veteran Donor'] },
    { id: 4, name: 'Sarah Connor', bloodType: 'AB+', phone: '+1 415-555-0175', lastDonation: '2026-01-01', lat: 37.7949, lng: -122.3994, isVerified: false, reliabilityScore: 70, totalDonations: 2, badges: ['New Recruit'] },
    { id: 5, name: 'Marcus Vance', bloodType: 'O-', phone: '+1 415-555-0166', lastDonation: '2025-03-15', lat: 37.7550, lng: -122.4350, isVerified: true, reliabilityScore: 96, totalDonations: 15, badges: ['Universal O- Vanguard', 'Life Saver', '15+ Club'] },
    { id: 6, name: 'Elena Rostova', bloodType: 'B+', phone: '+1 415-555-0121', lastDonation: '2025-11-20', lat: 37.7810, lng: -122.4380, isVerified: true, reliabilityScore: 90, totalDonations: 7, badges: ['Reliable Responder'] },
    { id: 7, name: 'David Kim', bloodType: 'A-', phone: '+1 415-555-0138', lastDonation: '2025-06-10', lat: 37.7690, lng: -122.4050, isVerified: true, reliabilityScore: 94, totalDonations: 11, badges: ['Life Saver', 'Fast Responder'] },
    { id: 8, name: 'Chloe Dubois', bloodType: 'AB-', phone: '+1 415-555-0155', lastDonation: '2025-09-12', lat: 37.7780, lng: -122.4480, isVerified: true, reliabilityScore: 91, totalDonations: 6, badges: ['Rare Type Champion'] },
    { id: 9, name: 'Mateo Hernandez', bloodType: 'B-', phone: '+1 415-555-0114', lastDonation: '2025-04-18', lat: 37.7590, lng: -122.4120, isVerified: true, reliabilityScore: 95, totalDonations: 8, badges: ['Life Saver', 'Universal Rare'] }
  ],
  dispatches: [],
  requests: [
    {
      id: 'REQ-901',
      patientName: 'Robert Martinez',
      bloodType: 'O-',
      unitsRequired: 2,
      urgency: 'critical',
      hospitalId: 'HOSP-01',
      hospitalName: 'SF General Trauma Center',
      status: 'In Progress',
      contactPhone: '+1 415-555-0911',
      medicalReason: 'Severe thoracic trauma from highway incident. Massive blood loss protocol activated.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  transfers: [],
  alerts: [
    { id: 'ALT-101', hospitalId: 'HOSP-02', bloodType: 'O-', urgency: 'critical', message: 'Critical O- Universal Donor shortage for trauma emergency at UCSF Parnassus.', createdAt: new Date().toISOString() }
  ]
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(INITIAL_DATA);
    return INITIAL_DATA;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (!data.hospitals || data.hospitals.length < 5) data.hospitals = INITIAL_DATA.hospitals;
    if (!data.donors || data.donors.length < 9) data.donors = INITIAL_DATA.donors;
    if (!data.dispatches) data.dispatches = [];
    if (!data.requests) data.requests = INITIAL_DATA.requests;
    if (!data.transfers) data.transfers = [];
    if (!data.alerts) data.alerts = INITIAL_DATA.alerts;
    return data;
  } catch (e) {
    writeDB(INITIAL_DATA);
    return INITIAL_DATA;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
