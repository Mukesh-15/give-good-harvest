
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Donation } from '@/types';

interface LocationMapProps {
  donation?: Donation;
  multiple?: boolean;
  donations?: Donation[];
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  donation, 
  multiple = false, 
  donations = [], 
  className = "h-[400px]" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'YOUR_MAPBOX_PUBLIC_TOKEN'; // Replace with your Mapbox token
    
    const initialLocation = donation?.location.coordinates || [0, 0];
    
    // Handle coordinates whether they're an object with lat/lng or an array [lng, lat]
    let centerLng: number;
    let centerLat: number;
    
    if (Array.isArray(initialLocation)) {
      [centerLng, centerLat] = initialLocation;
    } else {
      centerLng = initialLocation.lng;
      centerLat = initialLocation.lat;
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [centerLng, centerLat],
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers
    if (multiple && donations.length > 0) {
      donations.forEach(d => {
        const coords = d.location.coordinates;
        let markerLng: number;
        let markerLat: number;
        
        if (Array.isArray(coords)) {
          [markerLng, markerLat] = coords;
        } else {
          markerLng = coords.lng;
          markerLat = coords.lat;
        }
        
        new mapboxgl.Marker()
          .setLngLat([markerLng, markerLat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <h3 class="font-semibold">${d.foodName}</h3>
            <p>${d.location.address}</p>
          `))
          .addTo(map.current!);
      });

      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      donations.forEach(d => {
        const coords = d.location.coordinates;
        let lng: number;
        let lat: number;
        
        if (Array.isArray(coords)) {
          [lng, lat] = coords;
        } else {
          lng = coords.lng;
          lat = coords.lat;
        }
        
        bounds.extend([lng, lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (donation) {
      const coords = donation.location.coordinates;
      let markerLng: number;
      let markerLat: number;
      
      if (Array.isArray(coords)) {
        [markerLng, markerLat] = coords;
      } else {
        markerLng = coords.lng;
        markerLat = coords.lat;
      }
      
      new mapboxgl.Marker()
        .setLngLat([markerLng, markerLat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3 class="font-semibold">${donation.foodName}</h3>
          <p>${donation.location.address}</p>
        `))
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [donation, multiple, donations]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
};

export default LocationMap;
