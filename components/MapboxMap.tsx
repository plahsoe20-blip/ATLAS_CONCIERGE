import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYXRsYXMtY29uY2llcmdlIiwiYSI6ImNrZXhhbXBsZSJ9.example';

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    lng: number;
    lat: number;
    label?: string;
    color?: string;
    type?: 'driver' | 'pickup' | 'dropoff';
  }>;
  route?: Array<[number, number]>;
  onMapClick?: (lng: number, lat: number) => void;
  className?: string;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  center = [-74.006, 40.7128], // NYC default
  zoom = 12,
  markers = [],
  route = [],
  onMapClick,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';

      // Color based on type
      if (markerData.type === 'driver') {
        el.style.backgroundColor = '#22c55e'; // Green
      } else if (markerData.type === 'pickup') {
        el.style.backgroundColor = '#eab308'; // Yellow
      } else if (markerData.type === 'dropoff') {
        el.style.backgroundColor = '#ef4444'; // Red
      } else {
        el.style.backgroundColor = markerData.color || '#c9a961'; // Gold
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(map.current!);

      // Add popup if label exists
      if (markerData.label) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(markerData.label);
        marker.setPopup(popup);
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((marker) => {
        bounds.extend([marker.lng, marker.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [markers, mapLoaded]);

  // Draw route
  useEffect(() => {
    if (!map.current || !mapLoaded || route.length === 0) return;

    const routeId = 'route-layer';
    const sourceId = 'route-source';

    // Remove existing route
    if (map.current.getLayer(routeId)) {
      map.current.removeLayer(routeId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add route source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      },
    });

    // Add route layer
    map.current.addLayer({
      id: routeId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#c9a961',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });

    // Fit bounds to route
    const bounds = new mapboxgl.LngLatBounds();
    route.forEach((coord) => bounds.extend(coord as [number, number]));
    map.current.fitBounds(bounds, { padding: 50 });
  }, [route, mapLoaded]);

  return <div ref={mapContainer} className={`w-full h-full ${className}`} />;
};
