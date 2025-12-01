import React, { useState } from 'react';
import { LayoutDashboard, Car, Map, User, Settings, Menu, Download, LogOut, Shield, Briefcase, Users, Search, Globe, MessageSquare } from 'lucide-react';
import { BookingWidget } from './components/BookingWidget';
import { Assistant } from './components/Assistant';
import { ConciergeMap } from './components/ConciergeMap';
import { ConciergeSourcing } from './components/ConciergeSourcing';
import { ConciergeMessages } from './components/ConciergeMessages'; 
import { DashboardDriver } from './components/DashboardDriver';
import { DashboardOperator } from './components/DashboardOperator';
import { DashboardConcierge } from './components/DashboardConcierge';
import { OperatorFleet } from './components/OperatorFleet';
import { OperatorDrivers } from './components/OperatorDrivers'; // New Import
import { DriverSettings } from './components/DriverSettings';
import { OperatorSettings } from './components/OperatorSettings';
import { ToastSystem } from './components/ToastSystem'; // New Import
import { LoginPage } from './components/LoginPage';
import { Card, Button } from './components/ui';
import { UserRole, PricingRule } from './types';
import { GlobalProvider, useStore } from './context/Store'; 
import { runPricingTests } from './services/pricingEngine'; 

// Full Exportable JSON per instructions
const DEVELOPER_EXPORT = {
  app_name: "ATLAS",
  version: "1.0.0",
  roles: {
    CONCIERGE: { permissions: ["create_booking", "track_trip", "view_history", "ai_assistant"] },
    DRIVER: { permissions: ["view_assigned_jobs", "update_status", "navigation", "view_client_notes"] },
    OPERATOR: { permissions: ["manage_fleet", "assign_drivers", "view_revenue", "edit_pricing"] }
  },
  loginFlows: {
    CONCIERGE: "/login/concierge",
    DRIVER: "/login/driver",
    OPERATOR: "/login/operator"
  },
  styles: {
    primary: "Gold 500 (#cb902f)",
    background: "Zinc 950 (#0c0c0e)",
    font: "Inter / Playfair Display"
  }
};

