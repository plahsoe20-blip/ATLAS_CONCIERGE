import React from 'react';
import { Navigation } from 'lucide-react';
import { ActiveTrip, BookingStatus } from '../types';

interface TacticalMapProps {
  trip: ActiveTrip | null;
  className?: string;
  showOverlay?: boolean; // For blurred/locked states
  children?: React.ReactNode; // Allow overlays/markers
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ trip, className = '', showOverlay = false, children }) => {
  const isGlobalView = !trip && children;

  return (
    <div className={`bg-zinc-950 relative overflow-hidden group ${className}`}>
         
         {/* Map Background Grid (Simulating Vector Map) */}
         <div className="absolute inset-0 opacity-20" 
              style={{ 
                backgroundImage: 'radial-gradient(#333 1px, transparent 1px), radial-gradient(#333 1px, transparent 1px)', 
                backgroundSize: '20px 20px', 
                backgroundPosition: '0 0, 10px 10px'
              }} 
         />
         
         {/* Render Trip-Specific Vector Path only if a trip exists */}
         {trip && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 600">
              {/* Base Path (Grey) */}
              <path 
                d="M100,500 C150,400 300,450 400,300 S 600,200 700,100" 
                fill="none" 
                stroke="#333" 
                strokeWidth="4" 
              />
              {/* Active Path (Gold - Animated based on progress) */}
              <path 
                d="M100,500 C150,400 300,450 400,300 S 600,200 700,100" 
                fill="none" 
                stroke="#cb902f" 
                strokeWidth="3" 
                strokeDasharray="1000"
                strokeDashoffset={1000 - (trip.progress * 10)}
                className="transition-all duration-1000 ease-linear"
              />
           </svg>
         )}

         {/* Vehicle Marker for Single Trip */}
         {trip && (
           <div 
             className="absolute transition-all duration-1000 ease-linear flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
             style={{ 
               left: `${15 + (trip.progress * 0.70)}%`, // Approximate visual path mapping
               top: `${80 - (trip.progress * 0.65)}%` 
             }}
           >
              <div className="relative">
                 <div className={`absolute inset-0 bg-gold-500/30 rounded-full ${trip.status === BookingStatus.IN_PROGRESS ? 'animate-ping' : ''}`} />
                 <div className="w-8 h-8 bg-black border-2 border-gold-500 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-gold-500/20">
                    <Navigation size={14} className="text-gold-500 transform rotate-45" />
                 </div>
              </div>
              {/* Speed Badge */}
              {trip.status !== BookingStatus.DRIVER_ASSIGNED && (
                  <div className="mt-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] text-gold-500 font-mono border border-gold-500/30 whitespace-nowrap">
                  {trip.currentLocation.speed.toFixed(0)} km/h
                  </div>
              )}
           </div>
         )}

         {/* Telemetry Overlay */}
         <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            <button className="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded text-white hover:bg-zinc-800 flex items-center justify-center">+</button>
            <button className="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded text-white hover:bg-zinc-800 flex items-center justify-center">-</button>
         </div>

         {trip && (
           <div className="absolute bottom-4 left-4 text-xs text-zinc-600 font-mono z-30">
              LAT: {trip.currentLocation.lat.toFixed(6)} <br/>
              LNG: {trip.currentLocation.lng.toFixed(6)}
           </div>
         )}

         {/* Vignette */}
         <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 z-10" />

         {/* Custom Markers / Children */}
         {children}

         {/* Blurred Overlay for Locked State */}
         {showOverlay && (
             <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-20 flex items-center justify-center">
                 {/* Content handled by parent */}
             </div>
         )}
    </div>
  );
};