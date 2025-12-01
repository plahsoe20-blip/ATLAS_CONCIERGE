import React, { useState, useRef } from 'react';
import { Card, Button, Input } from './ui';
import { 
  Car, Camera, Calendar, PenTool as Tool, AlertTriangle, Plus, 
  Settings, Trash2, CheckCircle, XCircle, Fuel, MapPin, 
  Image as ImageIcon, MoreVertical, Search, Filter, ShieldCheck, X,
  Save, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { VehicleCategory } from '../types';
import { VEHICLE_SUB_CATEGORIES } from '../constants';

// Extended Vehicle Type for Fleet Management
interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  subCategory: string; // Niche classification (e.g. "Cadillac Escalade")
  plate: string;
  vin: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'UNLISTED' | 'ON_TRIP';
  photos: {
    front: string | null;
    side: string | null;
    rear: string | null;
    interior: string | null;
  };
  stats: {
    trips: number;
    revenue: number;
    rating: number;
  };
  features: string[];
  maintenance: {
    lastService: string;
    nextServiceDue: string;
    condition: 'Excellent' | 'Good' | 'Fair';
  };
}

const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: 'v1',
    make: 'Mercedes-Benz',
    model: 'S-Class S580',
    year: 2023,
    category: VehicleCategory.SEDAN,
    subCategory: 'Mercedes-Benz S-Class',
    plate: 'BLK-992',
    vin: 'W1K2291829102',
    status: 'ON_TRIP',
    photos: {
      front: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
      side: null,
      rear: null,
      interior: null
    },
    stats: { trips: 142, revenue: 42500, rating: 4.9 },
    features: ['Wifi', 'Massage Seats', 'Privacy Glass'],
    maintenance: { lastService: '2023-09-15', nextServiceDue: '2023-12-15', condition: 'Excellent' }
  },
  {
    id: 'v2',
    make: 'Cadillac',
    model: 'Escalade ESV',
    year: 2023,
    category: VehicleCategory.SUV,
    subCategory: 'Cadillac Escalade',
    plate: 'LXY-881',
    vin: '1GY9281928191',
    status: 'ACTIVE',
    photos: {
      front: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
      side: null,
      rear: null,
      interior: null
    },
    stats: { trips: 89, revenue: 31200, rating: 5.0 },
    features: ['7 Seats', 'Rear Entertainment', 'All-Wheel Drive'],
    maintenance: { lastService: '2023-10-01', nextServiceDue: '2024-01-01', condition: 'Good' }
  },
  {
    id: 'v3',
    make: 'Rolls Royce',
    model: 'Phantom VIII',
    year: 2022,
    category: VehicleCategory.LIMO,
    subCategory: 'Rolls Royce Phantom',
    plate: 'ROYAL-1',
    vin: 'SCA6281928101',
    status: 'MAINTENANCE',
    photos: {
      front: 'https://images.unsplash.com/photo-1631295868223-63265840d00f?auto=format&fit=crop&q=80&w=800',
      side: null,
      rear: null,
      interior: null
    },
    stats: { trips: 12, revenue: 18000, rating: 5.0 },
    features: ['Starlight Headliner', 'Champagne Cooler', 'Extended Wheelbase'],
    maintenance: { lastService: '2023-08-20', nextServiceDue: '2023-11-20', condition: 'Fair' }
  }
];

