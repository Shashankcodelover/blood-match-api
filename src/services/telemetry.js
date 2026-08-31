/**
 * LifeStream V3.2 - Advanced Cold-Chain IoT & Autonomous Multi-Dispatch Telemetry
 * Simulates real-time drone and ground vector kinematics, battery degradation,
 * environmental weather dynamics, and IoT cold-chain thermal regulation.
 */

const { getDistanceMiles } = require('./matchingEngine');

function updateDispatchPosition(dispatch) {
  if (dispatch.status === 'Arrived' || dispatch.status === 'Cancelled') return dispatch;

  // Move position closer towards destination on each pulse (14% per tick)
  const latDiff = dispatch.targetLat - dispatch.currentLat;
  const lngDiff = dispatch.targetLng - dispatch.currentLng;

  dispatch.currentLat += latDiff * 0.14;
  dispatch.currentLng += lngDiff * 0.14;

  // Cold-chain IoT temperature simulation (Safe range: 2.0°C to 6.0°C)
  if (!dispatch.tempCelsius) dispatch.tempCelsius = 4.0;
  const tempDelta = (Math.random() - 0.49) * 0.3;
  dispatch.tempCelsius = Math.max(2.1, Math.min(5.8, Number((dispatch.tempCelsius + tempDelta).toFixed(1))));

  // Weather simulation
  if (!dispatch.weather) {
    dispatch.weather = { condition: 'Optimal Clearance', windSpeedMph: 8, ambientTempC: 18 };
  }

  // Kinematic parameters based on vehicle / drone transport type
  if (dispatch.transportType === 'Autonomous Drone' || dispatch.transportType === 'Inter-Hospital Drone') {
    dispatch.altitudeMeters = Math.max(120, Math.min(185, Math.round(150 + (Math.random() - 0.5) * 12)));
    dispatch.speedMph = Math.max(42, Math.min(58, Math.round(50 + (Math.random() - 0.5) * 6)));
    dispatch.batteryPct = Math.max(8, (dispatch.batteryPct || 98) - 1);
  } else {
    dispatch.altitudeMeters = 0;
    dispatch.speedMph = Math.max(25, Math.min(48, Math.round(36 + (Math.random() - 0.5) * 8)));
    dispatch.batteryPct = Math.max(15, (dispatch.batteryPct || 100) - 1);
  }

  // Calculate remaining distance and ETA
  const remainingMiles = getDistanceMiles(dispatch.targetLat, dispatch.targetLng, dispatch.currentLat, dispatch.currentLng);
  dispatch.remainingMiles = Number(remainingMiles.toFixed(2));

  if (remainingMiles < 0.08) {
    dispatch.status = 'Arrived';
    dispatch.currentLat = dispatch.targetLat;
    dispatch.currentLng = dispatch.targetLng;
    dispatch.etaMinutes = 0;
    dispatch.completedAt = new Date().toISOString();
  } else {
    const speed = dispatch.speedMph || 45;
    const etaHours = remainingMiles / speed;
    dispatch.etaMinutes = Math.max(1, Math.ceil(etaHours * 60));
  }

  return dispatch;
}

module.exports = { updateDispatchPosition };
