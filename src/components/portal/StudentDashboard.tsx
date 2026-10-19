import React, { useState } from 'react';
import { User, PaymentRecord, PhysicsDiscipline } from '../../types';
import { 
  LayoutDashboard, 
  CreditCard, 
  BadgeCheck, 
  User as UserIcon, 
  Receipt, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  ExternalLink,
  Edit3,
  Save,
  Clock,
  Atom
} from 'lucide-react';
import { NAPS_LOGO, LASUSTECH_LOGO } from '../../data/mockData';

interface StudentDashboardProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  initialTab?: string;
  onOpenPaymentModal?: (student: User) => void;
  onOpenIdPreviewModal?: (student: User) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onUpdateUser,
  initialTab = 'overview',
  onOpenPaymentModal,
  onOpenIdPreviewModal
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [payingDues, setPayingDues] = useState<boolean>(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Edit profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    level: user.level,
    discipline: user.discipline
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePayDues = () => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal(user);
      return;
    }
    setPayingDues(true);
    setTimeout(() => {
      setPayingDues(false);
      const newPayment: PaymentRecord = {
        id: `TX-${Date.now()}`,
        reference: `NAPS-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: 2000,
        session: '2025/2026',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'Successful',
        paymentMethod: 'Card / Bank Transfer'
      };

      const updatedUser: User = {
        ...user,
        duesStatus: 'Paid',
        idCardStatus: 'Ready',
        payments: [newPayment, ...(user.payments || [])]
      };

      onUpdateUser(updatedUser);
      setPaymentSuccessMessage('2025/2026 Session Dues paid successfully! Your Digital NAPS ID Card is now cleared and activated.');
      setTimeout(() => setPaymentSuccessMessage(null), 4000);
    }, 1500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      ...profileForm
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Top Banner */}
      <div className="bg-[#08111d] text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-sky-500/50"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-sky-700 flex items-center justify-center font-bold text-2xl text-white">
                {user.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {user.fullName}
                </h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  user.duesStatus === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {user.duesStatus === 'Paid' ? 'Cleared (Paid)' : 'Dues Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Matric: <span className="font-mono text-slate-200">{user.matricNumber}</span> • {user.discipline} ({user.level})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('idcard')}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 shadow-sm transition-all"
            >
              <BadgeCheck className="h-4 w-4" />
              <span>View Digital ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'dues', label: 'Session Dues & Clearance', icon: CreditCard },
            { id: 'idcard', label: 'Digital Student ID', icon: BadgeCheck },
            { id: 'receipts', label: 'Payment Receipts', icon: Receipt },
            { id: 'profile', label: 'My Profile', icon: UserIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Feedback Banner */}
        {paymentSuccessMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{paymentSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Current Session</span>
                <p className="font-display text-xl font-bold text-slate-900 mt-1">2025/2026</p>
                <span className="text-[10px] text-sky-600 font-medium">Harmattan Semester</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Dues Status</span>
                <p className={`font-display text-xl font-bold mt-1 ${
                  user.duesStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {user.duesStatus === 'Paid' ? 'Cleared (Paid)' : 'Pending'}
                </p>
                <span className="text-[10px] text-slate-500">₦2,000 Annual Chapter Fee</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Digital ID Card</span>
                <p className="font-display text-xl font-bold text-slate-900 mt-1">
                  {user.duesStatus === 'Paid' ? 'Active & Valid' : 'Requires Dues'}
                </p>
                <span className="text-[10px] text-sky-600 font-medium">QR Verified</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Chapter Role</span>
                <p className="font-display text-xl font-bold text-slate-900 mt-1">
                  {user.post || 'Physics Scholar'}
                </p>
                <span className="text-[10px] text-slate-500">{user.level}</span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Member Checklist & Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setActiveTab('dues')}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-500/40 cursor-pointer transition-all flex items-start gap-3"
                >
                  <CreditCard className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">1. Departmental Dues Clearance</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay your mandatory ₦2,000 session dues to be cleared for departmental exams and events.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('idcard')}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-500/40 cursor-pointer transition-all flex items-start gap-3"
                >
                  <BadgeCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">2. Generate NAPS Digital ID</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      View your official digital ID card with QR code verification and security hologram.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DUES CLEARANCE */}
        {activeTab === 'dues' && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
                    Departmental Finance
                  </span>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                    2025/2026 Session Dues
                  </h3>
                </div>
                <span className="text-2xl font-extrabold text-sky-600">
                  ₦2,000
                </span>
              </div>

              {/* Status Notice */}
              {user.duesStatus === 'Paid' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">You Are Fully Cleared!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Your annual chapter dues for the 2025/2026 session have been confirmed. You can download your official clearance receipt below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Payment Required</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Your dues for the current session are unpaid. Complete payment now to activate your digital student ID and departmental privileges.
                    </p>
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-800">Fee Allocation Breakdown:</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>NAPS National Body Remittance</span>
                    <span className="font-semibold">₦500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Chapter Operations & Student Welfare</span>
                    <span className="font-semibold">₦500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Physics Lab Apparatus & Symposia</span>
                    <span className="font-semibold">₦1,000.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Session Dues</span>
                    <span>₦2,000.00</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {user.duesStatus !== 'Paid' ? (
                <button
                  onClick={handlePayDues}
                  disabled={payingDues}
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {payingDues ? (
                    <span>Processing Payment Gateway...</span>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay ₦2,000 via Online Gateway</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('receipts')}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  <span>View & Download Clearance Receipt</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL STUDENT ID CARD */}
        {activeTab === 'idcard' && (
          <div className="mt-6 space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Official Credential
              </span>
              <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
                Digital NAPS Chapter ID Card
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Present this digital credential for campus laboratory admission, Physics Week events, and academic voting.
              </p>
            </div>

            {/* Print / Download / Interactive 3D Controls */}
            <div className="flex flex-wrap justify-center items-center gap-3 print:hidden">
              {onOpenIdPreviewModal && (
                <button
                  onClick={() => onOpenIdPreviewModal(user)}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 text-white text-xs font-bold px-5 py-2.5 hover:bg-sky-500 transition-all shadow-md active:scale-95"
                >
                  <BadgeCheck className="h-4 w-4" />
                  <span>Open Full Card Preview & 3D Flip</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white text-xs font-bold px-5 py-2.5 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save as PDF</span>
              </button>
              {user.duesStatus !== 'Paid' && onOpenPaymentModal && (
                <button
                  onClick={() => onOpenPaymentModal(user)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 hover:bg-emerald-500 transition-all shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay ₦2,000 to Activate ID</span>
                </button>
              )}
            </div>

            {/* DUAL-SIDED ID CARD LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center max-w-3xl mx-auto">
              {/* FRONT SIDE */}
              <div className="relative w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-sky-950 via-slate-950 to-blue-950 text-white p-5 shadow-2xl overflow-hidden border border-sky-500/30 flex flex-col justify-between">
                {/* Background watermarks */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Top header */}
                <div className="relative z-10 flex items-center justify-between border-b border-sky-500/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <img src={NAPS_LOGO} alt="NAPS" className="h-7 w-auto object-contain" />
                    <img src={LASUSTECH_LOGO} alt="LASUSTECH" className="h-7 w-auto object-contain" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                      NAPS LASUSTECH
                    </p>
                    <p className="text-[8px] uppercase tracking-wider text-slate-300">
                      Physics Student Identity Card
                    </p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="relative z-10 flex items-center gap-4 py-2">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-800 border-2 border-sky-400/60 shrink-0 shadow-md">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-sky-700 flex items-center justify-center text-xl font-bold text-white">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 leading-tight flex-1">
                    <p className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-tight line-clamp-1">
                      {user.fullName}
                    </p>
                    <p className="text-[9px] font-mono text-sky-300">
                      MATRIC: {user.matricNumber}
                    </p>
                    <p className="text-[9px] text-slate-300">
                      STREAM: {user.discipline}
                    </p>
                    <p className="text-[9px] text-slate-300">
                      LEVEL: {user.level}
                    </p>
                    <div className="pt-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-sky-500 text-slate-950 px-2 py-0.5 rounded-full">
                        {user.post || 'PHYSICS SCHOLAR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-sky-500/30 text-[8px] text-slate-400">
                  <span>VALID: 2025/2026 SESSION</span>
                  <span className="font-mono">ID: {user.matricNumber}-NAPS</span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="relative w-full aspect-[1.58/1] rounded-2xl bg-white text-slate-900 p-5 shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-700">
                      Terms of Identification
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono">
                      LASUSTECH CHAPTER
                    </span>
                  </div>

                  <ul className="text-[8px] text-slate-500 mt-2 space-y-1 list-disc list-inside leading-tight">
                    <li>This card remains property of NAPS LASUSTECH Chapter.</li>
                    <li>Valid only for registered students with cleared session dues.</li>
                    <li>If found, please return to the Department of Physics Secretariat.</li>
                    <li>Email: napslasustech@gmail.com</li>
                  </ul>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                  {/* QR Code */}
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg">
                      <QrCode className="h-10 w-10 text-slate-800" />
                    </div>
                    <div className="text-[8px] text-slate-400">
                      <p className="font-bold text-slate-700">Scan to Verify</p>
                      <p>Official Digital Token</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="text-right">
                    <div className="font-serif italic text-xs text-slate-800 border-b border-slate-400 pb-0.5 px-2 inline-block">
                      Adeyemi Taiwo
                    </div>
                    <p className="text-[7px] text-slate-400 uppercase font-bold mt-0.5">
                      NAPS Chapter President
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECEIPTS */}
        {activeTab === 'receipts' && (
          <div className="mt-6 max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
                Official Payment History
              </h3>

              {(!user.payments || user.payments.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No payment records found yet. Pay your session dues to generate clearance slips.
                </div>
              ) : (
                <div className="space-y-4">
                  {(user.payments || []).map((pmt) => (
                    <div
                      key={pmt.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            Session Dues ({pmt.session})
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            {pmt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Ref: {pmt.reference} • {pmt.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-base text-slate-900">
                          ₦{pmt.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={handlePrint}
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                          title="Print Receipt"
                        >
                          <Download className="h-4 w-4 text-sky-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE EDIT */}
        {activeTab === 'profile' && (
          <div className="mt-6 max-w-xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
              <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                Edit Student Profile
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Update your contact details and academic track.
              </p>

              {saveSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Academic Level:
                    </label>
                    <select
                      value={profileForm.level}
                      onChange={(e) => setProfileForm({ ...profileForm, level: e.target.value as never })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    >
                      <option>100 Level</option>
                      <option>200 Level</option>
                      <option>300 Level</option>
                      <option>400 Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Physics Stream:
                    </label>
                    <select
                      value={profileForm.discipline}
                      onChange={(e) => setProfileForm({ ...profileForm, discipline: e.target.value as never })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    >
                      <option>Theoretical Physics</option>
                      <option>Applied Geophysics</option>
                      <option>Radiation & Medical Physics</option>
                      <option>Renewable Energy & Materials</option>
                      <option>Electronics & Instrumentation</option>
                      <option>Astrophysics & Space Science</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile Changes</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
