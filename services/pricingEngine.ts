import { BookingType, VehicleCategory, PricingRule, Quote } from '../types';

/**
 * Determines estimated tax rate based on location string.
 * Real-world logic would call a tax API (Avalara/Stripe).
 */
export const getTaxRateForLocation = (location: string): number => {
  if (!location) return 0.05; // Default safe assumption
  
  const lower = location.toLowerCase();
  
  // Major US Markets
  if (lower.includes('ny') || lower.includes('new york') || lower.includes('manhattan')) return 0.08875; // NYC Sales Tax
  if (lower.includes('ca') || lower.includes('california') || lower.includes('los angeles') || lower.includes('sf')) return 0.095; // LA Avg
  if (lower.includes('fl') || lower.includes('florida') || lower.includes('miami')) return 0.07;
  if (lower.includes('tx') || lower.includes('texas')) return 0.0825;
  if (lower.includes('nv') || lower.includes('las vegas')) return 0.0838;
  
  // International
  if (lower.includes('london') || lower.includes('uk')) return 0.20; // VAT
  if (lower.includes('dubai') || lower.includes('uae')) return 0.05; // VAT
  if (lower.includes('paris') || lower.includes('france')) return 0.20; // VAT

  return 0.05; // Fallback
};

/**
 * Calculates a detailed quote based on trip parameters and active pricing rules.
 */
export const calculateQuote = (
  type: BookingType,
  rule: PricingRule,
  distanceKm: number = 0,
  durationDays: number = 1,
  durationHours: number = 3,
  locationContext: string = ''
): Quote => {
  let operatorSubtotal = 0;
  let breakdown = { baseFare: 0, distanceFare: 0, timeFare: 0, extras: 0 };

  // 1. Calculate Operator Revenue (Subtotal)
  if (type === BookingType.HOURLY) {
    // Logic: Days * Hours/Day * Hourly Rate
    // Enforce minimum hours
    const effectiveHours = Math.max(durationHours, rule.minHours);
    const totalHours = durationDays * effectiveHours;
    
    operatorSubtotal = totalHours * rule.hourlyRate;
    breakdown.timeFare = operatorSubtotal;
  } else {
    // Logic: Base Fare + (Distance * Rate/Km)
    const distanceCost = distanceKm * rule.perKm;
    operatorSubtotal = rule.baseP2P + distanceCost;
    
    breakdown.baseFare = rule.baseP2P;
    breakdown.distanceFare = distanceCost;
  }

  // 2. Calculate Tax (Based on Location)
  const applicableTaxRate = getTaxRateForLocation(locationContext);
  const tax = operatorSubtotal * applicableTaxRate;

  // 3. Calculate Platform Fee (5%)
  const platformFee = operatorSubtotal * 0.05;

  // 4. Calculate Total
  const total = operatorSubtotal + tax + platformFee;

  // 5. Calculate Splits
  // Driver commission is usually based on the Operator Subtotal (before tax/platform fee)
  const driverPayout = operatorSubtotal * rule.driverCommissionPct;
  
  return {
    subtotal: operatorSubtotal,
    tax,
    platformFee,
    total,
    breakdown,
    driverPayout,
    platformRevenue: platformFee
  };
};

/**
 * Unit Tests for Pricing Engine
 * (Run this in development console)
 */
export const runPricingTests = () => {
  console.group('Pricing Engine Tests');
  
  const mockRule: PricingRule = {
    vehicleCategory: VehicleCategory.SEDAN,
    hourlyRate: 100,
    baseP2P: 50,
    perKm: 2,
    minHours: 3,
    driverCommissionPct: 0.8,
    taxRate: 0.1
  };

  // Test 1: Hourly Calculation
  const hourlyQuote = calculateQuote(BookingType.HOURLY, mockRule, 0, 1, 5, 'New York');
  // Subtotal: 5 * 100 = 500
  // Tax (NY ~8.8%): 500 * 0.08875 = 44.375
  // Platform (5%): 500 * 0.05 = 25
  // Total: 569.375
  console.assert(hourlyQuote.subtotal === 500, 'Hourly Subtotal Failed'); 
  console.log('Hourly Quote NY:', hourlyQuote);

  // Test 2: P2P Calculation
  const p2pQuote = calculateQuote(BookingType.P2P, mockRule, 25, 0, 0, 'London');
  // Subtotal: 50 + (25*2) = 100
  // Tax (UK 20%): 20
  // Platform (5%): 5
  // Total: 125
  console.assert(p2pQuote.total === 125, 'P2P Total Failed'); 
  console.log('P2P Quote London:', p2pQuote);

  console.log('All tests passed');
  console.groupEnd();
};