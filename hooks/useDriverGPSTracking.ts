/**
 * Driver GPS Tracking Integration
 * Auto-starts GPS tracking when driver has an active ride
 */

import { useEffect, useRef } from 'react';
import { gpsTrackingService } from '../services/gpsTrackingService';
import { useStore } from '../context/Store';

export const useDriverGPSTracking = () => {
  const { activeTrip, updateDriverLocation } = useStore();
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    // Start tracking if driver has active trip
    if (activeTrip && ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'].includes(activeTrip.status)) {
      if (!isTrackingRef.current) {
        console.log('[GPS Hook] Starting GPS tracking for ride:', activeTrip.id);
        isTrackingRef.current = true;

        gpsTrackingService.startTracking(activeTrip.id, async (position) => {
          const { latitude, longitude } = position.coords;
          const currentTime = Date.now();

          // Calculate speed if we have previous position
          let speed = 0;
          if (lastPositionRef.current) {
            const timeDiff = (currentTime - lastPositionRef.current.timestamp) / 1000; // seconds
            speed = gpsTrackingService.calculateSpeed(
              lastPositionRef.current.lat,
              lastPositionRef.current.lng,
              latitude,
              longitude,
              timeDiff
            );
          }

          // Update last position
          lastPositionRef.current = {
            lat: latitude,
            lng: longitude,
            timestamp: currentTime,
          };

          // Send to backend
          try {
            await gpsTrackingService.sendLocationUpdate(
              activeTrip.id,
              latitude,
              longitude,
              speed,
              position.coords.heading || undefined
            );

            // Update local store
            updateDriverLocation({
              latitude,
              longitude,
              speed,
              heading: position.coords.heading || 0,
              timestamp: currentTime,
            });

            console.log(`[GPS Hook] Location updated: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Speed: ${speed.toFixed(1)} km/h`);
          } catch (error) {
            console.error('[GPS Hook] Failed to send location:', error);
          }
        });
      }
    } else {
      // Stop tracking if no active trip
      if (isTrackingRef.current) {
        console.log('[GPS Hook] Stopping GPS tracking');
        gpsTrackingService.stopTracking();
        isTrackingRef.current = false;
        lastPositionRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (isTrackingRef.current) {
        gpsTrackingService.stopTracking();
        isTrackingRef.current = false;
      }
    };
  }, [activeTrip, updateDriverLocation]);

  return {
    isTracking: isTrackingRef.current,
    lastPosition: lastPositionRef.current,
  };
};

// Usage in DashboardDriver.tsx:
// const { isTracking, lastPosition } = useDriverGPSTracking();
