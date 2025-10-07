import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import ReactDOMServer from "react-dom/server";
import { Incident } from "../../types";

type MapComponentProps = {
  incidents?: Incident[];
  defaultCenter?: [number, number];
};

if (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
} else {
  console.error("Mapbox Access Token is not configured in .env.local");
}

function PopupComponent({ data }: { data: Incident }) {
  const title = data.title;
  return (
    <div className="p-1 bg-white rounded shadow-lg">
      <h3 className="font-sans text-sm font-bold text-black">{title?.toUpperCase()}</h3>
    </div>
  );
}

export default function MapComponent({ incidents = [], defaultCenter = [73.0243, 26.2389] }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Effect to initialize the map only once
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: defaultCenter,
      zoom: 12,
      attributionControl: false,
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => {
      map.current?.remove();
      map.current = null; // Ensure the map instance is cleared
    };
  }, [defaultCenter]);

  // ✅ FIX: This useEffect hook is now fully self-contained and handles its own cleanup
  useEffect(() => {
    if (!map.current || !incidents) return;

    const mapInstance = map.current; // Create a stable variable
    const createdMarkers: mapboxgl.Marker[] = []; // Store markers created in this run

    const markerColors: { [key: string]: string } = {
      NEW: "#F56565",
      PENDING: "#F6E05E",
    };

    const activeIncidents = incidents.filter(inc => inc.status !== 'DONE');

    activeIncidents.forEach((incident) => {
      if (incident.location?.latitude && incident.location?.longitude) {
        const status = incident.status || 'NEW';
        const marker = new mapboxgl.Marker({
          color: markerColors[status] || "#A0AEC0"
        })
          .setLngLat([incident.location.longitude, incident.location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              ReactDOMServer.renderToString(<PopupComponent data={incident} />)
            )
          )
          .addTo(mapInstance);
        
        createdMarkers.push(marker); // Keep track of the marker
      }
    });

    // This cleanup function will run BEFORE the effect runs again,
    // or when the component unmounts. It removes only the markers
    // that were created in *this* specific render.
    return () => {
      createdMarkers.forEach(marker => marker.remove());
    };

  }, [incidents]); // Re-run whenever the incidents prop changes

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
    ></div>
  );
}
