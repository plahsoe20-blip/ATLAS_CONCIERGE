import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from './ui';
import { Send, User, Shield, Briefcase, Car, Search, MoreVertical, Filter } from 'lucide-react';

// Mock Data
const MOCK_THREADS = {
  DRIVERS: [
    { id: 'd1', name: 'James Doe', status: 'On Trip', role: 'Driver', vehicle: 'S-Class (BLK-992)', unread: 2, messages: [
      { id: 1, sender: 'ME', text: 'Client has requested a coffee stop at Starbucks.', time: '10:15 AM' },
      { id: 2, sender: 'THEM', text: 'Copy that. Rerouting now.', time: '10:17 AM' }
    ]},
    { id: 'd2', name: 'Sarah Smith', status: 'Available', role: 'Driver', vehicle: 'Escalade (WHT-112)', unread: 0, messages: [
        { id: 1, sender: 'THEM', text: 'Ending my shift at 5 PM today.', time: '02:00 PM' }
    ]}
  ],
  CONCIERGES: [
    { id: 'c1', name: 'Amex Centurion', status: 'Partner', role: 'Concierge', vehicle: 'Booking #BLK-9281', unread: 1, messages: [
        { id: 1, sender: 'THEM', text: 'Can we upgrade the vehicle for Mr. Pennyworth?', time: '09:30 AM' },
        { id: 2, sender: 'ME', text: 'Yes, we have a Rolls Royce available.', time: '09:35 AM' }
    ]}
  ]
};

export const OperatorMessages: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'DRIVERS' | 'CONCIERGES'>('DRIVERS');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('d1');
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Flatten threads for easy access
  const activeList = MOCK_THREADS[activeCategory];
  const activeThread = activeList.find(t => t.id === selectedThreadId) || activeList[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedThreadId, activeCategory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] animate-fadeIn">
      {/* Sidebar List */}
      <Card className="col-span-1 p-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-white text-lg">Communications</h3>
              <button className="text-zinc-500 hover:text-white"><Filter size={16} /></button>
           </div>
           
           {/* Category Switcher */}
           <div className="flex bg-zinc-900 p-1 rounded-lg mb-2">
              <button 
                 onClick={() => { setActiveCategory('DRIVERS'); setSelectedThreadId(MOCK_THREADS.DRIVERS[0].id); }}
                 className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${activeCategory === 'DRIVERS' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                 Fleet Drivers
              </button>
              <button 
                 onClick={() => { setActiveCategory('CONCIERGES'); setSelectedThreadId(MOCK_THREADS.CONCIERGES[0].id); }}
                 className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${activeCategory === 'CONCIERGES' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                 Concierges
              </button>
           </div>

           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-zinc-600" size={14} />
              <input 
                placeholder="Search threads..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-700"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {activeList.map(thread => (
             <button 
               key={thread.id}
               onClick={() => setSelectedThreadId(thread.id)}
               className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${
                 selectedThreadId === thread.id 
                   ? 'bg-zinc-900 border-l-gold-500' 
                   : 'hover:bg-zinc-900/50 border-l-transparent'
               }`}
             >
               <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {activeCategory === 'DRIVERS' ? <User size={18} /> : <Briefcase size={18} />}
                  </div>
                  {thread.unread > 0 && (
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                        {thread.unread}
                     </div>
                  )}
               </div>
               <div className="text-left flex-1 min-w-0">
                 <div className="flex justify-between items-center mb-1">
                    <p className={`text-sm font-medium truncate ${selectedThreadId === thread.id ? 'text-white' : 'text-zinc-300'}`}>{thread.name}</p>
                    <span className="text-[10px] text-zinc-600">10:30 AM</span>
                 </div>
                 <p className="text-zinc-500 text-xs truncate w-full">{thread.vehicle}</p>
               </div>
             </button>
           ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-1 md:col-span-2 p-0 flex flex-col relative overflow-hidden bg-zinc-950">
        {activeThread ? (
           <>
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                    {activeCategory === 'DRIVERS' ? <User size={20} /> : <Briefcase size={20} />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium flex items-center gap-2">
                       {activeThread.name}
                       <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">{activeThread.status}</span>
                    </h4>
                    <p className="text-zinc-500 text-xs flex items-center gap-1">
                       {activeCategory === 'DRIVERS' && <Car size={10} />} {activeThread.vehicle}
                    </p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button size="sm" variant="secondary">View Profile</Button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
               {activeThread.messages.map((msg: any) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[70%] rounded-2xl p-4 ${
                     msg.sender === 'ME' 
                       ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-br-sm' 
                       : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'
                   }`}>
                     <p className="text-sm leading-relaxed">{msg.text}</p>
                     <p className="text-[10px] text-zinc-500 mt-2 text-right opacity-70">{msg.time}</p>
                   </div>
                 </div>
               ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
               <div className="relative">
                 <Input 
                   className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 pr-12"
                   placeholder={`Message ${activeThread.name}...`}
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                 />
                 <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gold-500 hover:text-white transition-colors">
                    <Send size={16} />
                 </button>
               </div>
            </div>
           </>
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <p>Select a thread to start messaging</p>
           </div>
        )}
      </Card>
    </div>
  );
};