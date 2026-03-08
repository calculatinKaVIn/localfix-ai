/**
 * Geofencing Utilities
 * 
 * Functions for calculating distances and filtering problems by radius
 */

export interface Location {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a location is within a specified radius from a center point
 * Returns true if distance <= radiusKm
 */
export function isWithinRadius(
  center: Location,
  point: Location,
  radiusKm: number
): boolean {
  return calculateDistance(center, point) <= radiusKm;
}

/**
 * Filter locations by radius from center point
 * Returns array of locations with their distances
 */
export function filterByRadius<T extends { lat: number; lng: number }>(
  center: Location,
  items: T[],
  radiusKm: number
): Array<T & { distance: number }> {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(center, { lat: item.lat, lng: item.lng }),
    }))
    .filter(item => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Common radius presets in kilometers
 */
export const RADIUS_PRESETS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
] as const;

export const DEFAULT_RADIUS = 5; // Default 5km radius
