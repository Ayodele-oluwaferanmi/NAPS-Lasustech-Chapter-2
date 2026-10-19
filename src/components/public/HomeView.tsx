import React from 'react';
import { 
  ArrowRight, 
  LogIn, 
  CreditCard, 
  IdCard, 
  BookOpen, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Download,
  FileText,
  Atom,
  Trophy
} from 'lucide-react';
import { 
  EXECUTIVES_DATA, 
  EVENTS_DATA, 
  GALLERY_ITEMS, 
  HERO_BG_IMAGE, 
  CONSTITUTION_ARTICLES,
  PAST_QUESTIONS_DATA
} from '../../data/mockData';
import { Executive, ChapterEvent, PastQuestion, PeopleProfile } from '../../types';
import { InteractiveCoin } from '../common/InteractiveCoin';

interface HomeViewProps {
  onNavigate: (view: string, tab?: string) => void;
  onOpenLogin: (tab?: string) => void;
  onOpenIdPreview?: () => void;
  onOpenPayment?: () => void;
  executives?: Executive[];
  people?: PeopleProfile[];
  events?: ChapterEvent[];
  pastQuestions?: PastQuestion[];
  gallery?: any[];
  siteSettings?: any;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onNavigate, 
  onOpenLogin,
  onOpenIdPreview,
  onOpenPayment,
  executives = EXECUTIVES_DATA,
  people,
  events = EVENTS_DATA,
  pastQuestions = PAST_QUESTIONS_DATA,
  gallery = GALLERY_ITEMS,
  siteSettings
}) => {
  // Top 4 executives for homepage preview
  const featuredExecutives = React.useMemo(() => {
    if (people && people.length > 0) {
      return people.filter(p => p.category === 'executive' || p.category === 'honourable').slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        post: p.post,
        level: p.level || '',
        description: p.description || '',
        image: p.image || ''
      }));
    }
    return executives.slice(0, 4);
  }, [people, executives]);
  // Top 3 events
  const featuredEvents = events.slice(0, 3);
  // Featured past questions
  const featuredPQs = pastQuestions.slice(0, 4);
  // Gallery preview
  const galleryImages = gallery[0]?.images?.slice(0, 4) || GALLERY_ITEMS[0]?.images.slice(0, 4) || [];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#08111d] text-white pt-24 pb-32 lg:pt-32 lg:pb-44 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG_IMAGE}
            alt="NAPS LASUSTECH Campus"
            className="w-full h-full object-cover object-center opacity-25 filter blur-[1px] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#08111d]/90 via-[#08111d]/80 to-[#08111d]"></div>
          {/* Radial spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Chapter pill label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-400 mb-6 shadow-xs backdrop-blur-md">
            <Atom className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>National Association of Physics Students • LASUSTECH Chapter</span>
          </div>

          {/* Grand Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            NAPS <span className="text-[#38bdf8]">LASUSTECH</span> Chapter
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Pioneering scientific discovery, theoretical inquiry, experimental physics, and technological innovation across the physical sciences.
          </p>

          {/* Slogan badge */}
          <p className="mt-3 text-xs uppercase tracking-widest text-sky-400 font-bold">
            Motto: "Advancing Science, Unlocking the Universe"
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('past-questions')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-8 py-3.5 shadow-lg shadow-sky-900/30 transition-all active:scale-95"
            >
              <FileText className="h-4 w-4" />
              <span>Past Questions Archive</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onOpenLogin('overview')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1F5FAF] hover:bg-[#184d90] text-white font-bold text-sm px-8 py-3.5 shadow-lg shadow-blue-900/30 transition-all active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Go to Student Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. FLOATING QUICK ACCESS GRID (Overlapping hero bottom) */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Login */}
          <div
            onClick={() => onOpenLogin('overview')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-sky-500/50 transition-all hover:-translate-y-1"
          >
            <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors mb-4">
              <LogIn className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              Login
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Access your NAPS member portal
            </p>
          </div>

          {/* Card 2: Pay Dues */}
          <div
            onClick={() => {
              if (onOpenPayment) onOpenPayment();
              else onOpenLogin('dues');
            }}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all hover:-translate-y-1"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Pay Dues
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pay your NAPS session dues (₦2,000)
            </p>
          </div>

          {/* Card 3: ID Card */}
          <div
            onClick={() => {
              if (onOpenIdPreview) onOpenIdPreview();
              else onOpenLogin('idcard');
            }}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-sky-500/50 transition-all hover:-translate-y-1"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1F5FAF] group-hover:bg-[#1F5FAF] group-hover:text-white transition-colors mb-4">
              <IdCard className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#1F5FAF] transition-colors">
              ID Card
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Generate & preview official digital ID
            </p>
          </div>

          {/* Card 4: Past Questions */}
          <div
            onClick={() => onNavigate('past-questions')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all hover:-translate-y-1"
          >
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Past Questions
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Download exams & syllabus archive
            </p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT OUR CHAPTER / INNOVATION AT LASUSTECH (With 3D Coin Flip) */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>About Our Chapter</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Physical Sciences at <span className="text-[#1F5FAF]">LASUSTECH</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              The LASUSTECH Chapter of NAPS (National Association of Physics Students) is an energetic academic union dedicated to theoretical inquiry, experimental rigor, and scientific advancement. We unite physics scholars from freshman year to final year research seminars.
            </p>

            <p className="text-sm text-slate-500 leading-relaxed">
              From classical mechanics and optics laboratories to quantum theory, solar photovoltaics, geoelectrical surveying, and satellite astronomy, we organize academic workshops, practical preparation bootcamps, and scientific research visits.
            </p>

            {/* Disciplines Covered */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Core Specialization Streams:
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Theoretical & Mathematical Physics',
                  'Applied Geophysics',
                  'Radiation & Medical Physics',
                  'Renewable Energy & Materials',
                  'Electronics & Instrumentation',
                  'Astrophysics & Space Science'
                ].map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>{dept}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('executives')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 transition-colors shadow-xs"
              >
                <Users className="h-4 w-4" />
                <span>Meet Chapter Leaders</span>
              </button>
              <button
                onClick={() => onNavigate('past-questions')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-bold px-6 py-3 transition-colors shadow-2xs"
              >
                <FileText className="h-4 w-4 text-sky-600" />
                <span>Browse Past Questions</span>
              </button>
            </div>
          </div>

          {/* Right: Signature 3D Flipping Coin */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-100/80 to-white p-6 border border-slate-200/80 shadow-xl">
              <InteractiveCoin />
            </div>
          </div>
        </div>
      </section>

      {/* 4. PAST QUESTIONS ARCHIVE HIGHLIGHT */}
      <section className="py-16 lg:py-20 bg-slate-100/80 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Academic Repository
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Past Questions & Syllabus Bank
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Verified departmental examination papers, Continuous Assessment (CA) tests, and laboratory manual guides for all levels.
              </p>
            </div>

            <button
              onClick={() => onNavigate('past-questions')}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs"
            >
              <span>View All Past Questions</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPQs.map((pq) => (
              <div
                key={pq.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
                      {pq.courseCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {pq.level}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2">
                    {pq.courseTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    {pq.semester} Semester • {pq.session}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {pq.downloads} downloads
                  </span>
                  <button
                    onClick={() => onNavigate('past-questions')}
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEADERSHIP / EXECUTIVE COUNCIL PREVIEW */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Leadership
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Executive Council
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                The dedicated leaders guiding the NAPS LASUSTECH Chapter towards academic brilliance and laboratory excellence.
              </p>
            </div>

            <button
              onClick={() => onNavigate('executives')}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
            >
              <span>View Full Council</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExecutives.map((exec, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-4/5 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={exec.image}
                    alt={exec.name}
                    className={`w-full h-full object-cover ${exec.objectPosition || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="p-5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 mb-2">
                    {exec.post}
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                    {exec.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {exec.level}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {exec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HAPPENINGS & EVENTS PREVIEW */}
      <section className="py-16 lg:py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Happenings
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Chapter Events
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                From Physics Week exhibitions and observatory stargazing to inter-level sports cups and research seminars.
              </p>
            </div>

            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <span>Explore All Events</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onNavigate('events')}
                className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="aspect-16/10 w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                      {evt.eventTag || 'Event'}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-sky-600 font-semibold mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{evt.date}</span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 group-hover:text-sky-700">
                    <span>View Event Flyer</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PHOTO ARCHIVE MOMENTS PREVIEW */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Memories
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Chapter Moments
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Preserving historical moments from scientific conferences, telescope stargazing, and departmental celebrations.
              </p>
            </div>

            <button
              onClick={() => onNavigate('gallery')}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
            >
              <span>View Full Photo Archive</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('gallery')}
                className="group cursor-pointer aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative shadow-sm hover:shadow-md"
              >
                <img
                  src={imgUrl}
                  alt={`NAPS Moment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    View Photo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONSTITUTION CALLOUT */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#08111d] to-[#0f1d30] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Supreme Law of the Chapter</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
              The NAPS Chapter Constitution
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light italic">
              "{CONSTITUTION_ARTICLES[0]?.sections[0]?.content.slice(1, 280)}..."
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('constitution')}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-6 py-3 transition-colors shadow-lg shadow-sky-900/40"
              >
                <BookOpen className="h-4 w-4" />
                <span>Read Full Constitution</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-6 py-3 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Save Official Copy</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PORTAL REGISTRATION BANNER */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-900 via-[#1F5FAF] to-blue-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold">
                Join the NAPS LASUSTECH Digital Register
              </h3>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                Pay your ₦2,000 session dues, generate your official digital student ID card with presidential clearance signature, and gain full chapter privileges.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => onOpenLogin('overview')}
                className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 text-xs font-bold shadow-md transition-all active:scale-95 text-center"
              >
                Student Sign In
              </button>
              <button
                onClick={() => onOpenLogin('dues')}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 text-xs font-bold shadow-md transition-all active:scale-95 text-center"
              >
                Pay Session Dues
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
