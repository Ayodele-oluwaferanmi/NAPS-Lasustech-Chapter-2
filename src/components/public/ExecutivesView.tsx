import React, { useState } from 'react';
import { EXECUTIVES_DATA } from '../../data/mockData';
import { Executive, PeopleProfile } from '../../types';
import { Search, Sparkles, Users, Atom, Award, BookOpen, ShieldCheck } from 'lucide-react';

interface ExecutivesViewProps {
  data?: Executive[];
  people?: PeopleProfile[];
}

export const ExecutivesView: React.FC<ExecutivesViewProps> = ({ 
  data = EXECUTIVES_DATA,
  people
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // If people array is provided, normalize to unified card items
  const unifiedList = React.useMemo(() => {
    if (people && people.length > 0) {
      return people.map(p => ({
        id: p.id,
        name: p.name,
        post: p.post,
        category: p.category,
        level: p.level || '',
        description: p.description || '',
        image: p.image || '',
        email: p.email,
        phone: p.phone,
        session: p.session
      }));
    }
    return data.map(ex => ({
      id: ex.id || ex.name,
      name: ex.name,
      post: ex.post,
      category: ex.category || 'executives',
      level: ex.level || '',
      description: ex.description || '',
      image: ex.image || '',
      email: ex.email,
      phone: ex.phone,
      session: '2025/2026'
    }));
  }, [people, data]);

  const filteredList = (unifiedList || []).filter(ex => {
    if (!ex) return false;
    const matchesSearch = 
      (ex.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.post || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.level || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && ex.category === activeFilter;
  });

  const renderCard = (ex: any, index: number) => (
    <div
      key={ex.id || `${ex.name}-${index}`}
      className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:border-sky-500/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-4/5 rounded-2xl overflow-hidden mb-4 bg-slate-100 flex items-center justify-center">
          {ex.image ? (
            <img
              src={ex.image}
              alt={ex.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const fallback = (e.target as HTMLElement).parentElement?.querySelector('.avatar-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`avatar-fallback ${ex.image ? 'hidden' : ''} flex flex-col items-center justify-center p-4 text-center text-slate-400`}>
            <div className="h-16 w-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl mb-2">
              {ex.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Official Portrait</span>
          </div>
          {ex.level && (
            <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {ex.level}
            </div>
          )}
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block">
            {ex.post}
          </span>
          <h3 className="font-display text-base font-bold text-slate-900 leading-snug mt-0.5">
            {ex.name}
          </h3>
          {ex.description && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {ex.description}
            </p>
          )}
        </div>
      </div>

      {(ex.email || ex.phone) && (
        <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] text-slate-500">
          {ex.email && (
            <a 
              href={`mailto:${ex.email}`} 
              className="hover:text-sky-600 truncate max-w-full font-medium"
              title={ex.email}
            >
              ✉️ {ex.email}
            </a>
          )}
          {ex.phone && (
            <span className="text-slate-400 font-mono text-[10px]">
              📞 {ex.phone}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-sky-700 mb-3 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-sky-600" />
            <span>Leadership & Governance</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            NAPS Leadership & Officials
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Meet the democratically elected executive officers, honourable parliamentary representatives, patrons, and class representatives (HOCs) of the National Association of Physics Students, LASUSTECH Chapter.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: `All Profiles (${unifiedList.length})` },
              { id: 'executive', label: 'Executive Council' },
              { id: 'honourable', label: 'Honourable Officials (SRC)' },
              { id: 'patron', label: 'Patrons & Staff Advisers' },
              { id: 'hoc', label: 'Class Reps (HOCs)' },
              { id: 'official', label: 'Other Officials' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search official by name or portfolio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">No Officials Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or filter category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredList.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  );
};
