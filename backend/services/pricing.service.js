// Pricing calculation service
export const calculateQuote = async (params) => {
  const {
    type,
    vehicleCategory,
    distanceKm = 0,
    durationHours = 3,
    durationDays = 1,
    locationContext = ''
  } = params;

  // Base pricing rules (should match frontend constants)
  const PRICING_RULES = {
    'Luxury Sedan': { hourlyRate: 95, baseP2P: 125, perKm: 2.35, minHours: 3, driverCommissionPct: 0.75 },
    'Luxury SUV': { hourlyRate: 125, baseP2P: 160, perKm: 2.95, minHours: 3, driverCommissionPct: 0.75 },
    'Executive Sprinter': { hourlyRate: 175, baseP2P: 250, perKm: 3.40, minHours: 4, driverCommissionPct: 0.70 },
    'First Class Limo': { hourlyRate: 225, baseP2P: 350, perKm: 4.00, minHours: 4, driverCommissionPct: 0.80 }
  };

  const rule = PRICING_RULES[vehicleCategory] || PRICING_RULES['Luxury Sedan'];

  let operatorSubtotal = 0;
  let breakdown = { baseFare: 0, distanceFare: 0, timeFare: 0 };

  if (type === 'Hourly Charter') {
    const effectiveHours = Math.max(durationHours, rule.minHours);
    const totalHours = durationDays * effectiveHours;
    operatorSubtotal = totalHours * rule.hourlyRate;
    breakdown.timeFare = operatorSubtotal;
  } else {
    const distanceCost = distanceKm * rule.perKm;
    operatorSubtotal = rule.baseP2P + distanceCost;
    breakdown.baseFare = rule.baseP2P;
    breakdown.distanceFare = distanceCost;
  }

  // Tax calculation (simplified - should use proper tax API)
  const taxRate = getTaxRateForLocation(locationContext);
  const tax = operatorSubtotal * taxRate;

  // Platform fee (5%)
  const platformFee = operatorSubtotal * 0.05;

  // Total
  const total = operatorSubtotal + tax + platformFee;

  // Driver payout
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

const getTaxRateForLocation = (location) => {
  if (!location) return 0.05;
  
  const lower = location.toLowerCase();
  
  if (lower.includes('ny') || lower.includes('new york') || lower.includes('manhattan')) return 0.08875;
  if (lower.includes('ca') || lower.includes('california') || lower.includes('los angeles')) return 0.095;
  if (lower.includes('fl') || lower.includes('florida') || lower.includes('miami')) return 0.07;
  if (lower.includes('tx') || lower.includes('texas')) return 0.0825;
  if (lower.includes('london') || lower.includes('uk')) return 0.20;
  if (lower.includes('dubai') || lower.includes('uae')) return 0.05;
  
  return 0.05;
};

export default { calculateQuote };
