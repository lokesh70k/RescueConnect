import React, { useEffect, useState, useMemo } from "react";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import Sidebar from "../components/sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { Incident } from "../types";
import { format } from 'date-fns';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartData } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// --- Helper Icon Component ---
const MenuIcon = () => (
    <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

// --- Chart Components ---
const IncidentTypePieChart = ({ data }: { data: ChartData<'pie'> }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#cbd5e1' // slate-300
                }
            },
        },
    };
    return <Pie data={data} options={options} />;
};

const IncidentsByDayBarChart = ({ data }: { data: ChartData<'bar'> }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8' }, // slate-400
                grid: { color: '#334155' } // slate-700
            },
            y: {
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' }
            }
        }
    };
    return <Bar options={options} data={data} />;
};

// --- Main Analytics Page Component ---
export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false); // ✅ State for mobile sidebar

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
                borderColor: ['#1e293b'], // slate-800 for dark theme
                borderWidth: 2,
            }],
        };

        const dailyCounts: { [key: string]: number } = {};
        const today = new Date();
        const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7));

        incidents.forEach(inc => {
            if (inc.datetime) {
                const incidentDate = inc.datetime.toDate ? inc.datetime.toDate() : new Date(inc.datetime);
                if (incidentDate >= sevenDaysAgo) {
                    const date = format(incidentDate, 'MMM dd');
                    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
                }
            }
        });
        const barChartLabels = Object.keys(dailyCounts).sort();
        const barChartData: ChartData<'bar'> = {
            labels: barChartLabels,
            datasets: [{
                label: 'Total Incidents',
                data: barChartLabels.map(label => dailyCounts[label]),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            }],
        };
        return { pieChartData, barChartData };
    }, [incidents]);

    if (authLoading || !user || loading) {
        return <div className="h-screen flex justify-center items-center bg-slate-900 text-white"><p>Loading Analytics...</p></div>;
    }

    return (
        <main className="flex bg-slate-900 h-screen overflow-hidden text-white">
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
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics Dashboard</h1>
                        <p className="text-slate-400">Overview of all incident data.</p>
                    </div>
                </header>
                
                {/* ✅ Responsive grid for charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                        <IncidentsByDayBarChart data={chartData.barChartData} />
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex justify-center items-center h-80 md:h-auto">
                        <IncidentTypePieChart data={chartData.pieChartData} />
                    </div>
                </div>
            </div>
        </main>
    );
}