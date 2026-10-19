import React, { useState } from 'react';
import { CONSTITUTION_ARTICLES } from '../../data/mockData';
import { ConstitutionArticle, ConstitutionDocument } from '../../types';
import { Download, BookOpen, Search, ShieldCheck, Atom } from 'lucide-react';

interface ConstitutionViewProps {
  articles?: ConstitutionArticle[];
  docInfo?: ConstitutionDocument;
}

export const ConstitutionView: React.FC<ConstitutionViewProps> = ({ 
  articles = CONSTITUTION_ARTICLES,
  docInfo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticleIndex, setActiveArticleIndex] = useState<number | null>(null);

  const safeArticles = articles || CONSTITUTION_ARTICLES || [];
  const filteredArticles = safeArticles.filter(art => {
    if (!art) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (art.number || '').toLowerCase().includes(query) ||
      (art.title || '').toLowerCase().includes(query) ||
      (art.sections || []).some(s => (s.title || '').toLowerCase().includes(query) || (s.content || '').toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <section className="bg-[#08111d] py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-sky-400" />
              <span>Chapter Supreme Law</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
              NAPS Constitution
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              The official legal framework and governing document of the National Association of Physics Students, LASUSTECH Chapter.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
          {/* Top Bar */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  NAPS LASUSTECH Constitution
                </h3>
                <p className="text-xs text-slate-500">
                  Supreme Governing Document & Bylaws
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-500 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Print Official PDF</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, sections, dues clauses, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Articles */}
          <div className="space-y-8">
            {filteredArticles.map((art, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-8 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                    {art.number}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
                  {art.title}
                </h3>

                <div className="space-y-4">
                  {art.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-xs text-slate-800 mb-1.5">
                        {sec.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-serif">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
