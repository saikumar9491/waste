/**
 * Haversine formula to compute great-circle distance between two GPS points in kilometers.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Intelligent collector recommendation ranking algorithm.
 * Factors:
 * 1. Proximity (Haversine distance)
 * 2. Availability (Available vs On Task vs Offline)
 * 3. Active workload (assignedTasks)
 */
function rankCollectors(complaintLat, complaintLon, collectors) {
  return collectors
    .map((c) => {
      const distance = calculateDistance(complaintLat, complaintLon, c.latitude, c.longitude);
      
      // Calculate weighted priority score (lower is better)
      let score = distance;
      if (c.availability === 'On Task') score += 5;
      if (c.availability === 'Offline') score += 100;
      score += (c.assignedTasks || 0) * 1.5;

      return {
        ...c,
        distance,
        recommendationScore: score,
        isRecommended: false
      };
    })
    .sort((a, b) => a.recommendationScore - b.recommendationScore)
    .map((c, index) => ({
      ...c,
      isRecommended: index === 0 && c.availability !== 'Offline'
    }));
}

module.exports = {
  calculateDistance,
  rankCollectors
};
