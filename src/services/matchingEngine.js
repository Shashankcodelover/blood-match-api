/**
 * LifeStream V3 - AI Matching Engine
 * Evaluates donor compatibility, geospatial distance (Haversine formula),
 * 56-day donation cooldown eligibility, and donor reliability score.
 */

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
  
  // 50% weight on distance (closer = higher), 50% weight on donor reliability rating
  let score = (100 - (distance * 2.5)) * 0.5 + (donor.reliabilityScore || 80) * 0.5;
  
  if (donor.isVerified) score += 5; // Verification bonus
  if (isCritical) score += 5; // Urgency boost
  
  if (score > 99) score = 99;
  if (score < 35) score = 35;
  
  return {
    score: Math.round(score),
    distanceMiles: Number(distance.toFixed(1)),
  };
}

function filterEligibleDonors(donors, recipientBloodType, targetLat, targetLng, isCritical = false) {
  const canReceiveFrom = Object.keys(COMPATIBILITY_CHART).filter(donorType => 
    COMPATIBILITY_CHART[donorType].includes(recipientBloodType)
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

module.exports = { COMPATIBILITY_CHART, getDistanceMiles, calculateMatchScore, filterEligibleDonors };
