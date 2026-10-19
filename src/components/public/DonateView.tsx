import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2, ShieldCheck, Heart, Sparkles, Receipt, ArrowRight, Atom } from 'lucide-react';

export const DonateView: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  const presetAmounts = [1000, 2500, 5000, 10000, 25000];

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const num = Number(e.target.value);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(num);
    }
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount <= 0) {
      alert('Please select or enter a valid donation amount.');
      return;
    }
    if (!isAnonymous && (!fullName.trim() || !email.trim())) {
      alert('Please provide your name and email, or select "Donate Anonymously".');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessReceipt({
        reference: `NAPS-DON-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: selectedAmount,
        donorName: isAnonymous ? 'Anonymous Science Supporter' : fullName,
        donorEmail: isAnonymous ? 'anonymous@napslasustech.org.ng' : email,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    }, 1200);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <section className="bg-[#08111d] py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-sky-400" />
              <span>Physics Lab & Student Support Fund</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
              Support NAPS LASUSTECH
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Empower student-led research, experimental optics equipment, scientific journals, telescope observation nights, and needy student dues bursaries.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
          {successReceipt ? (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Thank You for Supporting Science!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your contribution directly advances laboratory equipment and scholarship support for physics students at LASUSTECH.
              </p>

              <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{successReceipt.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Contributed:</span>
                  <span className="font-bold text-emerald-600 text-sm">₦{successReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contributor:</span>
                  <span className="font-semibold text-slate-800">{successReceipt.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-700">{successReceipt.date}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setSuccessReceipt(null)}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors"
                >
                  Make Another Contribution
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDonate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Select Contribution Amount (NGN)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {presetAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    type="number"
                    placeholder="Or enter custom amount (e.g. 50000)"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Donor Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="anon" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Keep my contribution anonymous on public registers
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Dr. / Prof. / Scholar Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="your.email@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <span>Processing Secure Transfer...</span>
                ) : (
                  <>
                    <Heart className="h-4 w-4 fill-white" />
                    <span>Proceed to Support NAPS (₦{selectedAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
