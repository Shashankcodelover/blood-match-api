const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// --- ZOD SCHEMAS ---
const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const bloodTypeSchema = z.string().toUpperCase().refine(val => bloodTypes.includes(val), {
    message: "Invalid blood type"
});

const urgencySchema = z.enum(['critical', 'standard']).optional().default('standard');

const dispatchSchema = z.object({
    donorId: z.number().int().positive("Invalid donor ID"),
    transportType: z.string().optional().default('Drone')
});

// --- DATABASE HELPER ---
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            const initialData = {
                donors: [
                    { id: 1, name: 'John Doe', bloodType: 'O-', contact: 'hidden', phone: 'hidden', lastDonation: '2025-01-01', lat: 37.7749, lng: -122.4194, isVerified: true, reliabilityScore: 98 },
                    { id: 2, name: 'Jane Smith', bloodType: 'A+', contact: 'hidden', phone: 'hidden', lastDonation: '2026-05-01', lat: 37.7849, lng: -122.4094, isVerified: true, reliabilityScore: 85 },
                    { id: 3, name: 'Alex River', bloodType: 'O+', contact: 'hidden', phone: 'hidden', lastDonation: '2025-08-01', lat: 37.7649, lng: -122.4294, isVerified: true, reliabilityScore: 92 },
                    { id: 4, name: 'Sarah Connor', bloodType: 'AB+', contact: 'hidden', phone: 'hidden', lastDonation: '2026-01-01', lat: 37.7949, lng: -122.3994, isVerified: false, reliabilityScore: 70 }
                ],
                messages: [],
                dispatches: []
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        if (!data.dispatches) data.dispatches = [];
        if (!data.messages) data.messages = [];
        return data;
    } catch (error) {
        console.error("Database read error:", error);
        return { donors: [], messages: [], dispatches: [] };
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Database write error:", error);
    }
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
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- ENDPOINTS ---
app.get('/health', (req, res) => res.status(200).json({ status: 'V3 Active' }));

app.get('/api/matches/:bloodType', (req, res, next) => {
    try {
        const recipientType = bloodTypeSchema.parse(req.params.bloodType);
        const urgency = urgencySchema.parse(req.query.urgency);
        const isUrgent = urgency === 'critical';
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

        matchingDonors.sort((a, b) => b.aiScore - a.aiScore);

        res.json(matchingDonors);
    } catch (error) {
        next(error);
    }
});

// Dispatch / Tracking Init
app.post('/api/dispatch', (req, res, next) => {
    try {
        const validated = dispatchSchema.parse(req.body);
        const { donorId, transportType } = validated;
        const db = readDB();
        
        const donor = db.donors.find(d => d.id === donorId);
        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }

        // Clean existing dispatches for this donor
        db.dispatches = db.dispatches.filter(d => d.donorId !== donorId);

        const newDispatch = {
            id: `DSP-${Date.now()}`,
            donorId,
            donorName: donor.name,
            transportType,
            currentLat: donor.lat,
            currentLng: donor.lng,
            targetLat: HOSPITAL_LAT,
            targetLng: HOSPITAL_LNG,
            status: 'En Route',
            etaMinutes: Math.ceil(getDistance(HOSPITAL_LAT, HOSPITAL_LNG, donor.lat, donor.lng) * 2),
            tempCelsius: 4.0 // starting temp
        };
        
        db.dispatches.unshift(newDispatch);
        writeDB(db);

        res.status(200).json(newDispatch);
    } catch (error) {
        next(error);
    }
});

// Live Tracking Endpoint (updates coordinates)
app.get('/api/track/:dispatchId', (req, res, next) => {
    try {
        const db = readDB();
        const dispatch = db.dispatches.find(d => d.id === req.params.dispatchId);
        
        if (!dispatch) {
            return res.status(404).json({ error: 'Dispatch not found' });
        }

        if (dispatch.status === 'Arrived') {
            return res.json(dispatch);
        }

        // Move 10% closer to destination per poll
        const latDiff = dispatch.targetLat - dispatch.currentLat;
        const lngDiff = dispatch.targetLng - dispatch.currentLng;
        
        dispatch.currentLat += latDiff * 0.1;
        dispatch.currentLng += lngDiff * 0.1;
        
        // Cold chain fluctuation between 2.0C and 6.0C
        dispatch.tempCelsius += (Math.random() - 0.5) * 0.5;
        if (dispatch.tempCelsius > 5.5) dispatch.tempCelsius = 5.5;
        if (dispatch.tempCelsius < 2.5) dispatch.tempCelsius = 2.5;

        // Check for arrival (within ~500 feet or 0.1 miles)
        const distLeft = getDistance(dispatch.targetLat, dispatch.targetLng, dispatch.currentLat, dispatch.currentLng);
        if (distLeft < 0.1) {
            dispatch.status = 'Arrived';
            dispatch.etaMinutes = 0;
        } else {
            dispatch.etaMinutes = Math.max(1, dispatch.etaMinutes - 1);
        }

        writeDB(db);
        res.json(dispatch);
    } catch (error) {
        next(error);
    }
});

// --- Centralized Error Handler ---
app.use((err, req, res, next) => {
    if (err instanceof z.ZodError) {
        return res.status(400).json({
            error: "Validation failed",
            details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`LifeStream V3 (Uber for Blood) running on port ${PORT}`);
    });
}

module.exports = app;
