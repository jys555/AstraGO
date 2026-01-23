// Location utilities for geolocation and address handling

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // In a real implementation, you'd use Google Maps Geocoding API or similar
  // For now, return a placeholder
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function formatLocation(location: Location): string {
  if (location.address) {
    return location.address;
  }
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
}

export function calculateDistance(
  loc1: Location,
  loc2: Location
): number {
  // Haversine formula to calculate distance in kilometers
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
