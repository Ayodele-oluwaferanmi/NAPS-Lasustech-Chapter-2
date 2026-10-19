import { safeGetItem, safeSetItem, safeRemoveItem } from './storage';
import { User, PaymentRecord, FlutterwaveConfig, FlutterwaveTransaction } from '../types';
import { NAPS_LOGO } from '../data/mockData';

// Declare FlutterwaveCheckout global type
declare global {
  interface Window {
    FlutterwaveCheckout?: (options: FlutterwaveOptions) => void;
  }
}

export interface FlutterwaveOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  callback: (data: FlutterwaveCallbackData) => void;
  onclose?: () => void;
  meta?: Record<string, any>;
}

export interface FlutterwaveCallbackData {
  transaction_id: number | string;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending' | string;
  charged_amount?: number;
  customer?: {
    name: string;
    email: string;
    phone_number?: string;
  };
}

export const DEFAULT_FLUTTERWAVE_CONFIG: FlutterwaveConfig = {
  publicKey: (import.meta as any).env?.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-5e8c15a77f98d5c56e07-X',
  isTestMode: true,
  duesAmount: 2000,
  currency: 'NGN',
  bankName: 'Moniepoint MFB / Wema Bank',
  accountNumber: '8123456789',
  accountName: 'National Association of Physics Students - LASUSTECH'
};

export const getSavedFlutterwaveConfig = (): FlutterwaveConfig => {
  try {
    const saved = safeGetItem('naps_flw_config');
    if (saved) {
      return { ...DEFAULT_FLUTTERWAVE_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_FLUTTERWAVE_CONFIG;
};

export const saveFlutterwaveConfig = (config: FlutterwaveConfig): void => {
  try {
    safeSetItem('naps_flw_config', JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Flutterwave config', e);
  }
};

/**
 * Generate unique Flutterwave transaction reference
 */
export const generateFlutterwaveTxRef = (matricNumber: string): string => {
  const cleanMatric = (matricNumber || 'GUEST').replace(/[^a-zA-Z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FLW-NAPS-${cleanMatric}-${timestamp}-${random}`;
};

/**
 * Loads Flutterwave script if not loaded
 */
export const loadFlutterwaveScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.flutterwave.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Convert Flutterwave callback data to NAPS PaymentRecord
 */
export const flutterwaveToPaymentRecord = (
  flwData: FlutterwaveCallbackData,
  student: User,
  session = '2025/2026'
): PaymentRecord => {
  return {
    id: `TX-FLW-${flwData.transaction_id || Date.now()}`,
    reference: flwData.tx_ref,
    matricNumber: student.matricNumber,
    studentName: student.fullName,
    level: student.level,
    session,
    amount: flwData.amount || 2000,
    payment_type: 'Session Dues & Lab Clearance (Flutterwave)',
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    created_at: new Date().toISOString(),
    status: 'Successful',
    flwRef: flwData.flw_ref || `FLW-MOCK-${Math.floor(100000 + Math.random() * 900000)}`,
    paymentMethod: 'Flutterwave Gateway'
  };
};
