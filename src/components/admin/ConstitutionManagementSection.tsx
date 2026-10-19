import React, { useState } from 'react';
import { ConstitutionDocument, ConstitutionArticle } from '../../types';
import { 
  BookOpen, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Eye,
  FileCheck
} from 'lucide-react';
import { uploadFileViaApi } from '../../utils/authClient';

interface ConstitutionManagementSectionProps {
  constitution?: ConstitutionDocument;
  docInfo?: ConstitutionDocument;
  articles?: ConstitutionArticle[];
  onUpdateConstitution?: (doc: ConstitutionDocument) => Promise<void> | void;
  onUpdateDocInfo?: (doc: ConstitutionDocument) => Promise<void> | void;
  onUpdateArticles?: (articles: ConstitutionArticle[]) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const ConstitutionManagementSection: React.FC<ConstitutionManagementSectionProps> = ({
  constitution,
  docInfo,
  articles,
  onUpdateConstitution,
  onUpdateDocInfo,
  onUpdateArticles,
  showFeedback
}) => {
  const defaultDoc: ConstitutionDocument = {
    pdfUrl: '',
    fileName: 'NAPS_Constitution.pdf',
    fileSize: '1.5 MB',
    updatedAt: new Date().toISOString().split('T')[0],
    published: true,
    articles: articles || []
  };
  const resolvedDoc = constitution || docInfo || defaultDoc;
  if (!resolvedDoc.articles && articles) {
    resolvedDoc.articles = articles;
  }
  const [docState, setDocState] = useState<ConstitutionDocument>(resolvedDoc);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal for editing an article
  const [editingArticleIndex, setEditingArticleIndex] = useState<number | null>(null);
  const [articleForm, setArticleForm] = useState<ConstitutionArticle>({
    number: '',
    title: '',
    sections: [{ title: '', content: '' }]
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Only valid PDF documents are allowed for the Constitution.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('PDF file size exceeds the 20MB maximum limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        // Upload to secure backend with magic byte validation
        const res = await uploadFileViaApi(base64, file.name, 'academic_material');
        const updated: ConstitutionDocument = {
          ...docState,
          pdfUrl: res.fileUrl || base64,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          updatedAt: new Date().toISOString().split('T')[0],
          published: true
        };

        setDocState(updated);
        await onUpdateConstitution(updated);
        setSuccessMessage('Official Constitution PDF uploaded and published successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload PDF.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = async () => {
    if (window.confirm('Are you sure you want to remove the currently attached Constitution PDF?')) {
      const updated: ConstitutionDocument = {
        ...docState,
        pdfUrl: '',
        fileName: '',
        fileSize: '',
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setDocState(updated);
      await onUpdateConstitution(updated);
      setSuccessMessage('Attached Constitution PDF has been removed.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleTogglePublished = async () => {
    const updated = { ...docState, published: !docState.published };
    setDocState(updated);
    await onUpdateConstitution(updated);
    setSuccessMessage(`Constitution public visibility set to: ${updated.published ? 'Published' : 'Unpublished'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleOpenAddArticle = () => {
    setEditingArticleIndex(-1);
    setArticleForm({
      number: `Article ${docState.articles.length + 1}`,
      title: '',
      sections: [{ title: 'Section 1', content: '' }]
    });
  };

  const handleOpenEditArticle = (index: number) => {
    setEditingArticleIndex(index);
    setArticleForm(JSON.parse(JSON.stringify(docState.articles[index])));
  };

  const handleSaveArticle = async () => {
    if (!articleForm.number.trim() || !articleForm.title.trim()) {
      alert('Article number and title are required.');
      return;
    }

    const copy = [...docState.articles];
    if (editingArticleIndex === -1) {
      copy.push(articleForm);
    } else if (editingArticleIndex !== null && editingArticleIndex >= 0) {
      copy[editingArticleIndex] = articleForm;
    }

    const updated = { ...docState, articles: copy };
    setDocState(updated);
    if (onUpdateConstitution) await onUpdateConstitution(updated);
    if (onUpdateDocInfo) await onUpdateDocInfo(updated);
    if (onUpdateArticles) await onUpdateArticles(copy);
    if (showFeedback) showFeedback('Constitution articles updated.');
    setEditingArticleIndex(null);
    setSuccessMessage('Constitution articles updated.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteArticle = async (index: number) => {
    if (window.confirm('Delete this article from the web viewer?')) {
      const copy = (docState.articles || []).filter((_, idx) => idx !== index);
      const updated = { ...docState, articles: copy };
      setDocState(updated);
      if (onUpdateConstitution) await onUpdateConstitution(updated);
      if (onUpdateDocInfo) await onUpdateDocInfo(updated);
      if (onUpdateArticles) await onUpdateArticles(copy);
      if (showFeedback) showFeedback('Article removed from constitution.');
      setSuccessMessage('Article removed.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Constitution Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload and replace the official ratified chapter PDF, toggle public visibility, or update articles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTogglePublished}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              docState.published 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {docState.published ? '● Published on Website' : '○ Draft (Hidden from Public)'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* PDF Upload Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1F5FAF]" />
              Official Ratified Constitution Document (PDF)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Matriculated students and consultative council can view or download this document directly from the public portal.
            </p>
          </div>
        </div>

        {docState.pdfUrl ? (
          <div className="p-5 bg-sky-50/70 border border-sky-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-xs text-sky-600">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">
                  {docState.fileName || 'NAPS_Constitution.pdf'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span>Size: {docState.fileSize || 'Standard'}</span>
                  <span>•</span>
                  <span>Updated: {docState.updatedAt || 'Recent'}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Digitally Validated
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={docState.pdfUrl}
                download={docState.fileName || 'Constitution.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Test Download</span>
              </a>

              <label className="px-3 py-2 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleRemovePdf}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Remove PDF"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
            <Upload className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-xs mb-1">
              No Constitution PDF currently attached
            </p>
            <p className="text-[11px] text-slate-500 mb-4 max-w-sm mx-auto">
              Upload the official signed and sealed Constitution of NAPS LASUSTECH Chapter.
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Select PDF Document</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploading && (
              <p className="text-xs text-sky-600 font-semibold mt-3 animate-pulse">
                Verifying PDF binary headers and uploading...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Online Interactive Articles Manager */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Constitution Articles & Web Sections ({docState.articles.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These articles appear directly in the interactive web constitution viewer for instant search without downloading.
            </p>
          </div>
          <button
            onClick={handleOpenAddArticle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Article</span>
          </button>
        </div>

        <div className="space-y-3">
          {docState.articles.map((article, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700">
                    {article.number}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {article.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  {article.sections?.length || 0} sub-sections defined
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditArticle(idx)}
                  className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Article"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteArticle(idx)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Article Modal */}
      {editingArticleIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingArticleIndex === -1 ? 'New Constitution Article' : 'Edit Constitution Article'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Configure article clauses, titles, and section contents.
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Article Number</label>
                  <input
                    type="text"
                    value={articleForm.number}
                    onChange={e => setArticleForm({ ...articleForm, number: e.target.value })}
                    placeholder="e.g. Article V"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Article Title</label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="e.g. The Electoral Commission (NAPSECO)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Sections list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700 block">Sub-Sections & Text</label>
                  <button
                    type="button"
                    onClick={() => setArticleForm({
                      ...articleForm,
                      sections: [...articleForm.sections, { title: `Section ${articleForm.sections.length + 1}`, content: '' }]
                    })}
                    className="text-[10px] font-bold text-sky-600 hover:underline"
                  >
                    + Add Section
                  </button>
                </div>

                <div className="space-y-3">
                  {articleForm.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={e => {
                            const secs = [...articleForm.sections];
                            secs[sIdx].title = e.target.value;
                            setArticleForm({ ...articleForm, sections: secs });
                          }}
                          placeholder="Section Title / Clause"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-xs"
                        />
                        {articleForm.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const secs = articleForm.sections.filter((_, idx) => idx !== sIdx);
                              setArticleForm({ ...articleForm, sections: secs });
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={e => {
                          const secs = [...articleForm.sections];
                          secs[sIdx].content = e.target.value;
                          setArticleForm({ ...articleForm, sections: secs });
                        }}
                        placeholder="Detailed constitutional clause text..."
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingArticleIndex(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveArticle}
                  className="px-5 py-2 rounded-xl bg-[#1F5FAF] text-white font-bold shadow-xs hover:bg-[#174983]"
                >
                  Save Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
