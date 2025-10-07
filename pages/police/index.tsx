import React, { useEffect, useState, useRef } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import Link from 'next/link';
import { useAuth } from "../../context/AuthContext";
import { useRouter } from 'next/router';
import PoliceSidebar from "../../components/dashboard/PoliceSidebar";
import PoliceMap from "../../components/map/PoliceMap";
import IncidentList from "../../components/dashboard/IncidentList";
import { User } from "firebase/auth"; // Import the User type from firebase

type Incident = {
  id: string;
  status: string;
  tittle: string;
  location: { latitude: number; longitude: number; };
  datetime: string;
  imageurl: string;
  responderId?: string;
  responderName?: string;
  responderType?: string;
};

// ✅ NEW: Define the props for our UI component to fix TypeScript errors
type PoliceDashboardComponentProps = {
    user: User | null;
    incidents: Incident[];
    loading: boolean;
    selectedIncident: Incident | null;
    setSelectedIncident: React.Dispatch<React.SetStateAction<Incident | null>>;
    handleUpdateStatus: (incidentId: string, newStatus: string) => Promise<void>;
};

// This is the UI of your dashboard
function PoliceDashboardComponent({ user, incidents, loading, selectedIncident, setSelectedIncident, handleUpdateStatus }: PoliceDashboardComponentProps) {
    return (
        <div className="flex w-full min-h-screen font-sans bg-slate-900 text-white">
          <PoliceSidebar />
          <main className="flex-1 flex flex-col gap-6 p-4">
            <header>
              <h1 className="text-4xl font-semibold leading-loose text-red-400">Police Dashboard</h1>
              <p className="text-gray-400">
                {new Date().toLocaleString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                      })}
              </p>
            </header>
    
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-md overflow-hidden h-full">
                    <PoliceMap selectedIncident={selectedIncident} incidents={incidents} />
                </div>
                <div className="lg:col-span-1 bg-slate-800 p-4 rounded-xl shadow-md flex flex-col h-full">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Accidents</h2>
                    <div className="flex-1 overflow-y-auto">
                        <IncidentList 
                            incidents={incidents} 
                            loading={loading}
                            onIncidentSelect={setSelectedIncident}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </div>
                </div>
            </div>
          </main>
        </div>
    );
}


// This is the page component that handles the logic and protection
export default function PoliceDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const incidentsRef = useRef<Incident[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login'); // Change '/login' to your actual login page URL
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const db = getFirestore();
    const q = query(collection(db, "fire"), orderBy("datetime", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const incidentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      
      if (incidentsRef.current.length > 0 && incidentsList.length > incidentsRef.current.length) {
        if (incidentsList.some(inc => !incidentsRef.current.find(oldInc => oldInc.id === inc.id))) {
            const audio = new Audio('/alert.mp3');
            audio.play();
        }
      }
      
      setIncidents(incidentsList);
      incidentsRef.current = incidentsList;
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    if (!user || !user.uid) {
        alert("Could not verify your user ID. Please log out and log back in.");
        return;
    }
    const db = getFirestore();
    const incidentDoc = doc(db, "fire", incidentId);
    const updateData: any = { status: newStatus };
    if (newStatus === 'ATTENDING') {
        updateData.responderId = user.uid;
        updateData.responderName = user.displayName || "Officer";
        updateData.responderType = 'POLICE';
    }
    try {
      await updateDoc(incidentDoc, updateData);
    } catch (error) {
      console.error("Error updating incident status: ", error);
    }
  };
  
  if (authLoading || !user) {
    return (
        <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
            <p>Loading Dashboard...</p>
        </div>
    );
  }

  return (
    <PoliceDashboardComponent
        user={user}
        incidents={incidents}
        loading={loading}
        selectedIncident={selectedIncident}
        setSelectedIncident={setSelectedIncident}
        handleUpdateStatus={handleUpdateStatus}
    />
  );
}