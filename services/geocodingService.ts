/**
 * Geocoding Service
 * Converts addresses to coordinates and vice versa using Mapbox Geocoding API
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYXRsYXMtY29uY2llcmdlIiwiYSI6ImNrZXhhbXBsZSJ9.example';
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

interface GeocodingResult {
  address: string;
  coordinates: [number, number]; // [lng, lat]
  placeName: string;
  placeType: string;
}

export const geocodingService = {
  /**
   * Forward geocoding: Address → Coordinates
   */
  forwardGeocode: async (address: string): Promise<GeocodingResult[]> => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `${GEOCODING_API}/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=5`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      return data.features.map((feature: any) => ({
        address: feature.place_name,
        coordinates: feature.center,
        placeName: feature.text,
        placeType: feature.place_type[0],
      }));
    } catch (error) {
      console.error('Forward geocoding error:', error);
      throw error;
    }
  },

  /**
   * Reverse geocoding: Coordinates → Address
   */
  reverseGeocode: async (lng: number, lat: number): Promise<GeocodingResult> => {
    try {
      const url = `${GEOCODING_API}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();
      const feature = data.features[0];

      return {
        address: feature.place_name,
        coordinates: feature.center,
        placeName: feature.text,
        placeType: feature.place_type[0],
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  },

  /**
   * Get directions between two points
   */
  getDirections: async (
    start: [number, number],
    end: [number, number],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{
    route: [number, number][];
    distance: number; // meters
    duration: number; // seconds
  }> => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Directions request failed');
      }

      const data = await response.json();
      const route = data.routes[0];

      return {
        route: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
      };
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  },

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance: (
    point1: [number, number],
    point2: [number, number]
  ): number => {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;

    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },
};
