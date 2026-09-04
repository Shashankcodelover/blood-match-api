const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getDistanceMiles,
  calculateMatchScore,
  WHOLE_BLOOD_DONOR_COMPATIBILITY,
  PLASMA_DONOR_COMPATIBILITY
} = require('../src/services/matchingEngine');
const { updateDispatchPosition } = require('../src/services/telemetry');

test('Haversine Geospatial Distance Calculation', () => {
  // SF General Hospital to UCSF Parnassus
  const dist = getDistanceMiles(37.7557, -122.4044, 37.7631, -122.4578);
  assert.ok(dist > 2.5 && dist < 3.5, `Distance should be ~3.0 miles, got ${dist.toFixed(2)}`);

  // Same coordinates should yield 0 miles
  const zeroDist = getDistanceMiles(37.7557, -122.4044, 37.7557, -122.4044);
  assert.equal(zeroDist, 0, 'Distance between identical points must be 0');
});

test('Clinical Red Blood Cell Compatibility Matrix (Universal Donor Rules)', () => {
  const oNegRecipients = WHOLE_BLOOD_DONOR_COMPATIBILITY['O-'];
  assert.equal(oNegRecipients.length, 8, 'O- must be universal red cell donor compatible with all 8 types');
  assert.ok(oNegRecipients.includes('AB+'));
  assert.ok(oNegRecipients.includes('O-'));

  const abPosRecipients = WHOLE_BLOOD_DONOR_COMPATIBILITY['AB+'];
  assert.equal(abPosRecipients.length, 1, 'AB+ whole blood is only compatible with AB+ recipients');
  assert.equal(abPosRecipients[0], 'AB+');
});

test('Clinical Plasma Compatibility Matrix (Universal Plasma Rules)', () => {
  const abPosPlasmaRecipients = PLASMA_DONOR_COMPATIBILITY['AB+'];
  assert.equal(abPosPlasmaRecipients.length, 8, 'AB+ must be universal plasma donor to all 8 blood types');

  const oNegPlasmaRecipients = PLASMA_DONOR_COMPATIBILITY['O-'];
  assert.equal(oNegPlasmaRecipients.length, 2, 'O- plasma is only compatible with O- and O+');
});

test('AI Donor Proximity & Reliability Scoring Engine', () => {
  const standardDonor = {
    lat: 37.7560,
    lng: -122.4050,
    reliabilityScore: 90,
    totalDonations: 8,
    isVerified: true,
    bloodType: 'O-'
  };

  const resNonCritical = calculateMatchScore(standardDonor, 37.7557, -122.4044, false);
  const resCritical = calculateMatchScore(standardDonor, 37.7557, -122.4044, true);

  assert.ok(resNonCritical.score >= 30 && resNonCritical.score <= 99, 'Score must be in valid [30, 99] bounds');
  assert.ok(resCritical.score >= resNonCritical.score, 'STAT critical emergency should boost match priority');
  assert.ok(typeof resNonCritical.distanceMiles === 'number', 'Should compute distanceMiles');
});

test('Cold-Chain IoT Thermal Regulation Simulation', () => {
  const mockDispatch = {
    status: 'In Transit',
    currentLat: 37.7557,
    currentLng: -122.4044,
    targetLat: 37.7631,
    targetLng: -122.4578,
    tempCelsius: 4.0,
    transportType: 'Autonomous Drone',
    batteryPct: 95
  };

  const updated = updateDispatchPosition(mockDispatch);

  // Biological safe window: 2.0°C to 6.0°C
  assert.ok(
    updated.tempCelsius >= 2.0 && updated.tempCelsius <= 6.0,
    `Cold-chain temperature must remain strictly within 2.0°C - 6.0°C, got ${updated.tempCelsius}°C`
  );
  assert.ok(updated.altitudeMeters >= 120 && updated.altitudeMeters <= 185, 'Drone altitude in FAA corridor');
  assert.ok(updated.batteryPct <= 95, 'Battery should consume energy during flight');
});
