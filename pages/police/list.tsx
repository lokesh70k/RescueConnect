// pages/police/list.tsx

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import PoliceSidebar from "../../components/dashboard/PoliceSidebar";
import IncidentList from "../../components/dashboard/IncidentList";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

// We can reuse the Incident type from our types file
import { Incident } from "../../types";

export default function AllIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/loginp');
    }
  }, [user, authLoading, router]);

  // Fetch all incidents
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
    return <div className="bg-slate-900 h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex w-full min-h-screen font-sans bg-slate-900 text-white">
      <PoliceSidebar />
      <main className="flex-1 flex flex-col gap-6 p-4">
        <header>
          <h1 className="text-4xl font-semibold leading-loose text-red-400">All Incidents</h1>
          <p className="text-gray-400">Complete incident history</p>
        </header>
        <div className="flex-1 overflow-y-auto">
            {/* We reuse the same IncidentList component for a consistent UI */}
            <IncidentList 
                incidents={incidents} 
                loading={loading}
                onIncidentSelect={() => {}} // Not needed on this page
                onUpdateStatus={() => {}}   // Not needed on this page
            />
        </div>
      </main>
    </div>
  );
}