/**
 * LifeStream V3 - Cold-Chain IoT & Dispatch Telemetry Service
 * Simulates real-time vehicle/drone vector movement and IoT cold-chain temperature readings.
 */

const { getDistanceMiles } = require('./matchingEngine');

function updateDispatchPosition(dispatch) {
  if (dispatch.status === 'Arrived') return dispatch;

  // Move position 12% closer towards destination on each pulse
  const latDiff = dispatch.targetLat - dispatch.currentLat;
  const lngDiff = dispatch.targetLng - dispatch.currentLng;

  dispatch.currentLat += latDiff * 0.12;
  dispatch.currentLng += lngDiff * 0.12;

  // Fluctuate cold-chain IoT temperature sensor between 2.2°C and 5.8°C (Medical safe zone is 2.0°C - 6.0°C)
  const tempDelta = (Math.random() - 0.48) * 0.4;
  dispatch.tempCelsius = Math.max(2.1, Math.min(5.9, Number((dispatch.tempCelsius + tempDelta).toFixed(1))));

  // Update telemetry details (altitude, speed, battery)
  if (dispatch.transportType === 'Autonomous Drone') {
    dispatch.altitudeMeters = Math.max(120, Math.min(180, Math.round(150 + (Math.random() - 0.5) * 15)));
    dispatch.speedMph = Math.max(35, Math.min(55, Math.round(45 + (Math.random() - 0.5) * 5)));
    dispatch.batteryPct = Math.max(10, dispatch.batteryPct - 1);
  } else {
    dispatch.speedMph = Math.max(25, Math.min(45, Math.round(35 + (Math.random() - 0.5) * 10)));
  }

  // Calculate remaining distance and ETA
  const remainingMiles = getDistanceMiles(dispatch.targetLat, dispatch.targetLng, dispatch.currentLat, dispatch.currentLng);
  dispatch.remainingMiles = Number(remainingMiles.toFixed(2));

  if (remainingMiles < 0.08) {
    dispatch.status = 'Arrived';
    dispatch.currentLat = dispatch.targetLat;
    dispatch.currentLng = dispatch.targetLng;
    dispatch.etaMinutes = 0;
  } else {
    // 1 mile ≈ 2 mins for drone, 3 mins for vehicle
    const multiplier = dispatch.transportType === 'Autonomous Drone' ? 2 : 3;
    dispatch.etaMinutes = Math.max(1, Math.ceil(remainingMiles * multiplier));
  }

  return dispatch;
}

module.exports = { updateDispatchPosition };