export const OperatorFleet: React.FC = () => {
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [view, setView] = useState<'LIST' | 'DETAIL' | 'ADD' | 'SCHEDULE'>('LIST');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // State for Add/Edit Forms
  const [isEditingFeatures, setIsEditingFeatures] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [addForm, setAddForm] = useState<Partial<FleetVehicle>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState<keyof FleetVehicle['photos'] | null>(null);

  // Derived state for the currently selected vehicle
  const selectedVehicle = fleet.find(v => v.id === selectedId) || null;

  // --- Handlers ---

  const handleVehicleClick = (id: string) => {
    setSelectedId(id);
    setView('DETAIL');
    setIsEditingFeatures(false);
    setIsEditingDetails(false);
  };

  const handleScheduleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setView('SCHEDULE');
  };

  const handleStartAdd = () => {
    setAddForm({
      category: VehicleCategory.SEDAN,
      status: 'UNLISTED',
      features: [],
      year: new Date().getFullYear(),
      photos: { front: null, side: null, rear: null, interior: null },
      stats: { trips: 0, revenue: 0, rating: 5.0 },
      maintenance: { lastService: 'N/A', nextServiceDue: 'N/A', condition: 'Excellent' }
    });
    setView('ADD');
  };

  const handleSaveNewVehicle = () => {
    if (!addForm.make || !addForm.model || !addForm.plate || !addForm.category) {
      alert("Please fill in Make, Model, Plate and Category.");
      return;
    }

    if (!addForm.subCategory) {
      alert("Please select a specific Niche/Model Classification.");
      return;
    }
    
    const newVehicle: FleetVehicle = {
      ...addForm,
      id: `v-${Date.now()}`,
      features: addForm.features || ['Leather Seats', 'Bluetooth', 'Water Bottles'], // Defaults
      photos: addForm.photos || { front: null, side: null, rear: null, interior: null },
      stats: { trips: 0, revenue: 0, rating: 5.0 },
      maintenance: { lastService: 'N/A', nextServiceDue: 'N/A', condition: 'Excellent' }
    } as FleetVehicle;

    setFleet([...fleet, newVehicle]);
    setView('LIST');
  };

  const handleDeleteVehicle = () => {
    if (confirm("Are you sure you want to remove this vehicle from your fleet? This action cannot be undone.")) {
      setFleet(prev => prev.filter(v => v.id !== selectedId));
      setSelectedId(null);
      setView('LIST');
    }
  };

  const updateStatus = (status: FleetVehicle['status']) => {
    if (!selectedId) return;
    setFleet(prev => prev.map(v => v.id === selectedId ? { ...v, status } : v));
  };

  const updateVehicleDetails = (field: keyof FleetVehicle, value: any) => {
    if (!selectedId) return;
    setFleet(prev => prev.map(v => v.id === selectedId ? { ...v, [field]: value } : v));
  };

  // --- Photo Logic ---

  const handlePhotoClick = (slot: keyof FleetVehicle['photos']) => {
    setActivePhotoSlot(slot);
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePhotoSlot) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (view === 'ADD') {
           setAddForm(prev => ({
             ...prev,
             photos: { ...prev.photos!, [activePhotoSlot]: reader.result as string }
           }));
        } else if (selectedId) {
          setFleet(prev => prev.map(v => {
             if (v.id === selectedId) {
               return { ...v, photos: { ...v.photos, [activePhotoSlot]: reader.result as string } };
             }
             return v;
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Feature Logic ---

  const handleAddFeature = () => {
    if (!selectedId || !newFeature.trim()) return;
    setFleet(prev => prev.map(v => {
      if (v.id === selectedId) {
        return { ...v, features: [...v.features, newFeature.trim()] };
      }
      return v;
    }));
    setNewFeature('');
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    if (!selectedId) return;
    setFleet(prev => prev.map(v => {
      if (v.id === selectedId) {
        return { ...v, features: v.features.filter(f => f !== featureToRemove) };
      }
      return v;
    }));
  };

  // --- Render Helpers ---

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'ON_TRIP': return 'text-gold-500 bg-gold-500/10 border-gold-500/20';
      case 'MAINTENANCE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-500 bg-zinc-800 border-zinc-700';
    }
  };

  const PhotoUploadSlot = ({ label, currentUrl, slot }: { label: string, currentUrl: string | null, slot: keyof FleetVehicle['photos'] }) => (
    <div 
      onClick={() => handlePhotoClick(slot)}
      className="relative group cursor-pointer border-2 border-dashed border-zinc-700 hover:border-gold-500 rounded-xl aspect-[4/3] flex flex-col items-center justify-center transition-all bg-zinc-900 overflow-hidden"
    >
      {currentUrl ? (
        <>
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="text-white mb-2" />
            <span className="text-white text-xs font-medium absolute bottom-4">Change {label}</span>
          </div>
        </>
      ) : (
        <>
          <Camera className="text-zinc-500 mb-2 group-hover:text-gold-500" />
          <span className="text-zinc-500 text-xs font-medium group-hover:text-gold-500">Upload {label}</span>
        </>
      )}
      <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white uppercase tracking-wider font-bold">
        {label}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handlePhotoUpload} 
      />

      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white">Fleet Management</h2>
          <p className="text-zinc-500 text-sm">Manage assets, photos, and availability.</p>
        </div>
        
        {view === 'LIST' && (
           <div className="flex gap-2">
             <Button variant="outline" className="gap-2"><Filter size={14}/> Filter</Button>
             <Button className="gap-2" onClick={handleStartAdd}><Plus size={16}/> Add Vehicle</Button>
           </div>
        )}

        {view !== 'LIST' && (
           <Button variant="ghost" onClick={() => setView('LIST')} className="gap-2">
              <ChevronLeft size={16} /> Back to Inventory
           </Button>
        )}
      </div>

      {/* VIEW: INVENTORY LIST */}
      {view === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {fleet.map(vehicle => (
             <Card 
                key={vehicle.id} 
                className="group cursor-pointer hover:border-gold-500/50 transition-all p-0 overflow-hidden flex flex-col"
             >
                <div 
                   className="h-48 bg-zinc-900 relative"
                   onClick={() => handleVehicleClick(vehicle.id)}
                >
                   <img src={vehicle.photos.front || ''} alt={vehicle.model} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   {/* Fallback if no image */}
                   {!vehicle.photos.front && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Car size={48} className="text-zinc-700" />
                     </div>
                   )}
                   <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                   </div>
                   <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-white font-medium text-lg">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-zinc-400 text-sm">{vehicle.plate}</p>
                   </div>
                </div>
                
                <div className="p-4 grid grid-cols-3 gap-2 border-b border-zinc-800">
                   <div className="text-center">
                      <p className="text-zinc-500 text-[10px] uppercase">Trips</p>
                      <p className="text-white font-mono">{vehicle.stats.trips}</p>
                   </div>
                   <div className="text-center border-l border-zinc-800">
                      <p className="text-zinc-500 text-[10px] uppercase">Rating</p>
                      <p className="text-white font-mono">{vehicle.stats.rating} ★</p>
                   </div>
                   <div className="text-center border-l border-zinc-800">
                      <p className="text-zinc-500 text-[10px] uppercase">Condition</p>
                      <p className={`font-mono text-xs mt-0.5 ${vehicle.maintenance.condition === 'Excellent' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {vehicle.maintenance.condition}
                      </p>
                   </div>
                </div>

                <div className="p-2 flex">
                   <button className="flex-1 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded flex items-center justify-center gap-2" onClick={() => handleVehicleClick(vehicle.id)}>
                      <Settings size={14} /> Manage
                   </button>
                   <button 
                      className="flex-1 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded flex items-center justify-center gap-2"
                      onClick={(e) => handleScheduleClick(e, vehicle.id)}
                    >
                      <Calendar size={14} /> Schedule
                   </button>
                </div>
             </Card>
           ))}
        </div>
      )}

      {/* VIEW: ADD VEHICLE WIZARD */}
      {view === 'ADD' && (
        <Card className="max-w-3xl mx-auto">
           <div className="border-b border-zinc-800 pb-4 mb-6">
              <h3 className="text-xl font-serif text-white">Add New Vehicle</h3>
              <p className="text-zinc-500 text-sm">Enter the details to register a new vehicle in your fleet.</p>
           </div>

           <div className="space-y-6">
              {/* Category & Niche Selection (NEW) */}
              <div className="space-y-3">
                 <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Vehicle Classification</label>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.values(VehicleCategory).map(cat => (
                       <button 
                         key={cat}
                         onClick={() => setAddForm({...addForm, category: cat, subCategory: ''})}
                         className={`px-2 py-3 rounded-lg text-xs font-medium border transition-all ${
                           addForm.category === cat ? 'bg-gold-500 text-black border-gold-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                         }`}
                       >
                         {cat}
                       </button>
                    ))}
                 </div>

                 {/* Niche Sub-Category Selection */}
                 {addForm.category && (
                    <div className="animate-fadeIn p-4 bg-zinc-900 rounded-lg border border-zinc-800 mt-2">
                       <label className="text-xs font-medium text-gold-500 uppercase tracking-wider block mb-2">Select Specific Model Type</label>
                       <p className="text-xs text-zinc-500 mb-3">Which category best describes this specific vehicle?</p>
                       <div className="grid grid-cols-2 gap-2">
                          {VEHICLE_SUB_CATEGORIES[addForm.category].map((subCat) => (
                             <button
                               key={subCat}
                               onClick={() => setAddForm({...addForm, subCategory: subCat})}
                               className={`px-3 py-2 rounded text-left text-xs transition-colors border ${
                                  addForm.subCategory === subCat 
                                    ? 'bg-zinc-800 text-white border-gold-500' 
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                               }`}
                             >
                                {subCat}
                             </button>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                   label="Make" 
                   placeholder="e.g. Mercedes-Benz" 
                   value={addForm.make || ''} 
                   onChange={e => setAddForm({...addForm, make: e.target.value})} 
                 />
                 <Input 
                   label="Model" 
                   placeholder="e.g. S-Class" 
                   value={addForm.model || ''} 
                   onChange={e => setAddForm({...addForm, model: e.target.value})} 
                 />
                 <Input 
                   label="Year" 
                   type="number"
                   value={addForm.year} 
                   onChange={e => setAddForm({...addForm, year: parseInt(e.target.value)})} 
                 />
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Condition</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['Excellent', 'Good', 'Fair'].map(cond => (
                         <button 
                           key={cond}
                           onClick={() => setAddForm({...addForm, maintenance: { ...addForm.maintenance!, condition: cond as any }})}
                           className={`px-2 py-3 rounded-lg text-xs font-medium border transition-all ${
                             addForm.maintenance?.condition === cond ? 'bg-zinc-800 text-white border-gold-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                           }`}
                         >
                           {cond}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                   label="License Plate" 
                   placeholder="ABC-1234" 
                   value={addForm.plate || ''} 
                   onChange={e => setAddForm({...addForm, plate: e.target.value})} 
                 />
                 <Input 
                   label="VIN" 
                   placeholder="17 Digit VIN" 
                   value={addForm.vin || ''} 
                   onChange={e => setAddForm({...addForm, vin: e.target.value})} 
                 />
              </div>

              {/* Photos */}
              <div className="space-y-3">
                 <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Initial Photos</label>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PhotoUploadSlot label="Front" currentUrl={addForm.photos?.front || null} slot="front" />
                    <PhotoUploadSlot label="Side" currentUrl={addForm.photos?.side || null} slot="side" />
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                 <Button variant="ghost" onClick={() => setView('LIST')}>Cancel</Button>
                 <Button onClick={handleSaveNewVehicle} className="px-8">Register Vehicle</Button>
              </div>
           </div>
        </Card>
      )}

      {/* VIEW: SCHEDULE CALENDAR */}
      {view === 'SCHEDULE' && selectedVehicle && (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-serif text-white">{selectedVehicle.make} {selectedVehicle.model}</h3>
                  <p className="text-zinc-500">Availability Schedule</p>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline"><ChevronLeft size={16}/></Button>
                  <Button variant="outline">October 2023</Button>
                  <Button variant="outline"><ChevronRight size={16}/></Button>
               </div>
            </div>

            <Card className="min-h-[500px] relative">
               {/* Mock Calendar Grid */}
               <div className="grid grid-cols-7 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                     <div key={d} className="bg-zinc-950 p-2 text-center text-xs text-zinc-500 uppercase">{d}</div>
                  ))}
                  {Array.from({length: 35}).map((_, i) => {
                     const day = i - 2; // Offset for mock month
                     const isToday = day === 24;
                     const hasTrip = [2, 5, 12, 18, 24].includes(day);
                     const isMaintenance = [15].includes(day);

                     return (
                       <div key={i} className={`bg-zinc-900/50 h-32 p-2 relative hover:bg-zinc-900 transition-colors ${day <= 0 ? 'opacity-30' : ''}`}>
                          <span className={`text-sm ${isToday ? 'bg-gold-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-bold' : 'text-zinc-400'}`}>
                             {day > 0 && day <= 31 ? day : ''}
                          </span>
                          
                          {day > 0 && day <= 31 && hasTrip && (
                             <div className="mt-2 bg-blue-500/20 border-l-2 border-blue-500 p-1 text-[10px] text-blue-300 rounded">
                                09:00 - 14:00<br/>
                                <span className="font-medium text-white">Client Booking</span>
                             </div>
                          )}
                          
                          {day > 0 && day <= 31 && isMaintenance && (
                             <div className="mt-2 bg-red-500/20 border-l-2 border-red-500 p-1 text-[10px] text-red-300 rounded">
                                All Day<br/>
                                <span className="font-medium text-white">Service</span>
                             </div>
                          )}
                       </div>
                     )
                  })}
               </div>
            </Card>
         </div>
      )}

      {/* VIEW: VEHICLE DETAIL & SETTINGS */}
      {view === 'DETAIL' && selectedVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Sidebar: Status & Key Info */}
           <div className="lg:col-span-1 space-y-6">
              <Card>
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       {isEditingDetails ? (
                         <div className="space-y-2 mb-2">
                           <Input 
                             value={selectedVehicle.make} 
                             onChange={(e) => updateVehicleDetails('make', e.target.value)}
                             className="h-8 text-sm"
                           />
                           <Input 
                             value={selectedVehicle.model} 
                             onChange={(e) => updateVehicleDetails('model', e.target.value)}
                             className="h-8 text-sm"
                           />
                         </div>
                       ) : (
                         <>
                           <h3 className="text-xl font-serif text-white">{selectedVehicle.make} {selectedVehicle.model}</h3>
                           <p className="text-zinc-500 text-sm">{selectedVehicle.year} • {selectedVehicle.category}</p>
                           {selectedVehicle.subCategory && (
                              <span className="inline-block mt-1 text-[10px] bg-zinc-800 text-gold-500 px-2 py-0.5 rounded border border-zinc-700">
                                 {selectedVehicle.subCategory}
                              </span>
                           )}
                         </>
                       )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleDeleteVehicle} className="hover:bg-red-900/20">
                      <Trash2 size={16} className="text-red-500"/>
                    </Button>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="text-xs text-zinc-500 uppercase">Vehicle Status</label>
                       <div className="mt-2 grid grid-cols-2 gap-2">
                          {['ACTIVE', 'MAINTENANCE', 'UNLISTED'].map(s => (
                             <button 
                                key={s}
                                onClick={() => updateStatus(s as any)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                   selectedVehicle.status === s 
                                     ? 'bg-gold-500 text-black border-gold-500 shadow-lg shadow-gold-500/20' 
                                     : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                                }`}
                             >
                                {s}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-zinc-400 text-sm">License Plate</span>
                          {isEditingDetails ? (
                            <Input 
                              value={selectedVehicle.plate} 
                              onChange={(e) => updateVehicleDetails('plate', e.target.value)}
                              className="w-28 h-7 text-xs font-mono"
                            />
                          ) : (
                            <span className="text-white font-mono text-sm">{selectedVehicle.plate}</span>
                          )}
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-zinc-400 text-sm">VIN</span>
                          <span className="text-zinc-500 font-mono text-xs">{selectedVehicle.vin}</span>
                       </div>
                       
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="w-full mt-2" 
                         onClick={() => setIsEditingDetails(!isEditingDetails)}
                       >
                         {isEditingDetails ? <><Save size={14} className="mr-2"/> Save Details</> : <><Tool size={14} className="mr-2"/> Edit Details</>}
                       </Button>
                    </div>
                 </div>
              </Card>

              <Card>
                 <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-gold-500"/> Trip Preferences
                 </h4>
                 <div className="space-y-3">
                    {['No Smoking', 'No Pets', 'Chauffeur Only', 'Max 200km/day'].map((pref, i) => (
                       <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm group cursor-pointer hover:text-white">
                          <CheckCircle size={14} className="text-zinc-600 group-hover:text-green-500 transition-colors" />
                          {pref}
                       </div>
                    ))}
                 </div>
                 <Button variant="outline" size="sm" className="w-full mt-4">Edit Rules</Button>
              </Card>
           </div>

           {/* Right Column: Photos & Details */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Photo Management */}
              <Card>
                 <div className="flex justify-between items-center mb-6">
                    <h4 className="text-white font-medium flex items-center gap-2">
                       <ImageIcon size={18} className="text-gold-500"/> Vehicle Photos
                    </h4>
                    <span className="text-xs text-zinc-500">4 sets required for verification</span>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PhotoUploadSlot label="Front (45°)" currentUrl={selectedVehicle.photos.front} slot="front" />
                    <PhotoUploadSlot label="Rear (45°)" currentUrl={selectedVehicle.photos.rear} slot="rear" />
                    <PhotoUploadSlot label="Side Profile" currentUrl={selectedVehicle.photos.side} slot="side" />
                    <PhotoUploadSlot label="Interior" currentUrl={selectedVehicle.photos.interior} slot="interior" />
                 </div>
              </Card>

              {/* Specs & Features */}
              <Card>
                 <div className="flex justify-between items-center mb-6">
                    <h4 className="text-white font-medium flex items-center gap-2">
                       <Settings size={18} className="text-gold-500"/> Features & Amenities
                    </h4>
                    <Button 
                      size="sm" 
                      variant={isEditingFeatures ? "primary" : "ghost"}
                      onClick={() => setIsEditingFeatures(!isEditingFeatures)}
                    >
                      {isEditingFeatures ? "Done Editing" : "Edit Features"}
                    </Button>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedVehicle.features.map((feature, i) => (
                       <div key={i} className={`bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-sm text-zinc-300 flex items-center justify-between gap-2 ${isEditingFeatures ? 'border-red-500/30' : ''}`}>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                             {feature}
                          </div>
                          {isEditingFeatures && (
                            <button onClick={() => handleRemoveFeature(feature)} className="text-red-500 hover:text-red-400">
                               <X size={14} />
                            </button>
                          )}
                       </div>
                    ))}
                    
                    {isEditingFeatures ? (
                      <div className="col-span-1 flex gap-2">
                         <Input 
                           value={newFeature} 
                           onChange={(e) => setNewFeature(e.target.value)} 
                           placeholder="New Feature..."
                           className="h-9 text-xs"
                           onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                         />
                         <Button size="sm" onClick={handleAddFeature} disabled={!newFeature} className="px-3">
                            <Plus size={14} />
                         </Button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsEditingFeatures(true)}
                        className="border border-dashed border-zinc-700 px-3 py-2 rounded-lg text-sm text-zinc-500 flex items-center gap-2 hover:text-white hover:border-zinc-500 transition-colors"
                      >
                         <Plus size={14} /> Add Feature
                      </button>
                    )}
                 </div>
              </Card>

              {/* Maintenance Log Preview */}
              <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium flex items-center gap-2">
                       <Tool size={18} className="text-gold-500"/> Service History
                    </h4>
                    <Button size="sm" variant="ghost">View Full Log</Button>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                             <Tool size={16} className="text-blue-500" />
                          </div>
                          <div>
                             <p className="text-white text-sm font-medium">Oil Change & Tire Rotation</p>
                             <p className="text-zinc-500 text-xs">Sep 15, 2023 • 42,109 mi</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-zinc-400 text-sm">$240.00</p>
                          <span className="text-[10px] text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">Completed</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                             <AlertTriangle size={16} className="text-orange-500" />
                          </div>
                          <div>
                             <p className="text-white text-sm font-medium">Brake Pad Inspection</p>
                             <p className="text-zinc-500 text-xs">Aug 02, 2023 • 40,005 mi</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-zinc-400 text-sm">$0.00</p>
                          <span className="text-[10px] text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">Passed</span>
                       </div>
                    </div>
                 </div>
              </Card>

           </div>
        </div>
      )}

    </div>
  );
};