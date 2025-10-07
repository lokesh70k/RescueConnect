import React, { useEffect, useState, useMemo } from "react";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { Incident } from "../types"; // ✅ USE the shared type
import { format } from 'date-fns';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartData } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// ✅ FIX: Added the correct types for the chart data props
const IncidentTypePieChart = ({ data }: { data: ChartData<'pie'> }) => {
    const options = { /* ... options remain the same */ };
    return <Pie data={data} options={options} />;
};

const IncidentsByDayBarChart = ({ data }: { data: ChartData<'bar'> }) => {
    const options = { /* ... options remain the same */ };
    return <Bar options={options} data={data} />;
};

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
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

    const chartData = useMemo(() => {
        const typeCounts = { Police: 0, Ambulance: 0, Fire: 0, Other: 0 };
        incidents.forEach(inc => {
            if (inc.policehelp) typeCounts.Police++;
            if (inc.ambulancehelp) typeCounts.Ambulance++;
            if (inc.firehelp) typeCounts.Fire++;
            if (inc.otherhelp) typeCounts.Other++;
        });
        const pieChartData: ChartData<'pie'> = {
            labels: Object.keys(typeCounts),
            datasets: [{
                label: '# of Incidents',
                data: Object.values(typeCounts),
                backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
                borderColor: ['#1e3a8a', '#059669', '#b91c1c', '#d97706'],
                borderWidth: 1,
            }],
        };

        // ✅ FIX: Added a type for the dailyCounts object
        const dailyCounts: { [key: string]: number } = {};
        const today = new Date();
        const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));

        incidents.forEach(inc => {
            if (inc.datetime) {
                const incidentDate = inc.datetime.toDate ? inc.datetime.toDate() : new Date(inc.datetime);
                if (incidentDate >= sevenDaysAgo) {
                    const date = format(incidentDate, 'MMM dd');
                    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
                }
            }
        });
        const barChartLabels = Object.keys(dailyCounts);
        const barChartData: ChartData<'bar'> = {
            labels: barChartLabels,
            datasets: [{
                label: 'Total Incidents',
                data: barChartLabels.map(label => dailyCounts[label]),
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
            }],
        };

        return { pieChartData, barChartData };
    }, [incidents]);

    if (authLoading || !user || loading) {
        return <div className="h-screen flex justify-center items-center bg-slate-900 text-white"><p>Loading Analytics...</p></div>;
    }

    return (
        <main className="flex bg-slate-900 h-screen overflow-hidden text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                    <p className="text-slate-400">Overview of all incident data.</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                        <IncidentsByDayBarChart data={chartData.barChartData} />
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex justify-center items-center" style={{maxHeight: '400px'}}>
                        <IncidentTypePieChart data={chartData.pieChartData} />
                    </div>
                </div>
            </div>
        </main>
    );
}