// Component for inner app content to access store
const AppContent = () => {
  const { pricingRules } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CONCIERGE);
  const [view, setView] = useState<'DASHBOARD' | 'BOOKING' | 'SOURCING' | 'MAP' | 'MESSAGES' | 'SETTINGS' | 'FLEET' | 'CLIENTS' | 'DRIVERS_LIST'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Run tests on mount
  React.useEffect(() => {
    runPricingTests();
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setView('DASHBOARD'); // Reset view on login
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole(UserRole.CONCIERGE);
  };

  const downloadDevSpec = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DEVELOPER_EXPORT, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "atlas_architecture_spec.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all border-r-2 ${
        active 
        ? 'border-gold-500 bg-zinc-900 text-gold-500' 
        : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans selection:bg-gold-500/30">
      <ToastSystem />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-zinc-950 p-4 flex justify-between items-center border-b border-zinc-800">
        <h1 className="text-xl font-serif text-white tracking-widest">ATLAS</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="text-white" />
        </button>
      </div>

      {/* Sidebar - Dynamic based on Role */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform md:translate-x-0 md:relative ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-zinc-800/50">
           <h1 className="text-3xl font-serif text-white tracking-widest text-center">ATLAS</h1>
           <p className="text-center text-xs text-gold-500 uppercase tracking-[0.2em] mt-2">{currentRole}</p>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} />
          
          {(currentRole === UserRole.CONCIERGE || currentRole === UserRole.CLIENT) && (
            <>
              <SidebarItem icon={Car} label="New Booking" active={view === 'BOOKING'} onClick={() => setView('BOOKING')} />
              <SidebarItem icon={Globe} label="Sourcing" active={view === 'SOURCING'} onClick={() => setView('SOURCING')} />
              <SidebarItem icon={Map} label="Live Map" active={view === 'MAP'} onClick={() => setView('MAP')} />
              <SidebarItem icon={MessageSquare} label="Messages" active={view === 'MESSAGES'} onClick={() => setView('MESSAGES')} />
              <SidebarItem icon={User} label="Clients" active={view === 'CLIENTS'} onClick={() => setView('CLIENTS')} />
            </>
          )}

          {currentRole === UserRole.DRIVER && (
            <SidebarItem icon={Map} label="My Route" active={view === 'BOOKING'} onClick={() => setView('BOOKING')} />
          )}

          {currentRole === UserRole.OPERATOR && (
            <>
              <SidebarItem icon={Car} label="Fleet Management" active={view === 'FLEET'} onClick={() => setView('FLEET')} />
              <SidebarItem icon={User} label="Drivers" active={view === 'DRIVERS_LIST'} onClick={() => setView('DRIVERS_LIST')} />
            </>
          )}

          <SidebarItem icon={Settings} label="Settings" active={view === 'SETTINGS'} onClick={() => setView('SETTINGS')} />
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-6 space-y-4">
           <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={handleLogout}>
             <LogOut className="w-4 h-4 mr-2" /> Sign Out
           </Button>

           <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Logged in as</p>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-black font-bold">
                   {currentRole[0]}
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-sm font-medium truncate.">Alex V.</p>
                   <p className="text-xs text-zinc-400 truncate capitalize">{currentRole.toLowerCase()}</p>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          
          {/* Header Actions */}
          <div className="flex justify-end mb-8 gap-4">
             <Button variant="outline" size="sm" onClick={downloadDevSpec} className="gap-2">
                <Download className="w-4 h-4" /> Spec Export
             </Button>
          </div>

          {/* VIEW ROUTER */}
          {view === 'DASHBOARD' && (
            <>
              {(currentRole === UserRole.CONCIERGE || currentRole === UserRole.CLIENT) && (
                <DashboardConcierge />
              )}

              {currentRole === UserRole.DRIVER && <DashboardDriver />}
              
              {currentRole === UserRole.OPERATOR && <DashboardOperator />}
            </>
          )}

          {view === 'BOOKING' && (currentRole === UserRole.CONCIERGE || currentRole === UserRole.CLIENT) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
               <div className="lg:col-span-2">
                 {/* Booking Widget Redirects to Sourcing on Complete */}
                 <BookingWidget onComplete={() => setView('SOURCING')} />
               </div>
               <div className="lg:col-span-1">
                 <div className="sticky top-6">
                    <Card className="bg-gradient-to-br from-zinc-900 to-black border-gold-500/20">
                      <h3 className="text-lg font-serif mb-4 text-gold-500">Pricing Policy</h3>
                      <ul className="space-y-4 text-sm text-zinc-400">
                        {Object.values(pricingRules).map((rule: PricingRule) => (
                          <li key={rule.vehicleCategory} className="flex justify-between">
                            <span>{rule.vehicleCategory}</span>
                            <span className="text-white">${rule.hourlyRate}/hr</span>
                          </li>
                        ))}
                        <li className="pt-4 border-t border-zinc-800">
                          <p className="text-xs italic opacity-70">
                            Minimum 3-4 hours. Pricing subject to change by Operator.
                          </p>
                        </li>
                      </ul>
                    </Card>
                 </div>
               </div>
            </div>
          )}

          {view === 'SOURCING' && (currentRole === UserRole.CONCIERGE || currentRole === UserRole.CLIENT) && (
            <ConciergeSourcing />
          )}

          {view === 'MAP' && (currentRole === UserRole.CONCIERGE || currentRole === UserRole.CLIENT) && (
             <ConciergeMap />
          )}

          {view === 'MESSAGES' && (currentRole === UserRole.CONCIERGE || currentRole === UserRole.CLIENT) && (
             <ConciergeMessages />
          )}

          {view === 'FLEET' && currentRole === UserRole.OPERATOR && (
            <OperatorFleet />
          )}

          {view === 'DRIVERS_LIST' && currentRole === UserRole.OPERATOR && (
            <OperatorDrivers />
          )}

          {view === 'CLIENTS' && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-serif text-white">Client Management</h2>
                 <Button className="gap-2"><Users size={16}/> Add Client</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[1,2,3].map(i => (
                    <Card key={i} className="hover:border-gold-500/50 cursor-pointer transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                             <User size={20} />
                          </div>
                          <div>
                             <p className="text-white font-medium">VIP Client {i}</p>
                             <p className="text-zinc-500 text-xs">Total Spend: $12k</p>
                          </div>
                       </div>
                    </Card>
                 ))}
              </div>
            </div>
          )}

          {view === 'SETTINGS' && (
             currentRole === UserRole.DRIVER ? <DriverSettings /> : 
             currentRole === UserRole.OPERATOR ? <OperatorSettings /> : (
              <Card>
                <h2 className="text-xl mb-4 text-white">Settings</h2>
                <p className="text-zinc-500">User preferences and configuration.</p>
              </Card>
             )
          )}

        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
}