import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { BookingStatus, OperatorQuote, VehicleCategory, BookingType } from '../types';
import { Card, Button, Input } from './ui';
import { MapPin, Clock, Calendar, CheckCircle, AlertCircle, DollarSign, Send } from 'lucide-react';
import { MOCK_VEHICLES } from '../constants';

export const OperatorMarketplace: React.FC = () => {
  const { activeRequests, marketplaceQuotes, submitOperatorQuote } = useStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  
  // Bidding Form State
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidEta, setBidEta] = useState<string>('15');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(MOCK_VEHICLES[0].id);

  // Filter only open requests
  const openRequests = activeRequests.filter(r => 
    r.status !== BookingStatus.OPERATOR_ASSIGNED && 
    r.status !== BookingStatus.CANCELLED &&
    r.status !== BookingStatus.COMPLETED
  );

  const handleSubmitBid = () => {
    if (!selectedRequest || !bidPrice) return;

    const vehicle = MOCK_VEHICLES.find(v => v.id === selectedVehicle);
    if (!vehicle) return;

    submitOperatorQuote({
      requestId: selectedRequest,
      operatorId: 'OP-CURRENT', // Mock current operator
      operatorName: 'Elite Transport Co.',
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.image,
      vehicleCategory: vehicle.category,
      price: parseFloat(bidPrice),
      eta: parseInt(bidEta),
      rating: 4.9,
      isBestValue: parseFloat(bidPrice) < 200 // Mock logic
    });

    // Reset
    setBidPrice('');
    setSelectedRequest(null);
  };

  const hasAlreadyBid = (reqId: string) => {
    return marketplaceQuotes.some(q => q.requestId === reqId && q.operatorId === 'OP-CURRENT');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-serif text-white">Marketplace Requests</h2>
         <div className="flex gap-2 text-sm">
            <span className="flex items-center gap-1 text-green-500"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* REQUEST LIST */}
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {openRequests.length === 0 ? (
            <Card className="text-center py-12">
               <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Clock className="text-zinc-500" />
               </div>
               <p className="text-zinc-400">No active requests at the moment.</p>
               <p className="text-xs text-zinc-600 mt-2">New requests will appear here instantly.</p>
            </Card>
          ) : (
            openRequests.map(req => {
              const bidded = hasAlreadyBid(req.id);
              return (
                <div 
                  key={req.id}
                  onClick={() => !bidded && setSelectedRequest(req.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRequest === req.id 
                      ? 'bg-zinc-800 border-gold-500 ring-1 ring-gold-500' 
                      : bidded 
                        ? 'bg-zinc-900/50 border-zinc-800 opacity-60 cursor-default'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                     <span className="bg-zinc-950 text-gold-500 text-xs px-2 py-1 rounded font-mono border border-gold-500/20">{req.id}</span>
                     <span className="text-zinc-400 text-xs">{new Date(req.createdAt).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                     <h3 className="text-white font-medium">{req.details.type}</h3>
                     {req.details.vehicleCategory && (
                       <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{req.details.vehicleCategory}</span>
                     )}
                  </div>

                  <div className="space-y-1 text-sm text-zinc-400 mb-3">
                     <div className="flex gap-2 items-center"><MapPin size={14} className="text-green-500"/> {req.details.pickupLocation}</div>
                     {req.details.dropoffLocation && <div className="flex gap-2 items-center"><MapPin size={14} className="text-red-500"/> {req.details.dropoffLocation}</div>}
                     <div className="flex gap-2 items-center"><Calendar size={14} /> {req.details.date} at {req.details.time}</div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                     <div className="text-xs text-zinc-500">Est. Budget: ${req.estimatedPrice.toFixed(0)}</div>
                     {bidded ? (
                       <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium"><CheckCircle size={14} /> Quote Sent</span>
                     ) : (
                       <span className="text-gold-500 text-xs font-medium hover:underline">Tap to Bid</span>
                     )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BIDDING FORM */}
        <div className="lg:sticky lg:top-6 h-fit">
           {selectedRequest ? (
             <Card className="border-gold-500/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif text-white">Submit Quote</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs text-zinc-400 uppercase">Select Vehicle</label>
                      <div className="grid grid-cols-2 gap-2">
                        {MOCK_VEHICLES.map(v => (
                          <div 
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`p-2 rounded border cursor-pointer text-sm ${
                              selectedVehicle === v.id ? 'bg-gold-500 text-black border-gold-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <p className="font-medium truncate">{v.name}</p>
                            <p className="text-xs opacity-80">{v.category}</p>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Your Price ($)"
                        type="number"
                        icon={<DollarSign size={14} />}
                        value={bidPrice}
                        onChange={e => setBidPrice(e.target.value)}
                        placeholder="0.00"
                      />
                      <Input 
                        label="ETA (Minutes)"
                        type="number"
                        icon={<Clock size={14} />}
                        value={bidEta}
                        onChange={e => setBidEta(e.target.value)}
                        placeholder="15"
                      />
                   </div>

                   <div className="bg-zinc-900 p-3 rounded-lg flex gap-3 items-start">
                      <AlertCircle className="text-zinc-500 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-zinc-500">
                        Platform fee (5%) will be deducted from this amount. Ensure vehicle is available for the requested time slot.
                      </p>
                   </div>

                   <Button className="w-full text-lg" onClick={handleSubmitBid}>
                      Send Quote
                   </Button>
                </div>
             </Card>
           ) : (
             <div className="hidden lg:flex h-full min-h-[400px] items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 text-zinc-600">
                Select a request to place a bid
             </div>
           )}
        </div>

      </div>
    </div>
  );
};