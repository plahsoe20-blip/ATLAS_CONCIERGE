import React, { useState } from 'react';
import { Card, Button } from './ui';
import { 
  Car, User, Clock, CheckCircle, XCircle, FileText, ChevronRight, X, AlertOctagon, 
  Crown, Calendar as CalendarIcon, List, DollarSign, TrendingUp, ChevronLeft 
} from 'lucide-react';
import { MOCK_BOOKINGS } from '../constants';
import { useStore } from '../context/Store';
import { Assistant } from './Assistant';

// --- CONSTANTS ---
const TIERS = [
  { name: 'Bronze', limit: 10, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Silver', limit: 20, color: 'text-slate-300', bg: 'bg-slate-300/10' },
  { name: 'Gold', limit: 30, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { name: 'Platinum', limit: 50, color: 'text-cyan-300', bg: 'bg-cyan-300/10' },
  { name: 'Diamond', limit: 9999, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
];

const getTierData = (count: number) => {
  if (count < 10) return { ...TIERS[0], next: TIERS[1] };
  if (count < 20) return { ...TIERS[1], next: TIERS[2] };
  if (count < 30) return { ...TIERS[2], next: TIERS[3] };
  if (count < 50) return { ...TIERS[3], next: TIERS[4] };
  return { ...TIERS[4], next: null };
};

// --- BOOKING DETAIL MODAL ---
interface BookingDetailModalProps {
  booking: typeof MOCK_BOOKINGS[0];
  onClose: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  const { cancelBooking } = useStore();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStep, setCancelStep] = useState<'CONFIRM' | 'REASON'>('CONFIRM');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await cancelBooking(booking.id, reason || 'User requested cancellation');
      onClose();
    } catch (e) {
      alert("Error cancelling booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
       <div className="h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-serif text-white">Booking Details</h3>
             <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24}/></button>
          </div>

          {/* Cancellation Flow */}
          {isCancelling ? (
            <div className="flex-1 flex flex-col">
               <div className="flex items-center gap-2 text-red-500 mb-4 bg-red-900/10 p-3 rounded-lg border border-red-900/30">
                  <AlertOctagon size={20} />
                  <span className="font-bold">Cancel Booking</span>
               </div>
               
               {cancelStep === 'CONFIRM' ? (
                 <>
                   <p className="text-zinc-300 mb-4">Are you sure you want to cancel this reservation? A cancellation fee of <strong>$50.00</strong> may apply as it is within 24 hours.</p>
                   <div className="space-y-3 mt-auto">
                      <Button className="w-full bg-red-600 hover:bg-red-500 text-white border-none" onClick={() => setCancelStep('REASON')}>Yes, Cancel Trip</Button>
                      <Button variant="ghost" className="w-full" onClick={() => setIsCancelling(false)}>Keep Booking</Button>
                   </div>
                 </>
               ) : (
                 <>
                   <p className="text-zinc-400 text-sm mb-2">Please select a reason:</p>
                   <div className="space-y-2 mb-6">
                      {['Client plans changed', 'Booked by mistake', 'Found alternative option', 'Other'].map(r => (
                        <button 
                          key={r}
                          onClick={() => setReason(r)}
                          className={`w-full text-left p-3 rounded-lg text-sm border ${reason === r ? 'bg-zinc-800 border-gold-500 text-white' : 'border-zinc-800 text-zinc-400'}`}
                        >
                          {r}
                        </button>
                      ))}
                   </div>
                   <div className="space-y-3 mt-auto">
                      <Button className="w-full bg-red-600 hover:bg-red-500 text-white border-none" onClick={handleCancel} disabled={!reason || isProcessing}>
                        {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => setIsCancelling(false)}>Back</Button>
                   </div>
                 </>
               )}
            </div>
          ) : (
            <>
              {/* Standard Detail View */}
              <div className="space-y-6 flex-1 overflow-y-auto">
                 <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-2xl font-serif text-white">{booking.vehicle}</p>
                          <p className="text-sm text-zinc-500">{booking.type} • {booking.id}</p>
                       </div>
                       <span className="px-2 py-1 rounded bg-green-900/20 text-green-500 text-xs font-bold border border-green-900/30">{booking.status}</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-zinc-300 text-sm">
                          <User size={16} className="text-zinc-500" /> {booking.client}
                       </div>
                       <div className="flex items-center gap-3 text-zinc-300 text-sm">
                          <Clock size={16} className="text-zinc-500" /> {booking.date}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase">Payment Info</h4>
                    <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                       <span className="text-zinc-400">Base Fare</span>
                       <span className="text-white">${booking.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                       <span className="text-zinc-400">Taxes & Fees</span>
                       <span className="text-white">${(booking.price * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium py-2">
                       <span className="text-white">Total</span>
                       <span className="text-gold-500">${(booking.price * 1.1).toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              <div className="mt-6 space-y-3">
                 <Button variant="outline" className="w-full gap-2"><FileText size={16}/> Download Receipt</Button>
                 <Button variant="ghost" className="w-full text-red-500 hover:text-red-400 hover:bg-red-900/10" onClick={() => setIsCancelling(true)}>Cancel Booking</Button>
              </div>
            </>
          )}
       </div>
    </div>
  );
};

// --- STATUS & PROGRESS MODAL ---
const StatusModal: React.FC<{ bookings: number; onClose: () => void }> = ({ bookings, onClose }) => {
   const currentTier = getTierData(bookings);
   const nextTier = currentTier.next;
   
   let progress = 0;
   if (nextTier) {
      const prevLimit = TIERS.find(t => t.name === currentTier.name)?.limit || 0;
      progress = (bookings / nextTier.limit) * 100;
   } else {
      progress = 100;
   }

   return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
         <Card className="max-w-md w-full border-gold-500/30">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif text-white">Concierge Status</h3>
               <button onClick={onClose}><X size={20} className="text-zinc-500 hover:text-white"/></button>
            </div>
            
            <div className="text-center mb-8">
               <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${currentTier.bg} border-2 border-current ${currentTier.color}`}>
                  <Crown size={32} />
               </div>
               <h2 className={`text-3xl font-serif font-bold ${currentTier.color}`}>{currentTier.name}</h2>
               <p className="text-zinc-400 mt-1">{bookings} Lifetime Bookings</p>
            </div>

            {nextTier ? (
               <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-wider">
                     <span>Current Progress</span>
                     <span>{bookings} / {nextTier.limit}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                     <div className={`h-full ${currentTier.color.replace('text', 'bg')}`} style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-center text-xs text-zinc-500 mt-2">
                     {nextTier.limit - bookings} more bookings to reach <span className={nextTier.color}>{nextTier.name}</span>
                  </p>
               </div>
            ) : (
               <div className="text-center mb-8 text-gold-500 font-medium">
                  You have reached the highest tier!
               </div>
            )}

            <div className="space-y-2 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
               <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Current Benefits</p>
               <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-green-500"/> Priority Dispatch Support</li>
                  <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-green-500"/> Advanced Analytics Dashboard</li>
                  {bookings >= 20 && <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-green-500"/> 2.5% Commission Bonus</li>}
                  {bookings >= 30 && <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-green-500"/> White-label Reports</li>}
               </ul>
            </div>
         </Card>
      </div>
   );
};

// --- SPEND MODAL ---
const SpendModal: React.FC<{ spend: number; totalLifetime: number; onClose: () => void }> = ({ spend, totalLifetime, onClose }) => {
   return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
         <Card className="max-w-md w-full border-zinc-700">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif text-white">Spend Analysis</h3>
               <button onClick={onClose}><X size={20} className="text-zinc-500 hover:text-white"/></button>
            </div>
            
            <div className="text-center mb-8">
               <div className="inline-block p-4 rounded-full bg-emerald-500/10 mb-4">
                  <DollarSign size={32} className="text-emerald-500" />
               </div>
               <h2 className="text-4xl font-serif font-bold text-white">${spend.toLocaleString()}</h2>
               <p className="text-zinc-500 mt-1">Current Month Spend</p>
               <p className="text-xs text-zinc-600 mt-2">Lifetime: ${totalLifetime.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
               {[
                  { label: 'October 2023', amt: '$3,200.00' },
                  { label: 'September 2023', amt: '$2,850.00' },
                  { label: 'August 2023', amt: '$1,100.00' }
               ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                     <span className="text-zinc-400">{m.label}</span>
                     <span className="text-white font-mono">{m.amt}</span>
                  </div>
               ))}
            </div>
         </Card>
      </div>
   );
};

// --- MAIN DASHBOARD COMPONENT ---
export const DashboardConcierge: React.FC = () => {
  const { currentUser } = useStore();
  const [selectedBooking, setSelectedBooking] = useState<typeof MOCK_BOOKINGS[0] | null>(null);
  
  // View States
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);

  // Get Stats from User (or default)
  const stats = currentUser.conciergeStats || { totalBookings: 0, totalSpend: 0, activeTrips: 0, thisMonthSpend: 0 };
  const currentTier = getTierData(stats.totalBookings);

  // Mock Calendar Grid Generator
  const renderCalendarDays = () => {
    const days = [];
    const totalDays = 31; // Mock Oct
    
    // Offset for start of month
    for(let i=0; i<2; i++) days.push(<div key={`empty-${i}`} className="bg-transparent" />);

    for(let i=1; i<=totalDays; i++) {
       // Mock logic to find booking on this day
       const hasBooking = MOCK_BOOKINGS.some(b => b.date.includes(`Oct ${i}`));
       const isToday = i === 24;

       days.push(
          <div key={i} className={`min-h-[80px] border border-zinc-800 p-2 relative hover:bg-zinc-900 transition-colors ${isToday ? 'bg-zinc-900/50' : ''}`}>
             <span className={`text-xs ${isToday ? 'bg-gold-500 text-black w-5 h-5 flex items-center justify-center rounded-full font-bold' : 'text-zinc-500'}`}>{i}</span>
             {hasBooking && (
                <div 
                   className="mt-2 text-[9px] bg-blue-900/30 text-blue-300 border-l-2 border-blue-500 px-1 py-1 rounded truncate cursor-pointer hover:bg-blue-900/50"
                   onClick={() => setSelectedBooking(MOCK_BOOKINGS.find(b => b.date.includes(`Oct ${i}`)) || null)}
                >
                   {MOCK_BOOKINGS.find(b => b.date.includes(`Oct ${i}`))?.client}
                </div>
             )}
          </div>
       );
    }
    return days;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {selectedBooking && <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
      {showStatusModal && <StatusModal bookings={stats.totalBookings} onClose={() => setShowStatusModal(false)} />}
      {showSpendModal && <SpendModal spend={stats.thisMonthSpend} totalLifetime={stats.totalSpend} onClose={() => setShowSpendModal(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
           {/* INTERACTIVE KPI CARDS */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Spend Card (Updated to show Monthly) */}
              <button 
                 onClick={() => setShowSpendModal(true)}
                 className="text-left bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-zinc-500 text-xs uppercase tracking-wider">Monthly Spend</p>
                   <ChevronRight size={14} className="text-zinc-600 group-hover:text-white"/>
                </div>
                <p className="text-3xl font-serif text-white group-hover:text-emerald-400 transition-colors">
                   ${stats.thisMonthSpend.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-zinc-500 text-xs mt-2">
                   <DollarSign size={12} /> Lifetime: ${stats.totalSpend.toLocaleString()}
                </div>
              </button>

              {/* Active Trips Card */}
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Active Trips</p>
                <p className="text-3xl font-serif text-gold-500">{stats.activeTrips}</p>
                <p className="text-zinc-600 text-xs mt-2">2 scheduled for tomorrow</p>
              </div>

              {/* Status Card */}
              <button 
                 onClick={() => setShowStatusModal(true)}
                 className="text-left bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-gold-500/50 hover:bg-zinc-900 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-zinc-500 text-xs uppercase tracking-wider">Concierge Tier</p>
                   <Crown size={16} className={`${currentTier.color}`} />
                </div>
                <p className={`text-3xl font-serif ${currentTier.color}`}>
                   {currentTier.name}
                </p>
                <div className="w-full bg-zinc-800 h-1.5 mt-3 rounded-full overflow-hidden">
                   {/* Mini Progress Bar */}
                   <div 
                     className={`h-full ${currentTier.color.replace('text', 'bg')}`} 
                     style={{ width: `${(stats.totalBookings / (currentTier.next?.limit || 100)) * 100}%` }} 
                   />
                </div>
                <p className="text-xs text-zinc-500 mt-2 group-hover:text-zinc-300">View progress</p>
              </button>
           </div>
           
           {/* BOOKINGS & CALENDAR SECTION */}
           <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden min-h-[500px]">
              <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/30">
                 <h3 className="text-xl font-serif text-white">Itinerary Management</h3>
                 <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button 
                       onClick={() => setViewMode('LIST')}
                       className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'LIST' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                       <List size={14} /> List
                    </button>
                    <button 
                       onClick={() => setViewMode('CALENDAR')}
                       className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'CALENDAR' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                       <CalendarIcon size={14} /> Calendar
                    </button>
                 </div>
              </div>

              {viewMode === 'LIST' ? (
                 <div className="p-2 space-y-2">
                    {/* Separate active/upcoming logic would be here, filtering mock data for now */}
                    <p className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Upcoming</p>
                    {MOCK_BOOKINGS.filter(b => b.status !== 'Completed').map(booking => (
                       <div 
                         key={booking.id} 
                         onClick={() => setSelectedBooking(booking)}
                         className="flex items-center justify-between p-4 bg-zinc-900/20 border border-transparent hover:border-zinc-800 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer group mx-2"
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-gold-500 transition-colors">
                               <Car className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="font-medium text-white group-hover:text-gold-500 transition-colors">{booking.client}</p>
                               <p className="text-xs text-zinc-500">{booking.vehicle} • {booking.date}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="text-right">
                                <p className="text-gold-500 font-mono font-medium">${booking.price}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${booking.status === 'Confirmed' ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                   {booking.status}
                                </span>
                             </div>
                             <ChevronRight size={16} className="text-zinc-600 group-hover:text-white" />
                          </div>
                       </div>
                    ))}

                    <p className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mt-4">Past History</p>
                    {MOCK_BOOKINGS.filter(b => b.status === 'Completed').map(booking => (
                       <div key={booking.id} onClick={() => setSelectedBooking(booking)} className="flex items-center justify-between p-4 mx-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                               <CheckCircle size={14} />
                             </div>
                             <div>
                               <p className="text-sm font-medium text-zinc-300">{booking.client}</p>
                               <p className="text-xs text-zinc-600">{booking.date}</p>
                             </div>
                          </div>
                          <span className="text-zinc-500 text-xs">Completed</span>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-white font-medium">October 2023</h4>
                       <div className="flex gap-2">
                          <Button size="sm" variant="ghost"><ChevronLeft size={16}/></Button>
                          <Button size="sm" variant="ghost"><ChevronRight size={16}/></Button>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-px bg-zinc-800 rounded-lg overflow-hidden border border-zinc-800">
                       {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d} className="bg-zinc-950 p-2 text-center text-[10px] text-zinc-500 uppercase tracking-wider">{d}</div>
                       ))}
                       {renderCalendarDays()}
                    </div>
                 </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-1">
           <Assistant />
        </div>
      </div>
    </div>
  );
};