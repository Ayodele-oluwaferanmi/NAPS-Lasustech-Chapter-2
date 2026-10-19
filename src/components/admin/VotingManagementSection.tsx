import React, { useState } from 'react';
import { VotingCategory, Nominee, VotingSettings } from '../../types';
import { 
  Vote, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ShieldCheck, 
  RotateCcw,
  Calendar,
  Lock,
  Unlock,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { uploadFileViaApi } from '../../utils/authClient';

interface VotingManagementSectionProps {
  categories?: VotingCategory[];
  settings?: VotingSettings;
  onSaveCategory?: (cat: VotingCategory) => Promise<void> | void;
  onDeleteCategory?: (id: string) => Promise<void> | void;
  onUpdateCategories?: (cats: VotingCategory[]) => Promise<void> | void;
  onUpdateSettings?: (settings: VotingSettings) => Promise<void> | void;
  onResetVotes?: (categoryId?: string) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const VotingManagementSection: React.FC<VotingManagementSectionProps> = ({
  categories,
  settings,
  onSaveCategory,
  onDeleteCategory,
  onUpdateCategories,
  onUpdateSettings,
  onResetVotes,
  showFeedback
}) => {
  const currentCategories = categories || [];
  const defaultSettings: VotingSettings = {
    electionTitle: 'NAPS General Elections 2025/2026',
    session: '2025/2026',
    isOpen: true,
    startDate: '2025-10-01T08:00',
    endDate: '2025-10-15T18:00',
    requireBiometrics: false,
    strictMatricValidation: true
  };
  const activeSettings = settings || defaultSettings;
  const [activeTab, setActiveTab] = useState<'categories' | 'settings'>('categories');
  const [editingCategory, setEditingCategory] = useState<VotingCategory | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Nominee Modal state
  const [nomineeModalCategory, setNomineeModalCategory] = useState<VotingCategory | null>(null);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [nomineeForm, setNomineeForm] = useState({
    id: '',
    name: '',
    level: '400 Level',
    discipline: 'Physics',
    image: '',
    description: '',
    votes: 0
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    title: '',
    groupName: 'Academic Excellence',
    groupKey: 'academic',
    description: ''
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<VotingSettings>(settings);

  const handleOpenAddCategory = () => {
    setIsNewCategory(true);
    setCategoryForm({
      id: `cat-${Date.now()}`,
      title: '',
      groupName: 'Academic Excellence',
      groupKey: 'academic',
      description: ''
    });
    setEditingCategory({
      id: `cat-${Date.now()}`,
      slug: '',
      title: '',
      groupKey: 'academic',
      groupName: 'Academic Excellence',
      description: '',
      nominees: []
    });
    setUploadError(null);
  };

  const handleOpenEditCategory = (cat: VotingCategory) => {
    setIsNewCategory(false);
    setCategoryForm({
      id: cat.id,
      title: cat.title,
      groupName: cat.groupName || 'General',
      groupKey: cat.groupKey || 'general',
      description: cat.description || ''
    });
    setEditingCategory(cat);
    setUploadError(null);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) {
      setUploadError('Category title is required.');
      return;
    }

    const catToSave: VotingCategory = {
      id: categoryForm.id || `cat-${Date.now()}`,
      slug: categoryForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: categoryForm.title.trim(),
      groupName: categoryForm.groupName.trim(),
      groupKey: categoryForm.groupKey.trim() || 'general',
      description: categoryForm.description.trim(),
      nominees: editingCategory?.nominees || []
    };

    if (onSaveCategory) {
      await onSaveCategory(catToSave);
    } else if (onUpdateCategories) {
      const idx = currentCategories.findIndex(c => c.id === catToSave.id);
      let updated: VotingCategory[];
      if (idx >= 0) {
        updated = [...currentCategories];
        updated[idx] = catToSave;
      } else {
        updated = [catToSave, ...currentCategories];
      }
      await onUpdateCategories(updated);
    }
    if (showFeedback) showFeedback(`Category "${catToSave.title}" saved.`);
    setActionSuccess(`Category "${catToSave.title}" saved successfully.`);
    setEditingCategory(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${title}" and all its candidate votes?`)) {
      if (onDeleteCategory) {
        await onDeleteCategory(id);
      } else if (onUpdateCategories) {
        const updated = currentCategories.filter(c => c.id !== id);
        await onUpdateCategories(updated);
      }
      if (showFeedback) showFeedback(`Category "${title}" removed.`);
      setActionSuccess(`Category "${title}" removed.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Manage Nominees
  const handleOpenAddNominee = (cat: VotingCategory) => {
    setNomineeModalCategory(cat);
    setEditingNominee(null);
    setNomineeForm({
      id: `nom-${Date.now()}`,
      name: '',
      level: '400 Level',
      discipline: 'Theoretical & Astrophysics',
      image: '',
      description: '',
      votes: 0
    });
    setUploadError(null);
  };

  const handleOpenEditNominee = (cat: VotingCategory, nom: Nominee) => {
    setNomineeModalCategory(cat);
    setEditingNominee(nom);
    setNomineeForm({
      id: nom.id,
      name: nom.name,
      level: nom.level,
      discipline: nom.discipline,
      image: nom.image || '',
      description: nom.description || '',
      votes: nom.votes
    });
    setUploadError(null);
  };

  const handleNomineePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Candidate photo exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await uploadFileViaApi(base64, file.name, 'profile_photo');
        setNomineeForm(prev => ({ ...prev, image: res.fileUrl || base64 }));
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload photo.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNomineeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeModalCategory) return;
    if (!nomineeForm.name.trim()) {
      setUploadError('Candidate full name is required.');
      return;
    }

    const updatedCategory = { ...nomineeModalCategory };
    const nomineeList = [...updatedCategory.nominees];

    const nomineeData: Nominee = {
      id: nomineeForm.id || `nom-${Date.now()}`,
      name: nomineeForm.name.trim(),
      level: nomineeForm.level,
      discipline: nomineeForm.discipline.trim(),
      image: nomineeForm.image,
      description: nomineeForm.description.trim(),
      votes: nomineeForm.votes || 0
    };

    if (editingNominee) {
      const idx = nomineeList.findIndex(n => n.id === editingNominee.id);
      if (idx >= 0) nomineeList[idx] = nomineeData;
    } else {
      nomineeList.push(nomineeData);
    }

    updatedCategory.nominees = nomineeList;
    if (onSaveCategory) {
      await onSaveCategory(updatedCategory);
    } else if (onUpdateCategories) {
      const idx = currentCategories.findIndex(c => c.id === updatedCategory.id);
      let updated: VotingCategory[];
      if (idx >= 0) {
        updated = [...currentCategories];
        updated[idx] = updatedCategory;
      } else {
        updated = [updatedCategory, ...currentCategories];
      }
      await onUpdateCategories(updated);
    }
    if (showFeedback) showFeedback(`Candidate "${nomineeData.name}" saved in ${updatedCategory.title}.`);
    setNomineeModalCategory(null);
    setEditingNominee(null);
    setActionSuccess(`Candidate "${nomineeData.name}" saved in ${updatedCategory.title}.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteNominee = async (cat: VotingCategory, nomId: string, nomName: string) => {
    if (window.confirm(`Are you sure you want to remove candidate "${nomName}" from "${cat.title}"?`)) {
      const updatedCat = {
        ...cat,
        nominees: (cat.nominees || []).filter(n => n.id !== nomId)
      };
      if (onSaveCategory) {
        await onSaveCategory(updatedCat);
      } else if (onUpdateCategories) {
        const idx = currentCategories.findIndex(c => c.id === updatedCat.id);
        if (idx >= 0) {
          const updated = [...currentCategories];
          updated[idx] = updatedCat;
          await onUpdateCategories(updated);
        }
      }
      if (showFeedback) showFeedback(`Candidate "${nomName}" removed.`);
      setActionSuccess(`Candidate "${nomName}" removed.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) await onUpdateSettings(settingsForm);
    if (showFeedback) showFeedback('Voting settings updated.');
    setActionSuccess('Voting settings and election parameters successfully updated.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleResetElection = async (categoryId?: string) => {
    const msg = categoryId 
      ? 'Are you sure you want to reset all vote tallies and voter history for this specific category?'
      : 'CRITICAL: Are you sure you want to reset ALL categories, candidate vote tallies, and student ballot records?';
    
    if (window.confirm(msg)) {
      if (onResetVotes) {
        await onResetVotes(categoryId);
      } else if (onUpdateCategories) {
        const updated = currentCategories.map(c => {
          if (!categoryId || c.id === categoryId) {
            return {
              ...c,
              nominees: (c.nominees || []).map(n => ({ ...n, votes: 0 }))
            };
          }
          return c;
        });
        await onUpdateCategories(updated);
      }
      if (showFeedback) showFeedback('Vote counts reset.');
      setActionSuccess('Vote counts and voter logs have been cleanly reset.');
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const totalVotesAcrossAll = (currentCategories || []).reduce((sum, c) => 
    sum + (c?.nominees || []).reduce((nSum, n) => nSum + (n?.votes || 0), 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Vote className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Elections & Honors Voting Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure election categories, candidate slates, voting periods, one-vote-per-student rules, and real-time tallies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'categories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Categories & Candidates ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Election Rules & Dates
            </button>
          </div>

          <button
            onClick={handleOpenAddCategory}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Ballots Cast</p>
            <p className="text-2xl font-black text-slate-900">{totalVotesAcrossAll.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Election Status</p>
            <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              {settings.isOpen ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-700 font-black">Voting Active</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-rose-700 font-black">Polls Closed</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Electoral Reset</p>
              <p className="text-xs font-semibold text-slate-700">Clear all ballot tallies</p>
            </div>
          </div>
          <button
            onClick={() => handleResetElection()}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Reset All
          </button>
        </div>
      </div>

      {activeTab === 'categories' ? (
        <div className="space-y-6">
          {categories.map(cat => {
            const totalCatVotes = cat.nominees.reduce((sum, n) => sum + (n.votes || 0), 0);
            return (
              <div 
                key={cat.id} 
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700">
                        {cat.groupName || 'Award Group'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{cat.title}</h3>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-500 mt-1 max-w-xl">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                      {totalCatVotes} total votes
                    </span>
                    <button
                      onClick={() => handleOpenAddNominee(cat)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Candidate</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-2 text-sky-700 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Category Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.title)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Candidate Roster in Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cat.nominees.map(nom => {
                    const percentage = totalCatVotes > 0 ? Math.round((nom.votes / totalCatVotes) * 100) : 0;
                    return (
                      <div 
                        key={nom.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                            {nom.image ? (
                              <img src={nom.image} alt={nom.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                                {nom.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{nom.name}</h4>
                            <p className="text-[11px] text-slate-500">{nom.level} • {nom.discipline}</p>
                            {nom.description && (
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{nom.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Votes & Progress bar */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-slate-800">{nom.votes} Votes</span>
                            <span className="text-sky-700">{percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1F5FAF] rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-end gap-1.5 mt-2.5">
                            <button
                              onClick={() => handleOpenEditNominee(cat, nom)}
                              className="px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-50 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteNominee(cat, nom.id, nom.name)}
                              className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {cat.nominees.length === 0 && (
                    <div className="col-span-full py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No candidates added yet to this category. Click "+ Add Candidate".
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Settings & Rules Tab */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Electoral Rules & Period Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control voting open/closed status, election instructions, and single-vote protection policy.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">Polls Open Status</p>
                <p className="text-[11px] text-slate-500">Allow verified matriculated students to cast ballots.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.isOpen}
                  onChange={e => setSettingsForm({ ...settingsForm, isOpen: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Election Title</label>
              <input
                type="text"
                value={settingsForm.title}
                onChange={e => setSettingsForm({ ...settingsForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Voter Instructions</label>
              <textarea
                rows={3}
                value={settingsForm.instructions}
                onChange={e => setSettingsForm({ ...settingsForm, instructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Voting Start Date / Time</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 12, 2026 - 08:00 AM"
                  value={settingsForm.startDate || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Voting Deadline / Close Date</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 14, 2026 - 06:00 PM"
                  value={settingsForm.endDate || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900">
                <p className="font-bold">Cryptographic Anti-Manipulation Enforcement:</p>
                <p className="mt-0.5 text-sky-800 leading-relaxed text-[11px]">
                  All votes are authenticated against verified session tokens on the server. The server verifies each matriculated student can submit strictly one vote per category, preventing vote duplication or ballot stuffing.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Voting Settings
            </button>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {isNewCategory ? 'Create Voting Category' : 'Edit Category'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify award category title and award classification group.
            </p>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.title}
                  onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  placeholder="e.g. Physicist of the Year (Overall Best)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Classification / Group Name</label>
                <input
                  type="text"
                  value={categoryForm.groupName}
                  onChange={e => setCategoryForm({ ...categoryForm, groupName: e.target.value, groupKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. Academic Excellence, Leadership, Emerging Talent"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief criteria for voters..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nominee Modal */}
      {nomineeModalCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingNominee ? 'Edit Candidate Details' : `Add Candidate to "${nomineeModalCategory.title}"`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter nominee details, photo, and biographical citation.
            </p>

            {uploadError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNomineeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={nomineeForm.name}
                  onChange={e => setNomineeForm({ ...nomineeForm, name: e.target.value })}
                  placeholder="e.g. Olatunji Michael Adebayo"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Level</label>
                  <select
                    value={nomineeForm.level}
                    onChange={e => setNomineeForm({ ...nomineeForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discipline / Track</label>
                  <input
                    type="text"
                    value={nomineeForm.discipline}
                    onChange={e => setNomineeForm({ ...nomineeForm, discipline: e.target.value })}
                    placeholder="e.g. Theoretical & Astrophysics"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    {nomineeForm.image ? (
                      <img src={nomineeForm.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNomineePhotoUpload}
                    disabled={uploading}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Campaign Statement / Citation</label>
                <textarea
                  rows={2}
                  value={nomineeForm.description}
                  onChange={e => setNomineeForm({ ...nomineeForm, description: e.target.value })}
                  placeholder="Key contributions and achievements..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNomineeModalCategory(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
