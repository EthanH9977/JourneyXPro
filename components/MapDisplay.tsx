
import React, { useEffect, useRef } from 'react';
import { GeoLocation } from '../types';

// Add 'day' and 'description' to the type for map display purposes
interface MapLocation extends GeoLocation {
    day?: number;
    description?: string;
}

interface Props {
  locations: MapLocation[];
}

const MapDisplay: React.FC<Props> = ({ locations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).L || !mapRef.current) return;
    const L = (window as any).L;

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;

    // Clear layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.FeatureGroup) {
        map.removeLayer(layer);
      }
    });

    if (locations.length === 0) return;

    const colors = ['#4f46e5', '#db2777', '#059669', '#d97706', '#7c3aed'];
    const markers: any[] = [];

    locations.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;

        let colorIdx = 0;
        if (loc.day) colorIdx = (loc.day - 1) % colors.length;

        const markerColor = colors[colorIdx];
        
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">${loc.day || '•'}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
            .bindPopup(`
                <div class="font-sans">
                    <h3 class="font-bold text-base mb-1">${loc.name}</h3>
                    <p class="text-sm text-gray-600 mb-1">${loc.description || ''}</p>
                    ${loc.address ? `<p class="text-xs text-gray-400">${loc.address}</p>` : ''}
                </div>
            `)
            .addTo(map);
        
        markers.push(marker);
    });

    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [locations]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default MapDisplay;
