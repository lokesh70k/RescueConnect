import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Sidebar from "../components/sidebar/Sidebar"; // Your public sidebar
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { Incident } from "../types"; // Using our shared type
import { formatDistanceToNow } from "date-fns";

// A simple card for the list view
const ReportCard = ({ incident }: { incident: Incident }) => {
    const timeAgo = incident.datetime 
    ? formatDistanceToNow(new Date(incident.datetime?.toDate ? incident.datetime.toDate() : incident.datetime), { addSuffix: true }) 
    : 'Date not available';

    const statusStyles = {
        'NEW': 'bg-red-100 text-red-800',
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'ATTENDING': 'bg-yellow-100 text-yellow-800',
        'DONE': 'bg-green-100 text-green-800'
    }[incident.status || ''] || 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-slate-300">
            <div className="flex justify-between items-center">
                <p className="font-bold text-gray-800">{incident.title || incident.tittle || 'Incident Report'}</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles}`}>
                    {incident.status || 'UNKNOWN'}
                </span>
            </div>
            <p className="text-sm text-gray-500 capitalize">{timeAgo}</p>
        </div>
    );
};

// The main page component
export default function AllReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    // Basic route protection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);
    
    // Fetch all incidents from Firestore
    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "fire"), orderBy("datetime", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const incidentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
            setIncidents(incidentsList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (authLoading || !user) {
        return <div className="h-screen flex justify-center items-center"><p>Loading...</p></div>;
    }

    return (
        <main className="flex bg-slate-100 h-screen overflow-hidden">
            <div className="w-64 flex-shrink-0 bg-slate-800">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">All Reports</h1>
                    <p className="text-gray-500">Complete history of all reported incidents.</p>
                </header>
                {loading ? (
                    <p>Loading reports...</p>
                ) : (
                    <div className="space-y-4">
                        {incidents.map(incident => (
                            <ReportCard key={incident.id} incident={incident} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}