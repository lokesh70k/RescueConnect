import React from 'react';
import AccidentDetails from './accidentDetails';
import { Incident } from '../../types';

type AccidentsProps = {
  incidents: Incident[];
  loading: boolean;
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function Accidents({ incidents, loading }: AccidentsProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        <p>No recent reports found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        // ✅ FIX: Pass the entire incident object as a single prop
        <AccidentDetails key={incident.id} incident={incident} />
      ))}
    </div>
  );
}