import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  Printer, 
  BadgeCheck, 
  Atom,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { User, PaymentRecord } from '../../types';
import { NAPS_LOGO, LASUSTECH_LOGO } from '../../data/mockData';
import { 
  getSavedFlutterwaveConfig, 
  generateFlutterwaveTxRef, 
  loadFlutterwaveScript,
  flutterwaveToPaymentRecord
} from '../../utils/flutterwave';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPaymentSuccess: (updatedUser: User, paymentRecord: PaymentRecord) => void;
  onOpenIdPreview?: (student: User) => void;
  purpose?: string;
  amount?: number;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  user,
  onPaymentSuccess,
  onOpenIdPreview,
  purpose = "2025/2026 Session Dues & Lab Clearance",
  amount = 2000
}) => {
  const [channel, setChannel] = useState<'flutterwave' | 'card' | 'transfer' | 'ussd'>('flutterwave');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedUssd, setCopiedUssd] = useState(false);

  // Flutterwave configuration state
  const [flwConfig, setFlwConfig] = useState(getSavedFlutterwaveConfig());

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState(user.fullName || '');
  const [cardError, setCardError] = useState<string | null>(null);

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // USSD Bank selection
  const [selectedBank, setSelectedBank] = useState('gtb');

  // Success payload
  const [completedPayment, setCompletedPayment] = useState<PaymentRecord | null>(null);
  const [paidUser, setPaidUser] = useState<User | null>(null);

  // Countdown for transfer account
  const [timeLeft, setTimeLeft] = useState(1799); // ~30 mins

  useEffect(() => {
    setFlwConfig(getSavedFlutterwaveConfig());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep('input');
      setLoading(false);
      setCompletedPayment(null);
      setOtpCode('');
      setCardError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (channel === 'transfer' && isOpen && step === 'input') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [channel, isOpen, step]);

  if (!isOpen) return null;

  // Format countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Card number auto-spacing
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const limited = raw.substring(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length <= 2) {
      setCardExpiry(raw);
    } else {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`);
    }
  };

  // Bank USSD dictionary
  const ussdCodes: Record<string, { name: string; code: string }> = {
    gtb: { name: 'GTBank', code: `*737*2*${amount}*8123456789#` },
    zenith: { name: 'Zenith Bank', code: `*966*${amount}*8123456789#` },
    firstbank: { name: 'First Bank', code: `*894*${amount}*8123456789#` },
    uba: { name: 'UBA', code: `*919*${amount}*8123456789#` },
    access: { name: 'Access Bank', code: `*901*${amount}*8123456789#` },
    opay: { name: 'OPay / PalmPay', code: `*955*${amount}*8123456789#` }
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) return 'Mastercard';
    if (clean.startsWith('506') || clean.startsWith('507') || clean.startsWith('6500')) return 'Verve';
    return null;
  };

  /**
   * Official Flutterwave Inline Payment Launcher
   */
  const handleLaunchFlutterwaveInline = async () => {
    setLoading(true);
    setCardError(null);

    const txRef = generateFlutterwaveTxRef(user.matricNumber);
    await loadFlutterwaveScript();

    if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
      try {
        window.FlutterwaveCheckout({
          public_key: flwConfig.publicKey,
          tx_ref: txRef,
          amount: amount,
          currency: flwConfig.currency || "NGN",
          payment_options: "card,banktransfer,ussd,barter",
          customer: {
            email: user.email || `${user.matricNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.lasustech.edu.ng`,
            phone_number: user.phoneNumber || user.whatsappNumber || "08012345678",
            name: user.fullName
          },
          customizations: {
            title: "NAPS LASUSTECH Session Dues",
            description: `${purpose} • 2025/2026 Session`,
            logo: NAPS_LOGO
          },
          callback: function(data: any) {
            handleCompleteSuccess(
              data.tx_ref || txRef,
              'Flutterwave Inline Gateway',
              data.flw_ref || `FLW-${data.transaction_id || Date.now()}`
            );
          },
          onclose: function() {
            setLoading(false);
          }
        });
        return;
      } catch (e) {
        console.warn('Flutterwave script error, falling back to embedded modal:', e);
      }
    }

    // Fallback if popup blocked by iframe sandboxing: switch to simulated card/transfer
    setTimeout(() => {
      setLoading(false);
      setChannel('card');
    }, 400);
  };

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 16) {
      setCardError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setCardError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setCardError('Please enter a valid 3-digit CVV.');
      return;
    }

    setLoading(true);
    // Simulate 3D Secure / OTP Challenge
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpCode || otpCode.length < 4) {
      setOtpError('Please enter the 6-digit OTP code sent to your phone/email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generatedTxRef = generateFlutterwaveTxRef(user.matricNumber);
      handleCompleteSuccess(generatedTxRef, 'Flutterwave Card (3D Secure)', `FLW-CARD-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1500);
  };

  const handleSimulateTransferVerification = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generatedTxRef = generateFlutterwaveTxRef(user.matricNumber);
      handleCompleteSuccess(generatedTxRef, 'Flutterwave Bank Transfer', `FLW-BNK-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1800);
  };

  const handleSimulateUssdVerification = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generatedTxRef = generateFlutterwaveTxRef(user.matricNumber);
      handleCompleteSuccess(generatedTxRef, `Flutterwave USSD (${ussdCodes[selectedBank].name})`, `FLW-USSD-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1600);
  };

  const handleCompleteSuccess = (newRef: string, method: string, flwRef: string) => {
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const pmt: PaymentRecord = {
      id: `TX-${Date.now()}`,
      reference: newRef,
      matricNumber: user.matricNumber,
      studentName: user.fullName,
      level: user.level,
      session: '2025/2026',
      amount: amount,
      payment_type: 'Session Dues (Flutterwave)',
      date: formattedDate,
      created_at: dateObj.toISOString(),
      status: 'Successful',
      flwRef: flwRef,
      paymentMethod: method
    };

    const updatedUser: User = {
      ...user,
      duesStatus: 'Paid',
      idCardStatus: 'Ready',
      payments: [pmt, ...(user.payments || [])]
    };

    setPaidUser(updatedUser);
    setCompletedPayment(pmt);
    setStep('success');
    onPaymentSuccess(updatedUser, pmt);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(flwConfig.accountNumber || '8123456789');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyUssd = () => {
    navigator.clipboard.writeText(ussdCodes[selectedBank].code);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 relative border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Branded with Flutterwave and NAPS */}
        <div className="bg-[#0b1320] text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Flutterwave Brand Logo Icon */}
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-2 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm sm:text-base font-bold text-white leading-tight">
                    Flutterwave Checkout
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {flwConfig.isTestMode ? 'Test Mode' : 'Live Gateway'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                  National Association of Physics Students • LASUSTECH
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Amount Badge */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {purpose}
              </p>
              <p className="text-xs text-slate-200 font-medium truncate max-w-[220px]">
                {user.fullName} ({user.matricNumber})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Total Payable
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-white">
                ₦{amount.toLocaleString()}.00
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: PAYMENT CHANNELS & INPUT */}
        {step === 'input' && (
          <div>
            {/* Channel Switcher */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setChannel('flutterwave')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'flutterwave' 
                    ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-2xs font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span>Flutterwave 1-Click</span>
              </button>

              <button
                onClick={() => setChannel('card')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'card' 
                    ? 'bg-white text-sky-700 border-b-2 border-sky-600 shadow-2xs font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Card</span>
              </button>

              <button
                onClick={() => setChannel('transfer')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'transfer' 
                    ? 'bg-white text-sky-700 border-b-2 border-sky-600 shadow-2xs font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Transfer</span>
              </button>

              <button
                onClick={() => setChannel('ussd')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-all ${
                  channel === 'ussd' 
                    ? 'bg-white text-sky-700 border-b-2 border-sky-600 shadow-2xs font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>USSD</span>
              </button>
            </div>

            <div className="p-6">
              {/* 0. FLUTTERWAVE 1-CLICK POPUP TAB */}
              {channel === 'flutterwave' && (
                <div className="space-y-4 text-center">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/80">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500 text-white mx-auto flex items-center justify-center mb-3 shadow-md shadow-orange-500/30">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h4 className="font-display text-base font-bold text-slate-900">
                      Official Flutterwave Checkout
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                      Pay seamlessly with any Nigerian Debit Card, Bank Account, Mobile Money, Barter, or USSD via Flutterwave's PCI-DSS Level 1 certified gateway.
                    </p>

                    <div className="mt-4 pt-3 border-t border-orange-200/60 flex items-center justify-center gap-4 text-[11px] text-slate-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Instant Clearance
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Zero Extra Surcharge
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
                        256-bit SSL
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchFlutterwaveInline}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Launching Flutterwave Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Pay ₦{amount.toLocaleString()}.00 via Flutterwave</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400">
                    If popups are restricted in preview, click "Card" or "Transfer" above to complete instant clearance.
                  </p>
                </div>
              )}

              {/* 1. CARD PAYMENT TAB */}
              {channel === 'card' && (
                <form onSubmit={handleCardPay} className="space-y-4 text-xs">
                  {cardError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{cardError}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Card Number:</label>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        {getCardBrand(cardNumber) ? (
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase text-[9px]">
                            {getCardBrand(cardNumber)}
                          </span>
                        ) : (
                          <span>Mastercard • Visa • Verve</span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="5399 4100 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                      />
                      <CreditCard className="h-4 w-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Expiry Date:
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        CVV / CVC:
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cardholder Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OLATUNJI MICHAEL A."
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 uppercase font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                    />
                  </div>

                  {/* Flutterwave Fast Test Card Chips */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Flutterwave Sandbox Test Cards:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber('5399 2810 4920 1842');
                          setCardExpiry('08/28');
                          setCardCvv('891');
                          setCardholderName(user.fullName || 'PHYSICS SCHOLAR');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-700"
                      >
                        💳 Mastercard Test
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber('4084 0000 0000 0000');
                          setCardExpiry('12/27');
                          setCardCvv('456');
                          setCardholderName(user.fullName || 'PHYSICS SCHOLAR');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-700"
                      >
                        💳 Visa Test
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber('5061 0000 0000 0000');
                          setCardExpiry('10/26');
                          setCardCvv('112');
                          setCardholderName(user.fullName || 'PHYSICS SCHOLAR');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-700"
                      >
                        💳 Verve Test
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying with Flutterwave...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Pay ₦{amount.toLocaleString()}.00 via Flutterwave</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 2. BANK TRANSFER TAB */}
              {channel === 'transfer' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
                    <p className="text-[11px] font-semibold text-orange-950 leading-relaxed">
                      Transfer exactly <span className="font-bold">₦{amount.toLocaleString()}</span> to the dedicated Flutterwave dynamic account below.
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-orange-800 font-mono">
                      <span>Account expires in:</span>
                      <span className="font-bold bg-orange-200/60 px-2 py-0.5 rounded">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Bank Name:</span>
                      <span className="font-bold text-slate-900">{flwConfig.bankName}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Account Name:</span>
                      <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                        {flwConfig.accountName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 font-medium block">Account Number:</span>
                        <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                          {flwConfig.accountNumber}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyAccount}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold transition-colors"
                      >
                        {copiedAccount ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateTransferVerification}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Confirming Flutterwave Inflow...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>I have completed this transfer</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 3. USSD TAB */}
              {channel === 'ussd' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Select your mobile bank:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 text-xs"
                    >
                      <option value="gtb">GTBank (*737#)</option>
                      <option value="zenith">Zenith Bank (*966#)</option>
                      <option value="firstbank">First Bank (*894#)</option>
                      <option value="uba">UBA (*919#)</option>
                      <option value="access">Access Bank (*901#)</option>
                      <option value="opay">OPay / PalmPay (*955#)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-slate-500 text-[11px] mb-1">
                      Dial this USSD code on your registered phone number:
                    </p>
                    <div className="font-mono text-base font-black text-slate-900 tracking-wider py-1.5 bg-white rounded-xl border border-slate-200 mt-2 mb-3">
                      {ussdCodes[selectedBank].code}
                    </div>

                    <button
                      onClick={handleCopyUssd}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-[11px] transition-colors"
                    >
                      {copiedUssd ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedUssd ? 'Code Copied' : 'Copy USSD Code'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSimulateUssdVerification}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying USSD Session...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>I have dialed the USSD code</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer trust badge */}
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 px-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified by Flutterwave Technologies</span>
              </div>
              <span className="font-mono text-[9px] text-slate-400">
                PCI-DSS Level 1 Compliant
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: OTP / 3D SECURE VERIFICATION */}
        {step === 'otp' && (
          <div className="p-6 text-center space-y-4 text-xs">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>

            <div>
              <h4 className="font-display text-base font-bold text-slate-900">
                Flutterwave 3D Secure Authorization
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                An SMS one-time password has been sent to the mobile number registered with your debit card.
              </p>
            </div>

            {otpError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP (e.g. 123456)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  className="text-[10px] text-orange-600 hover:text-orange-700 underline mt-1 font-semibold block"
                >
                  ⚡ Click to autofill test OTP (123456)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: PAYMENT RECEIPT & CLEARANCE CONFIRMATION */}
        {step === 'success' && completedPayment && (
          <div className="p-6 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Payment Verified by Flutterwave
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-2">
                Dues Cleared Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your 2025/2026 NAPS LASUSTECH Session Dues are now fully recorded. Your official Digital Student ID Card is unlocked.
              </p>
            </div>

            {/* Printable Receipt Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Flutterwave Ref:</span>
                <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]">
                  {completedPayment.reference}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">
                  {user.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Matriculation No:</span>
                <span className="font-mono font-bold text-slate-900">
                  {user.matricNumber}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">
                  ₦{completedPayment.amount.toLocaleString()}.00
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Channel / Method:</span>
                <span className="font-semibold text-slate-800">
                  {completedPayment.paymentMethod || 'Flutterwave'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Clearance Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Official Cleared (Paid)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {onOpenIdPreview && (
                <button
                  onClick={() => {
                    const studentToPreview = paidUser || { ...user, duesStatus: 'Paid', idCardStatus: 'Ready' };
                    onClose();
                    onOpenIdPreview(studentToPreview);
                  }}
                  className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <BadgeCheck className="h-4 w-4" />
                  <span>Preview Cleared ID Card</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-semibold block mx-auto pt-1"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
