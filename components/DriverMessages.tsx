import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from './ui';
import { Send, User, Shield, Briefcase, MoreVertical } from 'lucide-react';

// Mock Data
const MOCK_THREADS = {
  CONCIERGE: {
    id: 't1',
    name: 'Concierge Desk',
    role: 'Booking Agent',
    icon: Briefcase,
    messages: [
      { id: 1, sender: 'THEM', text: 'Please ensure the AC is set to 21°C before pickup.', time: '10:30 AM' },
      { id: 2, sender: 'ME', text: 'Noted. Vehicle is pre-cooling now.', time: '10:32 AM' },
      { id: 3, sender: 'THEM', text: 'Client has an extra bag, please assist.', time: '10:45 AM' }
    ]
  },
  OPERATOR: {
    id: 't2',
    name: 'Fleet Dispatch',
    role: 'Operator',
    icon: Shield,
    messages: [
      { id: 1, sender: 'THEM', text: 'James, you have a new assignment queued for 4 PM.', time: '09:00 AM' },
      { id: 2, sender: 'ME', text: 'Received. I will be free by 3:30.', time: '09:05 AM' }
    ]
  }
};

export const DriverMessages: React.FC = () => {
  const [activeThread, setActiveThread] = useState<'CONCIERGE' | 'OPERATOR'>('CONCIERGE');
  const [inputText, setInputText] = useState('');
  const [threads, setThreads] = useState(MOCK_THREADS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threads, activeThread]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'ME',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setThreads(prev => ({
      ...prev,
      [activeThread]: {
        ...prev[activeThread],
        messages: [...prev[activeThread].messages, newMessage]
      }
    }));
    setInputText('');
  };

  const currentThread = threads[activeThread];
  const Icon = currentThread.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] animate-fadeIn">
      {/* Sidebar */}
      <Card className="col-span-1 p-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800">
           <h3 className="font-serif text-white text-lg">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
           {/* Concierge Thread */}
           <button 
             onClick={() => setActiveThread('CONCIERGE')}
             className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${activeThread === 'CONCIERGE' ? 'bg-zinc-900 border-l-gold-500' : 'hover:bg-zinc-900/50 border-l-transparent'}`}
           >
             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gold-500">
               <Briefcase size={18} />
             </div>
             <div className="text-left">
               <p className="text-white font-medium text-sm">Concierge Desk</p>
               <p className="text-zinc-500 text-xs truncate w-32">Booking #BLK-9281</p>
             </div>
           </button>

           {/* Operator Thread */}
           <button 
             onClick={() => setActiveThread('OPERATOR')}
             className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${activeThread === 'OPERATOR' ? 'bg-zinc-900 border-l-blue-500' : 'hover:bg-zinc-900/50 border-l-transparent'}`}
           >
             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-blue-500">
               <Shield size={18} />
             </div>
             <div className="text-left">
               <p className="text-white font-medium text-sm">Fleet Dispatch</p>
               <p className="text-zinc-500 text-xs truncate w-32">Operator: Elite Transport</p>
             </div>
           </button>
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-1 md:col-span-2 p-0 flex flex-col relative overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeThread === 'CONCIERGE' ? 'bg-gold-500 text-black' : 'bg-blue-500 text-white'}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-white font-medium">{currentThread.name}</p>
                <p className="text-zinc-500 text-xs">{currentThread.role}</p>
              </div>
           </div>
           <button className="text-zinc-500 hover:text-white"><MoreVertical size={16} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/30" ref={scrollRef}>
           {currentThread.messages.map((msg: any) => (
             <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[70%] rounded-xl p-3 ${
                 msg.sender === 'ME' 
                   ? 'bg-zinc-800 text-white rounded-br-none' 
                   : 'bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-bl-none'
               }`}>
                 <p className="text-sm">{msg.text}</p>
                 <p className="text-[10px] text-zinc-500 mt-1 text-right">{msg.time}</p>
               </div>
             </div>
           ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
           <div className="flex gap-2">
             <Input 
               className="bg-zinc-900 border-zinc-800 focus:border-gold-500/50"
               placeholder="Type a message..."
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <Button onClick={handleSend} className="px-4"><Send size={16} /></Button>
           </div>
        </div>
      </Card>
    </div>
  );
};