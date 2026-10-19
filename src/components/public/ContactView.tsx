import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, MessageSquare, Atom, PhoneCall, Phone } from 'lucide-react';
import { ContactInfo } from '../../types';

interface ContactViewProps {
  contact?: ContactInfo;
}

export const ContactView: React.FC<ContactViewProps> = ({ contact }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayAddress = contact?.address || 'Department of Physics, Faculty of Science, LASUSTECH Main Campus, Ikorodu, Lagos State.';
  const displayEmail = contact?.email || 'napslasustech@gmail.com';
  const displayPhone = contact?.phone || '+234 812 345 6789';
  const displayOfficeHours = contact?.officeHours || 'Monday to Friday: 9:00 AM - 4:00 PM (West Africa Time).';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <section className="bg-[#08111d] py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-sky-400" />
              <span>Chapter Help Desk & Secretariat</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Have questions regarding course past questions, departmental dues verification, lab sessions, or academic mentoring? Reach out to the NAPS Secretariat.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Message Dispatched!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for reaching out. We have logged your inquiry with the NAPS Executive Council. The Secretariat will reply to your email promptly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="rounded-xl bg-slate-900 text-white text-xs font-bold px-6 py-2.5 hover:bg-slate-800 transition-colors mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Send Secretariat a Note
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in your details below and an executive officer will respond.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Adewale"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Student / Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. student@lasustech.edu.ng"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your Message or Inquiry
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Write your question, complaint, or partnership proposal..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Sending...' : 'Send Message to NAPS'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Info Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Departmental Information
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Location</h5>
                    <p className="mt-0.5 leading-relaxed">
                      {displayAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Email Address</h5>
                    <p className="mt-0.5">
                      <a href={`mailto:${displayEmail}`} className="text-sky-600 hover:underline">
                        {displayEmail}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Phone Support</h5>
                    <p className="mt-0.5">
                      <a href={`tel:${displayPhone}`} className="text-sky-600 hover:underline">
                        {displayPhone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Official Channels</h5>
                    <p className="mt-0.5 leading-relaxed">
                      Join the verified NAPS WhatsApp and Telegram announcement channels via your class representative (HOC).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="rounded-3xl border border-sky-100 bg-sky-50/60 p-6">
              <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wider mb-2">
                Secretariat Office Hours
              </h4>
              <p className="text-xs text-sky-800 leading-relaxed">
                {displayOfficeHours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
