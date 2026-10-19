import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  RotateCw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Upload, 
  QrCode, 
  BadgeCheck, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles,
  Camera
} from 'lucide-react';
import { User } from '../../types';
import { NAPS_LOGO, LASUSTECH_LOGO } from '../../data/mockData';

interface IdCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User;
  allStudents?: User[];
  onSelectStudent?: (student: User) => void;
  onOpenPayment?: (student: User) => void;
  onUpdatePhoto?: (studentId: string, newPhotoUrl: string) => void;
}

export const IdCardPreviewModal: React.FC<IdCardPreviewModalProps> = ({
  isOpen,
  onClose,
  student,
  allStudents = [],
  onSelectStudent,
  onOpenPayment,
  onUpdatePhoto
}) => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [copiedMatric, setCopiedMatric] = useState(false);
  const [searchMatric, setSearchMatric] = useState('');

  // Resolve freshest student data from allStudents so updates propagate immediately
  const activeStudent = allStudents.find((s) => 
    s.id === student.id || 
    s.matricNumber.trim().toUpperCase() === student.matricNumber.trim().toUpperCase()
  ) || student;

  if (!isOpen) return null;

  const handleFlip = () => {
    setSide((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMatric = () => {
    navigator.clipboard.writeText(activeStudent.matricNumber);
    setCopiedMatric(true);
    setTimeout(() => setCopiedMatric(false), 2000);
  };

  // Handle local passport photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdatePhoto(activeStudent.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchMatric.trim() || !onSelectStudent) return;
    const found = allStudents.find(
      (s) => 
        s.matricNumber.toLowerCase().includes(searchMatric.trim().toLowerCase()) ||
        s.fullName.toLowerCase().includes(searchMatric.trim().toLowerCase())
    );
    if (found) {
      onSelectStudent(found);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[105] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl rounded-3xl bg-slate-900 text-white shadow-2xl p-6 sm:p-8 border border-slate-800 my-auto animate-in zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                Official Credential Preview
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                activeStudent.duesStatus === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {activeStudent.duesStatus === 'Paid' ? 'Verified Member' : 'Dues Unpaid'}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
              NAPS Digital Student ID Card
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Matric Student Switcher (If multiple students available) */}
        {allStudents.length > 0 && onSelectStudent && (
          <div className="mt-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 whitespace-nowrap font-medium text-[11px]">
                Preview Roster:
              </span>
              <select
                value={activeStudent.id}
                onChange={(e) => {
                  const target = allStudents.find((s) => s.id === e.target.value);
                  if (target) onSelectStudent(target);
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-sky-500 max-w-[220px] truncate"
              >
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.matricNumber.split('/').pop() || s.matricNumber}) - {s.duesStatus}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearchSelect} className="flex items-center gap-1.5 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search Matric / Name..."
                value={searchMatric}
                onChange={(e) => setSearchMatric(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-sky-500 w-full sm:w-44"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0"
              >
                Find
              </button>
            </form>
          </div>
        )}

        {/* Dues Status Banner if unpaid */}
        {activeStudent.duesStatus !== 'Paid' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-amber-200 text-[11px]">
                This student has not paid the mandatory ₦2,000 session dues. QR security verification will remain unverified until cleared.
              </p>
            </div>
            {onOpenPayment && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPayment(activeStudent);
                }}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm transition-all shrink-0"
              >
                Pay ₦2,000 Dues
              </button>
            )}
          </div>
        )}

        {/* INTERACTIVE ID CARD CONTAINER */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md aspect-[1.58/1] perspective-1000">
            {/* FRONT OF ID CARD */}
            {side === 'front' && (
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-950 via-[#071322] to-sky-950 text-white p-4 sm:p-5 shadow-2xl border-2 border-sky-500/30 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
                {/* Holographic shimmer effect */}
                <div className="absolute top-0 -right-16 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Top Branding Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-sky-500/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <img src={NAPS_LOGO} alt="NAPS" className="h-7 sm:h-8 w-auto object-contain drop-shadow" />
                    <img src={LASUSTECH_LOGO} alt="LASUSTECH" className="h-7 sm:h-8 w-auto object-contain drop-shadow" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-sky-400">
                      NAPS LASUSTECH
                    </p>
                    <p className="text-[8px] uppercase tracking-wider text-slate-300">
                      Department of Physics
                    </p>
                  </div>
                </div>

                {/* Card Middle: Passport & Info */}
                <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 my-auto">
                  {/* Photo Container */}
                  <div className="relative group shrink-0">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-800 border-2 border-sky-400 shadow-lg">
                      {activeStudent.profileImage ? (
                        <img 
                          src={activeStudent.profileImage} 
                          alt={activeStudent.fullName} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full bg-sky-700 flex items-center justify-center font-bold text-2xl text-white">
                          {activeStudent.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Change Photo Upload Trigger */}
                    {onUpdatePhoto && (
                      <label className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] text-white cursor-pointer transition-opacity">
                        <Camera className="h-4 w-4 mb-0.5 text-sky-400" />
                        <span>Change</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5 sm:space-y-1 leading-tight flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                      {activeStudent.fullName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-sky-300">
                      <span>MATRIC: {activeStudent.matricNumber}</span>
                      <button 
                        onClick={handleCopyMatric} 
                        className="text-slate-400 hover:text-white"
                        title="Copy Matric"
                      >
                        {copiedMatric ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                      </button>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-300 truncate">
                      STREAM: {activeStudent.discipline}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-300">
                      LEVEL: {activeStudent.level}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider bg-sky-500 text-slate-950 px-2 py-0.5 rounded-full">
                        {activeStudent.post || 'PHYSICS SCHOLAR'}
                      </span>
                      {activeStudent.duesStatus === 'Paid' && (
                        <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>CLEARED</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Bar */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-sky-500/30 text-[8px] text-slate-400">
                  <span className="font-semibold text-slate-300">VALID: 2025/2026 SESSION</span>
                  <span className="font-mono text-sky-400">ID: {activeStudent.matricNumber.split('/').pop() || 'NAPS-26'}</span>
                </div>
              </div>
            )}

            {/* BACK OF ID CARD */}
            {side === 'back' && (
              <div className="relative w-full h-full rounded-2xl bg-white text-slate-900 p-4 sm:p-5 shadow-2xl border-2 border-slate-200 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-sky-700">
                    Terms & Verification
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono font-bold">
                    LASUSTECH CHAPTER
                  </span>
                </div>

                {/* Terms Body */}
                <ul className="text-[8px] sm:text-[9px] text-slate-600 space-y-1 list-disc list-inside leading-snug">
                  <li>This card remains the official property of NAPS LASUSTECH Chapter.</li>
                  <li>Valid for registered students who have fulfilled 2025/2026 session dues.</li>
                  <li>Entitles bearer to physics laboratory access, library, and chapter voting.</li>
                  <li>If found, please return to Department of Physics, Faculty of Science.</li>
                  <li>Email: napslasustech@gmail.com • www.napslasustech.org.ng</li>
                </ul>

                {/* Verification Footer */}
                <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                  {/* QR Code & Scan Token */}
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg">
                      <QrCode className="h-9 w-9 text-slate-900" />
                    </div>
                    <div className="text-[7.5px] text-slate-400 leading-tight">
                      <p className="font-bold text-slate-800">
                        {activeStudent.duesStatus === 'Paid' ? 'Verified Token' : 'Pending Clearance'}
                      </p>
                      <p className="font-mono text-sky-700">
                        {activeStudent.duesStatus === 'Paid' ? 'AUTHENTIC-OK' : 'UNPAID'}
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="text-right">
                    <div className="font-serif italic text-[11px] sm:text-xs text-slate-800 border-b border-slate-400 pb-0.5 px-2 inline-block">
                      Olatunji Michael A.
                    </div>
                    <p className="text-[7px] text-slate-400 uppercase font-bold mt-0.5">
                      Chapter President
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs">
          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
          >
            <RotateCw className="h-4 w-4 text-sky-400" />
            <span>Flip to {side === 'front' ? 'Back' : 'Front'} Side</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>Print ID Card</span>
          </button>

          {onUpdatePhoto && (
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700 cursor-pointer">
              <Upload className="h-4 w-4 text-sky-400" />
              <span>Upload Passport</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          )}

          {activeStudent.duesStatus !== 'Paid' && onOpenPayment && (
            <button
              onClick={() => {
                onClose();
                onOpenPayment(activeStudent);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md transition-all active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay ₦2,000 Dues to Activate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
