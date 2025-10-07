import React, { useEffect, useState, useRef } from "react";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import PoliceSidebar from "../../components/dashboard/PoliceSidebar";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import { Incident } from "../../types";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const HeatmapComponent = ({ incidents }: { incidents: Incident[] }) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // This useEffect runs ONCE to create the map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [73.0243, 26.2389],
            zoom: 11,
        });

        map.current.on('load', () => {
            if (!map.current) return;
            map.current.addSource('incidents-heatmap', {
                'type': 'geojson',
                'data': { type: 'FeatureCollection', features: [] }
            });
            map.current.addLayer({
                id: 'incidents-heat',
                type: 'heatmap',
                source: 'incidents-heatmap',
                maxzoom: 15,
                paint: {
                    'heatmap-color': [
                        'interpolate', ['linear'], ['heatmap-density'],
                        0, 'rgba(33,102,172,0)', 0.2, 'rgb(103,169,207)', 0.4, 'rgb(209,229,240)',
                        0.6, 'rgb(253,219,199)', 0.8, 'rgb(239,138,98)', 1, 'rgb(178,24,43)'
                    ],
                    'heatmap-radius': [ 'interpolate', ['linear'], ['zoom'], 0, 2, 9, 20 ],
                    'heatmap-intensity': [ 'interpolate', ['linear'], ['zoom'], 0, 1, 9, 3 ]
                }
            });
        });
        
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // ✅ FINAL FIX: This useEffect is now more robust for updating data
    useEffect(() => {
        const mapInstance = map.current;
        // 1. Wait for the map and the incidents data to be ready
        if (!mapInstance || !incidents) return;

        // 2. Define the function to update the data
        const updateSourceData = () => {
            const source = mapInstance.getSource('incidents-heatmap');
            // 3. Wait for the source to be added to the map
            if (!source) return;

            const points = incidents
                .filter(incident => incident.location)
                .map(incident => ({
                    type: 'Feature' as 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point' as 'Point',
                        coordinates: [incident.location!.longitude, incident.location!.latitude]
                    }
                }));

            const geojson: mapboxgl.GeoJSONSourceOptions['data'] = {
                type: 'FeatureCollection' as 'FeatureCollection',
                features: points
            };
            
            (source as mapboxgl.GeoJSONSource).setData(geojson);
        };

        // 4. Check if the map is fully loaded before updating
        if (mapInstance.isStyleLoaded()) {
            updateSourceData();
        } else {
            mapInstance.once('load', updateSourceData);
        }

    }, [incidents]);

    return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
};


// --- Main Analytics Page ---
export default function PoliceAnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/loginp');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "fire"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const incidentsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident));
            setIncidents(incidentsList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (authLoading || !user || loading) {
        return <div className="bg-slate-900 h-screen flex items-center justify-center text-white">Loading Analytics...</div>;
    }

    return (
        <main className="flex bg-slate-900 h-screen overflow-hidden text-white">
            <PoliceSidebar />
            <div className="flex-1 flex flex-col p-6">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Incident Hotspots</h1>
                    <p className="text-slate-400">Heatmap of all reported incident locations.</p>
                </header>
                <div className="flex-1">
                    <HeatmapComponent incidents={incidents} />
                </div>
            </div>
        </main>
    );
}