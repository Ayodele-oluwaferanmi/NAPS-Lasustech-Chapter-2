import React, { useState } from 'react';
import { ChapterEvent } from '../../types';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Tag, 
  Sparkles,
  Link,
  Eye,
  AlertCircle
} from 'lucide-react';
import { uploadFileViaApi } from '../../utils/authClient';

interface EventsManagementSectionProps {
  events?: ChapterEvent[];
  onSaveEvent?: (event: ChapterEvent) => Promise<void> | void;
  onDeleteEvent?: (id: string) => Promise<void> | void;
  onUpdateEvents?: (events: ChapterEvent[]) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const EventsManagementSection: React.FC<EventsManagementSectionProps> = ({
  events,
  onSaveEvent,
  onDeleteEvent,
  onUpdateEvents,
  showFeedback
}) => {
  const currentEvents = events || [];
  const [editingEvent, setEditingEvent] = useState<ChapterEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    id: '',
    title: '',
    date: '',
    time: '10:00 AM WAT',
    venue: 'Faculty of Science Lecture Theatre, LASUSTECH',
    description: '',
    image: '',
    upcoming: true,
    ongoing: false,
    eventTag: 'Physics Week',
    registrationUrl: ''
  });

  const handleOpenAdd = () => {
    setIsNew(true);
    setForm({
      id: `evt-${Date.now()}`,
      title: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: '10:00 AM WAT',
      venue: 'Faculty of Science Lecture Theatre, LASUSTECH',
      description: '',
      image: 'https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg',
      upcoming: true,
      ongoing: false,
      eventTag: 'Physics Week',
      registrationUrl: ''
    });
    setEditingEvent({
      id: `evt-${Date.now()}`,
      title: '',
      date: '',
      description: '',
      image: ''
    });
    setUploadError(null);
  };

  const handleOpenEdit = (evt: ChapterEvent) => {
    setIsNew(false);
    setForm({
      id: evt.id,
      title: evt.title,
      date: evt.date,
      time: '10:00 AM WAT',
      venue: 'Faculty of Science Lecture Theatre, LASUSTECH',
      description: evt.description,
      image: evt.image,
      upcoming: Boolean(evt.upcoming),
      ongoing: Boolean(evt.ongoing),
      eventTag: evt.eventTag || 'General',
      registrationUrl: ''
    });
    setEditingEvent(evt);
    setUploadError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const result = await uploadFileViaApi(base64Data, file.name, 'profile_photo');
        setForm(prev => ({ ...prev, image: result.fileUrl || base64Data }));
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
    if (!form.title.trim() || !form.date.trim()) {
      setUploadError('Title and Event Date are required.');
      return;
    }

    const eventToSave: ChapterEvent = {
      id: form.id || `evt-${Date.now()}`,
      title: form.title.trim(),
      date: form.date.trim(),
      description: form.description.trim(),
      image: form.image || 'https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg',
      upcoming: form.upcoming,
      ongoing: form.ongoing,
      eventTag: form.eventTag
    };

    if (onSaveEvent) {
      await onSaveEvent(eventToSave);
    } else if (onUpdateEvents) {
      const idx = currentEvents.findIndex(e => e.id === eventToSave.id);
      let updated: ChapterEvent[];
      if (idx >= 0) {
        updated = [...currentEvents];
        updated[idx] = eventToSave;
      } else {
        updated = [eventToSave, ...currentEvents];
      }
      await onUpdateEvents(updated);
    }
    if (showFeedback) showFeedback(`Event "${eventToSave.title}" saved.`);
    setActionSuccess(`Event "${eventToSave.title}" successfully ${isNew ? 'published' : 'updated'}.`);
    setEditingEvent(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete event "${title}"?`)) {
      if (onDeleteEvent) {
        await onDeleteEvent(id);
      } else if (onUpdateEvents) {
        const updated = currentEvents.filter(e => e.id !== id);
        await onUpdateEvents(updated);
      }
      if (showFeedback) showFeedback(`Event "${title}" removed.`);
      setActionSuccess(`Event "${title}" was removed from the schedule.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filteredEvents = (currentEvents || []).filter(evt => {
    const matchesSearch = (evt?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (evt?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (evt?.eventTag && evt.eventTag.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (statusFilter === 'upcoming') return evt?.upcoming;
    if (statusFilter === 'ongoing') return evt?.ongoing;
    if (statusFilter === 'past') return !evt?.upcoming && !evt?.ongoing;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Events Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, classify (upcoming/ongoing/past), upload flyers, and schedule departmental symposia.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <input
          type="text"
          placeholder="Search events by title, description or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:flex-1 px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {(['all', 'upcoming', 'ongoing', 'past'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map(evt => (
          <div 
            key={evt.id} 
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              <img 
                src={evt.image} 
                alt={evt.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600';
                }}
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {evt.upcoming && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500 text-white shadow-xs">
                    Upcoming
                  </span>
                )}
                {evt.ongoing && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                    Ongoing Now
                  </span>
                )}
                {!evt.upcoming && !evt.ongoing && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    Past Event
                  </span>
                )}
                {evt.eventTag && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-slate-900 backdrop-blur-xs">
                    {evt.eventTag}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>{evt.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(evt)}
                  className="p-2 rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                  title="Edit Event"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(evt.id, evt.title)}
                  className="p-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No events found</p>
            <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or add a new event.</p>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isNew ? 'Publish New Event' : 'Edit Event Details'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update event details, timing, venue, flyers, and publication status.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual LASUSTECH Physics Week & Symposium 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Date(s) *</label>
                  <input
                    type="text"
                    required
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    placeholder="e.g. June 15 - 19, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Tag</label>
                  <input
                    type="text"
                    value={form.eventTag}
                    onChange={e => setForm({ ...form, eventTag: e.target.value })}
                    placeholder="e.g. Physics Week, Sports, Excursion"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Full agenda, symposium theme, keynote speakers, and participating levels..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              {/* Status Toggles */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Publication & Lifecycle Status:</span>
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.upcoming}
                      onChange={e => setForm({ ...form, upcoming: e.target.checked, ongoing: e.target.checked ? false : form.ongoing })}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Mark as Upcoming</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ongoing}
                      onChange={e => setForm({ ...form, ongoing: e.target.checked, upcoming: e.target.checked ? false : form.upcoming })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Mark as Currently Ongoing</span>
                  </label>
                </div>
              </div>

              {/* Image / Flyer Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Banner / Flyer</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">PNG, JPEG, WebP up to 5MB (magic-bytes verified)</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isNew ? 'Publish Event' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
