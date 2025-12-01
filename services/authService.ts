
import { UserRole, UserProfile } from '../types';

// Mock Encryption Key
const SECRET_KEY = "atlas_super_secret_256_bit_key";

export const generateToken = (user: UserProfile): string => {
  // Simulating JWT structure: header.payload.signature
  const payload = btoa(JSON.stringify({ 
    id: user.id, 
    role: user.role, 
    exp: Date.now() + 3600000 // 1 hour
  }));
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.${btoa(SECRET_KEY)}`;
};

export const verifyToken = (token: string): boolean => {
  if (!token) return false;
  try {
    const [, payload] = token.split('.');
    const data = JSON.parse(atob(payload));
    return data.exp > Date.now();
  } catch (e) {
    return false;
  }
};

export const encryptData = (data: string): string => {
  // Mock AES-256 simulation
  return `enc_${btoa(data).split('').reverse().join('')}`;
};

export const decryptData = (encrypted: string): string => {
  if (!encrypted.startsWith('enc_')) return '';
  return atob(encrypted.replace('enc_', '').split('').reverse().join(''));
};

export const mockLogin = async (role: UserRole): Promise<{ user: UserProfile, token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

  // Return specific mock profiles based on role
  let user: UserProfile;

  switch (role) {
    case UserRole.CONCIERGE:
      user = {
        id: 'u_concierge_01',
        name: 'Alex V.',
        email: 'alex@atlas.com',
        phone: '+15550123456',
        avatar: '',
        role: UserRole.CONCIERGE,
        settings: { notifications: true, darkMode: true },
        conciergeStats: { totalBookings: 24, totalSpend: 12500, thisMonthSpend: 3200, activeTrips: 2 }
      };
      break;
    case UserRole.OPERATOR:
      user = {
        id: 'u_operator_01',
        name: 'Elite Dispatch',
        email: 'dispatch@elite.com',
        phone: '+15559988776',
        avatar: '',
        role: UserRole.OPERATOR,
        settings: { notifications: true, darkMode: true }
      };
      break;
    case UserRole.DRIVER:
      user = {
        id: 'u_driver_01',
        name: 'James Doe',
        email: 'james@atlas.com',
        phone: '+15551122334',
        avatar: '',
        role: UserRole.DRIVER,
        settings: { notifications: true, darkMode: true }
      };
      break;
    default:
      throw new Error("Invalid Role");
  }

  return {
    user,
    token: generateToken(user)
  };
};
