import React, { useState } from 'react';
import { EVENTS_DATA } from '../../data/mockData';
import { ChapterEvent } from '../../types';
import { Calendar, Download, X, Eye, Sparkles, Atom, MapPin, Clock, ExternalLink } from 'lucide-react';

interface EventsViewProps {
  data?: ChapterEvent[];
}

export const EventsView: React.FC<EventsViewProps> = ({ data = EVENTS_DATA }) => {
  const [selectedFlyer, setSelectedFlyer] = useState<string | null>(null);
  const [flyerTitle, setFlyerTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');

  const safeData = data || EVENTS_DATA || [];
  const filteredEvents = safeData.filter(evt => {
    if (!evt) return false;
    if (activeTab === 'upcoming') return evt.upcoming || evt.ongoing;
    if (activeTab === 'past') return !evt.upcoming && !evt.ongoing;
    return true;
  });

  const handleDownloadFlyer = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_flyer.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <section className="bg-[#08111d] py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-sky-400" />
              <span>Scientific Symposia & Gatherings</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
              NAPS Chapter Events
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Stay engaged with our annual Physics Week, scientific exhibitions, astronomy excursions, research conferences, and sports tournaments across LASUSTECH.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2 max-w-md">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Events ({data.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Past Archives
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">No Events Listed</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back shortly or explore past archives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Event Image Banner */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-950">
                    <img
                      src={event.image}
                      alt={event.title}
                      className={`w-full h-full ${event.contain ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform duration-500`}
                    />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {event.eventTag && (
                        <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                          {event.eventTag}
                        </span>
                      )}
                      {event.upcoming && (
                        <span className="bg-sky-500 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
                          Upcoming
                        </span>
                      )}
                      {event.ongoing && (
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs animate-pulse">
                          Ongoing
                        </span>
                      )}
                    </div>

                    {/* Preview Flyer Button Overlay */}
                    <button
                      onClick={() => {
                        setSelectedFlyer(event.image);
                        setFlyerTitle(event.title);
                      }}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Enlarge Flyer</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5 text-sky-600 font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{event.date}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>

                    {event.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-2.5">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}

                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-4">
                      {event.description}
                    </p>

                    {event.registrationInfo && (
                      <div className="mt-3 p-2.5 rounded-xl bg-sky-50 text-[11px] text-sky-900 font-medium border border-sky-100">
                        ℹ️ {event.registrationInfo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedFlyer(event.image);
                        setFlyerTitle(event.title);
                      }}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Flyer</span>
                    </button>

                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Register</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownloadFlyer(event.image, event.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save Flyer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flyer Lightbox Modal */}
      {selectedFlyer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
          onClick={() => setSelectedFlyer(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800 text-white">
              <h4 className="font-bold text-sm truncate max-w-[80%]">{flyerTitle}</h4>
              <button
                onClick={() => setSelectedFlyer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={selectedFlyer}
                alt={flyerTitle}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleDownloadFlyer(selectedFlyer, flyerTitle)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download High-Res Flyer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
