import React, { useState, useRef } from 'react';
import { Card, Button, Input } from './ui';
import { 
  User, Bell, CreditCard, Smartphone, ChevronRight, 
  CheckCircle, AlertTriangle, Moon, Volume2, 
  FileText, Shield, LogOut, Car, Camera, Save, Loader2
} from 'lucide-react';
import { useStore } from '../context/Store';

type SettingsTab = 'ACCOUNT' | 'APP' | 'NOTIFICATIONS' | 'BILLING';

export const DriverSettings: React.FC = () => {
  const { currentUser, updateUserProfile } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('ACCOUNT');
  
  // --- PROFILE EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      await updateUserProfile(formData);
      setSuccessMsg("Profile updated successfully.");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      const reader = new FileReader();
      reader.onloadend = () => {
         // In real app: Upload to S3/GCS, get URL
         updateUserProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: SettingsTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
        activeTab === id 
          ? 'bg-zinc-800 border-gold-500/50 text-white' 
          : 'bg-zinc-900/30 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={activeTab === id ? 'text-gold-500' : ''} />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight size={16} className={`opacity-50 ${activeTab === id ? 'text-gold-500' : ''}`} />
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      
      {/* Settings Navigation Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
           <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-gold-500 p-1 overflow-hidden">
                 {currentUser.avatar ? (
                   <img src={currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                 ) : (
                   <div className="w-full h-full rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-serif text-xl">
                     {currentUser.name.charAt(0)}
                   </div>
                 )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} className="text-white"/>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
           </div>
           <div>
              <h2 className="text-white font-serif text-lg">{currentUser.name}</h2>
              <div className="flex items-center gap-1 text-zinc-400 text-xs">
                <span className="bg-gold-500 text-black px-1.5 rounded font-bold">4.95</span>
                <span>• Platinum Chauffeur</span>
              </div>
           </div>
        </div>

        <nav className="space-y-2">
           <SidebarItem id="ACCOUNT" icon={User} label="Account & Documents" />
           <SidebarItem id="APP" icon={Smartphone} label="App Settings" />
           <SidebarItem id="NOTIFICATIONS" icon={Bell} label="Notifications" />
           <SidebarItem id="BILLING" icon={CreditCard} label="Billing & Payouts" />
        </nav>

        <div className="pt-6 border-t border-zinc-800">
           <p className="text-xs text-center text-zinc-600 mb-4">ATLAS Driver v1.0.4 (Build 220)</p>
           <Button variant="ghost" className="w-full text-red-400 hover:bg-red-900/10 hover:text-red-300">
              <LogOut size={16} className="mr-2" /> Sign Out
           </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2">
        <Card className="min-h-[600px]">
           
           {/* ACCOUNT TAB: FULL EDIT LOGIC */}
           {activeTab === 'ACCOUNT' && (
             <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-xl font-serif text-white mb-1">Account & Documents</h3>
                      <p className="text-zinc-500 text-sm">Manage your profile and compliance documents.</p>
                   </div>
                   {!isEditing && (
                     <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                   )}
                </div>

                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> {successMsg}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                <div className="space-y-4">
                   <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Personal Information</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="Full Name" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        disabled={!isEditing}
                      />
                      <Input 
                        label="Email Address" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                      <Input 
                        label="Phone Number" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                      <Input 
                         label="Member ID" 
                         value="DRV-829102" 
                         disabled 
                         className="opacity-50" 
                      />
                   </div>
                   
                   {isEditing && (
                     <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData({name: currentUser.name, email: currentUser.email, phone: currentUser.phone}); }}>Cancel</Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                           {isSaving ? <><Loader2 className="animate-spin mr-2" size={16}/> Saving...</> : <><Save size={16} className="mr-2"/> Save Changes</>}
                        </Button>
                     </div>
                   )}
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-800">
                   <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Compliance Documents</h4>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                         <div className="flex items-center gap-3">
                            <FileText size={18} className="text-zinc-400" />
                            <span className="text-zinc-200">Driver's License</span>
                         </div>
                         <span className="flex items-center gap-1 text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded">
                            <CheckCircle size={12} /> Active
                         </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                         <div className="flex items-center gap-3">
                            <Shield size={18} className="text-zinc-400" />
                            <span className="text-zinc-200">Vehicle Insurance</span>
                         </div>
                         <span className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded">
                            <AlertTriangle size={12} /> Expiring Soon (14 days)
                         </span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* Placeholder for other tabs (kept simple for brevity in this demo) */}
           {activeTab !== 'ACCOUNT' && (
             <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
               <p>Settings Section Demo</p>
               <p className="text-xs">Functionality available in Account tab.</p>
             </div>
           )}
        </Card>
      </div>
    </div>
  );
};