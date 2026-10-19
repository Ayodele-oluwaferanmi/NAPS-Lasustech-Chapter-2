import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle2, 
  Tag, 
  Calendar,
  Layers,
  AlertCircle,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { uploadFileViaApi } from '../../utils/authClient';

interface GalleryManagementSectionProps {
  gallery?: GalleryItem[];
  items?: GalleryItem[];
  onSaveAlbum?: (album: GalleryItem) => Promise<void> | void;
  onDeleteAlbum?: (id: string) => Promise<void> | void;
  onUpdateGallery?: (gallery: GalleryItem[]) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const GalleryManagementSection: React.FC<GalleryManagementSectionProps> = ({
  gallery,
  items,
  onSaveAlbum,
  onDeleteAlbum,
  onUpdateGallery,
  showFeedback
}) => {
  const currentGallery = gallery || items || [];
  const [editingAlbum, setEditingAlbum] = useState<GalleryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    id: '',
    title: '',
    eventTag: 'Physics Week',
    date: '',
    images: [] as string[]
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleOpenAdd = () => {
    setIsNew(true);
    const newId = `gallery-${Date.now()}`;
    setForm({
      id: newId,
      title: '',
      eventTag: 'Physics Week',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      images: []
    });
    setEditingAlbum({
      id: newId,
      title: '',
      eventTag: 'Physics Week',
      date: '',
      images: []
    });
    setUploadError(null);
  };

  const handleOpenEdit = (album: GalleryItem) => {
    setIsNew(false);
    setForm({
      id: album.id,
      title: album.title,
      eventTag: album.eventTag || 'General',
      date: album.date || '',
      images: [...album.images]
    });
    setEditingAlbum(album);
    setUploadError(null);
  };

  // Support multiple image uploads simultaneously
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 8MB limit.`);
        }

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload through secure verification API
        const result = await uploadFileViaApi(base64Data, file.name, 'profile_photo');
        uploadedUrls.push(result.fileUrl || base64Data);
      }

      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err: any) {
      setUploadError(err.message || 'One or more images failed to upload.');
    } finally {
      setUploading(false);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setForm(prev => {
      const copy = [...prev.images];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, images: copy };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setUploadError('Album Title is required.');
      return;
    }
    if (form.images.length === 0) {
      setUploadError('Please upload at least one image to this gallery album.');
      return;
    }

    const albumToSave: GalleryItem = {
      id: form.id || `gallery-${Date.now()}`,
      title: form.title.trim(),
      eventTag: form.eventTag.trim(),
      date: form.date.trim(),
      images: form.images
    };

    if (onSaveAlbum) {
      await onSaveAlbum(albumToSave);
    } else if (onUpdateGallery) {
      const idx = currentGallery.findIndex(g => g.id === albumToSave.id);
      let updated: GalleryItem[];
      if (idx >= 0) {
        updated = [...currentGallery];
        updated[idx] = albumToSave;
      } else {
        updated = [albumToSave, ...currentGallery];
      }
      await onUpdateGallery(updated);
    }

    if (showFeedback) {
      showFeedback(`Album "${albumToSave.title}" saved.`);
    }
    setActionSuccess(`Album "${albumToSave.title}" with ${albumToSave.images.length} photos saved.`);
    setEditingAlbum(null);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the album "${title}"?`)) {
      if (onDeleteAlbum) {
        await onDeleteAlbum(id);
      } else if (onUpdateGallery) {
        const updated = currentGallery.filter(g => g.id !== id);
        await onUpdateGallery(updated);
      }
      if (showFeedback) {
        showFeedback(`Album "${title}" has been deleted.`);
      }
      setActionSuccess(`Album "${title}" has been deleted.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filteredAlbums = (currentGallery || []).filter(album => 
    (album?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (album?.eventTag || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Photo Gallery & Archive Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload single or bulk event photographs, manage albums, captions, reorder shots, and curate visual history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Photo Album</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <input
          type="text"
          placeholder="Filter gallery albums by title or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Gallery Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAlbums.map(album => (
          <div 
            key={album.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Image Preview Collage */}
            <div className="relative h-48 bg-slate-900 grid grid-cols-2 gap-0.5 overflow-hidden">
              {album.images.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${album.title} ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              ))}
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>{album.images.length} Photos</span>
              </div>
              <div className="absolute top-2 left-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-slate-900 shadow-xs">
                  {album.eventTag}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{album.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {album.title}
                </h3>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(album)}
                  className="p-2 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                  title="Edit Album"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(album.id, album.title)}
                  className="p-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Delete Album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAlbums.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No photo albums found</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Photo Album" to upload pictures.</p>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isNew ? 'Create Photo Album' : 'Manage Gallery Album'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload multiple photos, reorder thumbnails, and update album tags.
                </p>
              </div>
              <button 
                onClick={() => setEditingAlbum(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Album Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Physics Week 2026 Innovation Showcase"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Category / Tag *</label>
                  <input
                    type="text"
                    required
                    value={form.eventTag}
                    onChange={e => setForm({ ...form, eventTag: e.target.value })}
                    placeholder="e.g. Physics Week, Excursion, Laboratory"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    placeholder="e.g. June 17, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Multiple Images Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <Upload className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-xs mb-1">
                  Upload Photos to this Album
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Select one or multiple image files (PNG, JPG, WebP) from your device.
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
                  <span>Choose Files (Multiple Allowed)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleMultipleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {uploading && (
                  <p className="text-xs text-indigo-600 font-semibold mt-2 animate-pulse">
                    Uploading and verifying image integrity...
                  </p>
                )}
              </div>

              {/* Or Add Image URL */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Or paste an image URL directly..."
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                >
                  Add URL
                </button>
              </div>

              {/* Photos in Album List & Reordering */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-xs">
                    Album Photos ({form.images.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Use arrows to reorder photo display order
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-900 h-24 border border-slate-200">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'up')}
                            className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded-md"
                            title="Move Earlier"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {idx < form.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'down')}
                            className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded-md"
                            title="Move Later"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-950/70 rounded text-[9px] font-bold text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}

                  {form.images.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                      No photos added yet. Upload files or paste links above.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isNew ? 'Create Album' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
