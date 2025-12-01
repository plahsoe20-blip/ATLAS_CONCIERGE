import React, { useState } from 'react';
import { Card, Button } from './ui';
import { MapPin, Navigation, CheckCircle, User, MessageSquare, PlayCircle, Lock } from 'lucide-react';
import { useStore } from '../context/Store'; 
import { BookingStatus } from '../types';
import { TacticalMap } from './TacticalMap';
import { DriverMessages } from './DriverMessages';

export const DashboardDriver: React.FC = () => {
  const { activeTrip, driverAction, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'MESSAGES'>('CURRENT');

  // Determine UI State based on trip status
  const isTripPending = activeTrip?.status === BookingStatus.DRIVER_ASSIGNED;
  const isTripActive = [BookingStatus.DRIVER_EN_ROUTE, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS].includes(activeTrip?.status || BookingStatus.NEW);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
         <div>
           <h2 className="text-2xl font-serif text-white">Welcome, {currentUser.name}</h2>
           <p className="text-zinc-400 text-sm">{activeTrip ? 'You have an active assignment.' : 'Waiting for dispatch...'}</p>
         </div>
         <div className="flex items-center gap-4">
           <span className="text-green-500 text-sm font-medium animate-pulse">ONLINE</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* TABS */}
           <div className="flex gap-2">
              <Button variant={activeTab === 'CURRENT' ? 'primary' : 'ghost'} onClick={() => setActiveTab('CURRENT')}>Current Job</Button>
              <Button variant={activeTab === 'MESSAGES' ? 'primary' : 'ghost'} onClick={() => setActiveTab('MESSAGES')}>Messages</Button>
           </div>

           {activeTab === 'MESSAGES' && <DriverMessages />}

           {activeTab === 'CURRENT' && (
             <Card className="h-[600px] flex flex-col p-0 overflow-hidden relative border-gold-500/20">
                {activeTrip ? (
                   <>
                     <div className="flex-1 relative">
                        <TacticalMap trip={activeTrip} className="w-full h-full" showOverlay={isTripPending} />
                        
                        {/* PENDING ACCEPTANCE OVERLAY */}
                        {isTripPending && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-8 bg-black/60 backdrop-blur-sm text-center">
                              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 shadow-2xl animate-bounce">
                                 <Lock className="text-gold-500" size={24} />
                              </div>
                              <h3 className="text-3xl font-serif text-white mb-2">New Trip Assigned</h3>
                              <p className="text-zinc-300 mb-8 max-w-sm text-sm">Pickup: {activeTrip.route.pickup.address}</p>
                              <Button onClick={() => driverAction('ACCEPT')} size="lg" className="w-full max-w-sm bg-gold-500 text-black font-bold">
                                 <PlayCircle className="mr-2" /> ACCEPT JOB
                              </Button>
                           </div>
                        )}
                     </div>

                     {/* ACTIVE TRIP CONTROLS */}
                     {isTripActive && (
                        <div className="p-6 bg-zinc-950 border-t border-zinc-800">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-xl font-bold text-white uppercase">{activeTrip.status.replace(/_/g, ' ')}</h3>
                              <span className="text-gold-500 font-mono text-sm">{activeTrip.currentLocation.speed.toFixed(0)} km/h</span>
                           </div>
                           <div className="flex gap-2">
                              {activeTrip.status === BookingStatus.DRIVER_EN_ROUTE && (
                                 <Button onClick={() => driverAction('ARRIVE')} className="w-full bg-blue-600 hover:bg-blue-500">I Have Arrived</Button>
                              )}
                              {activeTrip.status === BookingStatus.ARRIVED && (
                                 <Button onClick={() => driverAction('PICKUP')} className="w-full bg-green-600 hover:bg-green-500">Passenger Onboard</Button>
                              )}
                              {activeTrip.status === BookingStatus.IN_PROGRESS && (
                                 <Button onClick={() => driverAction('COMPLETE')} className="w-full bg-zinc-800 hover:bg-zinc-700">Complete Trip</Button>
                              )}
                           </div>
                        </div>
                     )}
                   </>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                      <Navigation size={48} className="mb-4 opacity-20" />
                      <p>No active assignments.</p>
                   </div>
                )}
             </Card>
           )}
        </div>

        {/* RIGHT COLUMN INFO */}
        <div className="space-y-6">
           <Card>
              <h3 className="font-serif text-white mb-4 flex items-center gap-2"><User size={16} className="text-gold-500"/> Passenger</h3>
              {activeTrip ? (
                 <div className="space-y-2">
                    <p className="text-white font-medium">Alistair Pennyworth</p>
                    <p className="text-xs text-zinc-500">VIP • 5.0 Rating</p>
                    <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => setActiveTab('MESSAGES')}><MessageSquare size={14} className="mr-2"/> Message</Button>
                 </div>
              ) : (
                 <p className="text-zinc-500 text-sm">Waiting for job...</p>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
};
