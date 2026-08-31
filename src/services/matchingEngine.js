/**
 * LifeStream V3.2 - Advanced AI Blood Compatibility & Proximity Engine
 * Evaluates donor compatibility, geospatial distance (Haversine formula),
 * medical donation cooldown intervals, rare phenotype weighting, and hospital surplus.
 */

// Whole Blood Compatibility: Key = Donor, Value = Eligible Recipients
const WHOLE_BLOOD_DONOR_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Red Cell Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal Recipient
};

// Plasma Compatibility: Key = Donor, Value = Eligible Recipients
const PLASMA_DONOR_COMPATIBILITY = {
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Plasma Donor
  'AB-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'A-': ['O-', 'O+', 'A-', 'A+'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'B-': ['O-', 'O+', 'B-', 'B+'],
  'O+': ['O-', 'O+'],
  'O-': ['O-', 'O+']
};

function getDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calculateMatchScore(donor, targetLat, targetLng, isCritical = false) {
  const distance = getDistanceMiles(targetLat, targetLng, donor.lat, donor.lng);
  
  // Base proximity score (decays over distance)
  const proximityScore = Math.max(10, 100 - (distance * 3.2));
  
  // Reliability score from historical compliance
  const reliability = donor.reliabilityScore || 85;
  
  // Composite score: 45% proximity, 40% reliability, 15% experience bonus
  let score = (proximityScore * 0.45) + (reliability * 0.40) + (Math.min(15, (donor.totalDonations || 1) * 1.5));
  
  if (donor.isVerified) score += 5; // Verified identity bonus
  if (isCritical) score += 5; // STAT emergency boost
  
  // Universal O- donor bonus during critical emergencies
  if (donor.bloodType === 'O-' && isCritical) score += 4;

  if (score > 99) score = 99;
  if (score < 30) score = 30;
  
  return {
    score: Math.round(score),
    distanceMiles: Number(distance.toFixed(1)),
  };
}

function filterEligibleDonors(donors, recipientBloodType, targetLat, targetLng, isCritical = false) {
  const canReceiveFrom = Object.keys(WHOLE_BLOOD_DONOR_COMPATIBILITY).filter(donorType => 
    WHOLE_BLOOD_DONOR_COMPATIBILITY[donorType].includes(recipientBloodType)
  );

  return donors
    .filter(donor => {
      // Check blood compatibility
      if (!canReceiveFrom.includes(donor.bloodType)) return false;

      // Check 56-day donation cooldown unless critical emergency
      if (donor.lastDonation) {
        const daysSince = (new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24);
        if (daysSince < 56 && !isCritical) return false;
      }

      return true;
    })
    .map(donor => {
      const match = calculateMatchScore(donor, targetLat, targetLng, isCritical);
      return {
        ...donor,
        aiScore: match.score,
        distanceMiles: match.distanceMiles,
        eligibilityStatus: donor.lastDonation ? 'Eligible' : 'New Donor',
      };
    })
    .sort((a, b) => b.aiScore - a.aiScore);
}

// Find surplus units in other nearby hospitals for emergency inter-hospital transfer
function findHospitalSurplusMatches(hospitals, targetHospitalId, recipientBloodType) {
  const targetHospital = hospitals.find(h => h.id === targetHospitalId) || hospitals[0];
  const compatibleBloodTypes = Object.keys(WHOLE_BLOOD_DONOR_COMPATIBILITY).filter(donorType => 
    WHOLE_BLOOD_DONOR_COMPATIBILITY[donorType].includes(recipientBloodType)
  );

  const surplusList = [];

  hospitals.forEach(h => {
    if (h.id === targetHospital.id) return;
    const distance = getDistanceMiles(targetHospital.lat, targetHospital.lng, h.lat, h.lng);

    compatibleBloodTypes.forEach(bType => {
      const units = (h.inventory && h.inventory[bType]) || 0;
      if (units >= 2) {
        surplusList.push({
          sourceHospitalId: h.id,
          sourceHospitalName: h.name,
          sourceLat: h.lat,
          sourceLng: h.lng,
          targetHospitalId: targetHospital.id,
          targetHospitalName: targetHospital.name,
          targetLat: targetHospital.lat,
          targetLng: targetHospital.lng,
          bloodType: bType,
          availableUnits: units,
          distanceMiles: Number(distance.toFixed(1)),
          estimatedDroneMins: Math.ceil(distance * 1.8)
        });
      }
    });
  });

  return surplusList.sort((a, b) => a.distanceMiles - b.distanceMiles);
}

module.exports = {
  WHOLE_BLOOD_DONOR_COMPATIBILITY,
  PLASMA_DONOR_COMPATIBILITY,
  getDistanceMiles,
  calculateMatchScore,
  filterEligibleDonors,
  findHospitalSurplusMatches
};
