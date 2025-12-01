import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input } from './ui';
import { 
  MapPin, Navigation, Search, Filter, Car, Clock, Shield, 
  Plus, Minus, Share2, Copy, Locate, MoreVertical, Phone, MessageSquare,
  Maximize2, User, ChevronRight
} from 'lucide-react';
import { useStore } from '../context/Store';

// Mock Data for "Other" Active Trips (since Store only has one active simulation)
const MOCK_OTHER_TRIPS = [
  { id: 'BLK-102', client: 'Sarah Connor', vehicle: 'Cadillac Escalade', status: 'En Route', eta: '12 min' },
  { id: 'BLK-304', client: 'James Bond', vehicle: 'Aston Martin DB5', status: 'Arriving', eta: '2 min' },
];

export const ConciergeMap: React.FC = () => {
  const { activeTrip } = useStore();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(activeTrip?.id || null);
  
  // --- MAP INTERACTION STATE ---
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [followMode, setFollowMode] = useState(true); // Auto-center on driver

  // --- HANDLERS ---
  
  // Sync selected trip if activeTrip changes (e.g. created new booking)
  useEffect(() => {
    if (activeTrip) {
      setSelectedTripId(activeTrip.id);
    }
  }, [activeTrip]);

  // Mouse/Touch Events for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setFollowMode(false); // User took control
    dragStart.current = { x: e.clientX - viewState.x, y: e.clientY - viewState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setViewState(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom Logic
    const scaleAdjustment = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, viewState.scale + scaleAdjustment), 4);
    setViewState(prev => ({ ...prev, scale: newScale }));
  };

  // Zoom Controls
  const zoomIn = () => setViewState(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 4) }));
  const zoomOut = () => setViewState(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.5) }));
  
  // Re-center logic
  const handleRecenter = () => {
    setViewState({ x: 0, y: 0, scale: 1.2 });
    setFollowMode(true);
  };

  // Share Link Mock
  const handleShare = () => {
    alert("Tracking link copied to clipboard: https://atlas.app/track/BLK-9281");
  };

  // Determine which trip data to display
  const isLiveTrip = selectedTripId === activeTrip?.id;
  const currentDisplayTrip = isLiveTrip ? activeTrip : null;

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
      
      {/* LEFT SIDEBAR: ACTIVE BOOKINGS */}
      <Card className="lg:col-span-1 p-0 flex flex-col h-full overflow-hidden border-zinc-800 bg-zinc-950">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
          <h2 className="text-xl font-serif text-white mb-4">Live Dispatch</h2>
          
          <div className="relative mb-3">
             <Search className="absolute left-3 top-2.5 text-zinc-600" size={14} />
             <input 
               placeholder="Search active trips..." 
               className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
             />
          </div>

          <div className="flex gap-2">
             <Button size="sm" variant="ghost" className="flex-1 text-xs border border-zinc-800 bg-zinc-900 text-white">Live (3)</Button>
             <Button size="sm" variant="ghost" className="flex-1 text-xs border border-zinc-800 text-zinc-500">Scheduled</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {/* The REAL Active Trip from Store */}
           {activeTrip ? (
             <div 
               onClick={() => setSelectedTripId(activeTrip.id)}
               className={`p-4 border-b border-zinc-900 cursor-pointer transition-all ${
                 selectedTripId === activeTrip.id 
                   ? 'bg-zinc-900 border-l-2 border-l-gold-500' 
                   : 'hover:bg-zinc-900/50'
               }`}
             >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-500 font-bold uppercase tracking-wider">Live Now</span>
                   </div>
                   <span className="text-xs text-zinc-500 font-mono">BLK-9281</span>
                </div>
                
                <h4 className="text-white font-medium mb-1">Alistair Pennyworth</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                   <Car size={12} /> Mercedes-Benz S-Class
                </div>
                
                <div className="bg-zinc-950 rounded p-2 border border-zinc-800 flex justify-between items-center">
                   <span className="text-xs text-zinc-500">Status</span>
                   <span className="text-xs text-gold-500 font-medium">{activeTrip.status.replace('_', ' ')}</span>
                </div>
             </div>
           ) : (
             <div className="p-6 text-center border-b border-zinc-900">
                <p className="text-zinc-500 text-sm">No live simulation active.</p>
                <Button 
                   size="sm" 
                   variant="outline" 
                   className="mt-2 text-xs"
                   onClick={() => alert("Go to Driver Dashboard to start simulation or New Booking to create one.")}
                >
                   How to start?
                </Button>
             </div>
           )}

           {/* MOCKED Other Trips */}
           {MOCK_OTHER_TRIPS.map(trip => (
             <div 
               key={trip.id}
               onClick={() => setSelectedTripId(trip.id)}
               className={`p-4 border-b border-zinc-900 cursor-pointer transition-all opacity-75 hover:opacity-100 ${
                 selectedTripId === trip.id 
                   ? 'bg-zinc-900 border-l-2 border-l-zinc-500' 
                   : 'hover:bg-zinc-900/50'
               }`}
             >
                <div className="flex justify-between items-start mb-1">
                   <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Connecting...</span>
                   <span className="text-xs text-zinc-500 font-mono">{trip.id}</span>
                </div>
                <h4 className="text-zinc-300 font-medium mb-1">{trip.client}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                   <Car size={12} /> {trip.vehicle}
                </div>
             </div>
           ))}
        </div>
      </Card>

      {/* RIGHT: INTERACTIVE MAP VIEWPORT */}
      <div className="lg:col-span-3 relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 group shadow-2xl">
         
         {/* MAP CANVAS CONTAINER */}
         <div 
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative bg-[#0c0c0e]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
         >
            {/* TRANSFORM LAYER */}
            <div 
               className="w-full h-full absolute inset-0 transition-transform duration-75 ease-linear will-change-transform origin-center"
               style={{ 
                  transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})` 
               }}
            >
               {/* 1. Map Grid/Background Pattern */}
               <div 
                  className="absolute inset-[-100%] w-[300%] h-[300%] opacity-20 pointer-events-none"
                  style={{ 
                     backgroundImage: 'radial-gradient(#333 1px, transparent 1px), radial-gradient(#222 1px, transparent 1px)', 
                     backgroundSize: '40px 40px',
                     backgroundPosition: '0 0, 20px 20px'
                  }} 
               />
               
               {/* 2. City Block Outlines (Abstract Vector Art) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
                  <path d="M-200,400 L1200,400" stroke="#333" strokeWidth="2" />
                  <path d="M400,-200 L400,1200" stroke="#333" strokeWidth="2" />
                  <rect x="200" y="200" width="150" height="150" stroke="#222" fill="none" />
                  <rect x="600" y="500" width="200" height="100" stroke="#222" fill="none" />
                  <circle cx="500" cy="400" r="300" stroke="#222" strokeWidth="1" fill="none" />
               </svg>

               {/* 3. The Route Path */}
               {currentDisplayTrip && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 800 600" preserveAspectRatio="none">
                     {/* Route Shadow */}
                     <path 
                        d="M100,500 C150,400 300,450 400,300 S 600,200 700,100" 
                        fill="none" 
                        stroke="black" 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        opacity="0.5"
                     />
                     {/* Route Line */}
                     <path 
                        d="M100,500 C150,400 300,450 400,300 S 600,200 700,100" 
                        fill="none" 
                        stroke="#333" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                     />
                     {/* Progress Line */}
                     <path 
                        d="M100,500 C150,400 300,450 400,300 S 600,200 700,100" 
                        fill="none" 
                        stroke="#cb902f" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                        strokeDasharray="1000"
                        strokeDashoffset={1000 - (currentDisplayTrip.progress * 10)}
                        className="transition-all duration-1000 ease-linear"
                     />
                     
                     {/* Pickup Point */}
                     <circle cx="100" cy="500" r="8" fill="#000" stroke="#cb902f" strokeWidth="4" />
                     {/* Dropoff Point */}
                     <circle cx="700" cy="100" r="8" fill="#000" stroke="#fff" strokeWidth="4" />
                  </svg>
               )}

               {/* 4. The Vehicle Marker */}
               {currentDisplayTrip && (
                  <div 
                     className="absolute transition-all duration-1000 ease-linear z-30"
                     style={{ 
                        left: `${15 + (currentDisplayTrip.progress * 0.70)}%`, 
                        top: `${80 - (currentDisplayTrip.progress * 0.65)}%`,
                        transform: 'translate(-50%, -50%)'
                     }}
                  >
                     {/* Pulse */}
                     <div className="absolute inset-0 bg-gold-500/40 rounded-full animate-ping" />
                     
                     {/* Car Icon */}
                     <div className="relative w-12 h-12 bg-black border-2 border-gold-500 rounded-full flex items-center justify-center shadow-2xl shadow-gold-500/50">
                        <Navigation size={20} className="text-gold-500 transform rotate-45" />
                     </div>

                     {/* Tooltip Label */}
                     <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-1.5 rounded-lg border border-zinc-800 whitespace-nowrap shadow-xl">
                        <p className="text-white text-xs font-bold">BLK-9281</p>
                        <p className="text-gold-500 text-[10px]">{currentDisplayTrip.currentLocation.speed.toFixed(0)} km/h</p>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* --- OVERLAY CONTROLS (UI Layer) --- */}
         
         {/* Top Left: Trip Info Card */}
         {currentDisplayTrip && (
            <div className="absolute top-6 left-6 z-40">
               <Card className="w-80 p-0 overflow-hidden shadow-2xl border-zinc-800 bg-zinc-950/90 backdrop-blur">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                           <p className="text-xs font-bold text-white uppercase">In Progress</p>
                        </div>
                        <h3 className="text-lg font-serif text-white">To JFK Airport</h3>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-mono text-white">14 <span className="text-xs text-zinc-500">min</span></p>
                        <p className="text-xs text-zinc-500">ETA</p>
                     </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                     {/* Progress Bar */}
                     <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                           <span>Times Square</span>
                           <span>Terminal 4</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-gold-500 transition-all duration-1000" 
                              style={{ width: `${currentDisplayTrip.progress}%` }} 
                           />
                        </div>
                     </div>

                     {/* Driver Info */}
                     <div className="flex items-center gap-3 pt-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                           <User size={18} />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-medium text-white">James Doe</p>
                           <p className="text-xs text-zinc-500">4.9 ★ • Mercedes S-Class</p>
                        </div>
                        <div className="flex gap-1">
                           <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><Phone size={14}/></button>
                           <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><MessageSquare size={14}/></button>
                        </div>
                     </div>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex gap-2">
                     <Button size="sm" variant="secondary" className="flex-1 text-xs h-8" onClick={handleShare}>
                        <Share2 size={12} className="mr-2" /> Share Trip
                     </Button>
                     <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                        <Copy size={12} className="mr-2" /> Details
                     </Button>
                  </div>
               </Card>
            </div>
         )}

         {/* Bottom Right: Map Controls */}
         <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
               <button onClick={zoomIn} className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-900 border-b border-zinc-800 block transition-colors">
                  <Plus size={20} />
               </button>
               <button onClick={zoomOut} className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-900 block transition-colors">
                  <Minus size={20} />
               </button>
            </div>
            
            <button 
               onClick={handleRecenter}
               className={`p-3 rounded-lg border shadow-xl transition-all ${
                  followMode 
                     ? 'bg-gold-500 text-black border-gold-500' 
                     : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
               }`}
            >
               <Locate size={20} />
            </button>
         </div>

         {/* Empty State Overlay */}
         {!activeTrip && !selectedTripId && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
               <div className="text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                     <Navigation size={32} className="text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-serif text-white mb-2">No Live Trip Selected</h3>
                  <p className="text-zinc-400 max-w-xs mx-auto">Select an active booking from the sidebar to track its real-time progress.</p>
               </div>
            </div>
         )}

      </div>
    </div>
  );
};