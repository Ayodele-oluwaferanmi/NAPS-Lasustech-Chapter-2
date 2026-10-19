import React, { useState } from 'react';
import { AwardItem } from '../../types';
import { 
  Trophy, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Award,
  Search,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { uploadFileViaApi } from '../../utils/authClient';

interface AwardsManagementSectionProps {
  awards?: AwardItem[];
  onSaveAward?: (award: AwardItem) => Promise<void> | void;
  onDeleteAward?: (id: string) => Promise<void> | void;
  onUpdateAwards?: (awards: AwardItem[]) => Promise<void> | void;
  categories?: any[];
  showFeedback?: (msg: string) => void;
}

export const AwardsManagementSection: React.FC<AwardsManagementSectionProps> = ({
  awards,
  onSaveAward,
  onDeleteAward,
  onUpdateAwards,
  categories,
  showFeedback
}) => {
  const currentAwards = awards || [];
  const [editingAward, setEditingAward] = useState<AwardItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '',
    title: '',
    recipient: '',
    year: '2025/2026',
    category: 'Academic Excellence',
    description: '',
    image: '',
    certificateUrl: ''
  });

  const handleOpenAdd = () => {
    setIsNew(true);
    setForm({
      id: `award-${Date.now()}`,
      title: '',
      recipient: '',
      year: '2025/2026',
      category: 'Academic Excellence',
      description: '',
      image: '',
      certificateUrl: ''
    });
    setEditingAward({
      id: `award-${Date.now()}`,
      title: '',
      recipient: '',
      year: '2025/2026',
      category: 'Academic Excellence',
      description: ''
    });
    setUploadError(null);
  };

  const handleOpenEdit = (award: AwardItem) => {
    setIsNew(false);
    setForm({
      id: award.id,
      title: award.title,
      recipient: award.recipient,
      year: award.year,
      category: award.category,
      description: award.description,
      image: award.image || '',
      certificateUrl: award.certificateUrl || ''
    });
    setEditingAward(award);
    setUploadError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const result = await uploadFileViaApi(base64, file.name, 'profile_photo');
        setForm(prev => ({ ...prev, image: result.fileUrl || base64 }));
      } catch (err: any) {
        setUploadError(err.message || 'Image upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.recipient.trim()) {
      setUploadError('Award Title and Recipient name are required.');
      return;
    }

    const awardToSave: AwardItem = {
      id: form.id || `award-${Date.now()}`,
      title: form.title.trim(),
      recipient: form.recipient.trim(),
      year: form.year.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image,
      certificateUrl: form.certificateUrl
    };

    if (onSaveAward) {
      await onSaveAward(awardToSave);
    } else if (onUpdateAwards) {
      const idx = currentAwards.findIndex(a => a.id === awardToSave.id);
      let updated: AwardItem[];
      if (idx >= 0) {
        updated = [...currentAwards];
        updated[idx] = awardToSave;
      } else {
        updated = [awardToSave, ...currentAwards];
      }
      await onUpdateAwards(updated);
    }
    if (showFeedback) showFeedback(`Award "${awardToSave.title}" saved.`);
    setActionSuccess(`Award "${awardToSave.title}" has been ${isNew ? 'added' : 'updated'}.`);
    setEditingAward(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the award "${title}"?`)) {
      if (onDeleteAward) {
        await onDeleteAward(id);
      } else if (onUpdateAwards) {
        const updated = currentAwards.filter(a => a.id !== id);
        await onUpdateAwards(updated);
      }
      if (showFeedback) showFeedback(`Award "${title}" deleted.`);
      setActionSuccess(`Award "${title}" deleted.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filteredAwards = (currentAwards || []).filter(a => 
    (a?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a?.recipient || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a?.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a?.year || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Awards & Honors Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register departmental honors, best graduating awards, innovation citations, and certificates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Award</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <input
          type="text"
          placeholder="Filter awards by title, recipient, category or session year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAwards.map(award => (
          <div 
            key={award.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 overflow-hidden">
                    {award.image ? (
                      <img src={award.image} alt={award.recipient} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {award.category}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3" />
                      Session {award.year}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {award.title}
                </h3>
                <p className="text-xs font-bold text-[#1F5FAF] mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Conferred on: {award.recipient}
                </p>
                {award.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {award.description}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(award)}
                className="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Edit Award"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(award.id, award.title)}
                className="p-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Delete Award"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredAwards.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No awards recorded</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add New Award" to add honours.</p>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingAward && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isNew ? 'Create New Honor / Award' : 'Edit Award Details'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter award criteria, recipient information, session year, and upload certificate or photo.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Award Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Best Graduating Physicist Award"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={form.recipient}
                    onChange={e => setForm({ ...form, recipient: e.target.value })}
                    placeholder="e.g. Comr. Olatunji Michael Adebayo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session / Year</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    placeholder="e.g. 2025/2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Academic Excellence, Leadership & Service, Innovation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Citation</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Citation of achievement, CGPA, research publication, or service highlights..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recipient Photo or Certificate Image</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">Upload portrait photo or scanned certificate</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAward(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isNew ? 'Create Award' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
