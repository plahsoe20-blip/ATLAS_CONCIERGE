import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Globe } from 'lucide-react';
import { Button, Input, Card } from './ui';
import { sendMessageToAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

export const Assistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Welcome to ATLAS Concierge. How may I assist with your itinerary today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendMessageToAssistant(input, history);
      const text = response.text || '';
      
      // Extract grounding metadata if available
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources: any[] = [];
      
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) sources.push({ uri: chunk.web.uri, title: chunk.web.title });
          if (chunk.maps?.uri) sources.push({ uri: chunk.maps.uri, title: chunk.maps.title || 'Google Maps' });
        });
      }

      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text,
        groundingSources: sources
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'I apologize, I am currently unable to reach the concierge network.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col p-0">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold-500" />
        <h3 className="font-serif font-semibold text-white">ATLAS AI Concierge</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-white rounded-br-none' 
                : 'bg-gold-500/10 border border-gold-500/20 text-gold-50 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gold-500/20 grid gap-1">
                  <p className="text-[10px] uppercase tracking-wider text-gold-500 opacity-70 mb-1">Sources</p>
                  {msg.groundingSources.map((src, idx) => (
                    <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                      {src.uri.includes('maps') ? <MapPin className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      <span className="truncate max-w-[200px]">{src.title || 'Source Link'}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-zinc-900 rounded-xl p-3 flex gap-2 items-center">
               <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" />
               <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-75" />
               <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-150" />
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about traffic, restaurants, or routes..."
            className="bg-black"
          />
          <Button onClick={handleSend} variant="primary" className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};