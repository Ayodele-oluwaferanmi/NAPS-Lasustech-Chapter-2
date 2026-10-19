import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Filter, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  Layers,
  ArrowDownToLine,
  Eye,
  X,
  Printer,
  Image as ImageIcon,
  Clock,
  HelpCircle,
  School,
  ExternalLink
} from 'lucide-react';
import { PAST_QUESTIONS_DATA } from '../../data/mockData';
import { AcademicLevel, PastQuestion } from '../../types';

interface PastQuestionsViewProps {
  data?: PastQuestion[];
}

export const PastQuestionsView: React.FC<PastQuestionsViewProps> = ({ data = PAST_QUESTIONS_DATA }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [activeViewerPq, setActiveViewerPq] = useState<PastQuestion | null>(null);
  const [viewerTab, setViewerTab] = useState<'manual' | 'images' | 'pdf'>('manual');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filteredPQs = useMemo(() => {
    const safeData = data || PAST_QUESTIONS_DATA || [];
    return safeData.filter((pq) => {
      if (!pq) return false;
      const matchesSearch = 
        (pq.courseCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pq.courseTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pq.session || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === 'all' || pq.level === selectedLevel;
      const matchesSemester = selectedSemester === 'all' || pq.semester === selectedSemester;

      return matchesSearch && matchesLevel && matchesSemester;
    });
  }, [data, searchQuery, selectedLevel, selectedSemester]);

  const handleDownload = (pq: PastQuestion) => {
    if (pq.pdfUrl) {
      const link = document.createElement('a');
      link.href = pq.pdfUrl;
      link.download = pq.pdfFileName || `${pq.courseCode}_${pq.session.replace('/', '-')}_Exam.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(`Downloaded official PDF paper for ${pq.courseCode}.`);
    } else {
      setDownloadSuccess(`Downloaded official examination paper for ${pq.courseCode}.`);
    }
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleOpenViewer = (pq: PastQuestion) => {
    setActiveViewerPq(pq);
    setActiveImageIndex(0);
    // choose best initial tab
    if (pq.manualQuestions?.length || pq.manualContent) {
      setViewerTab('manual');
    } else if (pq.images?.length) {
      setViewerTab('images');
    } else if (pq.pdfUrl) {
      setViewerTab('pdf');
    } else {
      setViewerTab('manual');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-sky-700 mb-3 shadow-2xs">
            <FileText className="h-3.5 w-3.5 text-sky-600" />
            <span>Academic Excellence & Repository</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Physics Past Questions Bank
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Search, filter, and download verified semester examination papers, test solutions, and laboratory practical manuals across 100 Level through 400 Level.
          </p>
        </div>

        {downloadSuccess && (
          <div className="mb-6 max-w-xl mx-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course code or title (e.g., PHY 101, Quantum, Mechanics)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['all', '100 Level', '200 Level', '300 Level', '400 Level'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedLevel === lvl
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'all' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Semester Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Semester:</span>
              <button
                onClick={() => setSelectedSemester('all')}
                className={`px-2.5 py-1 rounded-lg ${
                  selectedSemester === 'all' ? 'bg-slate-800 text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                Both Semesters
              </button>
              <button
                onClick={() => setSelectedSemester('Harmattan')}
                className={`px-2.5 py-1 rounded-lg ${
                  selectedSemester === 'Harmattan' ? 'bg-slate-800 text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                Harmattan (1st)
              </button>
              <button
                onClick={() => setSelectedSemester('Rain')}
                className={`px-2.5 py-1 rounded-lg ${
                  selectedSemester === 'Rain' ? 'bg-slate-800 text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                Rain (2nd)
              </button>
            </div>

            <span className="font-medium text-slate-400">
              Showing {filteredPQs.length} papers
            </span>
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPQs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">No Past Questions Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keywords or switching filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPQs.map((pq) => (
              <div
                key={pq.id}
                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-extrabold text-xs border border-sky-200">
                      {pq.courseCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {pq.level}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                    {pq.courseTitle}
                  </h3>

                  <div className="mt-4 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center justify-between">
                      <span>Semester:</span>
                      <span className="font-semibold text-slate-700">{pq.semester} Semester</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Session:</span>
                      <span className="font-semibold text-slate-700">{pq.session}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Type:</span>
                      <span className="font-semibold text-slate-700">{pq.examType}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>File Size:</span>
                      <span className="font-semibold text-slate-700">{pq.fileSize}</span>
                    </p>
                    {pq.formatType && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {pq.pdfUrl && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            PDF Doc
                          </span>
                        )}
                        {pq.images && pq.images.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            {pq.images.length} Page{pq.images.length === 1 ? '' : 's'}
                          </span>
                        )}
                        {(pq.manualQuestions?.length || pq.manualContent) && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Interactive Q&A
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenViewer(pq)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95"
                    title="View past question paper and questions"
                  >
                    <Eye className="h-3.5 w-3.5 text-sky-600" />
                    <span>View Paper</span>
                  </button>

                  <button
                    onClick={() => handleDownload(pq)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                    title="Download past question"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* INTERACTIVE QUESTION PAPER VIEWER MODAL */}
        {/* ================================================================= */}
        {activeViewerPq && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in"
            onClick={() => setActiveViewerPq(null)}
          >
            <div 
              className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-600 text-white font-mono font-bold text-xs">
                      {activeViewerPq.courseCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold text-[11px]">
                      {activeViewerPq.level}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {activeViewerPq.semester} Semester • Session {activeViewerPq.session}
                    </span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {activeViewerPq.courseTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lagos State University of Science and Technology (LASUSTECH) • Department of Physics
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs"
                    title="Print question paper"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => handleDownload(activeViewerPq)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs"
                    title="Download file"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setActiveViewerPq(null)}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
                    title="Close viewer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Format Tab Switcher if paper has multiple assets */}
              {(activeViewerPq.images?.length || activeViewerPq.pdfUrl) && (
                <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2 text-xs font-bold">
                  {(activeViewerPq.manualQuestions?.length || activeViewerPq.manualContent || !activeViewerPq.pdfUrl && !activeViewerPq.images?.length) && (
                    <button
                      onClick={() => setViewerTab('manual')}
                      className={`py-2 px-4 rounded-t-xl transition-colors flex items-center gap-2 ${
                        viewerTab === 'manual'
                          ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Questions & Socratic Text</span>
                    </button>
                  )}
                  {activeViewerPq.images && activeViewerPq.images.length > 0 && (
                    <button
                      onClick={() => setViewerTab('images')}
                      className={`py-2 px-4 rounded-t-xl transition-colors flex items-center gap-2 ${
                        viewerTab === 'images'
                          ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Scanned Exam Sheets ({activeViewerPq.images.length})</span>
                    </button>
                  )}
                  {activeViewerPq.pdfUrl && (
                    <button
                      onClick={() => setViewerTab('pdf')}
                      className={`py-2 px-4 rounded-t-xl transition-colors flex items-center gap-2 ${
                        viewerTab === 'pdf'
                          ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 text-rose-600" />
                      <span>PDF Document</span>
                    </button>
                  )}
                </div>
              )}

              {/* Modal Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
                {/* 1. SCANNED IMAGES VIEW */}
                {viewerTab === 'images' && activeViewerPq.images && activeViewerPq.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Viewing Page {activeImageIndex + 1} of {activeViewerPq.images.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {activeViewerPq.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`h-7 px-2.5 rounded-lg font-bold text-xs transition-colors ${
                              activeImageIndex === idx
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Page {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center min-h-[400px]">
                      <img
                        src={activeViewerPq.images[activeImageIndex]}
                        alt={`${activeViewerPq.courseCode} Page ${activeImageIndex + 1}`}
                        className="max-h-[70vh] w-auto object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}

                {/* 2. PDF VIEWER TAB */}
                {viewerTab === 'pdf' && activeViewerPq.pdfUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-rose-600" />
                        <span className="font-semibold text-slate-800 truncate max-w-sm">
                          {activeViewerPq.pdfFileName || `${activeViewerPq.courseCode}_Examination.pdf`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(activeViewerPq)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Direct Download</span>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 overflow-hidden h-[550px] bg-slate-100">
                      <iframe
                        src={activeViewerPq.pdfUrl}
                        title={activeViewerPq.courseTitle}
                        className="w-full h-full border-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. FORMATTED QUESTIONS VIEW */}
                {viewerTab === 'manual' && (
                  <div className="space-y-6">
                    {/* Exam Rubric / Instructions Header */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <div className="flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4 text-amber-600" />
                          <span>Examination Instructions</span>
                        </div>
                        {activeViewerPq.duration && (
                          <div className="flex items-center gap-1 font-mono text-amber-800">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span>Duration: {activeViewerPq.duration}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-amber-900/90 leading-relaxed font-medium">
                        {activeViewerPq.instructions || 
                          'INSTRUCTIONS: Answer all questions in Section A and any THREE (3) questions in Section B. Electronic non-programmable calculators are permitted. Show all working steps clearly. Physical constants: Speed of light c = 3.00 × 10⁸ m/s; Acceleration due to gravity g = 9.8 m/s²; Planck constant h = 6.626 × 10⁻³⁴ J·s.'}
                      </p>
                    </div>

                    {/* Structured Question List if defined */}
                    {activeViewerPq.manualQuestions && activeViewerPq.manualQuestions.length > 0 ? (
                      <div className="space-y-4">
                        {activeViewerPq.manualQuestions.map((q, idx) => (
                          <div
                            key={q.id || idx}
                            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-2xs space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {q.number || idx + 1}
                                </span>
                                {q.section && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {q.section}
                                  </span>
                                )}
                              </div>
                              {q.marks && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                                  {q.marks}
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line font-serif">
                              {q.text}
                            </p>

                            {/* Multiple choice options if present */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium"
                                  >
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Answer key if present */}
                            {q.answer && (
                              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Official Key / Note: {q.answer}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Free-form typed questions or default text representation */
                      <div className="p-6 rounded-2xl bg-white border border-slate-200 font-serif text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
                        {activeViewerPq.manualContent ? (
                          activeViewerPq.manualContent
                        ) : (
                          <div>
                            <h4 className="font-sans font-bold text-sm text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
                              SECTION A: COMPULSORY THEORY & APPLICATIONS
                            </h4>
                            <p className="mb-4">
                              <strong>Question 1 (20 Marks)</strong><br />
                              (a) State the Heisenberg Uncertainty Principle and derive the relativistic energy-momentum relationship for a photon in free space.<br />
                              (b) A particle of mass <em>m</em> is trapped in an infinite one-dimensional potential well of width <em>L</em>. Write down the time-independent Schrödinger wave equation, determine the normalized eigenfunctions, and calculate the zero-point ground state energy.
                            </p>
                            <p className="mb-4">
                              <strong>Question 2 (15 Marks)</strong><br />
                              (a) Distinguish between Maxwell-Boltzmann, Bose-Einstein, and Fermi-Dirac distribution statistics with applicable examples in condensed matter physics.<br />
                              (b) Calculate the de Broglie wavelength of an electron accelerated through an electric potential difference of 150 Volts.
                            </p>
                            <h4 className="font-sans font-bold text-sm text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3 mt-6">
                              SECTION B: DERIVATIONS & PROBLEM SOLVING
                            </h4>
                            <p>
                              <strong>Question 3 (15 Marks)</strong><br />
                              Show that the differential equation describing an underdamped harmonic oscillator yields an exponential amplitude decay envelope. Calculate the quality factor Q and logarithmic decrement for a damping constant γ = 0.05 s⁻¹.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Archive ID: <span className="font-mono">{activeViewerPq.id}</span>
                </span>
                <button
                  onClick={() => setActiveViewerPq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
