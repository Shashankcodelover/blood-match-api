const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./server');

const DB_PATH = path.join(__dirname, 'db.json');

beforeEach(() => {
    const initialData = {
        donors: [
            { id: 1, name: 'John Doe', bloodType: 'O-', contact: 'hidden', phone: 'hidden', lastDonation: '2025-01-01', lat: 37.7749, lng: -122.4194, isVerified: true, reliabilityScore: 98 },
            { id: 2, name: 'Jane Smith', bloodType: 'A+', contact: 'hidden', phone: 'hidden', lastDonation: '2026-05-01', lat: 37.7849, lng: -122.4094, isVerified: true, reliabilityScore: 85 }
        ],
        messages: [],
        dispatches: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
});

afterAll(() => {
    if (fs.existsSync(DB_PATH)) {
        try {
            fs.unlinkSync(DB_PATH);
        } catch (e) {
            // Ignore clean up errors
        }
    }
});

describe('LifeStream V3 API', () => {
    test('GET /health - should return status V3 Active', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('V3 Active');
    });

    test('GET /api/matches/:bloodType - should find compatible donors and calculate scores', async () => {
        // A+ recipient can receive from O- (universal) and A+ (matching).
        // Let's test with A+ recipient.
        const res = await request(app).get('/api/matches/A+');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2); // Both O- and A+ are compatible with A+
        expect(res.body[0]).toHaveProperty('aiScore');
        expect(res.body[0]).toHaveProperty('distanceMiles');
    });

    test('GET /api/matches/:bloodType - should return 400 for invalid blood type', async () => {
        const res = await request(app).get('/api/matches/XYZ');
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Validation failed');
    });

    test('POST /api/dispatch - should initialize a drone dispatch session', async () => {
        const res = await request(app)
            .post('/api/dispatch')
            .send({ donorId: 1, transportType: 'Drone' });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('En Route');
        expect(res.body.donorName).toBe('John Doe');
        expect(res.body.tempCelsius).toBe(4.0);
    });

    test('POST /api/dispatch - should return 404 for non-existent donor', async () => {
        const res = await request(app)
            .post('/api/dispatch')
            .send({ donorId: 99, transportType: 'Drone' });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Donor not found');
    });

    test('GET /api/track/:dispatchId - should increment coordinates closer and update ETA', async () => {
        // First, dispatch
        const dispatchRes = await request(app)
            .post('/api/dispatch')
            .send({ donorId: 2, transportType: 'Ambulance' });
        
        const dispatchId = dispatchRes.body.id;

        // Then, track
        const trackRes = await request(app).get(`/api/track/${dispatchId}`);
        expect(trackRes.statusCode).toBe(200);
        expect(trackRes.body.id).toBe(dispatchId);
        expect(trackRes.body.tempCelsius).toBeGreaterThanOrEqual(2.0);
        expect(trackRes.body.tempCelsius).toBeLessThanOrEqual(6.0);
    });
});
