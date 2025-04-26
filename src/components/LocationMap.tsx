
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const initialLocation = donation?.location.coordinates || [0, 0];
    
    // Handle coordinates whether they're an object with lat/lng or an array [lng, lat]
    let centerLat: number;
    let centerLng: number;
    
    if (Array.isArray(initialLocation)) {
      [centerLng, centerLat] = initialLocation;
    } else {
      centerLng = initialLocation.lng;
      centerLat = initialLocation.lat;
    }
    
    map.current = L.map(mapContainer.current).setView([centerLat, centerLng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers
    if (multiple && donations.length > 0) {
      const bounds = L.latLngBounds([]);
      
      donations.forEach(d => {
        const coords = d.location.coordinates;
        let markerLat: number;
        let markerLng: number;
        
        if (Array.isArray(coords)) {
          [markerLng, markerLat] = coords;
        } else {
          markerLng = coords.lng;
          markerLat = coords.lat;
        }
        
        const marker = L.marker([markerLat, markerLng])
          .bindPopup(`
            <h3 class="font-semibold">${d.foodName}</h3>
            <p>${d.location.address}</p>
          `);
          
        marker.addTo(map.current!);
        markersRef.current.push(marker);
        bounds.extend([markerLat, markerLng]);
      });

      map.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (donation) {
      const coords = donation.location.coordinates;
      let markerLat: number;
      let markerLng: number;
      
      if (Array.isArray(coords)) {
        [markerLng, markerLat] = coords;
      } else {
        markerLng = coords.lng;
        markerLat = coords.lat;
      }
      
      const marker = L.marker([markerLat, markerLng])
        .bindPopup(`
          <h3 class="font-semibold">${donation.foodName}</h3>
          <p>${donation.location.address}</p>
        `);
        
      marker.addTo(map.current);
      markersRef.current.push(marker);
    }

    return () => {
      map.current?.remove();
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [donation, multiple, donations]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
};

export default LocationMap;
