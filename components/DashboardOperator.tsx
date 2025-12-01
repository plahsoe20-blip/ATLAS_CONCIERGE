import React, { useState } from 'react';
import { Card, Button } from './ui';
import { Users, Car, TrendingUp, AlertTriangle, DollarSign, Globe, Map, MessageSquare, BarChart3, X, Check, Search } from 'lucide-react';
import { MOCK_VEHICLES } from '../constants';
import { PricingManager } from './PricingManager';
import { OperatorMarketplace } from './OperatorMarketplace';
import { LiveTracking } from './LiveTracking';
import { OperatorMessages } from './OperatorMessages';
import { OperatorReports } from './OperatorReports';
import { useStore } from '../context/Store';

// --- DISPATCH ASSIGNMENT MODAL ---
interface DispatchModalProps {
  onClose: () => void;
  onAssign: (driverId: string, vehicleId: string) => Promise<void>;
}

const DispatchModal: React.FC<DispatchModalProps> = ({ onClose, onAssign }) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock Available Drivers
  const availableDrivers = [
    { id: 'd1', name: 'James Doe', status: 'AVAILABLE', vehicle: 'Mercedes S-Class' },
    { id: 'd2', name: 'Sarah Smith', status: 'BUSY', vehicle: 'Cadillac Escalade' },
    { id: 'd3', name: 'Michael B.', status: 'AVAILABLE', vehicle: 'Rolls Royce Phantom' }
  ];

  const handleConfirm = async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const driver = availableDrivers.find(d => d.id === selectedDriver);
      if (driver?.status === 'BUSY') throw new Error("Selected driver is currently busy.");
      
      await onAssign(selectedDriver, 'v1'); // v1 is mock vehicle
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
       <Card className="w-full max-w-lg border-gold-500/30 shadow-2xl shadow-gold-900/20">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-serif text-white">Assign Driver</h3>
             <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20}/></button>
          </div>

          <div className="space-y-4 mb-6">
             <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase">Trip Details</p>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-white font-medium">Times Square → JFK Airport</span>
                   <span className="text-gold-500 text-sm">$125.00</span>
                </div>
             </div>

             <div className="relative">
                <Search className="absolute left-3 top-3 text-zinc-600" size={16} />
                <input placeholder="Search drivers..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-gold-500 outline-none" />
             </div>

             <div className="max-h-60 overflow-y-auto space-y-2">
                {availableDrivers.map(d => (
                   <div 
                      key={d.id}
                      onClick={() => setSelectedDriver(d.id)}
                      className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                         selectedDriver === d.id 
                           ? 'bg-gold-500/10 border-gold-500' 
                           : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900'
                      }`}
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 border border-zinc-700">
                            {d.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-medium text-white">{d.name}</p>
                            <p className="text-xs text-zinc-500">{d.vehicle}</p>
                         </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${d.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                         {d.status}
                      </span>
                   </div>
                ))}
             </div>
          </div>

          {error && (
             <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
             </div>
          )}

          <div className="flex gap-3">
             <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
             <Button className="flex-1" onClick={handleConfirm} disabled={!selectedDriver || isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
             </Button>
          </div>
       </Card>
    </div>
  );
};


// --- MAIN COMPONENT ---
export const DashboardOperator: React.FC = () => {
  const { assignDriverToTrip } = useStore();
  const [activeView, setActiveView] = useState<'OVERVIEW' | 'PRICING' | 'MARKETPLACE' | 'TRACKING' | 'MESSAGES' | 'REPORTS'>('OVERVIEW');
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      {showDispatchModal && (
        <DispatchModal 
           onClose={() => setShowDispatchModal(false)}
           onAssign={async (dId) => await assignDriverToTrip('trip-123', dId)}
        />
      )}
      
      {/* Navigation Tabs for Operator */}
      <div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto">
         <button 
           onClick={() => setActiveView('OVERVIEW')}
           className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeView === 'OVERVIEW' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-white'}`}
         >
           Fleet Overview
         </button>
         <button 
           onClick={() => setActiveView('TRACKING')}
           className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeView === 'TRACKING' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-white'}`}
         >
           <Map size={14} /> Live Ops
         </button>
         <button 
           onClick={() => setActiveView('MARKETPLACE')}
           className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeView === 'MARKETPLACE' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-white'}`}
         >
           <Globe size={14} /> Bid Board
         </button>
         <button 
           onClick={() => setActiveView('MESSAGES')}
           className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeView === 'MESSAGES' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-white'}`}
         >
           <MessageSquare size={14} /> Messages
         </button>
         <button 
           onClick={() => setActiveView('REPORTS')}
           className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeView === 'REPORTS' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-white'}`}
         >
           <BarChart3 size={14} /> Reports
         </button>
         <button 
           onClick={() => setActiveView('PRICING')}
           className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeView === 'PRICING' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-white'}`}
         >
           Base Pricing
         </button>
      </div>

      {activeView === 'PRICING' && <PricingManager />}
      
      {activeView === 'MARKETPLACE' && <OperatorMarketplace />}

      {activeView === 'TRACKING' && <LiveTracking />}

      {activeView === 'MESSAGES' && <OperatorMessages />}

      {activeView === 'REPORTS' && <OperatorReports />}

      {activeView === 'OVERVIEW' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900/50 border-l-4 border-l-gold-500">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total Revenue (Mo)</p>
              <p className="text-2xl font-serif text-white">$145,200</p>
              <div className="flex items-center gap-1 text-emerald-500 text-xs mt-1">
                <TrendingUp size={12} /> +8.4%
              </div>
            </Card>
            <Card className="bg-zinc-900/50 border-l-4 border-l-blue-500">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Active Drivers</p>
              <p className="text-2xl font-serif text-white">12 <span className="text-sm text-zinc-500">/ 18</span></p>
              <p className="text-zinc-500 text-xs mt-1">4 Currently on trip</p>
            </Card>
            <Card className="bg-zinc-900/50 border-l-4 border-l-purple-500">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Fleet Status</p>
              <p className="text-2xl font-serif text-white">94%</p>
              <p className="text-zinc-500 text-xs mt-1">Operational</p>
            </Card>
            <Card className="bg-zinc-900/50 border-l-4 border-l-red-500">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Alerts</p>
              <p className="text-2xl font-serif text-white">2</p>
              <p className="text-zinc-500 text-xs mt-1">Maintenance required</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Operations */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-white">Live Fleet Overview</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Map View</Button>
                    <Button size="sm" variant="primary" onClick={() => setShowDispatchModal(true)}>Assign Driver</Button>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4 font-medium">Driver</th>
                          <th className="px-6 py-4 font-medium">Vehicle</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Location</th>
                          <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        <tr className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">James D.</td>
                          <td className="px-6 py-4 text-zinc-400">Mercedes S-Class</td>
                          <td className="px-6 py-4"><span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs border border-green-500/20">On Trip</span></td>
                          <td className="px-6 py-4 text-zinc-400">Downtown</td>
                          <td className="px-6 py-4 text-right"><button className="text-gold-500 hover:text-white text-xs">Track</button></td>
                        </tr>
                    </tbody>
                  </table>
                </div>
            </div>

            {/* Fleet List */}
            <div className="space-y-6">
                <h3 className="text-xl font-serif text-white">Vehicle Inventory</h3>
                <div className="space-y-4">
                  {MOCK_VEHICLES.map((vehicle) => (
                    <div key={vehicle.id} className="flex gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <img src={vehicle.image} alt={vehicle.name} className="w-16 h-12 object-cover rounded" />
                      <div className="flex-1">
                          <p className="text-white text-sm font-medium truncate">{vehicle.name}</p>
                          <p className="text-zinc-500 text-xs">{vehicle.category}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                          <span className="text-green-500 text-xs">Active</span>
                          <button className="text-zinc-400 hover:text-white"><AlertTriangle size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};