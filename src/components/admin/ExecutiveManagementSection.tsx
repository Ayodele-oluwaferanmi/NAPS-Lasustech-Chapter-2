import React, { useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  Search, 
  Filter, 
  Award, 
  Mail, 
  Phone, 
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Executive } from '../../types';
import { apiUploadDocument } from '../../utils/authClient';

interface ExecutiveManagementSectionProps {
  executives?: Executive[];
  onUpdateExecutives: (newExecs: Executive[]) => void;
  showFeedback: (msg: string) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
];

export const ExecutiveManagementSection: React.FC<ExecutiveManagementSectionProps> = ({
  executives,
  onUpdateExecutives,
  showFeedback
}) => {
  const currentExecs = executives || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Add executive state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExec, setNewExec] = useState<Executive>({
    id: `exec-${Date.now()}`,
    name: '',
    post: '',
    level: '300 Level',
    description: '',
    image: DEFAULT_AVATARS[0],
    category: 'top',
    phone: '',
    email: '',
    department: 'Physics'
  });

  // Edit executive state
  const [editingExec, setEditingExec] = useState<Executive | null>(null);
  const [execToDelete, setExecToDelete] = useState<Executive | null>(null);

  // File input refs
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Handle secure image upload with server-side magic-byte verification
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      try {
        const uploadResult = await apiUploadDocument(base64Url, file.name, 'executive_photo');
        if (!uploadResult.success) {
          alert(`File security rejection: ${uploadResult.error}`);
          return;
        }
        const verifiedUrl = uploadResult.dataUrl || base64Url;
        if (isEditing && editingExec) {
          setEditingExec({ ...editingExec, image: verifiedUrl });
        } else {
          setNewExec(prev => ({ ...prev, image: verifiedUrl }));
        }
        showFeedback('Profile photo verified and uploaded securely.');
      } catch (err) {
        // fallback
        if (isEditing && editingExec) {
          setEditingExec({ ...editingExec, image: base64Url });
        } else {
          setNewExec(prev => ({ ...prev, image: base64Url }));
        }
        showFeedback('Profile photo uploaded.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new executive
  const handleCreateExecutive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExec.name.trim() || !newExec.post.trim()) {
      alert('Full name and executive position are required.');
      return;
    }

    const created: Executive = {
      ...newExec,
      id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newExec.name.trim(),
      post: newExec.post.trim()
    };

    onUpdateExecutives([created, ...executives]);
    showFeedback(`Executive ${created.name} added to the leadership directory!`);
    setShowAddModal(false);
    // Reset form
    setNewExec({
      id: `exec-${Date.now()}`,
      name: '',
      post: '',
      level: '300 Level',
      description: '',
      image: DEFAULT_AVATARS[0],
      category: 'top',
      phone: '',
      email: '',
      department: 'Physics'
    });
  };

  // Submit edit executive
  const handleSaveEditExecutive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExec) return;
    if (!editingExec.name.trim() || !editingExec.post.trim()) {
      alert('Full name and executive position are required.');
      return;
    }

    const updated = executives.map((ex) => {
      const match = (ex.id && editingExec.id && ex.id === editingExec.id) || ex.name === editingExec.name;
      return match ? editingExec : ex;
    });

    onUpdateExecutives(updated);
    showFeedback(`Executive ${editingExec.name} updated successfully.`);
    setEditingExec(null);
  };

  // Delete executive
  const handleConfirmDelete = () => {
    if (!execToDelete) return;
    const filtered = (currentExecs || []).filter(ex => 
      (ex.id && execToDelete.id ? ex.id !== execToDelete.id : ex.name !== execToDelete.name)
    );
    onUpdateExecutives(filtered);
    showFeedback(`Executive ${execToDelete.name} removed from council.`);
    setExecToDelete(null);
  };

  // Filtered executive list
  const filteredExecutives = (currentExecs || []).filter(ex => {
    const matchesSearch = 
      (ex?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex?.post || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex?.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ex?.level && ex.level.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200/60 mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Executive Governance Hub</span>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            NAPS Executive Council Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, reassign portfolios, and update profile photos for student leadership. All changes reflect live on the public Executives page.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Executive</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, portfolio title, or level..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Portfolios' },
            { id: 'top', label: 'Top Bureau' },
            { id: 'secretariat', label: 'Secretariat' },
            { id: 'directors', label: 'Directors' },
            { id: 'hocs', label: 'Class Reps (HOCs)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === tab.id
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executives Cards Grid */}
      {filteredExecutives.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No Executives Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No executive matches the current search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExecutives.map((ex, idx) => (
            <div
              key={ex.id || `${ex.name}-${idx}`}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative h-18 w-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                    <img
                      src={ex.image}
                      alt={ex.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {ex.level && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs text-[9px] font-bold text-white text-center py-0.5">
                        {ex.level}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 truncate block">
                      {ex.post}
                    </span>
                    <h4 className="font-display text-base font-bold text-slate-900 leading-snug truncate mt-0.5">
                      {ex.name}
                    </h4>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold capitalize">
                      {ex.category ? ex.category.replace('_', ' ') : 'Executive'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {ex.description || 'No biography or mandate statement provided.'}
                </p>

                {(ex.email || ex.phone) && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] text-slate-400 mb-4">
                    {ex.email && (
                      <span className="flex items-center gap-1 truncate max-w-full">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{ex.email}</span>
                      </span>
                    )}
                    {ex.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{ex.phone}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingExec(ex)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile & Photo</span>
                </button>

                <button
                  onClick={() => setExecToDelete(ex)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Remove Executive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: ADD NEW EXECUTIVE */}
      {/* ================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div 
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Add Executive Officer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish a new leader to the official NAPS leadership directory.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExecutive} className="space-y-4 text-xs overflow-y-auto pr-1">
              {/* Profile Image Upload & Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Executive Profile Photo:
                </label>
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative h-18 w-18 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <img
                      src={newExec.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Photo File</span>
                      </button>
                      <input
                        type="file"
                        ref={addFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Supports JPG, PNG, WEBP files up to 5MB.
                    </p>
                  </div>
                </div>

                {/* Photo URL fallback */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Or Enter Image URL Directly:
                  </span>
                  <input
                    type="text"
                    value={newExec.image}
                    onChange={(e) => setNewExec({ ...newExec, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-mono"
                  />
                </div>
              </div>

              {/* Name & Post */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Comrade Babatunde Peter"
                    value={newExec.name}
                    onChange={(e) => setNewExec({ ...newExec, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Portfolio / Position Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President or General Secretary"
                    value={newExec.post}
                    onChange={(e) => setNewExec({ ...newExec, post: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Level & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Level:
                  </label>
                  <select
                    value={newExec.level}
                    onChange={(e) => setNewExec({ ...newExec, level: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Portfolio Category:
                  </label>
                  <select
                    value={newExec.category}
                    onChange={(e) => setNewExec({ ...newExec, category: e.target.value as never })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="top">Central Exco (Top Bureau)</option>
                    <option value="secretariat">Secretariat & Treasury</option>
                    <option value="directors">Directors & Welfare</option>
                    <option value="hocs">Head of Class (HOC)</option>
                    <option value="ass_hocs">Assistant Head of Class</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={newExec.phone || ''}
                    onChange={(e) => setNewExec({ ...newExec, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Email:
                  </label>
                  <input
                    type="email"
                    placeholder="executive@napslasustech.org.ng"
                    value={newExec.email || ''}
                    onChange={(e) => setNewExec({ ...newExec, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Bio Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bio / Mandate Statement:
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief leadership background, vision, or motto for the physics students..."
                  value={newExec.description}
                  onChange={(e) => setNewExec({ ...newExec, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Publish Executive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: EDIT EXISTING EXECUTIVE */}
      {/* ================================================================= */}
      {editingExec && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div 
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Edit Executive Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update photo, portfolio title, contact details, or bio.
                </p>
              </div>
              <button
                onClick={() => setEditingExec(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExecutive} className="space-y-4 text-xs overflow-y-auto pr-1">
              {/* Profile Photo Replacement */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Executive Portrait:
                </label>
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 shadow-2xs">
                    <img
                      src={editingExec.image}
                      alt={editingExec.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Replace Profile Photo</span>
                    </button>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-500">
                      Upload from phone or computer. Updates immediately.
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Or Edit Image URL:
                  </span>
                  <input
                    type="text"
                    value={editingExec.image}
                    onChange={(e) => setEditingExec({ ...editingExec, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-mono"
                  />
                </div>
              </div>

              {/* Name & Post */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExec.name}
                    onChange={(e) => setEditingExec({ ...editingExec, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Portfolio / Position Title:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExec.post}
                    onChange={(e) => setEditingExec({ ...editingExec, post: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Level & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Level:
                  </label>
                  <select
                    value={editingExec.level}
                    onChange={(e) => setEditingExec({ ...editingExec, level: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Portfolio Category:
                  </label>
                  <select
                    value={editingExec.category || 'top'}
                    onChange={(e) => setEditingExec({ ...editingExec, category: e.target.value as never })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="top">Central Exco (Top Bureau)</option>
                    <option value="secretariat">Secretariat & Treasury</option>
                    <option value="directors">Directors & Welfare</option>
                    <option value="hocs">Head of Class (HOC)</option>
                    <option value="ass_hocs">Assistant Head of Class</option>
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={editingExec.phone || ''}
                    onChange={(e) => setEditingExec({ ...editingExec, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Email:
                  </label>
                  <input
                    type="email"
                    placeholder="executive@napslasustech.org.ng"
                    value={editingExec.email || ''}
                    onChange={(e) => setEditingExec({ ...editingExec, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bio / Mandate Statement:
                </label>
                <textarea
                  rows={3}
                  value={editingExec.description}
                  onChange={(e) => setEditingExec({ ...editingExec, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExec(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: CONFIRM DELETE EXECUTIVE */}
      {/* ================================================================= */}
      {execToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Remove Executive
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm council roster modification
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to remove <strong>{execToDelete.name}</strong> ({execToDelete.post}) from the executive council directory? This action immediately takes effect on the public portal.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExecToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Keep Executive
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
