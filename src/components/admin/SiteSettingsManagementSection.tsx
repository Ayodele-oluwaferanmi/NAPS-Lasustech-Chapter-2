import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Building, 
  CreditCard, 
  Bell, 
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface SiteSettingsManagementSectionProps {
  settings?: SiteSettings;
  onUpdateSettings?: (settings: SiteSettings) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const SiteSettingsManagementSection: React.FC<SiteSettingsManagementSectionProps> = ({
  settings,
  onUpdateSettings,
  showFeedback
}) => {
  const defaultSettings: SiteSettings = {
    associationName: 'Nigeria Association of Physics Students (NAPS)',
    shortName: 'NAPS LASUSTECH',
    institution: 'Lagos State University of Science and Technology',
    faculty: 'College of Applied Sciences',
    department: 'Department of Physics',
    currentSession: '2025/2026',
    semester: 'Harmattan',
    duesAmount: 3000,
    allowRegistration: true,
    allowVoting: true,
    broadcastNotice: null,
    contactEmail: 'info@napslasustech.org.ng',
    emergencyNotice: null
  };
  const [form, setForm] = useState<SiteSettings>(settings || defaultSettings);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (onUpdateSettings) await onUpdateSettings(form);
      if (showFeedback) showFeedback('Site settings updated.');
      setSuccessMessage('Site settings, chapter configuration, and dues ledger parameters updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <Settings className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">Site Settings & Chapter Configuration</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure association branding, chapter motto, academic session year, departmental dues amount, and student registration gates.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Association Identity */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1F5FAF]" />
            Association & University Chapter Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Association Full Name *</label>
              <input
                type="text"
                required
                value={form.associationName}
                onChange={e => setForm({ ...form, associationName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Chapter Designation *</label>
              <input
                type="text"
                required
                value={form.chapterName}
                onChange={e => setForm({ ...form, chapterName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Official Association Motto</label>
              <input
                type="text"
                value={form.motto}
                onChange={e => setForm({ ...form, motto: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Academic Session & Financial Settings */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1F5FAF]" />
            Academic Session & Departmental Dues Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Academic Session *</label>
              <input
                type="text"
                required
                value={form.academicSession}
                onChange={e => setForm({ ...form, academicSession: e.target.value })}
                placeholder="2025/2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Departmental Annual Dues (₦ Naira) *</label>
              <input
                type="number"
                required
                min="0"
                value={form.duesAmount}
                onChange={e => setForm({ ...form, duesAmount: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={e => setForm({ ...form, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Account Number</label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Account Beneficiary Name</label>
              <input
                type="text"
                value={form.accountName}
                onChange={e => setForm({ ...form, accountName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Portal Notice & Student Registration Controls */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1F5FAF]" />
            Student Portal Broadcast Announcement
          </h3>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Secretariat Banner Notice</label>
            <textarea
              rows={3}
              value={form.portalNotice || ''}
              onChange={e => setForm({ ...form, portalNotice: e.target.value })}
              placeholder="Announcement displayed to all logged-in students in their dashboard..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 leading-relaxed"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">Self-Registration Gate</p>
              <p className="text-[11px] text-slate-500">
                Allow new departmental students to create and claim their accounts on the public portal.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.registrationOpen}
                onChange={e => setForm({ ...form, registrationOpen: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
