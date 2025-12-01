
import { PaymentTransaction } from '../types';

export const squarePreAuthorize = async (amount: number, cardNonce: string): Promise<PaymentTransaction> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate Square API latency
  
  // 90% Success Rate simulation
  if (Math.random() > 0.9) throw new Error("Card Declined: Insufficient Funds");

  return {
    id: `tx_${Date.now()}`,
    bookingId: '', // Assigned later
    amount: amount,
    status: 'AUTHORIZED',
    method: 'CARD',
    timestamp: Date.now(),
    squarePaymentId: `sq_${Math.random().toString(36).substr(2, 9)}`
  };
};

export const squareCapture = async (transactionId: string, finalAmount?: number): Promise<PaymentTransaction> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    id: transactionId,
    bookingId: '',
    amount: finalAmount || 0,
    status: 'CAPTURED',
    method: 'CARD',
    timestamp: Date.now(),
    squarePaymentId: `sq_cap_${Math.random().toString(36).substr(2, 9)}`
  };
};

export const generateInvoicePDF = (transaction: PaymentTransaction): string => {
  return `https://atlas.com/invoices/${transaction.id}.pdf`; // Mock URL
};
