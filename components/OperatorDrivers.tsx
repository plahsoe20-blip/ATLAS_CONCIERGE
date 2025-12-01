import React, { useState } from 'react';
import { Card, Button, Input } from './ui';
import { User, Shield, CheckCircle, XCircle, MoreVertical, Plus, FileText, Calendar, Filter } from 'lucide-react';
import { useStore } from '../context/Store';
import { DriverProfile } from '../types';

export const OperatorDrivers: React.FC = () => {
  const { drivers, addDriver, updateDriverStatus } = useStore();
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  const [newDriver, setNewDriver] = useState<Partial<DriverProfile>>({});

  const handleAddSubmit = async () => {
    if (!newDriver.name || !newDriver.email || !newDriver.licenseNumber) return;
    
    await addDriver({
      name: newDriver.name,
      email: newDriver.email,
      phone: newDriver.phone || '',
      avatar: '',
      status: 'OFFLINE',
      licenseNumber: newDriver.licenseNumber,
      licenseExpiry: '2025-01-01', // Default mock
      rating: 5.0,
      totalTrips: 0,
      documents: { license: true, backgroundCheck: true, insurance: true }
    });
    
    setView('LIST');
    setNewDriver({});
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-serif text-white">Driver Roster</h2>
            <p className="text-zinc-500 text-sm">Manage personnel, compliance, and real-time status.</p>
         </div>
         {view === 'LIST' && (
            <Button onClick={() => setView('ADD')} className="gap-2">
               <Plus size={16} /> Onboard Driver
            </Button>
         )}
         {view === 'ADD' && (
            <Button variant="ghost" onClick={() => setView('LIST')}>Cancel</Button>
         )}
      </div>

      {view === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {drivers.map(driver => (
             <Card key={driver.id} className="group hover:border-gold-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-lg">
                         {driver.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-white font-medium">{driver.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${
                               driver.status === 'ONLINE' ? 'bg-green-500' : 
                               driver.status === 'BUSY' ? 'bg-orange-500' : 'bg-zinc-500'
                            }`} />
                            <span className="text-xs text-zinc-400 font-medium">{driver.status}</span>
                         </div>
                      </div>
                   </div>
                   <button className="text-zinc-500 hover:text-white"><MoreVertical size={16} /></button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm border-t border-b border-zinc-800 py-3 mb-3">
                   <div>
                      <p className="text-zinc-500 text-[10px] uppercase">License</p>
                      <p className="text-zinc-300 font-mono text-xs">{driver.licenseNumber}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-zinc-500 text-[10px] uppercase">Rating</p>
                      <p className="text-gold-500 font-mono text-xs">{driver.rating} ★</p>
                   </div>
                </div>

                <div className="space-y-2 mb-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 flex items-center gap-2"><FileText size={12}/> License</span>
                      {driver.documents.license ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-500"/>}
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 flex items-center gap-2"><Shield size={12}/> Background Check</span>
                      {driver.documents.backgroundCheck ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-500"/>}
                   </div>
                </div>

                <div className="flex gap-2">
                   <Button size="sm" variant="secondary" className="flex-1 text-xs">View Profile</Button>
                   <Button size="sm" variant="outline" className="flex-1 text-xs">Schedule</Button>
                </div>
             </Card>
           ))}
        </div>
      )}

      {view === 'ADD' && (
         <Card className="max-w-2xl mx-auto">
            <h3 className="text-xl font-medium text-white mb-6 border-b border-zinc-800 pb-4">New Driver Onboarding</h3>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={newDriver.name || ''} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                  <Input label="Last Name" /> 
               </div>
               <Input label="Email Address" value={newDriver.email || ''} onChange={e => setNewDriver({...newDriver, email: e.target.value})} />
               <Input label="Phone Number" value={newDriver.phone || ''} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
               
               <div className="grid grid-cols-2 gap-4">
                  <Input label="License Number" value={newDriver.licenseNumber || ''} onChange={e => setNewDriver({...newDriver, licenseNumber: e.target.value})} />
                  <Input label="Expiry Date" type="date" />
               </div>
               
               <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 mt-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Required Documents</h4>
                  <div className="grid grid-cols-3 gap-3">
                     {['Driver License', 'Background Check', 'Insurance'].map(doc => (
                        <div key={doc} className="border-2 border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center text-zinc-500 hover:border-gold-500 hover:text-gold-500 cursor-pointer transition-colors">
                           <FileText size={24} className="mb-2" />
                           <span className="text-xs text-center">Upload {doc}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-end pt-4">
                  <Button onClick={handleAddSubmit} className="px-8">Register Driver</Button>
               </div>
            </div>
         </Card>
      )}
    </div>
  );
};