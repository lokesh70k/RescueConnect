import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type IconProps = {
  className?: string;
};

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

const AnalyticsIcon = ({ className }: IconProps) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

export default function Sidebar() {
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
        { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
        { name: 'All Reports', href: '/reports', icon: ReportsIcon },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-800 text-white p-4">
            <div className="flex items-center gap-3 mb-8 px-2">
                <img src="/logo.png" alt="RescueConnect Logo" className="w-10 h-10" />
                <span className="text-xl font-bold">RescueConnect</span>
            </div>
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
                                    ? 'bg-slate-900 text-white' 
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
            <div className="mt-auto">
                <Link 
                    href="/distressForm"
                    className="
                        flex items-center justify-center w-full gap-2 px-4 py-3 
                        bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-colors
                    "
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
                    <span>Report Incident</span>
                </Link>
            </div>
        </div>
    );
}