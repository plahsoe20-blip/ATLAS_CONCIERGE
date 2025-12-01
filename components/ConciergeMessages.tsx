import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from './ui';
import { Send, User, Shield, Car, Search, MoreVertical, Phone, Video, CheckCheck } from 'lucide-react';

// Mock Data
const MOCK_THREADS = [
  {
    id: 't1',
    name: 'James Doe',
    role: 'DRIVER',
    entity: 'Elite Transport',
    context: 'Active Trip #BLK-9281',
    status: 'En Route',
    avatar: null,
    unread: 1,
    messages: [
      { id: 1, sender: 'THEM', text: 'I have arrived at the pickup location (Times Square). Waiting at the main entrance.', time: '10:00 AM' },
      { id: 2, sender: 'ME', text: 'Thank you, James. Mr. Pennyworth is coming down now.', time: '10:02 AM' },
      { id: 3, sender: 'THEM', text: 'Copy that. I have the AC running.', time: '10:03 AM' }
    ]
  },
  {
    id: 't2',
    name: 'Dispatch Desk',
    role: 'OPERATOR',
    entity: 'Royal Limousines',
    context: 'Quote #REQ-112',
    status: 'Online',
    avatar: null,
    unread: 0,
    messages: [
      { id: 1, sender: 'ME', text: 'Can we ensure the vehicle is a 2023 model or newer?', time: 'Yesterday' },
      { id: 2, sender: 'THEM', text: 'Certainly. We have assigned a 2024 Rolls Royce Ghost.', time: 'Yesterday' }
    ]
  },
  {
    id: 't3',
    name: 'Sarah Smith',
    role: 'DRIVER',
    entity: 'Prestige Cars',
    context: 'Completed #BLK-8821',
    status: 'Offline',
    avatar: null,
    unread: 0,
    messages: [
      { id: 1, sender: 'THEM', text: 'Passenger dropped off safely.', time: 'Mon' },
      { id: 2, sender: 'ME', text: 'Great, thanks Sarah.', time: 'Mon' }
    ]
  }
];

export const ConciergeMessages: React.FC = () => {
  const [activeThreadId, setActiveThreadId] = useState<string>(MOCK_THREADS[0].id);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DRIVER' | 'OPERATOR'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derived state
  const activeThread = MOCK_THREADS.find(t => t.id === activeThreadId) || MOCK_THREADS[0];
  const filteredThreads = MOCK_THREADS.filter(t => filter === 'ALL' || t.role === filter);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThreadId, filteredThreads]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    // In a real app, this would push to backend
    activeThread.messages.push({
        id: Date.now(),
        sender: 'ME',
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setInputText('');
    // Force update for mock
    setActiveThreadId(activeThreadId); 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn">
      {/* Sidebar List */}
      <Card className="col-span-1 p-0 overflow-hidden flex flex-col h-full bg-zinc-950 border-zinc-800">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-white text-lg">Messages</h3>
              <div className="flex gap-1">
                 <button className="p-1 hover:text-white text-zinc-500"><MoreVertical size={16} /></button>
              </div>
           </div>
           
           <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 text-zinc-600" size={14} />
              <input 
                placeholder="Search conversations..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
           </div>

           {/* Filter Tabs */}
           <div className="flex bg-zinc-900 p-1 rounded-lg">
              {['ALL', 'DRIVER', 'OPERATOR'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                        filter === f ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                     {f}s
                  </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {filteredThreads.map(thread => (
             <button 
               key={thread.id}
               onClick={() => setActiveThreadId(thread.id)}
               className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${
                 activeThreadId === thread.id 
                   ? 'bg-zinc-900 border-l-gold-500' 
                   : 'hover:bg-zinc-900/50 border-l-transparent'
               }`}
             >
               <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      thread.role === 'DRIVER' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-blue-900/20 border-blue-500/30 text-blue-400'
                  }`}>
                    {thread.role === 'DRIVER' ? <Car size={18} /> : <Shield size={18} />}
                  </div>
                  {thread.unread > 0 && (
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                        {thread.unread}
                     </div>
                  )}
                  {thread.status === 'Online' && (
                     <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950" />
                  )}
               </div>
               <div className="text-left flex-1 min-w-0">
                 <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm font-medium truncate ${activeThreadId === thread.id ? 'text-white' : 'text-zinc-300'}`}>{thread.name}</p>
                    <span className="text-[10px] text-zinc-600">{thread.messages[thread.messages.length-1].time}</span>
                 </div>
                 <p className="text-xs text-zinc-500 mb-1">{thread.entity}</p>
                 <p className="text-zinc-400 text-xs truncate w-full opacity-70">
                    {thread.messages[thread.messages.length-1].text}
                 </p>
               </div>
             </button>
           ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-1 md:col-span-2 p-0 flex flex-col relative overflow-hidden bg-zinc-950 border-zinc-800 h-full">
         
         {/* Header */}
         <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                   activeThread.role === 'DRIVER' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-blue-900/20 border-blue-500/30 text-blue-400'
               }`}>
                 {activeThread.role === 'DRIVER' ? <User size={20} /> : <Shield size={20} />}
               </div>
               <div>
                 <h4 className="text-white font-medium flex items-center gap-2">
                    {activeThread.name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        activeThread.role === 'DRIVER' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                        {activeThread.role}
                    </span>
                 </h4>
                 <p className="text-zinc-500 text-xs flex items-center gap-1">
                    {activeThread.context} • {activeThread.status}
                 </p>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><Phone size={18} /></button>
               <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><Video size={18} /></button>
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-zinc-900/20 to-transparent" ref={scrollRef}>
             {activeThread.messages.map((msg: any) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
                     msg.sender === 'ME' 
                       ? 'bg-gold-500 text-black rounded-br-none' 
                       : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-none'
                   }`}>
                     <p className="text-sm leading-relaxed">{msg.text}</p>
                     <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'ME' ? 'text-black/60' : 'text-zinc-500'}`}>
                        <span>{msg.time}</span>
                        {msg.sender === 'ME' && <CheckCheck size={12} />}
                     </div>
                   </div>
                 </div>
               ))}
         </div>

         {/* Input */}
         <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                 <Input 
                    className="bg-zinc-900 border-zinc-800 focus:border-gold-500/50 pr-12 rounded-xl"
                    placeholder={`Message ${activeThread.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 />
              </div>
              <Button onClick={handleSend} className="px-4 rounded-xl">
                 <Send size={18} />
              </Button>
            </div>
         </div>
      </Card>
    </div>
  );
};