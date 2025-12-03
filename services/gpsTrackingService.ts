/**
 * GPS Tracking Service
 * Handles real-time location updates for active rides
 */

let trackingInterval: NodeJS.Timeout | null = null;
let isTracking = false;

export const gpsTrackingService = {
  /**
   * Start GPS tracking for active ride
   * Sends location updates every 5 seconds
   */
  startTracking: (rideId: string, onLocationUpdate: (position: GeolocationPosition) => void) => {
    if (isTracking) {
      console.warn('GPS tracking already active');
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported by browser');
      return;
    }

    isTracking = true;
    console.log(`[GPS] Starting tracking for ride ${rideId}`);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationUpdate(position);
      },
      (error) => {
        console.error('[GPS] Initial position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Set up continuous tracking
    trackingInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationUpdate(position);
        },
        (error) => {
          console.error('[GPS] Position update error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }, 5000); // Update every 5 seconds
  },

  /**
   * Stop GPS tracking
   */
  stopTracking: () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
    isTracking = false;
    console.log('[GPS] Tracking stopped');
  },

  /**
   * Check if currently tracking
   */
  isTracking: () => isTracking,

  /**
   * Calculate speed in km/h from consecutive positions
   */
  calculateSpeed: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    timeDiffSeconds: number
  ): number => {
    // Haversine formula for distance between two coordinates
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Speed = distance / time
    const speedKmH = (distance / timeDiffSeconds) * 3600;
    return Math.round(speedKmH * 10) / 10; // Round to 1 decimal
  },

  /**
   * Send location update to backend
   */
  sendLocationUpdate: async (
    rideId: string,
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number
  ) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          latitude,
          longitude,
          speed,
          heading,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send location update');
      }

      return await response.json();
    } catch (error) {
      console.error('[GPS] Failed to send location update:', error);
      throw error;
    }
  },
};
