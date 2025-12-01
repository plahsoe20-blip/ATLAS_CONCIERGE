import React from 'react';
import { useStore } from '../context/Store';
import { Card, Button } from './ui';
import { Clock, Shield, Gauge, Phone, MessageSquare } from 'lucide-react';
import { BookingStatus } from '../types';
import { TacticalMap } from './TacticalMap';

export const LiveTracking: React.FC = () => {
  const { activeTrip } = useStore();

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-500">
        <Shield size={48} className="mb-4 opacity-50" />
        <p className="text-lg">No active trip in progress.</p>
        <p className="text-sm">Dispatch a vehicle to see live telemetry.</p>
      </div>
    );
  }

  const { status, currentLocation } = activeTrip;

  const getStatusColor = () => {
    switch (status) {
      case BookingStatus.DRIVER_EN_ROUTE: return 'text-gold-500';
      case BookingStatus.ARRIVED: return 'text-blue-500';
      case BookingStatus.IN_PROGRESS: return 'text-green-500';
      default: return 'text-zinc-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case BookingStatus.DRIVER_EN_ROUTE: return 'Driver En Route';
      case BookingStatus.ARRIVED: return 'Driver Arrived';
      case BookingStatus.IN_PROGRESS: return 'Trip In Progress';
      case BookingStatus.COMPLETED: return 'Trip Completed';
      default: return 'Scheduled';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* LEFT PANEL: Telemetry */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-l-4 border-l-gold-500 bg-zinc-900/80 backdrop-blur">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest">Status</p>
                <h2 className={`text-2xl font-serif font-bold ${getStatusColor()} animate-pulse`}>
                  {getStatusText()}
                </h2>
              </div>
              <div className="bg-zinc-950 p-2 rounded-full border border-zinc-800">
                 <Shield size={20} className="text-gold-500" />
              </div>
           </div>
           
           <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-zinc-400">
                   <Clock size={16} /> <span className="text-sm">ETA Dropoff</span>
                 </div>
                 <span className="text-xl font-mono text-white">12:45 PM</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-zinc-400">
                   <Gauge size={16} /> <span className="text-sm">Current Speed</span>
                 </div>
                 <span className="text-xl font-mono text-white">{currentLocation.speed.toFixed(0)} <span className="text-xs text-zinc-500">km/h</span></span>
              </div>
           </div>
        </Card>

        <Card className="space-y-4">
           <h3 className="text-zinc-400 text-xs uppercase tracking-widest">Trip Details</h3>
           
           <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
              <div className="relative">
                 <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-950" />
                 <p className="text-xs text-zinc-500">Pickup</p>
                 <p className="text-white text-sm font-medium">{activeTrip.route.pickup.address}</p>
              </div>
              <div className="relative">
                 <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-zinc-950 ${status === BookingStatus.COMPLETED ? 'bg-gold-500' : 'bg-zinc-700'}`} />
                 <p className="text-xs text-zinc-500">Dropoff</p>
                 <p className="text-white text-sm font-medium">{activeTrip.route.dropoff.address}</p>
              </div>
           </div>

           <div className="pt-4 flex gap-2">
              <Button className="flex-1" variant="secondary"><Phone size={14} className="mr-2"/> Call Driver</Button>
              <Button className="flex-1" variant="secondary"><MessageSquare size={14} className="mr-2"/> Message</Button>
           </div>
        </Card>
      </div>

      {/* RIGHT PANEL: Tactical Map Visualization */}
      <div className="lg:col-span-2 relative bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden group">
         <TacticalMap trip={activeTrip} className="w-full h-full" />
      </div>
    </div>
  );
};