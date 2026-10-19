import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../../data/mockData';
import { GalleryItem } from '../../types';
import { Download, X, ChevronLeft, ChevronRight, Filter, Atom } from 'lucide-react';

interface GalleryViewProps {
  data?: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ data = GALLERY_ITEMS }) => {
  const [activeTag, setActiveTag] = useState('All');
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    currentIndex: number;
    title: string;
  } | null>(null);

  // Derive unique tags from data
  const safeData = data || GALLERY_ITEMS || [];
  const dynamicTags = Array.from(new Set(safeData.map(i => i?.eventTag).filter(Boolean)));
  const tags = ['All', ...dynamicTags];

  const filteredItems = safeData.filter(item => {
    if (!item) return false;
    if (activeTag === 'All') return true;
    return item.eventTag === activeTag;
  });

  // Flatten all photos for grid view with parent context
  const photoList: { url: string; title: string; eventTag: string; date: string; itemIndex: number; images: string[] }[] = [];
  filteredItems.forEach(item => {
    (item.images || []).forEach((img, idx) => {
      photoList.push({
        url: img,
        title: item.title,
        eventTag: item.eventTag,
        date: item.date,
        itemIndex: idx,
        images: item.images || []
      });
    });
  });

  const handleDownload = (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_photo.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxData) return;
    setLightboxData({
      ...lightboxData,
      currentIndex: (lightboxData.currentIndex + 1) % lightboxData.images.length
    });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightboxData) return;
    setLightboxData({
      ...lightboxData,
      currentIndex: (lightboxData.currentIndex - 1 + lightboxData.images.length) % lightboxData.images.length
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <section className="bg-[#08111d] py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-sky-400" />
              <span>Visual Archive</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-5xl">
              Chapter Moments
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              A curated visual timeline of physics symposiums, astronomical observations, laboratory practicals, and departmental celebrations.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2 overflow-x-auto">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTag === tag
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {photoList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <p className="text-sm text-slate-500">No photos found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photoList.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxData({
                  images: photo.images,
                  currentIndex: photo.itemIndex,
                  title: photo.title
                })}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold bg-sky-600/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                      {photo.eventTag}
                    </span>
                    <button
                      onClick={(e) => handleDownload(e, photo.url, photo.title)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                      title="Save Photo"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-bold leading-tight line-clamp-1">{photo.title}</p>
                    <p className="text-[10px] text-white/70 mt-0.5">{photo.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Viewer */}
      {lightboxData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in"
          onClick={() => setLightboxData(null)}
        >
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <div className="max-w-[70%]">
              <h4 className="font-bold text-sm truncate">{lightboxData.title}</h4>
              <p className="text-xs text-white/60">
                Photo {lightboxData.currentIndex + 1} of {lightboxData.images.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleDownload(e, lightboxData.images[lightboxData.currentIndex], lightboxData.title)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download Photo"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLightboxData(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Main Image */}
          <div 
            className="relative max-w-4xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxData.images[lightboxData.currentIndex]}
              alt={lightboxData.title}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};
