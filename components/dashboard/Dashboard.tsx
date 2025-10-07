import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../sidebar/Sidebar";
import Accidents from "../accidents/accidents";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import MapComponent from "../map/map";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";
import { Incident } from "../../types";

// --- Type Definitions ---
type StatCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  colorClass: { bg: string };
};

// --- Helper Icon Components ---
const MenuIcon = () => ( <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );
const SearchIcon = () => ( <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> );
const BellIcon = () => ( <div className="relative"><svg className="w-6 h-6 text-gray-600 hover:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span></div> );
const StatCard = ({ title, count, icon, colorClass }: StatCardProps) => ( <div className="flex-1 p-3 bg-white rounded-lg flex items-center gap-3 border border-gray-200"><div className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClass.bg}`}>{icon}</div><div><p className="text-xs font-medium text-gray-500">{title}</p><p className="text-lg font-bold text-gray-800">{count}</p></div></div> );

// --- Main Dashboard Component (Optimized with Tabs) ---
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reports'); // ✅ State for active tab

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, "fire"), orderBy("datetime", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const incidentsList: Incident[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      setIncidents(incidentsList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    if (!incidents) return { newCount: 0, pendingCount: 0, completedCount: 0 };
    return {
      newCount: incidents.filter(i => i.status === 'NEW').length,
      pendingCount: incidents.filter(i => i.status === 'PENDING').length,
      completedCount: incidents.filter(i => i.status === 'DONE').length,
    };
  }, [incidents]);

  return (
    <main className="flex bg-slate-100 h-screen overflow-hidden">
      {/* --- Desktop Sidebar --- */}
      <div className="hidden lg:block w-64 flex-shrink-0 bg-slate-800"><Sidebar /></div>
      
      {/* --- Mobile Sidebar Overlay --- */}
      {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
              <div className="relative w-64 h-full bg-slate-800 z-50"><Sidebar /></div>
          </div>
      )}

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <header className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
              <div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-800">RescueConnect</h1>
                  <p className="text-sm md:text-base text-gray-500">Real-time Incident Dashboard</p>
              </div>
           </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:block relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon /></span>
              <input type="text" placeholder="Search reports..." className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="flex items-center gap-3 md:gap-5">
              <button><BellIcon /></button>
              <div className="hidden md:block w-px h-6 bg-gray-300"></div>
              {user && (<button onClick={logout} className="hidden md:block px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Logout</button>)}
              <Link href="/profile"><img alt="profile" src={(user as User)?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/2048px-Circle-icons-profile.svg.png"} className="object-cover rounded-full h-10 w-10 border-2 border-gray-300 hover:border-blue-500" /></Link>
            </div>
          </div>
        </header>
        
        {/* ✅ Tab Navigation --- */}
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex border-b border-gray-300">
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`py-3 px-6 text-sm font-semibold ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Reports
                </button>
                <button 
                    onClick={() => setActiveTab('map')}
                    className={`py-3 px-6 text-sm font-semibold ${activeTab === 'map' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Map
                </button>
            </div>

            {/* ✅ Tab Content --- */}
            <div className="flex-1 overflow-hidden pt-4">
                {activeTab === 'reports' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-full">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 px-2">Recent Reports</h2>
                        <div className="flex gap-2 mb-4">
                            <StatCard title="New" count={stats.newCount} colorClass={{bg: "bg-red-100"}} icon={<svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V7z" clipRule="evenodd"></path></svg>} />
                            <StatCard title="Pending" count={stats.pendingCount} colorClass={{bg: "bg-yellow-100"}} icon={<svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd"></path></svg>} />
                            <StatCard title="Completed" count={stats.completedCount} colorClass={{bg: "bg-green-100"}} icon={<svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>} />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <Accidents incidents={incidents} loading={loading} />
                        </div>
                    </div>
                )}
                {activeTab === 'map' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                        <MapComponent incidents={incidents} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}
