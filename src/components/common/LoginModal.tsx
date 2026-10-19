import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Shield,
  Clock,
  Check,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { NAPS_LOGO } from '../../data/mockData';
import { User as UserType, PhysicsDiscipline, AcademicLevel } from '../../types';
import { 
  apiLogin, 
  apiRegister, 
  apiForgotPassword, 
  apiResetPassword, 
  apiCheckAdminStatus, 
  apiSetupAdmin 
} from '../../utils/authClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType, targetTab?: string) => void;
  targetTab?: string;
  initialMode?: 'student' | 'admin' | 'register' | 'forgot';
  onRegisterUser?: (newUser: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetTab = 'overview',
  initialMode = 'student',
  onRegisterUser
}) => {
  const [mode, setMode] = useState<'student' | 'admin' | 'register' | 'forgot' | 'reset' | 'setup-admin'>(initialMode);
  
  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields
  const [regFullName, setRegFullName] = useState('');
  const [regMatric, setRegMatric] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLevel, setRegLevel] = useState<AcademicLevel>('100 Level');
  const [regDiscipline, setRegDiscipline] = useState<PhysicsDiscipline>('Physics (General)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot / Reset Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [previewTokenHint, setPreviewTokenHint] = useState<string | null>(null);

  // Initial Admin Setup fields
  const [adminSetupName, setAdminSetupName] = useState('');
  const [adminSetupEmail, setAdminSetupEmail] = useState('');
  const [adminSetupMatric, setAdminSetupMatric] = useState('');
  const [adminSetupPhone, setAdminSetupPhone] = useState('');
  const [adminSetupPassword, setAdminSetupPassword] = useState('');
  const [adminSetupConfirmPassword, setAdminSetupConfirmPassword] = useState('');
  const [adminSetupSecret, setAdminSetupSecret] = useState('');
  const [hasExistingAdmin, setHasExistingAdmin] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Check admin status whenever modal opens
  useEffect(() => {
    if (isOpen) {
      apiCheckAdminStatus().then(({ hasAdmin }) => {
        setHasExistingAdmin(hasAdmin);
        if (!hasAdmin && initialMode === 'admin') {
          setMode('setup-admin');
        } else {
          setMode(initialMode);
        }
      });
      setError(null);
      setSuccessInfo(null);
      setIdentifier('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Real-time password strength computation
  const computePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak (needs 8+ chars & mixed characters)', color: 'bg-rose-500', width: 'w-1/4' };
    if (score === 3) return { score: 2, label: 'Fair (add numbers or special characters)', color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 4) return { score: 3, label: 'Strong', color: 'bg-blue-500', width: 'w-3/4' };
    return { score: 4, label: 'Exceptional (Very Secure)', color: 'bg-emerald-500', width: 'w-full' };
  };

  const regPassStrength = computePasswordStrength(regPassword);
  const resetPassStrength = computePasswordStrength(resetNewPassword);
  const adminPassStrength = computePasswordStrength(adminSetupPassword);

  // Student Login Handler
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError('Please provide your Matriculation Number / Email and password.');
      return;
    }

    setLoading(true);
    const res = await apiLogin(cleanIdentifier, password);
    setLoading(false);

    if (!res.success || !res.user) {
      setError(res.error || 'Invalid credentials. Please verify your details.');
      return;
    }

    onLoginSuccess(res.user, targetTab);
    onClose();
  };

  // Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError('Administrator email / ID and password are required.');
      return;
    }

    setLoading(true);
    const res = await apiLogin(cleanIdentifier, password);
    setLoading(false);

    if (!res.success || !res.user) {
      setError(res.error || 'Administrator authentication failed. Please check your credentials.');
      return;
    }

    if (res.user.role !== 'admin') {
      setError('Access Denied: Account lacks administrator privileges.');
      return;
    }

    onLoginSuccess(res.user, 'admin');
    onClose();
  };

  // Registration Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const cleanName = regFullName.trim();
    const cleanMatric = regMatric.trim().toUpperCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName || !cleanMatric || !cleanEmail) {
      setError('Full Name, Matriculation Number, and Email are required.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await apiRegister({
      fullName: cleanName,
      matricNumber: cleanMatric,
      email: cleanEmail,
      phoneNumber: regPhone.trim(),
      level: regLevel,
      discipline: regDiscipline,
      password: regPassword
    });
    setLoading(false);

    if (!res.success || !res.user) {
      setError(res.error || 'Registration failed. Please check your inputs.');
      return;
    }

    if (onRegisterUser) {
      onRegisterUser(res.user);
    }

    onLoginSuccess(res.user, targetTab);
    onClose();
  };

  // Forgot Password Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await apiForgotPassword(forgotEmail.trim().toLowerCase());
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccessInfo(res.message);
    if (res.previewResetToken) {
      setPreviewTokenHint(res.previewResetToken);
      setResetToken(res.previewResetToken);
    }
  };

  // Reset Password Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!resetToken.trim()) {
      setError('Password reset token is required.');
      return;
    }

    if (resetNewPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await apiResetPassword(resetToken.trim(), resetNewPassword);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to reset password.');
      return;
    }

    setSuccessInfo(res.message || 'Password reset successfully! Please sign in with your new password.');
    setMode('student');
    setPassword('');
    setResetToken('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setPreviewTokenHint(null);
  };

  // Admin Setup Handler
  const handleSetupAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!adminSetupName.trim() || !adminSetupEmail.trim()) {
      setError('Full Name and valid email are required.');
      return;
    }

    if (adminSetupPassword.length < 8) {
      setError('Administrative password must be at least 8 characters long.');
      return;
    }

    if (adminSetupPassword !== adminSetupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await apiSetupAdmin({
      fullName: adminSetupName.trim(),
      email: adminSetupEmail.trim().toLowerCase(),
      matricNumber: adminSetupMatric.trim().toUpperCase(),
      phoneNumber: adminSetupPhone.trim(),
      password: adminSetupPassword,
      setupSecret: adminSetupSecret.trim()
    });
    setLoading(false);

    if (!res.success || !res.user) {
      setError(res.error || 'Administrator initialization failed.');
      return;
    }

    setHasExistingAdmin(true);
    onLoginSuccess(res.user, 'admin');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shadow-inner">
              <img src={NAPS_LOGO} alt="NAPS Crest" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                Security & Authentication Gateway
              </span>
              <h2 className="text-xl font-display font-bold tracking-tight">
                {mode === 'student' && 'Student Portal Sign In'}
                {mode === 'admin' && 'Executive Administration Sign In'}
                {mode === 'register' && 'New Student Registration'}
                {mode === 'forgot' && 'Password Recovery'}
                {mode === 'reset' && 'Reset Your Password'}
                {mode === 'setup-admin' && 'Initialize Administrator Account'}
              </h2>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex flex-wrap gap-1.5 mt-4 p-1 rounded-2xl bg-black/30 backdrop-blur-xs border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => { setMode('student'); setError(null); }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'student' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('admin'); setError(null); }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'admin' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
            {!hasExistingAdmin && (
              <button
                type="button"
                onClick={() => { setMode('setup-admin'); setError(null); }}
                className={`py-1.5 px-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'setup-admin' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Setup Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successInfo && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successInfo}</div>
            </div>
          )}

          {/* MODE 1: STUDENT LOGIN */}
          {mode === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Matriculation Number or Student Email:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LASU/STECH/PHY/23/0112 or student@lasustech.edu.ng"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccessInfo(null); }}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your registered account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-300 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Sign In to Student Portal</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>First time here?</span>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>Create Student Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: ADMIN LOGIN */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Restricted Administrative Area</span>
                  Only verified executive officers and authorized system administrators are permitted.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Administrator Email or Executive ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin@napslasustech.org.ng"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Master Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccessInfo(null); }}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Reset Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your administrative password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Authenticating Administrator...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authenticate as Administrator</span>
                    </>
                  )}
                </button>
              </div>

              {!hasExistingAdmin && (
                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('setup-admin'); setError(null); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    No Administrator setup yet? Click here to initialize primary admin credentials.
                  </button>
                </div>
              )}
            </form>
          )}

          {/* MODE 3: STUDENT REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Surname Firstname Other"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Matriculation Number:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="LASU/STECH/PHY/..."
                    value={regMatric}
                    onChange={(e) => setRegMatric(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono uppercase text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    University / Student Email:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@student.lasustech.edu.ng"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number:
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Level:
                  </label>
                  <select
                    value={regLevel}
                    onChange={(e) => setRegLevel(e.target.value as AcademicLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physics Discipline / Track:
                  </label>
                  <select
                    value={regDiscipline}
                    onChange={(e) => setRegDiscipline(e.target.value as PhysicsDiscipline)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Physics (General)">Physics (General)</option>
                    <option value="Applied Geophysics">Applied Geophysics</option>
                    <option value="Radiation & Health Physics">Radiation & Health Physics</option>
                    <option value="Renewable Energy & Material Science">Renewable Energy & Material Science</option>
                    <option value="Electronics & Computational Physics">Electronics & Computational Physics</option>
                    <option value="Theoretical & Astrophysics">Theoretical & Astrophysics</option>
                  </select>
                </div>
              </div>

              {/* Strong Password Creation */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Create Strong Password:
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Strength: <span className="font-bold">{regPassStrength.label}</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {/* Visual strength bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${regPassStrength.color} ${regPassStrength.width}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password exactly"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-300 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Creating Secure Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Complete Registration & Enter Portal</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('student'); setError(null); }}
                  className="font-bold text-sky-600 hover:text-sky-700"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Password Recovery</span>
                  Enter your registered student or administrator email address. A time-limited, secure one-time authorization token will be generated to reset your credentials.
                </div>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@lasustech.edu.ng or admin@napslasustech.org.ng"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-300 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Issuing Reset Token...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Send Recovery Token</span>
                    </>
                  )}
                </button>
              </form>

              {/* If token was generated, allow direct transition to Reset form */}
              {previewTokenHint && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sky-400 font-bold">One-Time Recovery Token Issued:</span>
                    <span className="text-[10px] text-slate-400">Expires in 15 mins</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 break-all border border-slate-800">
                    {previewTokenHint}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(null); }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="text-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode('student'); setError(null); }}
                  className="font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* MODE 5: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Authorization Reset Token:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste the 32-character recovery token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    New Strong Password:
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {resetPassStrength.label}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 8 characters"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${resetPassStrength.color} ${resetPassStrength.width}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save New Password & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 6: INITIAL ADMIN SETUP */}
          {mode === 'setup-admin' && (
            <form onSubmit={handleSetupAdminSubmit} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Administrator Initialization</span>
                  Create your official administrator credentials. In compliance with strict security requirements, no default or predictable credentials exist. Choose a unique, strong password.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Administrator Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Administrator"
                    value={adminSetupName}
                    onChange={(e) => setAdminSetupName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Admin Email:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@napslasustech.org.ng"
                    value={adminSetupEmail}
                    onChange={(e) => setAdminSetupEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Executive ID / Matric (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADMIN-NAPS-01"
                    value={adminSetupMatric}
                    onChange={(e) => setAdminSetupMatric(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono uppercase text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone Number:
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={adminSetupPhone}
                    onChange={(e) => setAdminSetupPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {hasExistingAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Administrative Setup Secret Key:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter configured ADMIN_SETUP_SECRET"
                    value={adminSetupSecret}
                    onChange={(e) => setAdminSetupSecret(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Master Administrator Password:
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {adminPassStrength.label}
                  </span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Choose strong, unique passphrase (min 8 chars)"
                  value={adminSetupPassword}
                  onChange={(e) => setAdminSetupPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${adminPassStrength.color} ${adminPassStrength.width}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Master Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={adminSetupConfirmPassword}
                  onChange={(e) => setAdminSetupConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Provisioning Administrator...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Provision Administrator Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
