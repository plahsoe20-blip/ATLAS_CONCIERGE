import React from 'react';
import { useStore } from '../context/Store';
import { QuoteRequest, OperatorQuote } from '../types';
import { Card, Button } from './ui';
import { Star, Clock, Shield, Check, DollarSign } from 'lucide-react';

interface QuoteComparisonProps {
  requestId: string;
  onClose: () => void;
}

export const QuoteComparison: React.FC<QuoteComparisonProps> = ({ requestId, onClose }) => {
  const { activeRequests, marketplaceQuotes, acceptQuote } = useStore();
  
  const request = activeRequests.find(r => r.id === requestId);
  const quotes = marketplaceQuotes.filter(q => q.requestId === requestId).sort((a, b) => a.price - b.price); // Cheapest first

  if (!request) return null;

  const handleAccept = (quoteId: string) => {
    acceptQuote(quoteId);
    alert(`Quote accepted! Driver assigned.`);
    onClose();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
         <div>
           <h2 className="text-2xl font-serif text-white">Available Options</h2>
           <p className="text-zinc-400 text-sm">Comparing {quotes.length} quotes for Request #{requestId}</p>
         </div>
         <Button variant="ghost" onClick={onClose}>Back to Dashboard</Button>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
           <div className="flex justify-center mb-4">
             <span className="relative flex h-8 w-8">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-8 w-8 bg-gold-500"></span>
             </span>
           </div>
           <h3 className="text-white font-medium mb-2">Broadcasting to Operator Network...</h3>
           <p className="text-zinc-500 text-sm max-w-md mx-auto">
             Your request has been sent to premium operators in the area. Quotes will appear here in real-time.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {quotes.map((quote) => (
             <Card key={quote.id} className={`flex flex-col md:flex-row gap-6 transition-all hover:border-zinc-600 ${quote.isBestValue ? 'border-gold-500/50 bg-gradient-to-r from-zinc-950 to-zinc-900' : ''}`}>
                
                {/* Image Section */}
                <div className="w-full md:w-48 h-32 flex-shrink-0 relative">
                  <img src={quote.vehicleImage} alt={quote.vehicleName} className="w-full h-full object-cover rounded-lg" />
                  {quote.isBestValue && (
                    <div className="absolute top-2 left-2 bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded">
                      BEST VALUE
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col justify-center">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-medium text-white">{quote.vehicleName}</h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                           <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-500"/> {quote.operatorName}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><Star size={12} className="text-gold-500 fill-gold-500"/> {quote.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-serif text-white flex items-center justify-end">
                            <span className="text-sm text-zinc-500 mr-1 font-sans font-normal">Total</span> 
                            ${quote.price.toFixed(2)}
                         </div>
                         <div className="flex items-center justify-end gap-1 text-emerald-400 text-sm font-medium mt-1">
                            <Clock size={14} /> {quote.eta} min away
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-3 mt-4">
                      <div className="flex-1 bg-zinc-900 rounded px-3 py-2 text-xs text-zinc-400 border border-zinc-800">
                         {quote.vehicleCategory} Class • Includes 5% Platform Fee • Free Cancellation
                      </div>
                      <Button onClick={() => handleAccept(quote.id)} className="px-8 bg-white text-black hover:bg-zinc-200">
                         Book Now
                      </Button>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
};