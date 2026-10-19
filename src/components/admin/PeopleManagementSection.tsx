import React, { useState } from 'react';
import { PeopleProfile } from '../../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  GraduationCap, 
  Award, 
  Phone, 
  Mail,
  Search
} from 'lucide-react';
import { uploadFileViaApi } from '../../utils/authClient';

interface PeopleManagementSectionProps {
  people?: PeopleProfile[];
  onSavePerson?: (person: PeopleProfile) => Promise<void> | void;
  onDeletePerson?: (id: string) => Promise<void> | void;
  onUpdatePeople?: (people: PeopleProfile[]) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const PeopleManagementSection: React.FC<PeopleManagementSectionProps> = ({
  people,
  onSavePerson,
  onDeletePerson,
  onUpdatePeople,
  showFeedback
}) => {
  const currentPeople = people || [];
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'executive' | 'honourable' | 'patron' | 'hoc' | 'official'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPerson, setEditingPerson] = useState<PeopleProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '',
    name: '',
    post: '',
    level: '400 Level',
    category: 'executive' as PeopleProfile['category'],
    description: '',
    bio: '',
    image: '',
    phone: '',
    email: '',
    department: 'Department of Physics',
    order: 50
  });

  const handleOpenAdd = () => {
    setIsNew(true);
    const newId = `peo-${Date.now()}`;
    setForm({
      id: newId,
      name: '',
      post: '',
      level: '400 Level',
      category: selectedCategory === 'all' ? 'executive' : selectedCategory,
      description: '',
      bio: '',
      image: '',
      phone: '',
      email: '',
      department: 'Department of Physics',
      order: people.length + 1
    });
    setEditingPerson({
      id: newId,
      name: '',
      post: '',
      level: '400 Level',
      category: 'executive',
      description: '',
      image: ''
    });
    setUploadError(null);
  };

  const handleOpenEdit = (person: PeopleProfile) => {
    setIsNew(false);
    setForm({
      id: person.id,
      name: person.name,
      post: person.post,
      level: person.level,
      category: person.category || 'executive',
      description: person.description || '',
      bio: person.bio || '',
      image: person.image || '',
      phone: person.phone || '',
      email: person.email || '',
      department: person.department || 'Department of Physics',
      order: person.order || 50
    });
    setEditingPerson(person);
    setUploadError(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Portrait image exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await uploadFileViaApi(base64, file.name, 'profile_photo');
        setForm(prev => ({ ...prev, image: res.fileUrl || base64 }));
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload photo.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.post.trim()) {
      setUploadError('Full Name and Official Position / Title are required.');
      return;
    }

    const personToSave: PeopleProfile = {
      id: form.id || `peo-${Date.now()}`,
      name: form.name.trim(),
      post: form.post.trim(),
      level: form.level.trim(),
      category: form.category,
      description: form.description.trim(),
      bio: form.bio.trim(),
      image: form.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      phone: form.phone.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      order: Number(form.order) || 50
    };

    if (onSavePerson) {
      await onSavePerson(personToSave);
    } else if (onUpdatePeople) {
      const idx = currentPeople.findIndex(p => p.id === personToSave.id);
      let updated: PeopleProfile[];
      if (idx >= 0) {
        updated = [...currentPeople];
        updated[idx] = personToSave;
      } else {
        updated = [personToSave, ...currentPeople];
      }
      await onUpdatePeople(updated);
    }
    if (showFeedback) showFeedback(`Profile for "${personToSave.name}" saved.`);
    setActionSuccess(`Profile for "${personToSave.name}" successfully ${isNew ? 'created' : 'updated'}.`);
    setEditingPerson(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the profile of "${name}"?`)) {
      if (onDeletePerson) {
        await onDeletePerson(id);
      } else if (onUpdatePeople) {
        const updated = currentPeople.filter(p => p.id !== id);
        await onUpdatePeople(updated);
      }
      if (showFeedback) showFeedback(`Profile for "${name}" removed.`);
      setActionSuccess(`Profile for "${name}" removed.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filteredPeople = (currentPeople || []).filter(p => {
    const matchesSearch = (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p?.post || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p?.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  }).sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">People & Leadership Profiles</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage executive council members, parliamentary honourable officials, patrons/advisers, and class representatives (HOCs).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Profile</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Categories & Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['all', 'executive', 'honourable', 'patron', 'hoc', 'official'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Roles' : cat === 'hoc' ? 'Class HOCs' : cat === 'executive' ? 'Executive Council' : cat === 'honourable' ? 'Honourables' : cat === 'patron' ? 'Patrons & Advisers' : 'Officials'}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search by name, post..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPeople.map(person => (
          <div 
            key={person.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {person.image ? (
                    <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                      {person.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 capitalize">
                    {person.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                    {person.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#1F5FAF] mt-0.5 truncate">
                    {person.post}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {person.level} • {person.department || 'Physics'}
                  </p>
                </div>
              </div>

              {person.description && (
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {person.description}
                </p>
              )}

              {(person.phone || person.email) && (
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                  {person.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-sky-600 shrink-0" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-sky-600 shrink-0" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(person)}
                className="p-2 text-sky-700 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(person.id, person.name)}
                className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Delete Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredPeople.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No profiles found</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add New Profile" to create one.</p>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingPerson && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isNew ? 'Create New Profile' : 'Edit Profile Information'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Configure name, executive position, bio, portrait image, and classification.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name & Title *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Comr. Olatunji Michael Adebayo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Office / Position *</label>
                  <input
                    type="text"
                    required
                    value={form.post}
                    onChange={e => setForm({ ...form, post: e.target.value })}
                    placeholder="e.g. Chapter President"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Classification</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as never })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="executive">Executive Council</option>
                    <option value="honourable">Honourable / Consultative Council</option>
                    <option value="patron">Grand Patron / Staff Adviser</option>
                    <option value="hoc">Head of Class (HOC)</option>
                    <option value="official">Special Committee Official</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Level</label>
                  <input
                    type="text"
                    value={form.level}
                    onChange={e => setForm({ ...form, level: e.target.value })}
                    placeholder="e.g. 400 Level / Staff"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Description / Mandate</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Portfolio summary, academic focus, and initiatives..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="president@napslasustech.org.ng"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+234 802 345 6789"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Portrait Photo Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Portrait Photo</label>
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isNew ? 'Create Profile' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
