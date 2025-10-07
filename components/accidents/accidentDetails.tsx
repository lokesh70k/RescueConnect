import React, { useState } from 'react';
import { Incident } from '../../types';
// We no longer need date-fns for this component

type AccidentDetailsProps = {
  incident: Incident;
};

export default function AccidentDetails({ incident }: AccidentDetailsProps) {
  const [copyTooltip, setCopyTooltip] = useState('Copy coordinates');

  // ✅ UPDATED: This now formats the exact time (e.g., 03:12 AM)
  const submissionTime = incident.datetime 
    ? new Date(incident.datetime?.toDate ? incident.datetime.toDate() : incident.datetime)
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'N/A';
  
  const displayTitle = incident.title || incident.tittle || 'Incident Report';
  
  const statusStyles = {
    'NEW': 'bg-red-100 text-red-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'ATTENDING': 'bg-yellow-100 text-yellow-800',
    'DONE': 'bg-green-100 text-green-800'
  }[incident.status || ''] || 'bg-gray-100 text-gray-800';

  const handleCopyLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (incident.location) {
      const coords = `${incident.location.latitude}, ${incident.location.longitude}`;
      navigator.clipboard.writeText(coords);
      setCopyTooltip('Copied!');
      setTimeout(() => setCopyTooltip('Copy coordinates'), 2000);
    }
  };

  return (
    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer">
        <img 
            src={incident.imageurl || '/placeholder-image.png'} 
            alt="Incident" 
            className="h-10 w-10 rounded-md object-cover" 
        />
        <div className="flex-1 min-w-0 mx-3">
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyles}`}>
                    {incident.status || 'UNKNOWN'}
                </span>
                <p className="text-sm font-bold text-gray-900 truncate">
                    {displayTitle}
                </p>
            </div>
        </div>
        <div className="flex flex-col items-end text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {/* ✅ UPDATED: Display the new submissionTime string */}
                <span>{submissionTime}</span>
            </div>
            <button
                title={copyTooltip}
                onClick={handleCopyLocation}
                className="flex items-center gap-1.5 mt-1 cursor-pointer hover:text-blue-500"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{incident.location ? `${incident.location.latitude.toFixed(3)}, ${incident.location.longitude.toFixed(3)}` : 'N/A'}</span>
            </button>
        </div>
        <div className="ml-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </div>
    </div>
  );
}