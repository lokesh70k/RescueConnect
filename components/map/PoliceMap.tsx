import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Incident } from '../../types';

type PoliceMapProps = {
  selectedIncident: Incident | null;
  incidents: Incident[];
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export default function PoliceMap({ selectedIncident, incidents }: PoliceMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const policeStationCoords: [number, number] = [72.9691, 26.2485];

  // Effect to initialize the map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: policeStationCoords,
      zoom: 12,
    });

    new mapboxgl.Marker({ color: '#007cbf' })
      .setLngLat(policeStationCoords)
      .setPopup(new mapboxgl.Popup().setText('Jhalamand Police Station'))
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ✅ FINAL FIX: This is the most stable way to handle dynamic markers
  useEffect(() => {
    if (!map.current || !incidents) return;

    const mapInstance = map.current;
    const createdMarkers: mapboxgl.Marker[] = [];

    const activeIncidents = incidents.filter(inc => inc.status === 'NEW' || inc.status === 'ATTENDING');

    activeIncidents.forEach(incident => {
      if (incident.location) {
        const el = document.createElement('div');
        el.className = 'incident-marker';
        
        if (incident.status === 'NEW') {
          el.innerHTML = `<div class="marker-sonar"><div class="marker-sonar-ring"></div><div class="marker-sonar-ring"></div><div class="marker-sonar-ring"></div></div>`;
        } else if (incident.status === 'ATTENDING') {
          el.innerHTML = `<div class="marker-stable-yellow"></div>`;
        }
        
        const popupText = incident.title || 'Incident';
        const newMarker = new mapboxgl.Marker({ element: el })
          .setLngLat([incident.location.longitude, incident.location.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(popupText))
          .addTo(mapInstance);
        
        createdMarkers.push(newMarker);
      }
    });

    // This cleanup function runs when the component unmounts or before the effect runs again.
    // It removes only the markers that were created in THIS render.
    return () => {
        createdMarkers.forEach(marker => marker.remove());
    };

  }, [incidents]);

  // Effect for drawing the route (this logic is correct)
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    if (mapInstance.getSource('route')) {
        if (mapInstance.getLayer('route')) {
            mapInstance.removeLayer('route');
        }
        mapInstance.removeSource('route');
    }

    if (selectedIncident && selectedIncident.location) {
      const incidentCoords: [number, number] = [selectedIncident.location.longitude, selectedIncident.location.latitude];
      
      const getRoute = async () => {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${policeStationCoords.join(',')};${incidentCoords.join(',')}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes.length) {
              const route = data.routes[0].geometry.coordinates;
              const geojson: mapboxgl.GeoJSONSourceOptions['data'] = {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: route }
              };
              
              if (map.current?.isStyleLoaded()) {
                map.current.addSource('route', { type: 'geojson', data: geojson });
                map.current.addLayer({
                  id: 'route',
                  type: 'line',
                  source: 'route',
                  layout: { 'line-join': 'round', 'line-cap': 'round' },
                  paint: { 'line-color': '#3887be', 'line-width': 5, 'line-opacity': 0.75 }
                });

                const bounds = new mapboxgl.LngLatBounds().extend(policeStationCoords).extend(incidentCoords);
                map.current.fitBounds(bounds, { padding: 100 });
              }
            }
        } catch(error) {
            console.error("Error fetching route:", error);
        }
      };
      getRoute();
    }
  }, [selectedIncident]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
