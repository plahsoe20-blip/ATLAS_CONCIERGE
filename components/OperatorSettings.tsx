import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from './ui';
import { 
  Building2, Bell, CreditCard, Laptop, ChevronRight, 
  CheckCircle, AlertTriangle, Moon, Globe, Volume2, 
  FileText, Shield, LogOut, UploadCloud, Lock, RefreshCw, Flag
} from 'lucide-react';

type SettingsTab = 'COMPANY' | 'CONSOLE' | 'NOTIFICATIONS' | 'BILLING';
type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'CHECKING' | 'FAILED';

export const OperatorSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('COMPANY');
  const [consoleSound, setConsoleSound] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Notification System State
  const [notification, setNotification] = useState<{title: string, msg: string} | null>(null);

  // Company Profile State (Editable)
  const [profile, setProfile] = useState({
    legalName: "Elite Transport Logistics, LLC",
    dba: "Elite Limo NYC",
    jurisdiction: "USA", // USA, CAN, UK
    taxId: "82-1928391",
    regNumber: "281903",
    insurancePolicy: "CPP-99182-002",
    insuranceCarrier: "Berkshire Hathaway Homestate"
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('VERIFIED');

  // Jurisdiction Configurations (Simulating Database Rules)
  const jurisdictions = {
    USA: { label: 'United States', regLabel: 'USDOT Number', taxLabel: 'IRS EIN', dbName: 'IRS & DOT Registry' },
    CAN: { label: 'Canada', regLabel: 'Provincial Corp ID', taxLabel: 'CRA Business Number (BN)', dbName: 'Canada Business Registries' },
    UK: { label: 'United Kingdom', regLabel: 'Company Number', taxLabel: 'VAT Number', dbName: 'Companies House' }
  };

  const currentJurisdiction = jurisdictions[profile.jurisdiction as keyof typeof jurisdictions];

  const showNotification = (title: string, msg: string) => {
    setNotification({ title, msg });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // If critical fields change, invalidate verification
    if (['legalName', 'taxId', 'regNumber', 'jurisdiction'].includes(field)) {
       setVerificationStatus('UNVERIFIED');
    }
  };

  const handleVerifyAndSave = () => {
    setVerificationStatus('CHECKING');
    
    // Simulate Backend Verification Process
    setTimeout(() => {
      // Mock Validation Logic
      if (!profile.legalName || !profile.taxId || !profile.regNumber) {
         setVerificationStatus('FAILED');
         showNotification('Verification Failed', 'All business identity fields are required.');
         return;
      }

      setVerificationStatus('VERIFIED');
      showNotification(
         'Compliance Verified', 
         `Entity '${profile.legalName}' successfully verified against ${currentJurisdiction.dbName}.`
      );
    }, 2500); // 2.5s simulated network delay
  };

  // Mock Notification Toggle State
  const [notifs, setNotifs] = useState({
    urgent: true,
    bookings: true,
    driver_status: false,
    marketing: false
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
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
    <div className="relative">
      {/* System Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-gold-500 text-white p-4 rounded-xl shadow-2xl animate-bounce flex items-center gap-4 max-w-md">
            <div className="bg-gold-500/20 p-2 rounded-full">
               <Bell className="text-gold-500" size={20} />
            </div>
            <div>
                <p className="font-bold text-sm text-gold-500">{notification.title}</p>
                <p className="text-xs text-zinc-300">{notification.msg}</p>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
             <div className="w-16 h-16 rounded-lg bg-zinc-800 border-2 border-blue-500 p-1 flex items-center justify-center">
                <Building2 className="text-blue-500" size={32} />
             </div>
             <div>
                <h2 className="text-white font-serif text-lg">{profile.legalName || 'Company Name'}</h2>
                <div className="flex items-center gap-1 text-zinc-400 text-xs">
                  {verificationStatus === 'VERIFIED' 
                    ? <span className="bg-green-500 text-white px-1.5 rounded font-bold">Verified</span> 
                    : <span className="bg-zinc-700 text-zinc-400 px-1.5 rounded font-bold">Unverified</span>
                  }
                  <span>• Operator</span>
               </div>
             </div>
          </div>

          <nav className="space-y-2">
             <SidebarItem id="COMPANY" icon={Building2} label="Compliance & Identity" />
             <SidebarItem id="CONSOLE" icon={Laptop} label="Dispatch Console" />
             <SidebarItem id="NOTIFICATIONS" icon={Bell} label="Alerts & Notifications" />
             <SidebarItem id="BILLING" icon={CreditCard} label="Billing & Subscription" />
          </nav>

          <div className="pt-6 border-t border-zinc-800">
             <Button variant="ghost" className="w-full text-red-400 hover:bg-red-900/10 hover:text-red-300">
                <LogOut size={16} className="mr-2" /> Sign Out
             </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="min-h-[600px]">
             
             {/* COMPANY & COMPLIANCE TAB */}
             {activeTab === 'COMPANY' && (
               <div className="space-y-8 animate-fadeIn">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-serif text-white mb-1">Business Verification</h3>
                        <p className="text-zinc-500 text-sm">Real-time validation against government registries.</p>
                     </div>
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                        verificationStatus === 'VERIFIED' ? 'bg-green-900/20 text-green-500 border-green-500/30' : 
                        verificationStatus === 'CHECKING' ? 'bg-blue-900/20 text-blue-500 border-blue-500/30' :
                        'bg-red-900/20 text-red-500 border-red-500/30'
                     }`}>
                        {verificationStatus === 'VERIFIED' && <CheckCircle size={14} />}
                        {verificationStatus === 'CHECKING' && <RefreshCw size={14} className="animate-spin" />}
                        {verificationStatus === 'UNVERIFIED' && <AlertTriangle size={14} />}
                        <span className="text-xs font-bold uppercase tracking-wider">
                           {verificationStatus === 'CHECKING' ? 'Verifying...' : verificationStatus}
                        </span>
                     </div>
                  </div>

                  {/* Legal Entity Info */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">Corporate Identity</h4>
                     
                     {/* Jurisdiction Selector */}
                     <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 mb-4">
                        <label className="text-xs font-medium text-zinc-400 uppercase block mb-2">Registration Jurisdiction</label>
                        <div className="flex gap-2">
                          {Object.entries(jurisdictions).map(([key, data]) => (
                            <button
                              key={key}
                              onClick={() => handleProfileChange('jurisdiction', key)}
                              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                                profile.jurisdiction === key 
                                  ? 'bg-gold-500 text-black border-gold-500' 
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                              }`}
                            >
                              {data.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                           <Globe size={12} /> Verification will be performed against: <span className="text-gold-500">{currentJurisdiction.dbName}</span>
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                           label="Legal Corporate Name" 
                           value={profile.legalName} 
                           onChange={(e) => handleProfileChange('legalName', e.target.value)}
                           className={verificationStatus === 'UNVERIFIED' ? 'border-yellow-500/50' : ''}
                        />
                        <Input 
                           label="DBA (Doing Business As)" 
                           value={profile.dba} 
                           onChange={(e) => handleProfileChange('dba', e.target.value)}
                        />
                        <Input 
                           label={currentJurisdiction.taxLabel} 
                           value={profile.taxId} 
                           onChange={(e) => handleProfileChange('taxId', e.target.value)}
                           icon={<Lock size={14}/>} 
                        />
                        <Input 
                           label="Dun & Bradstreet (DUNS)" 
                           value="02-192-8491" 
                           disabled 
                           className="opacity-50"
                        />
                     </div>
                  </div>

                  {/* Operating Authority - Dynamic Labels */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">Operating Authority</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                           label={currentJurisdiction.regLabel} 
                           value={profile.regNumber} 
                           onChange={(e) => handleProfileChange('regNumber', e.target.value)}
                        />
                        <Input label="Permit / TLC #" value="B02918" disabled className="opacity-50" />
                     </div>
                  </div>

                  {/* Insurance */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">Insurance Requirements</h4>
                     <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                           label="Insurance Carrier" 
                           value={profile.insuranceCarrier} 
                           onChange={(e) => handleProfileChange('insuranceCarrier', e.target.value)}
                        />
                        <Input 
                           label="Policy Number" 
                           value={profile.insurancePolicy} 
                           onChange={(e) => handleProfileChange('insurancePolicy', e.target.value)}
                        />
                        <div className="md:col-span-2">
                          <Input label="Commercial General Liability Limit" value="$5,000,000.00" disabled />
                          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                             <CheckCircle size={10} className="text-green-500"/> Meets ATLAS Premier Tier Requirements ($1M Minimum)
                          </p>
                        </div>
                     </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4 items-center">
                     {verificationStatus === 'UNVERIFIED' && (
                        <span className="text-xs text-yellow-500 flex items-center gap-1">
                           <AlertTriangle size={12} /> Changes saved locally. Verification required.
                        </span>
                     )}
                     <Button 
                        onClick={handleVerifyAndSave} 
                        disabled={verificationStatus === 'CHECKING'}
                        className="min-w-[200px]"
                     >
                        {verificationStatus === 'CHECKING' ? 'Contacting Registry...' : 'Verify & Save Profile'}
                     </Button>
                  </div>
               </div>
             )}

             {/* CONSOLE TAB */}
             {activeTab === 'CONSOLE' && (
               <div className="space-y-8 animate-fadeIn">
                  <div>
                     <h3 className="text-xl font-serif text-white mb-1">Dispatch Console</h3>
                     <p className="text-zinc-500 text-sm">Configure how you receive and manage trips.</p>
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2">
                             <Volume2 size={18} /> New Request Alerts
                          </h4>
                          <p className="text-zinc-500 text-xs">Play sound when new RFPs enter the bid board.</p>
                        </div>
                        <button 
                          onClick={() => setConsoleSound(!consoleSound)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${consoleSound ? 'bg-blue-500' : 'bg-zinc-700'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${consoleSound ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>

                     <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2">
                             <Globe size={18} /> Auto-Refresh Data
                          </h4>
                          <p className="text-zinc-500 text-xs">Keep fleet map and tables updated in real-time.</p>
                        </div>
                        <button 
                          onClick={() => setAutoRefresh(!autoRefresh)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${autoRefresh ? 'bg-blue-500' : 'bg-zinc-700'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoRefresh ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
               </div>
             )}

             {/* NOTIFICATIONS TAB */}
             {activeTab === 'NOTIFICATIONS' && (
               <div className="space-y-8 animate-fadeIn">
                  <div>
                     <h3 className="text-xl font-serif text-white mb-1">Alerts & Notifications</h3>
                     <p className="text-zinc-500 text-sm">Manage team communication preferences.</p>
                  </div>

                  <div className="space-y-2 bg-zinc-900/30 rounded-xl p-2 border border-zinc-800">
                     {[
                       { key: 'urgent', label: 'Urgent Fleet Alerts', desc: 'Accidents, breakdowns, or SOS signals.' },
                       { key: 'bookings', label: 'New Bookings', desc: 'When a quote is accepted by a client.' },
                       { key: 'driver_status', label: 'Driver Status Changes', desc: 'Clock-ins, breaks, and logouts.' },
                       { key: 'marketing', label: 'Platform Updates', desc: 'New features and partner newsletters.' }
                     ].map((item) => (
                       <div key={item.key} className="flex justify-between items-center p-4 hover:bg-zinc-900 rounded-lg transition-colors">
                          <div>
                             <p className="text-white font-medium">{item.label}</p>
                             <p className="text-zinc-500 text-xs">{item.desc}</p>
                          </div>
                          <button 
                             onClick={() => toggleNotif(item.key as any)}
                             className={`w-12 h-6 rounded-full relative transition-colors ${notifs[item.key as keyof typeof notifs] ? 'bg-green-500' : 'bg-zinc-700'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifs[item.key as keyof typeof notifs] ? 'left-7' : 'left-1'}`} />
                           </button>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {/* BILLING TAB */}
             {activeTab === 'BILLING' && (
               <div className="space-y-8 animate-fadeIn">
                  <div>
                     <h3 className="text-xl font-serif text-white mb-1">Billing & Subscription</h3>
                     <p className="text-zinc-500 text-sm">ATLAS Partner fees and earnings payout.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 relative overflow-hidden">
                        <p className="text-zinc-400 text-sm mb-1">Current Plan</p>
                        <h4 className="text-2xl text-white font-serif mb-2">Enterprise</h4>
                        <p className="text-xs text-zinc-500 mb-6">Unlimited Drivers • 5% Platform Fee</p>
                        <Button size="sm" variant="secondary" className="w-full">Manage Subscription</Button>
                     </div>

                     <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                              <CreditCard className="text-zinc-400" size={18} />
                           </div>
                           <div>
                              <p className="text-white font-medium">Payout Account</p>
                              <p className="text-zinc-500 text-xs">•••• 8821</p>
                           </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">Update Bank Details</Button>
                     </div>
                  </div>
               </div>
             )}

          </Card>
        </div>
      </div>
    </div>
  );
};