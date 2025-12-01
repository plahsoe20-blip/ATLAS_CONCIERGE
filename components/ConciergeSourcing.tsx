import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { BookingStatus, QuoteRequest } from '../types';
import { Card, Button } from './ui';
import { QuoteComparison } from './QuoteComparison';
import { Clock, CheckCircle, AlertCircle, ChevronRight, Search, FileText, Calendar, MapPin, Car, ArrowRight } from 'lucide-react';

export const ConciergeSourcing: React.FC = () => {
  const { activeRequests } = useStore();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'BOOKED'>('ALL');

  // Filter requests
  const filteredRequests = activeRequests.filter(req => {
    if (filter === 'OPEN') return req.status !== BookingStatus.OPERATOR_ASSIGNED && req.status !== BookingStatus.CANCELLED;
    if (filter === 'BOOKED') return req.status === BookingStatus.OPERATOR_ASSIGNED;
    return true;
  });

  // If a request is selected, show the Quote Comparison view
  if (selectedRequestId) {
    return <QuoteComparison requestId={selectedRequestId} onClose={() => setSelectedRequestId(null)} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-serif text-white mb-2">Sourcing Dashboard</h2>
            <p className="text-zinc-400">Track requests and compare incoming operator quotes.</p>
         </div>
         <div className="flex gap-2">
            <Button 
               variant={filter === 'ALL' ? 'primary' : 'ghost'} 
               size="sm" 
               onClick={() => setFilter('ALL')}
            >
               All Requests
            </Button>
            <Button 
               variant={filter === 'OPEN' ? 'primary' : 'ghost'} 
               size="sm" 
               onClick={() => setFilter('OPEN')}
            >
               Open / Quoting
            </Button>
            <Button 
               variant={filter === 'BOOKED' ? 'primary' : 'ghost'} 
               size="sm" 
               onClick={() => setFilter('BOOKED')}
            >
               Booked
            </Button>
         </div>
      </div>

      <div className="flex-1 overflow-hidden bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col">
         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-900 border-b border-zinc-800 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            <div className="col-span-2">Request ID</div>
            <div className="col-span-3">Itinerary</div>
            <div className="col-span-2">Date/Time</div>
            <div className="col-span-2">Vehicle</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Action</div>
         </div>

         {/* Table Body */}
         <div className="flex-1 overflow-y-auto">
            {filteredRequests.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>No requests found.</p>
               </div>
            ) : (
               filteredRequests.map(req => (
                  <div 
                     key={req.id} 
                     onClick={() => setSelectedRequestId(req.id)}
                     className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors cursor-pointer items-center group"
                  >
                     {/* ID */}
                     <div className="col-span-2">
                        <span className="font-mono text-gold-500">{req.id}</span>
                        <p className="text-[10px] text-zinc-500">{req.details.type}</p>
                     </div>

                     {/* Itinerary */}
                     <div className="col-span-3">
                        <div className="flex items-center gap-2 text-sm text-white">
                           <MapPin size={12} className="text-zinc-500" />
                           <span className="truncate">{req.details.pickupLocation}</span>
                        </div>
                        {req.details.dropoffLocation && (
                           <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                              <ArrowRight size={10} />
                              <span className="truncate">{req.details.dropoffLocation}</span>
                           </div>
                        )}
                        {req.details.durationDays && req.details.durationDays > 1 && (
                           <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded ml-6 mt-1 inline-block">
                              {req.details.durationDays} Day Charter
                           </span>
                        )}
                     </div>

                     {/* Date */}
                     <div className="col-span-2 text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-zinc-600" /> {req.details.date}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                           <Clock size={12} /> {req.details.time}
                        </div>
                     </div>

                     {/* Vehicle */}
                     <div className="col-span-2">
                        <div className="flex items-center gap-2 text-sm text-white">
                           <Car size={12} className="text-zinc-500" />
                           {req.details.vehicleCategory}
                        </div>
                        <p className="text-[10px] text-zinc-500 ml-5 truncate">{req.details.vehicleSubCategory || 'Any'}</p>
                     </div>

                     {/* Status */}
                     <div className="col-span-2">
                        {req.status === BookingStatus.OPERATOR_ASSIGNED ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                              <CheckCircle size={12} /> Booked
                           </span>
                        ) : req.status === BookingStatus.QUOTING ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500 border border-gold-500/20 animate-pulse">
                              <AlertCircle size={12} /> {(req.quoteCount || 3)} Quotes
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                              <Clock size={12} /> Pending
                           </span>
                        )}
                     </div>

                     {/* Action */}
                     <div className="col-span-1 text-right">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 group-hover:bg-zinc-800 group-hover:text-white">
                           <ChevronRight size={16} />
                        </Button>
                     </div>
                  </div>
               ))
            )}
         </div>
         
         <div className="p-3 border-t border-zinc-800 bg-zinc-900 text-right text-xs text-zinc-500">
            Showing {filteredRequests.length} records
         </div>
      </div>
    </div>
  );
};