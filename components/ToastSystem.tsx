import React from 'react';
import { Notification } from '../types';
import { X, CheckCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useStore } from '../context/Store';

export const ToastSystem: React.FC = () => {
  const { notifications, dismissNotification } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className={`pointer-events-auto w-80 p-4 rounded-xl border shadow-2xl flex items-start gap-3 transition-all animate-fadeIn ${
            notif.type === 'SUCCESS' ? 'bg-zinc-900 border-green-500/50 text-white' :
            notif.type === 'WARNING' ? 'bg-zinc-900 border-yellow-500/50 text-white' :
            notif.type === 'ERROR' ? 'bg-zinc-900 border-red-500/50 text-white' :
            'bg-zinc-900 border-blue-500/50 text-white'
          }`}
        >
           <div className={`mt-0.5 ${
             notif.type === 'SUCCESS' ? 'text-green-500' :
             notif.type === 'WARNING' ? 'text-yellow-500' :
             notif.type === 'ERROR' ? 'text-red-500' :
             'text-blue-500'
           }`}>
              {notif.type === 'SUCCESS' && <CheckCircle size={18} />}
              {notif.type === 'WARNING' && <AlertTriangle size={18} />}
              {notif.type === 'ERROR' && <AlertOctagon size={18} />}
              {notif.type === 'INFO' && <Info size={18} />}
           </div>
           
           <div className="flex-1">
              <h4 className="text-sm font-medium">{notif.title}</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
           </div>

           <button 
             onClick={() => dismissNotification(notif.id)}
             className="text-zinc-500 hover:text-white transition-colors"
           >
             <X size={14} />
           </button>
        </div>
      ))}
    </div>
  );
};