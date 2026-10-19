import React, { useState } from 'react';
import { ContactInfo } from '../../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Save
} from 'lucide-react';

interface ContactManagementSectionProps {
  contact?: ContactInfo;
  onUpdateContact?: (contact: ContactInfo) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const ContactManagementSection: React.FC<ContactManagementSectionProps> = ({
  contact,
  onUpdateContact,
  showFeedback
}) => {
  const defaultContact: ContactInfo = {
    address: 'Department of Physics, LASUSTECH, Ikorodu, Lagos State',
    email: 'info@napslasustech.org.ng',
    phone: '+234 810 000 0000',
    officeHours: 'Monday - Friday: 9:00 AM - 4:00 PM',
    instagram: '',
    twitter: '',
    linkedin: '',
    telegram: '',
    whatsappGroup: ''
  };
  const [form, setForm] = useState<ContactInfo>(contact || defaultContact);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (onUpdateContact) await onUpdateContact(form);
      if (showFeedback) showFeedback('Contact info updated.');
      setSuccessMessage('Secretariat contact details and social media links updated globally across the website.');
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
          <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <Phone className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">Contact & Secretariat Management</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Update phone lines, email addresses, physical departmental secretariat, working hours, and social media handles.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Telephone & Electronic Mail */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#1F5FAF]" />
            Official Communications Channels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Helpdesk Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Secretariat Office Email</label>
              <input
                type="email"
                value={form.secretariatEmail || ''}
                onChange={e => setForm({ ...form, secretariatEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Telephone Line *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alternative Phone Line / WhatsApp</label>
              <input
                type="text"
                value={form.alternativePhone || ''}
                onChange={e => setForm({ ...form, alternativePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Physical Office Address */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1F5FAF]" />
            Secretariat Physical Address & Hours
          </h3>
          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Office Location & Department Address *</label>
              <textarea
                rows={2}
                required
                value={form.officeAddress}
                onChange={e => setForm({ ...form, officeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Faculty</label>
                <input
                  type="text"
                  value={form.faculty}
                  onChange={e => setForm({ ...form, faculty: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">University Campus</label>
                <input
                  type="text"
                  value={form.campus}
                  onChange={e => setForm({ ...form, campus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={form.operatingHours || ''}
                  onChange={e => setForm({ ...form, operatingHours: e.target.value })}
                  placeholder="e.g. Mon - Fri: 8:00 AM - 5:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#1F5FAF]" />
            Social Media & Web Presence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Twitter / X Handle / URL</label>
              <input
                type="text"
                value={form.twitter || ''}
                onChange={e => setForm({ ...form, twitter: e.target.value })}
                placeholder="https://x.com/napslasustech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Instagram URL</label>
              <input
                type="text"
                value={form.instagram || ''}
                onChange={e => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/napslasustech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={form.linkedin || ''}
                onChange={e => setForm({ ...form, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/napslasustech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Global Contact Information'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
