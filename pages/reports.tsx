import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Sidebar from "../components/sidebar/Sidebar"; // Your public sidebar
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { Incident } from "../types"; // Using our shared type
import { formatDistanceToNow } from "date-fns";

// --- Helper Icon Component ---
const MenuIcon = () => (
    <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

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
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-slate-300 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex justify-between items-center">
                <p className="font-bold text-gray-800">{incident.name || 'Incident Report'}</p>
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
    const [isSidebarOpen, setSidebarOpen] = useState(false); // ✅ State for mobile sidebar

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
            {/* --- Desktop Sidebar --- */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <Sidebar />
            </div>

            {/* --- Mobile Sidebar Overlay --- */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative w-64 h-full bg-slate-800 z-50">
                        <Sidebar />
                    </div>
                </div>
            )}
            
            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
                <header className="flex items-center gap-4 mb-6">
                    {/* ✅ Hamburger button for mobile */}
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <MenuIcon />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Reports</h1>
                        <p className="text-gray-500">Complete history of all reported incidents.</p>
                    </div>
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