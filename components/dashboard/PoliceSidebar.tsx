import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

// Define a type for the props that our icon components will accept
type IconProps = {
  className?: string;
};

// --- Icon Components ---
const DashboardIcon = ({ className }: IconProps) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const ReportsIcon = ({ className }: IconProps) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// ✅ ADDED the missing AnalyticsIcon component
const AnalyticsIcon = ({ className }: IconProps) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

// ✅ IMPROVEMENT: Moved navItems outside the component as it's a constant
const navItems = [
    { name: 'Live Dashboard', href: '/police', icon: DashboardIcon },
    { name: 'All Incidents', href: '/police/list', icon: ReportsIcon },
    { name: 'Analytics', href: '/police/analytics', icon: AnalyticsIcon },
];

// The main Sidebar component
export default function PoliceSidebar() {
    const router = useRouter();
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col h-full bg-slate-800 text-white p-4 w-64">
            {/* Logo and App Name */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center font-bold text-2xl">
                    P
                </div>
                <span className="text-xl font-bold">Police Control</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${isActive 
                                    ? 'bg-red-600 text-white' 
                                    : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                                }
                            `}
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* ✅ IMPROVEMENT: Enhanced User Profile and Logout section */}
            <div className="mt-auto border-t border-slate-700 pt-4">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700">
                    <img 
                        src={user?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/2048px-Circle-icons-profile.svg.png"} 
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.displayName || "Officer"}</p>
                        <button 
                            onClick={logout}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}