import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Navigation, CheckCircle, ArrowRight, CreditCard, Lock, Thermometer, Music, Coffee, VolumeX, Star, Accessibility } from 'lucide-react';
import { BookingType, VehicleCategory, BookingRequest, Quote, ItineraryDay, VIPPreferences } from '../types';
import { MOCK_VEHICLES, VEHICLE_SUB_CATEGORIES } from '../constants';
import { Button, Input, Card, Stepper } from './ui';
import { getFastQuoteEstimate } from '../services/geminiService';
import { useStore } from '../context/Store';
import { calculateQuote } from '../services/pricingEngine';

interface BookingWidgetProps {
  onComplete?: () => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ onComplete }) => {
  const { pricingRules, createBookingRequest, processPayment } = useStore(); 
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<BookingType>(BookingType.P2P);
  
  // State
  const [request, setRequest] = useState<Partial<BookingRequest>>({
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    passengerCount: 1,
    durationHours: 3, 
    durationDays: 1
  });
  
  // Enhanced VIP Preferences
  const [vipPrefs, setVipPrefs] = useState<VIPPreferences>({
    temperature: 'Ambient (72°F)',
    music: 'Radio',
    meetAndGreet: true,
    quietRide: false
  });

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [selectedVehicleCat, setSelectedVehicleCat] = useState<VehicleCategory | null>(null);
  const [estimatedDist, setEstimatedDist] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auto-calculate distance
  useEffect(() => {
    const fetchEstimate = async () => {
      if (bookingType === BookingType.P2P && request.pickupLocation?.length! > 3 && request.dropoffLocation?.length! > 3) {
        try {
          const jsonStr = await getFastQuoteEstimate(`${request.pickupLocation} to ${request.dropoffLocation}`);
          const data = JSON.parse(jsonStr);
          setEstimatedDist(data.km || 25); 
        } catch (e) {
          setEstimatedDist(25);
        }
      }
    };
    const timer = setTimeout(fetchEstimate, 1000); 
    return () => clearTimeout(timer);
  }, [request.pickupLocation, request.dropoffLocation]);

  const getBaselineQuote = (cat: VehicleCategory): Quote => {
    return calculateQuote(bookingType, pricingRules[cat], estimatedDist, request.durationDays || 1, request.durationHours || 3);
  };

  const handleSubmit = async () => {
    if (!selectedVehicleCat || !request.pickupLocation) return;
    setIsProcessing(true);
    
    // 1. Payment
    const quote = getBaselineQuote(selectedVehicleCat);
    await processPayment(quote.total, 'CARD');

    // 2. Booking
    await createBookingRequest({
      type: bookingType,
      pickupLocation: request.pickupLocation,
      dropoffLocation: request.dropoffLocation,
      date: request.date,
      time: request.time,
      durationHours: request.durationHours,
      durationDays: request.durationDays,
      vehicleCategory: selectedVehicleCat,
      vipPreferences: vipPrefs,
      itinerary: itineraryDays,
      estimatedPrice: quote.total,
      passengerCount: request.passengerCount,
      luggageCount: 2 // Mock
    });

    setIsProcessing(false);
    if (onComplete) onComplete();
  };

  // --- RENDERERS ---
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
       <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setBookingType(BookingType.P2P)} className={`p-4 border rounded-xl ${bookingType === BookingType.P2P ? 'bg-gold-500 text-black border-gold-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>Point-to-Point</button>
          <button onClick={() => setBookingType(BookingType.HOURLY)} className={`p-4 border rounded-xl ${bookingType === BookingType.HOURLY ? 'bg-gold-500 text-black border-gold-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>Hourly / Charter</button>
       </div>
       <Input label="Pickup" value={request.pickupLocation || ''} onChange={e => setRequest({...request, pickupLocation: e.target.value})} icon={<MapPin className="w-4 h-4"/>} />
       {bookingType === BookingType.P2P && <Input label="Dropoff" value={request.dropoffLocation || ''} onChange={e => setRequest({...request, dropoffLocation: e.target.value})} icon={<Navigation className="w-4 h-4"/>} />}
       <div className="grid grid-cols-2 gap-4">
          <Input type="date" value={request.date} onChange={e => setRequest({...request, date: e.target.value})} label="Date" />
          <Input type="time" value={request.time} onChange={e => setRequest({...request, time: e.target.value})} label="Time" />
       </div>
       {bookingType === BookingType.HOURLY && (
          <Stepper label="Duration (Hours)" value={request.durationHours || 3} min={3} max={24} onChange={v => setRequest({...request, durationHours: v})} />
       )}
       <Button className="w-full mt-4" onClick={() => setStep(2)}>Next: Vehicle</Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fadeIn">
       {Object.values(VehicleCategory).map(cat => {
         const quote = getBaselineQuote(cat);
         return (
           <div key={cat} onClick={() => setSelectedVehicleCat(cat)} className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center ${selectedVehicleCat === cat ? 'bg-zinc-800 border-gold-500 ring-1 ring-gold-500' : 'bg-zinc-900 border-zinc-800'}`}>
              <div>
                 <h4 className="text-white font-medium">{cat}</h4>
                 <p className="text-xs text-zinc-500">Est. ${quote.total.toFixed(0)}</p>
              </div>
              {selectedVehicleCat === cat && <CheckCircle className="text-gold-500"/>}
           </div>
         );
       })}
       <div className="flex gap-3 mt-4">
          <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
          <Button onClick={() => setStep(3)} className="flex-1" disabled={!selectedVehicleCat}>Next: VIP Options</Button>
       </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
       <h3 className="text-lg text-white font-serif mb-2">VIP Preferences</h3>
       
       <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-400 uppercase flex items-center gap-2"><Thermometer size={14}/> Temperature</label>
          <div className="grid grid-cols-3 gap-2">
             {['Cool (68°F)', 'Ambient (72°F)', 'Warm (76°F)'].map(t => (
                <button key={t} onClick={() => setVipPrefs({...vipPrefs, temperature: t as any})} className={`py-2 text-xs border rounded-lg ${vipPrefs.temperature === t ? 'bg-blue-900/30 text-blue-400 border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>{t}</button>
             ))}
          </div>
       </div>

       <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-400 uppercase flex items-center gap-2"><Music size={14}/> Audio / Ambiance</label>
          <div className="flex flex-wrap gap-2">
             {['Silence', 'Jazz', 'Classical', 'Pop', 'Client Aux'].map(m => (
                <button key={m} onClick={() => setVipPrefs({...vipPrefs, music: m as any})} className={`px-3 py-2 text-xs border rounded-lg ${vipPrefs.music === m ? 'bg-purple-900/30 text-purple-400 border-purple-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>{m}</button>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div onClick={() => setVipPrefs({...vipPrefs, quietRide: !vipPrefs.quietRide})} className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${vipPrefs.quietRide ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
             <VolumeX size={18}/> <span className="text-sm">Quiet Ride</span>
          </div>
          <div onClick={() => setVipPrefs({...vipPrefs, meetAndGreet: !vipPrefs.meetAndGreet})} className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${vipPrefs.meetAndGreet ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
             <Star size={18}/> <span className="text-sm">Meet & Greet</span>
          </div>
       </div>

       <div className="flex gap-3 mt-4">
          <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
          <Button onClick={() => setStep(4)} className="flex-1">Review & Pay</Button>
       </div>
    </div>
  );

  const renderStep4 = () => {
    if(!selectedVehicleCat) return null;
    const quote = getBaselineQuote(selectedVehicleCat);
    return (
      <div className="space-y-6 animate-fadeIn">
         <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-white font-serif text-lg mb-4">Summary</h3>
            <div className="space-y-2 text-sm text-zinc-400">
               <div className="flex justify-between"><span>Service</span> <span className="text-white">{bookingType}</span></div>
               <div className="flex justify-between"><span>Vehicle</span> <span className="text-white">{selectedVehicleCat}</span></div>
               <div className="flex justify-between"><span>Date</span> <span className="text-white">{request.date} {request.time}</span></div>
               <div className="border-t border-zinc-800 pt-2 flex justify-between text-lg font-medium text-white"><span>Total</span> <span>${quote.total.toFixed(2)}</span></div>
            </div>
         </div>
         <Button className="w-full text-lg h-12" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? 'Processing Payment...' : 'Authorize & Request'}
         </Button>
         <Button variant="ghost" className="w-full" onClick={() => setStep(3)}>Back</Button>
      </div>
    );
  };

  return (
    <Card className="max-w-xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-serif text-white">New Booking</h2>
        <div className="flex gap-2">{[1,2,3,4].map(i => <div key={i} className={`h-1 w-6 rounded ${step >= i ? 'bg-gold-500' : 'bg-zinc-800'}`}/>)}</div>
      </div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </Card>
  );
};