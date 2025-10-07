import React, { useState, useEffect } from 'react';
import { Incident } from '../../types'; // We no longer need date-fns

type IncidentListProps = {
  incidents: Incident[];
  loading: boolean;
  onIncidentSelect: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, newStatus: string) => void;
};

type IncidentCardProps = {
  incident: Incident;
  onIncidentSelect: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, newStatus: string) => void;
};

const IncidentCard = ({ incident, onIncidentSelect, onUpdateStatus }: IncidentCardProps) => {
  const [address, setAddress] = useState('Loading address...');

  // ✅ UPDATED: This now formats the exact time (e.g., 03:15 AM)
  const submissionTime = incident.datetime 
    ? new Date(incident.datetime?.toDate ? incident.datetime.toDate() : incident.datetime)
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'Date not available';
  
  const displayTitle = incident.title || incident.tittle || 'Incident Report';

  useEffect(() => {
    const fetchAddress = async () => {
      if (!incident.location?.latitude || !incident.location?.longitude) {
        setAddress('Location not available');
        return;
      }
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${incident.location.longitude},${incident.location.latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setAddress(data.features[0].place_name);
        } else { setAddress('Address not found'); }
      } catch (error) { setAddress('Could not fetch address'); }
    };
    fetchAddress();
  }, [incident.location]);

  const handleAttendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(incident.id, 'ATTENDING');
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(incident.id, 'DONE');
  };
  
  const cardBorderColor = {
    'NEW': 'border-red-500',
    'ATTENDING': 'border-yellow-500',
    'DONE': 'border-green-500'
  }[incident.status || ''] || 'border-gray-700';

  return (
    <div 
      onClick={() => onIncidentSelect(incident)}
      className={`p-4 bg-slate-700 rounded-lg border-l-4 ${cardBorderColor} cursor-pointer hover:bg-slate-600 transition-colors`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-bold text-white">{displayTitle}</p>
          {/* ✅ UPDATED: Display the new submissionTime string */}
          <p className="text-xs text-gray-400">{submissionTime}</p>
        </div>
        <span className={`px-2 py-0-5 text-xs font-semibold rounded-full bg-opacity-20 ${
          {'NEW': 'bg-red-500 text-red-300', 'ATTENDING': 'bg-yellow-500 text-yellow-300', 'DONE': 'bg-green-500 text-green-300'}[incident.status || '']
        }`}>
          {incident.status || 'UNKNOWN'}
        </span>
      </div>
      <p className="text-sm text-gray-300 mt-2">{address}</p>
      
      {incident.responderName && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-600">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            <p className="text-xs text-slate-400">Assigned to: <strong className="text-slate-200">{incident.responderName}</strong></p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {incident.status === 'NEW' && ( <button onClick={handleAttendClick} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Attend</button> )}
        {incident.status === 'ATTENDING' && ( <button onClick={handleCompleteClick} className="px-4 py-2 text-sm font-semibold bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">Mark as Completed</button> )}
      </div>
    </div>
  );
};

export default function IncidentList({ incidents, loading, onIncidentSelect, onUpdateStatus }: IncidentListProps) {
  if (loading) {
    return ( <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div> );
  }

  if (!incidents || incidents.length === 0) {
    return ( <div className="flex justify-center items-center h-full text-gray-500"><p>No reports found.</p></div> );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <IncidentCard 
          key={incident.id} 
          incident={incident} 
          onIncidentSelect={onIncidentSelect}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}