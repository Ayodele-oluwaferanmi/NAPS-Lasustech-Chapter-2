import React, { useState } from 'react';
import { VOTING_CATEGORIES } from '../../data/mockData';
import { VotingCategory, Nominee, AwardItem, VotingSettings, User } from '../../types';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Vote, 
  Sparkles, 
  X, 
  User as UserIcon, 
  Atom, 
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { apiCastVote } from '../../utils/contentClient';

interface AwardsViewProps {
  awards?: AwardItem[];
  categories?: VotingCategory[];
  settings?: VotingSettings;
  currentUser?: User | null;
  onOpenLogin?: () => void;
  onRefreshCategories?: () => void;
}

export const AwardsView: React.FC<AwardsViewProps> = ({
  awards = [],
  categories = VOTING_CATEGORIES,
  settings = {
    isOpen: true,
    title: 'NAPS Annual Physics Awards & Honors Balloting',
    instructions: 'Each verified student is entitled to cast strictly one ballot per category.',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    oneVotePerUser: true
  },
  currentUser,
  onOpenLogin,
  onRefreshCategories
}) => {
  const safeCategories = categories || VOTING_CATEGORIES || [];
  const [activeTab, setActiveTab] = useState<'voting' | 'conferred'>('voting');
  const [categoryList, setCategoryList] = useState<VotingCategory[]>(safeCategories);
  const [selectedCategory, setSelectedCategory] = useState<VotingCategory>(
    safeCategories[0] || { id: 'default', title: 'Physicist of the Year', slug: 'poty', nominees: [] }
  );

  const [votingModalNominee, setVotingModalNominee] = useState<{ nominee: Nominee; categoryId: string } | null>(null);
  const [votingSuccess, setVotingSuccess] = useState<string | null>(null);
  const [votingError, setVotingError] = useState<string | null>(null);
  const [submittingVote, setSubmittingVote] = useState(false);

  // Sync if prop updates
  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryList(categories);
      const existing = categories.find(c => c.id === selectedCategory.id);
      if (!existing && categories[0]) {
        setSelectedCategory(categories[0]);
      } else if (existing) {
        setSelectedCategory(existing);
      }
    }
  }, [categories]);

  const handleCastVote = async () => {
    if (!votingModalNominee) return;
    setVotingError(null);
    setSubmittingVote(true);

    try {
      const res = await apiCastVote(votingModalNominee.categoryId, votingModalNominee.nominee.id, 1);
      if (res.error) {
        setVotingError(res.error);
        setSubmittingVote(false);
        return;
      }

      // Update local counts
      setCategoryList(prev => (prev || []).map(cat => {
        if (cat.id !== votingModalNominee.categoryId) return cat;
        return {
          ...cat,
          nominees: (cat.nominees || []).map(nom => {
            if (nom.id !== votingModalNominee.nominee.id) return nom;
            return { ...nom, votes: (nom.votes || 0) + 1 };
          })
        };
      }));

      setSelectedCategory(prev => ({
        ...prev,
        nominees: (prev?.nominees || []).map(nom => {
          if (nom.id !== votingModalNominee.nominee.id) return nom;
          return { ...nom, votes: (nom.votes || 0) + 1 };
        })
      }));

      setVotingSuccess(`Ballot recorded! You voted for ${votingModalNominee.nominee.name}.`);
      if (onRefreshCategories) {
        onRefreshCategories();
      }
      setTimeout(() => {
        setVotingModalNominee(null);
        setVotingSuccess(null);
        setVotingError(null);
      }, 2000);
    } catch (err: any) {
      setVotingError(err.message || 'Failed to submit vote.');
    } finally {
      setSubmittingVote(false);
    }
  };

  const totalVotesInActiveCategory = (selectedCategory?.nominees || []).reduce((acc, n) => acc + (n?.votes || 0), 0) || 1;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <section className="bg-[#08111d] py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              <span>Chapter Recognition & Democratic Elections</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
              NAPS Awards & Voting
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Celebrating exceptional scholastic research, laboratory mastery, and outstanding leadership by physical sciences scholars at LASUSTECH.
            </p>

            {/* View Switcher: Elections Voting vs Conferred Honors */}
            <div className="flex items-center gap-2 mt-6 bg-white/10 p-1 rounded-2xl w-fit backdrop-blur-xs border border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab('voting')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'voting' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Elections & Honors Balloting
              </button>
              <button
                onClick={() => setActiveTab('conferred')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'conferred' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Conferred Departmental Honors ({awards.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {activeTab === 'voting' ? (
          <div>
            {/* Election Status Banner */}
            <div className={`p-5 rounded-3xl mb-8 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              settings.isOpen 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-2xl ${settings.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {settings.isOpen ? <Vote className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      settings.isOpen ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                    }`}>
                      {settings.isOpen ? 'Polls Open' : 'Voting Closed'}
                    </span>
                    <h3 className="font-bold text-sm">{settings.title}</h3>
                  </div>
                  <p className="text-xs mt-1 text-slate-600 max-w-2xl">{settings.instructions}</p>
                </div>
              </div>

              {settings.endDate && (
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Voting Deadline</p>
                  <p className="text-xs font-bold text-slate-800">{settings.endDate}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Categories Navigator */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Award & Election Categories
                </h3>
                {(categoryList || []).map(cat => {
                  const isActive = selectedCategory?.id === cat?.id;
                  const totalVotes = (cat?.nominees || []).reduce((sum, n) => sum + (n?.votes || 0), 0) || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20'
                          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                          {cat.groupName || 'Recognition'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {totalVotes} votes
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-slate-900 mt-2">
                        {cat.title}
                      </h4>
                    </button>
                  );
                })}

                {(!categoryList || categoryList.length === 0) && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    No active categories yet.
                  </div>
                )}
              </div>

              {/* Right Nominees & Live Voting */}
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                        {selectedCategory?.groupName || 'Election Slate'}
                      </span>
                      <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
                        {selectedCategory?.title}
                      </h2>
                      {selectedCategory?.description && (
                        <p className="text-xs text-slate-500 mt-1">{selectedCategory.description}</p>
                      )}
                    </div>

                    <div className="bg-sky-50 text-sky-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-sky-200 w-fit">
                      {totalVotesInActiveCategory} Total Votes
                    </div>
                  </div>

                  {/* Candidates Roster */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {(selectedCategory?.nominees || []).map(nom => {
                      const voteCount = nom.votes || 0;
                      const percentage = totalVotesInActiveCategory > 0 
                        ? Math.round((voteCount / totalVotesInActiveCategory) * 100) 
                        : 0;

                      return (
                        <div
                          key={nom.id}
                          className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between group"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="h-16 w-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                              {nom.image ? (
                                <img src={nom.image} alt={nom.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                                  {nom.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{nom.name}</h4>
                              <p className="text-[11px] text-slate-500">{nom.level} • {nom.discipline}</p>
                              {nom.description && (
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{nom.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                              <span className="text-slate-800">{voteCount} Votes</span>
                              <span className="text-sky-700">{percentage}%</span>
                            </div>

                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                              <div
                                className="h-full bg-[#1F5FAF] rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            <button
                              onClick={() => {
                                setVotingModalNominee({ nominee: nom, categoryId: selectedCategory.id });
                                setVotingError(null);
                                setVotingSuccess(null);
                              }}
                              disabled={!settings.isOpen}
                              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                settings.isOpen
                                  ? 'bg-[#1F5FAF] hover:bg-[#174983] text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Vote className="w-3.5 h-3.5" />
                              <span>{settings.isOpen ? 'Vote for Candidate' : 'Polls Closed'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {(!selectedCategory.nominees || selectedCategory.nominees.length === 0) && (
                      <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                        No nominees configured yet for this category.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Conferred Awards Tab */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Departmental Roll of Honor & Excellence</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official recipients of departmental citations, best graduating student awards, and physical science accolades.
                </p>
              </div>
              <span className="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 shrink-0">
                {awards.length} Conferred Citations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {awards.map(award => (
                <div 
                  key={award.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 overflow-hidden">
                        {award.image ? (
                          <img src={award.image} alt={award.recipient} className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {award.category}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3 h-3" />
                          Session {award.year}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {award.title}
                      </h4>
                      <p className="text-xs font-bold text-[#1F5FAF] mt-1 flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        Conferred on: {award.recipient}
                      </p>
                      {award.description && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {award.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {awards.length === 0 && (
                <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200">
                  <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800">No conferred awards published yet</p>
                  <p className="text-xs text-slate-500 mt-1">Honors published by the executive council will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voting Confirmation Modal */}
      {votingModalNominee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
          onClick={() => setVotingModalNominee(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVotingModalNominee(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            {votingSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900 text-base">Ballot Cast Successfully!</h4>
                <p className="text-xs text-slate-500">{votingSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                    Official Election Ballot
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1">
                    Vote for {votingModalNominee.nominee.name}
                  </h3>
                  <p className="text-slate-500 mt-0.5">
                    Category: <span className="font-semibold text-slate-700">{selectedCategory.title}</span>
                  </p>
                </div>

                {votingError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{votingError}</span>
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>One-Vote-Per-Student Integrity</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Voting is cryptographically sealed and tracked per verified matriculation account. Duplicate votes for the same category are blocked.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setVotingModalNominee(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingVote}
                    onClick={handleCastVote}
                    className="px-5 py-2.5 rounded-xl bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Vote className="h-4 w-4" />
                    <span>{submittingVote ? 'Submitting Ballot...' : 'Confirm & Cast Vote'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
