
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
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialLocation.lng, initialLocation.lat],
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers
    if (multiple && donations.length > 0) {
      donations.forEach(d => {
        const { lat, lng } = d.location.coordinates;
        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <h3 class="font-semibold">${d.foodName}</h3>
            <p>${d.location.address}</p>
          `))
          .addTo(map.current!);
      });

      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      donations.forEach(d => {
        bounds.extend([d.location.coordinates.lng, d.location.coordinates.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (donation) {
      const { lat, lng } = donation.location.coordinates;
      new mapboxgl.Marker()
        .setLngLat([lng, lat])
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

