const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// --- DATABASE HELPER ---
function readDB() {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            donors: [
                { id: 1, name: 'John Doe', bloodType: 'O-', contact: 'hidden', phone: 'hidden', lastDonation: '2025-01-01', lat: 37.7749, lng: -122.4194, isVerified: true, reliabilityScore: 98 },
                { id: 2, name: 'Jane Smith', bloodType: 'A+', contact: 'hidden', phone: 'hidden', lastDonation: '2026-05-01', lat: 37.7849, lng: -122.4094, isVerified: true, reliabilityScore: 85 },
                { id: 3, name: 'Alex River', bloodType: 'O+', contact: 'hidden', phone: 'hidden', lastDonation: '2025-08-01', lat: 37.7649, lng: -122.4294, isVerified: true, reliabilityScore: 92 },
                { id: 4, name: 'Sarah Connor', bloodType: 'AB+', contact: 'hidden', phone: 'hidden', lastDonation: '2026-01-01', lat: 37.7949, lng: -122.3994, isVerified: false, reliabilityScore: 70 }
            ],
            messages: [],
            dispatches: [] // Active tracking sessions
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    // Ensure new V3 properties exist on old V2 databases
    if (!data.dispatches) data.dispatches = [];
    if (!data.messages) data.messages = [];
    return data;
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Hospital Center (San Francisco)
const HOSPITAL_LAT = 37.7749;
const HOSPITAL_LNG = -122.4194;

const COMPATIBILITY_CHART = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], 
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'] 
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- ENDPOINTS ---
app.get('/health', (req, res) => res.status(200).json({ status: 'V3 Active' }));

app.get('/api/matches/:bloodType', (req, res) => {
    const recipientType = req.params.bloodType.toUpperCase();
    const isUrgent = req.query.urgency === 'critical';
    const db = readDB();
    
    let matchingDonors = db.donors.filter(donor => {
        const canGiveTo = COMPATIBILITY_CHART[donor.bloodType];
        if (!canGiveTo || !canGiveTo.includes(recipientType)) return false;

        if (donor.lastDonation) {
            const daysSince = (new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24);
            if (daysSince < 56 && !isUrgent) return false; 
        }
        return true;
    });

    matchingDonors = matchingDonors.map(d => {
        const dist = getDistance(HOSPITAL_LAT, HOSPITAL_LNG, d.lat, d.lng);
        // AI Score: Closer is better, higher reliability is better
        let aiScore = (100 - (dist * 2)) * 0.5 + (d.reliabilityScore || 80) * 0.5;
        if (aiScore > 99) aiScore = 99;
        if (aiScore < 40) aiScore = 40;

        return {
            id: d.id,
            name: d.name,
            bloodType: d.bloodType,
            isVerified: d.isVerified,
            distanceMiles: dist.toFixed(1),
            lat: d.lat,
            lng: d.lng,
            aiScore: aiScore.toFixed(0),
            eligibilityStatus: d.lastDonation ? 'Eligible' : 'New Donor'
        };
    });

    matchingDonors.sort((a, b) => b.aiScore - a.aiScore); // Sort by highest AI score

    res.json(matchingDonors);
});

// Dispatch / Tracking Init
app.post('/api/dispatch', (req, res) => {
    const { donorId, transportType } = req.body;
    const db = readDB();
    
    const donor = db.donors.find(d => d.id === donorId);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });

    // Ensure we remove any existing dispatch for this donor so we start fresh
    db.dispatches = db.dispatches.filter(d => d.donorId !== donorId);

    const newDispatch = {
        id: `DSP-${Date.now()}`,
        donorId,
        donorName: donor.name,
        transportType: transportType || 'Drone', // Drone, Ambulance, Self-Drive
        currentLat: donor.lat,
        currentLng: donor.lng,
        targetLat: HOSPITAL_LAT,
        targetLng: HOSPITAL_LNG,
        status: 'En Route',
        etaMinutes: Math.ceil(getDistance(HOSPITAL_LAT, HOSPITAL_LNG, donor.lat, donor.lng) * 2), // Mock ETA
        tempCelsius: 4.0 // Cold chain starting temp
    };
    
    db.dispatches.unshift(newDispatch);
    writeDB(db);

    res.status(200).json(newDispatch);
});

// Live Tracking Polling Endpoint (Updates coordinates slightly closer to hospital)
app.get('/api/track/:dispatchId', (req, res) => {
    const db = readDB();
    const dispatch = db.dispatches.find(d => d.id === req.params.dispatchId);
    
    if (!dispatch) return res.status(404).json({ error: 'Dispatch not found' });

    if (dispatch.status === 'Arrived') return res.json(dispatch);

    // Move slightly towards target
    const latDiff = dispatch.targetLat - dispatch.currentLat;
    const lngDiff = dispatch.targetLng - dispatch.currentLng;
    
    dispatch.currentLat += latDiff * 0.1; // move 10% closer per ping
    dispatch.currentLng += lngDiff * 0.1;
    
    // Fluctuate temp slightly between 2.0 and 6.0
    dispatch.tempCelsius += (Math.random() - 0.5) * 0.5;
    if (dispatch.tempCelsius > 5.5) dispatch.tempCelsius = 5.5;
    if (dispatch.tempCelsius < 2.5) dispatch.tempCelsius = 2.5;

    // Check arrival
    const distLeft = getDistance(dispatch.targetLat, dispatch.targetLng, dispatch.currentLat, dispatch.currentLng);
    if (distLeft < 0.1) {
        dispatch.status = 'Arrived';
        dispatch.etaMinutes = 0;
    } else {
        dispatch.etaMinutes = Math.max(1, dispatch.etaMinutes - 1); // Decrease ETA
    }

    writeDB(db);
    res.json(dispatch);
});

app.listen(PORT, () => {
    console.log(`LifeStream V3 (Uber for Blood) running on port ${PORT}`);
});




