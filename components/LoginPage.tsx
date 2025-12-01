import React, { useState } from 'react';
import { UserRole } from '../types';
import { Button, Input } from './ui';
import { User, Shield, Car, Briefcase, ChevronLeft, ArrowRight, Check } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'ROLE_SELECT' | 'LOGIN_FORM' | 'REGISTER'>('ROLE_SELECT');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('LOGIN_FORM');
  };

  const handleLogin = () => {
    if (selectedRole) {
      onLogin(selectedRole);
    }
  };

  // Uber-like List Option Component
  const RoleOption = ({ title, desc, icon: Icon, onClick }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl transition-all group text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-zinc-400 group-hover:text-gold-500 transition-colors">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-white font-medium text-lg">{title}</h3>
          <p className="text-zinc-500 text-sm">{desc}</p>
        </div>
      </div>
      <ArrowRight className="text-zinc-600 group-hover:text-white transition-colors" size={20} />
    </button>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row font-sans">
      
      {/* Left Side - Brand & Imagery */}
      <div className="lg:w-1/2 relative bg-zinc-900 overflow-hidden flex flex-col justify-between p-12 lg:min-h-screen">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1983" 
             alt="Luxury Car" 
             className="w-full h-full object-cover opacity-60"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10">
           <h1 className="text-3xl font-serif text-white tracking-widest font-bold">ATLAS</h1>
        </div>

        <div className="relative z-10 mb-12 lg:mb-0">
           <h2 className="text-4xl lg:text-6xl font-serif text-white mb-6 leading-tight">
             Elevate your <br/>
             <span className="text-gold-500">journey.</span>
           </h2>
           <p className="text-zinc-300 text-lg max-w-md leading-relaxed">
             Experience the pinnacle of luxury logistics. Seamless booking, exceptional service, and world-class fleet management.
           </p>
        </div>
      </div>

      {/* Right Side - Interaction Area */}
      <div className="lg:w-1/2 bg-black flex flex-col justify-center p-6 lg:p-24 relative">
        
        {/* Back Button (Only visible if not in initial step) */}
        {step !== 'ROLE_SELECT' && (
          <button 
            onClick={() => setStep(step === 'REGISTER' ? 'LOGIN_FORM' : 'ROLE_SELECT')}
            className="absolute top-12 left-6 lg:left-24 flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} className="mr-2" /> Back
          </button>
        )}

        <div className="w-full max-w-md mx-auto animate-fadeIn">
          
          {/* STEP 1: ROLE SELECTION */}
          {step === 'ROLE_SELECT' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-medium text-white mb-2">Get started</h3>
                <p className="text-zinc-400">Select your account type to continue.</p>
              </div>

              <div className="space-y-3">
                <RoleOption 
                   title="Concierge" 
                   desc="Book and manage client itineraries" 
                   icon={Briefcase}
                   onClick={() => handleRoleSelect(UserRole.CONCIERGE)}
                />
                <RoleOption 
                   title="Chauffeur" 
                   desc="Access trips and navigation" 
                   icon={Car}
                   onClick={() => handleRoleSelect(UserRole.DRIVER)}
                />
                <RoleOption 
                   title="Operator" 
                   desc="Fleet management console" 
                   icon={Shield}
                   onClick={() => handleRoleSelect(UserRole.OPERATOR)}
                />
              </div>

              <div className="pt-8 border-t border-zinc-900">
                <p className="text-xs text-zinc-600 text-center">
                  By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from ATLAS and its affiliates to the number provided.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: LOGIN FORM */}
          {step === 'LOGIN_FORM' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-medium text-white mb-2">
                  {selectedRole === UserRole.CONCIERGE ? 'Concierge Login' : 
                   selectedRole === UserRole.DRIVER ? 'Driver Portal' : 'Operator Access'}
                </h3>
                <p className="text-zinc-400">Enter your credentials to access your dashboard.</p>
              </div>

              <div className="space-y-4">
                 <Input 
                   placeholder="name@example.com" 
                   className="bg-zinc-900 border-transparent focus:bg-zinc-800 text-lg h-14"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
                 <Input 
                   type="password"
                   placeholder="Enter your password" 
                   className="bg-zinc-900 border-transparent focus:bg-zinc-800 text-lg h-14"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                 />
                 <div className="flex justify-end">
                   <button className="text-gold-500 text-sm hover:underline">Forgot Password?</button>
                 </div>
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full h-14 text-lg font-medium bg-white text-black hover:bg-zinc-200 border-none"
              >
                Continue
              </Button>

              {/* Social Login Section */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-900" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-4 text-zinc-500">Or</span>
                </div>
              </div>

              <button className="w-full h-14 rounded-lg bg-zinc-900 text-white font-medium flex items-center justify-center gap-3 hover:bg-zinc-800 transition-colors">
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 Continue with Google
              </button>

              {selectedRole === UserRole.CONCIERGE && (
                <div className="mt-6 text-center">
                  <p className="text-zinc-400 text-sm">
                    New to Atlas? <button onClick={() => setStep('REGISTER')} className="text-white font-medium hover:underline">Join the network</button>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: REGISTRATION (CONCIERGE) */}
          {step === 'REGISTER' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-medium text-white mb-2">Join the Network</h3>
                <p className="text-zinc-400">Apply for a Concierge account.</p>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First Name" className="bg-zinc-900 border-transparent h-12" />
                    <Input placeholder="Last Name" className="bg-zinc-900 border-transparent h-12" />
                 </div>
                 <Input placeholder="Business Email" className="bg-zinc-900 border-transparent h-12" />
                 <Input placeholder="Company Name" className="bg-zinc-900 border-transparent h-12" />
                 <Input placeholder="Phone Number" className="bg-zinc-900 border-transparent h-12" />
                 
                 <div className="flex items-start gap-3 mt-4">
                    <div className="mt-1 w-5 h-5 rounded border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold-500" />
                    </div>
                    <p className="text-xs text-zinc-500">I agree to the Terms of Service and Privacy Policy, and I certify that I am an accredited travel agent or concierge.</p>
                 </div>
              </div>

              <Button 
                onClick={() => {
                  alert("Application Submitted.");
                  setStep('LOGIN_FORM');
                }}
                className="w-full h-14 text-lg font-medium bg-gold-500 text-black hover:bg-gold-400 border-none"
              >
                Submit Application
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
