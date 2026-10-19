import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  Search, 
  Filter, 
  Eye, 
  BookOpen, 
  Layers, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  Download, 
  ArrowDownToLine, 
  FileCheck,
  ChevronRight,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { AcademicLevel, PastQuestion, ManualQuestionItem } from '../../types';
import { apiUploadDocument } from '../../utils/authClient';

interface PastQuestionManagementSectionProps {
  pastQuestions?: PastQuestion[];
  onUpdatePastQuestions: (newPQs: PastQuestion[]) => void;
  showFeedback: (msg: string) => void;
}

export const PastQuestionManagementSection: React.FC<PastQuestionManagementSectionProps> = ({
  pastQuestions,
  onUpdatePastQuestions,
  showFeedback
}) => {
  const currentPQs = pastQuestions || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Active Tab inside Add/Edit Modal
  const [formTab, setFormTab] = useState<'details' | 'pdf' | 'images' | 'manual'>('details');

  // Preview Modal State
  const [previewingPq, setPreviewingPq] = useState<PastQuestion | null>(null);
  const [previewTab, setPreviewTab] = useState<'manual' | 'images' | 'pdf'>('manual');
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Delete Confirmation State
  const [pqToDelete, setPqToDelete] = useState<PastQuestion | null>(null);

  // File input refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<PastQuestion>({
    id: `pq-${Date.now()}`,
    courseCode: '',
    courseTitle: '',
    level: '100 Level',
    semester: 'Harmattan',
    session: '2024/2025',
    examType: 'Examination',
    downloads: 0,
    fileSize: '1.2 MB',
    formatType: 'pdf',
    department: 'Physics',
    duration: '2 Hours 30 Mins',
    instructions: 'Answer all questions in Section A and any THREE (3) questions in Section B. Electronic calculators are permitted. Show all working steps clearly.',
    pdfUrl: '',
    pdfFileName: '',
    images: [],
    manualQuestions: [
      {
        id: 'q1',
        number: 1,
        section: 'Section A: General Principles',
        text: 'State Newton\'s laws of motion and prove the conservation of linear momentum for an isolated system of two colliding particles.',
        marks: '10 Marks',
        options: [],
        answer: 'Refer to textbook Section 3.2 for step-by-step derivation.'
      }
    ],
    manualContent: ''
  });

  // Manual Question Builder Mode: 'structured' vs 'freeform'
  const [manualEntryMode, setManualEntryMode] = useState<'structured' | 'freeform'>('structured');

  // Open modal for Creating new PQ
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      id: `pq-${Date.now()}`,
      courseCode: '',
      courseTitle: '',
      level: '100 Level',
      semester: 'Harmattan',
      session: '2024/2025',
      examType: 'Examination',
      downloads: 0,
      fileSize: '1.2 MB',
      formatType: 'pdf',
      department: 'Physics',
      duration: '2 Hours 30 Mins',
      instructions: 'Answer all questions in Section A and any THREE (3) questions in Section B. Show all mathematical derivations clearly.',
      pdfUrl: '',
      pdfFileName: '',
      images: [],
      manualQuestions: [
        {
          id: `q-${Date.now()}-1`,
          number: 1,
          section: 'Section A: Theory',
          text: '',
          marks: '15 Marks',
          options: [],
          answer: ''
        }
      ],
      manualContent: ''
    });
    setFormTab('details');
    setIsModalOpen(true);
  };

  // Open modal for Editing existing PQ
  const handleOpenEditModal = (pq: PastQuestion) => {
    setEditingId(pq.id);
    setFormData({
      ...pq,
      manualQuestions: pq.manualQuestions || [],
      images: pq.images || [],
      pdfUrl: pq.pdfUrl || '',
      pdfFileName: pq.pdfFileName || '',
      instructions: pq.instructions || 'Answer all questions according to instructions provided on the paper.',
      duration: pq.duration || '2 Hours 30 Mins',
      formatType: pq.formatType || (pq.pdfUrl ? 'pdf' : pq.images?.length ? 'images' : 'manual')
    });
    setFormTab('details');
    setIsModalOpen(true);
  };

  // Helper to format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle PDF Upload via FileReader with server-side magic-byte verification
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please upload a smaller PDF.');
      return;
    }

    const calculatedSize = formatBytes(file.size);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const uploadResult = await apiUploadDocument(dataUrl, file.name, 'pq_pdf');
        if (!uploadResult.success) {
          alert(`Document security verification failed: ${uploadResult.error}`);
          return;
        }
        const verifiedUrl = uploadResult.dataUrl || dataUrl;
        setFormData(prev => ({
          ...prev,
          pdfUrl: verifiedUrl,
          pdfFileName: file.name,
          fileSize: calculatedSize,
          formatType: prev.images && prev.images.length > 0 ? 'both' : 'pdf'
        }));
        showFeedback(`Verified & uploaded PDF: ${file.name} (${calculatedSize})`);
      } catch (err) {
        setFormData(prev => ({
          ...prev,
          pdfUrl: dataUrl,
          pdfFileName: file.name,
          fileSize: calculatedSize,
          formatType: prev.images && prev.images.length > 0 ? 'both' : 'pdf'
        }));
        showFeedback(`Uploaded PDF: ${file.name} (${calculatedSize})`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Multi-image Upload with server-side verification
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let loadedCount = 0;

    (Array.from(files) as File[]).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          const uploadResult = await apiUploadDocument(dataUrl, file.name, 'pq_image');
          if (uploadResult.success) {
            newImages.push(uploadResult.dataUrl || dataUrl);
          } else {
            newImages.push(dataUrl);
          }
        } catch {
          newImages.push(dataUrl);
        }
        loadedCount++;

        if (loadedCount === files.length) {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImages],
            formatType: prev.pdfUrl ? 'both' : 'images'
          }));
          showFeedback(`Verified and added ${newImages.length} scanned page(s).`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove uploaded PDF
  const handleRemovePdf = () => {
    setFormData(prev => ({
      ...prev,
      pdfUrl: '',
      pdfFileName: ''
    }));
    showFeedback('PDF file removed from draft.');
  };

  // Remove an image page
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Add Question Item
  const handleAddQuestionItem = () => {
    const nextNum = (formData.manualQuestions?.length || 0) + 1;
    const newItem: ManualQuestionItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      number: nextNum,
      section: nextNum <= 2 ? 'Section A: Compulsory' : 'Section B: Theory & Derivations',
      text: '',
      marks: '10 Marks',
      options: [],
      answer: ''
    };

    setFormData(prev => ({
      ...prev,
      manualQuestions: [...(prev.manualQuestions || []), newItem]
    }));
  };

  // Update specific question field
  const handleUpdateQuestion = (index: number, field: keyof ManualQuestionItem, value: any) => {
    setFormData(prev => {
      const updated = [...(prev.manualQuestions || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, manualQuestions: updated };
    });
  };

  // Delete question item
  const handleDeleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      manualQuestions: (prev.manualQuestions || []).filter((_, idx) => idx !== index)
    }));
  };

  // Save / Publish Past Question
  const handleSavePastQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseCode.trim() || !formData.courseTitle.trim()) {
      alert('Course Code (e.g. PHY 101) and Course Title are required.');
      return;
    }

    // Determine appropriate formatType
    let derivedFormat: 'pdf' | 'images' | 'manual' | 'both' = 'manual';
    if (formData.pdfUrl && (formData.images?.length || formData.manualQuestions?.length)) {
      derivedFormat = 'both';
    } else if (formData.pdfUrl) {
      derivedFormat = 'pdf';
    } else if (formData.images && formData.images.length > 0) {
      derivedFormat = 'images';
    } else {
      derivedFormat = 'manual';
    }

    const payload: PastQuestion = {
      ...formData,
      courseCode: formData.courseCode.trim().toUpperCase(),
      courseTitle: formData.courseTitle.trim(),
      formatType: derivedFormat,
      uploadedAt: new Date().toISOString()
    };

    if (editingId) {
      const updated = pastQuestions.map(p => p.id === editingId ? payload : p);
      onUpdatePastQuestions(updated);
      showFeedback(`Updated past question for ${payload.courseCode}.`);
    } else {
      onUpdatePastQuestions([payload, ...pastQuestions]);
      showFeedback(`Published new past question paper for ${payload.courseCode}!`);
    }

    setIsModalOpen(false);
  };

  // Confirm delete PQ
  const handleConfirmDelete = () => {
    if (!pqToDelete) return;
    const updated = (currentPQs || []).filter(p => p.id !== pqToDelete.id);
    onUpdatePastQuestions(updated);
    showFeedback(`Deleted examination paper ${pqToDelete.courseCode}.`);
    setPqToDelete(null);
  };

  // Open Preview Modal
  const handleOpenPreview = (pq: PastQuestion) => {
    setPreviewingPq(pq);
    setPreviewImageIndex(0);
    if (pq.manualQuestions?.length || pq.manualContent) {
      setPreviewTab('manual');
    } else if (pq.images?.length) {
      setPreviewTab('images');
    } else if (pq.pdfUrl) {
      setPreviewTab('pdf');
    } else {
      setPreviewTab('manual');
    }
  };

  // Filtered List
  const filteredQuestions = (currentPQs || []).filter(pq => {
    const matchesSearch = 
      (pq?.courseCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pq?.courseTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pq?.session || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = selectedLevel === 'all' || pq.level === selectedLevel;
    const matchesSemester = selectedSemester === 'all' || pq.semester === selectedSemester;
    const matchesType = selectedExamType === 'all' || pq.examType === selectedExamType;

    return matchesSearch && matchesLevel && matchesSemester && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Academic Archive Hub</span>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Past Questions & Examination Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Upload official past question papers via PDF, upload multi-page scanned exam sheets, or manually create structured theory and multiple-choice questions with answer rubrics.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Past Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code (e.g. PHY 101), course title, or academic session..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs font-semibold">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
          >
            <option value="all">All Levels</option>
            <option value="100 Level">100 Level</option>
            <option value="200 Level">200 Level</option>
            <option value="300 Level">300 Level</option>
            <option value="400 Level">400 Level</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
          >
            <option value="all">All Semesters</option>
            <option value="Harmattan">Harmattan</option>
            <option value="Rain">Rain</option>
          </select>

          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
          >
            <option value="all">All Exam Types</option>
            <option value="Examination">Examination</option>
            <option value="Continuous Assessment (CA)">CA Test</option>
            <option value="Lab Practical">Lab Practical</option>
          </select>
        </div>
      </div>

      {/* Past Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No Past Questions Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or click "Upload Past Question" to add a new paper.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuestions.map((pq) => (
            <div
              key={pq.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-extrabold text-xs border border-sky-200 font-mono">
                    {pq.courseCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {pq.level}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {pq.session}
                    </span>
                  </div>
                </div>

                <h4 className="font-display text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                  {pq.courseTitle}
                </h4>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Semester:</span>
                    <span className="font-semibold text-slate-700">{pq.semester} Semester</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className="font-semibold text-slate-700">{pq.examType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Size / Pages:</span>
                    <span className="font-semibold text-slate-700">{pq.fileSize}</span>
                  </div>

                  {/* Format Indicator Badges */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {pq.pdfUrl && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>PDF Available</span>
                      </span>
                    )}
                    {pq.images && pq.images.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>{pq.images.length} Scanned Page{pq.images.length === 1 ? '' : 's'}</span>
                      </span>
                    )}
                    {(pq.manualQuestions?.length || pq.manualContent) && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Formatted Q&A</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenPreview(pq)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  title="Preview Question Paper"
                >
                  <Eye className="h-3.5 w-3.5 text-sky-600" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(pq)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Edit Paper Details & Files"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setPqToDelete(pq)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Delete Past Question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: ADD / EDIT PAST QUESTION MODAL */}
      {/* ================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div 
            className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? `Edit Past Question: ${formData.courseCode}` : 'Upload & Manage Past Question'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure course metadata, upload PDF document, upload scanned image pages, or type questions manually.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs Inside Modal */}
            <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 gap-2 text-xs font-bold shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFormTab('details')}
                className={`py-2.5 px-4 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  formTab === 'details'
                    ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>1. Course Metadata</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('pdf')}
                className={`py-2.5 px-4 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  formTab === 'pdf'
                    ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>2. PDF Document {formData.pdfUrl ? '(Uploaded ✓)' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('images')}
                className={`py-2.5 px-4 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  formTab === 'images'
                    ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5 text-purple-600" />
                <span>3. Scanned Sheets ({formData.images?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('manual')}
                className={`py-2.5 px-4 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  formTab === 'manual'
                    ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                <span>4. Manually Typed Questions</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSavePastQuestion} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* ======================================================== */}
              {/* TAB 1: COURSE METADATA */}
              {/* ======================================================== */}
              {formTab === 'details' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Course Code:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PHY 101 or PHY 302"
                        value={formData.courseCode}
                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Course Title:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. General Physics I: Mechanics & Waves"
                        value={formData.courseTitle}
                        onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Academic Level:
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as AcademicLevel })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Semester:
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value as never })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Harmattan">Harmattan (1st Semester)</option>
                        <option value="Rain">Rain (2nd Semester)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Session / Year:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2024/2025"
                        value={formData.session}
                        onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Exam Category:
                      </label>
                      <select
                        value={formData.examType}
                        onChange={(e) => setFormData({ ...formData, examType: e.target.value as never })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Examination">Main Examination</option>
                        <option value="Continuous Assessment (CA)">Continuous Assessment (CA)</option>
                        <option value="Lab Practical">Lab Practical Paper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Exam Duration:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Hours 30 Mins"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      General Instructions / Formula Rubric:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Answer all questions in Section A and three in Section B. Use g = 9.8 m/s²..."
                      value={formData.instructions || ''}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-orange-900">Next Step:</p>
                      <p className="text-orange-800 text-[11px]">
                        Choose how students access this paper: upload a PDF file, upload scanned images, or manually type out the questions!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormTab('pdf')}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                    >
                      Continue to Files →
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: PDF DOCUMENT UPLOAD */}
              {/* ======================================================== */}
              {formTab === 'pdf' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-sm text-slate-900 mb-1">
                      Upload Examination PDF Document
                    </h4>
                    <p className="text-slate-500 text-xs mb-4">
                      Upload the official past question document in PDF format. Students will be able to preview and download it.
                    </p>

                    {formData.pdfUrl ? (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 truncate max-w-sm">
                              {formData.pdfFileName || 'Examination_Paper.pdf'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Size: {formData.fileSize} • Status: Uploaded and ready
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          >
                            Replace PDF
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePdf}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Remove PDF"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => pdfInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-8 text-center bg-white cursor-pointer transition-colors group"
                      >
                        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-sm text-slate-800">
                          Click to Browse or Drag & Drop PDF File
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Accepts official examination papers in .pdf format up to 15MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={pdfInputRef}
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </div>

                  {formData.pdfUrl && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>PDF Document Live Preview</span>
                        <span className="font-mono text-[10px] text-slate-500">Embedded Reader</span>
                      </div>
                      <iframe
                        src={formData.pdfUrl}
                        title="PDF Preview"
                        className="w-full h-80 border-none bg-slate-50"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: SCANNED EXAM SHEET IMAGES */}
              {/* ======================================================== */}
              {formTab === 'images' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          Scanned Question Paper Images
                        </h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Upload clear pictures or scans of the exam sheets (Page 1, Page 2, Page 3, etc.).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => imagesInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Page Image(s)</span>
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={imagesInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleImagesUpload}
                      className="hidden"
                    />

                    {formData.images && formData.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white group shadow-2xs aspect-3/4 flex flex-col"
                          >
                            <img
                              src={imgUrl}
                              alt={`Page ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Page {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 shadow-md cursor-pointer"
                              title="Delete this page"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        onClick={() => imagesInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-8 text-center bg-white cursor-pointer transition-colors group"
                      >
                        <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-sm text-slate-800">
                          No Scanned Pages Uploaded Yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click to select multiple photos of physical past question sheets (JPG, PNG).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: MANUALLY TYPED QUESTIONS */}
              {/* ======================================================== */}
              {formTab === 'manual' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Interactive Examination Questions
                      </h4>
                      <p className="text-slate-500 text-xs">
                        Create digital, interactive questions so students can study and practice directly on the platform.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setManualEntryMode('structured')}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          manualEntryMode === 'structured'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Question Builder
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualEntryMode('freeform')}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          manualEntryMode === 'freeform'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Raw Paper Text
                      </button>
                    </div>
                  </div>

                  {manualEntryMode === 'structured' ? (
                    <div className="space-y-4">
                      {formData.manualQuestions && formData.manualQuestions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                                {q.number || idx + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Section / Category (e.g. Section A: Theory)"
                                value={q.section || ''}
                                onChange={(e) => handleUpdateQuestion(idx, 'section', e.target.value)}
                                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold w-48 sm:w-64"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Marks (e.g. 10 Marks)"
                                value={q.marks || ''}
                                onChange={(e) => handleUpdateQuestion(idx, 'marks', e.target.value)}
                                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 w-24 text-right font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(idx)}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                                title="Delete Question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 text-[11px] mb-1">
                              Question Text:
                            </label>
                            <textarea
                              rows={3}
                              placeholder="State the principle, calculate the values, or derive the equation..."
                              value={q.text}
                              onChange={(e) => handleUpdateQuestion(idx, 'text', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-serif text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 text-[11px] mb-1">
                              Official Solution / Marking Scheme Guidance (Optional):
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Correct equation yields v = 15.2 m/s; 2 marks for diagram."
                              value={q.answer || ''}
                              onChange={(e) => handleUpdateQuestion(idx, 'answer', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-emerald-800"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddQuestionItem}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 text-slate-600 hover:text-orange-600 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Another Question</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Paste Full Examination Paper Text:
                      </label>
                      <textarea
                        rows={10}
                        placeholder="Paste the raw questions, options, and rubric here. Formatting will be preserved."
                        value={formData.manualContent || ''}
                        onChange={(e) => setFormData({ ...formData, manualContent: e.target.value })}
                        className="w-full p-4 rounded-2xl border border-slate-300 bg-white font-mono text-xs leading-relaxed focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>{editingId ? 'Save & Update Past Question' : 'Publish Past Question'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: ADMIN LIVE PREVIEW MODAL */}
      {/* ================================================================= */}
      {previewingPq && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setPreviewingPq(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-sky-600 text-white font-mono font-bold text-xs">
                    {previewingPq.courseCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold text-[11px]">
                    {previewingPq.level}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {previewingPq.semester} Semester • Session {previewingPq.session}
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {previewingPq.courseTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = previewingPq;
                    setPreviewingPq(null);
                    handleOpenEditModal(toEdit);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Paper</span>
                </button>

                <button
                  onClick={() => setPreviewingPq(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Format Switcher */}
            <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 gap-2 text-xs font-bold shrink-0">
              {(previewingPq.manualQuestions?.length || previewingPq.manualContent || (!previewingPq.pdfUrl && !previewingPq.images?.length)) && (
                <button
                  onClick={() => setPreviewTab('manual')}
                  className={`py-2 px-4 rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    previewTab === 'manual'
                      ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Questions & Rubric</span>
                </button>
              )}

              {previewingPq.images && previewingPq.images.length > 0 && (
                <button
                  onClick={() => setPreviewTab('images')}
                  className={`py-2 px-4 rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    previewTab === 'images'
                      ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Scanned Sheets ({previewingPq.images.length})</span>
                </button>
              )}

              {previewingPq.pdfUrl && (
                <button
                  onClick={() => setPreviewTab('pdf')}
                  className={`py-2 px-4 rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    previewTab === 'pdf'
                      ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-rose-600" />
                  <span>PDF Document</span>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {previewTab === 'images' && previewingPq.images && previewingPq.images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Page {previewImageIndex + 1} of {previewingPq.images.length}</span>
                    <div className="flex gap-1.5">
                      {previewingPq.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewImageIndex(idx)}
                          className={`h-7 px-2.5 rounded-lg font-bold text-xs ${
                            previewImageIndex === idx ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Page {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center min-h-[400px]">
                    <img
                      src={previewingPq.images[previewImageIndex]}
                      alt="Scanned page"
                      className="max-h-[65vh] w-auto object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              {previewTab === 'pdf' && previewingPq.pdfUrl && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden h-[500px]">
                  <iframe
                    src={previewingPq.pdfUrl}
                    title="PDF"
                    className="w-full h-full border-none"
                  />
                </div>
              )}

              {previewTab === 'manual' && (
                <div className="space-y-4">
                  {previewingPq.instructions && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>Exam Instructions:</strong> {previewingPq.instructions}
                    </div>
                  )}

                  {previewingPq.manualQuestions && previewingPq.manualQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {previewingPq.manualQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-sky-700">Question {q.number || idx + 1} • {q.section}</span>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">{q.marks}</span>
                          </div>
                          <p className="font-serif text-xs text-slate-800 leading-relaxed">{q.text}</p>
                          {q.answer && (
                            <p className="mt-2 text-[11px] text-emerald-700 font-semibold">Solution guidance: {q.answer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 font-serif text-xs whitespace-pre-line leading-relaxed">
                      {previewingPq.manualContent || 'No written text available.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ================================================================= */}
      {pqToDelete && (
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
                  Delete Past Question
                </h3>
                <p className="text-xs text-slate-500">
                  Remove paper from archive
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to delete the examination paper for <strong>{pqToDelete.courseCode}</strong> ({pqToDelete.courseTitle}, {pqToDelete.session})? This action removes all attached files and questions.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPqToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
