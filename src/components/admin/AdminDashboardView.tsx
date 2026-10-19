import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  BadgeCheck, 
  ExternalLink, 
  ShieldCheck, 
  Bell, 
  RefreshCw, 
  Download, 
  Printer, 
  Eye, 
  Key, 
  Sliders, 
  Award,
  Sparkles,
  Layers,
  Atom,
  TrendingUp,
  Receipt,
  Edit,
  Save,
  X,
  Lock,
  ArrowUpRight,
  Settings,
  Building2,
  Copy,
  Check,
  CheckSquare,
  Square,
  DollarSign,
  Wallet,
  Image as ImageIcon,
  BookOpen,
  Trophy,
  Vote,
  Mail,
  Menu as MenuIcon
} from 'lucide-react';
import { 
  User, 
  PastQuestion, 
  ChapterEvent, 
  Executive, 
  PaymentRecord, 
  AcademicLevel,
  FlutterwaveConfig,
  GalleryItem,
  ConstitutionArticle,
  ConstitutionDocument,
  AwardItem,
  VotingCategory,
  VotingSettings,
  ContactInfo,
  NavigationMenuItem,
  PeopleProfile,
  SiteSettings
} from '../../types';
import { NAPS_LOGO } from '../../data/mockData';
import { 
  getSavedFlutterwaveConfig, 
  saveFlutterwaveConfig 
} from '../../utils/flutterwave';
import { ExecutiveManagementSection } from './ExecutiveManagementSection';
import { PastQuestionManagementSection } from './PastQuestionManagementSection';
import { EventsManagementSection } from './EventsManagementSection';
import { GalleryManagementSection } from './GalleryManagementSection';
import { ConstitutionManagementSection } from './ConstitutionManagementSection';
import { AwardsManagementSection } from './AwardsManagementSection';
import { VotingManagementSection } from './VotingManagementSection';
import { ContactManagementSection } from './ContactManagementSection';
import { MenuManagementSection } from './MenuManagementSection';
import { PeopleManagementSection } from './PeopleManagementSection';
import { SiteSettingsManagementSection } from './SiteSettingsManagementSection';

interface AdminDashboardViewProps {
  students: User[];
  onUpdateStudents: (updated: User[]) => void;
  pastQuestions: PastQuestion[];
  onUpdatePastQuestions: (updated: PastQuestion[]) => void;
  events: ChapterEvent[];
  onUpdateEvents: (updated: ChapterEvent[]) => void;
  executives: Executive[];
  onUpdateExecutives: (updated: Executive[]) => void;
  broadcastNotice: string | null;
  onUpdateBroadcastNotice: (notice: string | null) => void;
  onPreviewId: (student: User) => void;
  onTestPayment?: (student: User) => void;
  onExitAdmin: () => void;

  // Dynamic Content Modules
  gallery?: GalleryItem[];
  onUpdateGallery?: (updated: GalleryItem[]) => void;
  constitutionArticles?: ConstitutionArticle[];
  onUpdateConstitutionArticles?: (updated: ConstitutionArticle[]) => void;
  constitutionDoc?: ConstitutionDocument;
  onUpdateConstitutionDoc?: (updated: ConstitutionDocument) => void;
  awards?: AwardItem[];
  onUpdateAwards?: (updated: AwardItem[]) => void;
  votingCategories?: VotingCategory[];
  onUpdateVotingCategories?: (updated: VotingCategory[]) => void;
  votingSettings?: VotingSettings;
  onUpdateVotingSettings?: (updated: VotingSettings) => void;
  contactInfo?: ContactInfo;
  onUpdateContactInfo?: (updated: ContactInfo) => void;
  menuItems?: NavigationMenuItem[];
  onUpdateMenuItems?: (updated: NavigationMenuItem[]) => void;
  people?: PeopleProfile[];
  onUpdatePeople?: (updated: PeopleProfile[]) => void;
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (updated: SiteSettings) => void;
}

import { createPersonApi, updatePersonApi, deletePersonApi } from '../../utils/contentClient';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  students,
  onUpdateStudents,
  pastQuestions,
  onUpdatePastQuestions,
  events,
  onUpdateEvents,
  executives,
  onUpdateExecutives,
  broadcastNotice,
  onUpdateBroadcastNotice,
  onPreviewId,
  onTestPayment,
  onExitAdmin,
  gallery = [],
  onUpdateGallery,
  constitutionArticles = [],
  onUpdateConstitutionArticles,
  constitutionDoc,
  onUpdateConstitutionDoc,
  awards = [],
  onUpdateAwards,
  votingCategories = [],
  onUpdateVotingCategories,
  votingSettings,
  onUpdateVotingSettings,
  contactInfo,
  onUpdateContactInfo,
  menuItems = [],
  onUpdateMenuItems,
  people = [],
  onUpdatePeople,
  siteSettings,
  onUpdateSiteSettings
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'roster'
    | 'events'
    | 'gallery'
    | 'constitution'
    | 'awards'
    | 'voting'
    | 'publish-pq'
    | 'people'
    | 'executives'
    | 'contact'
    | 'menu'
    | 'settings'
    | 'flutterwave'
    | 'broadcast'
  >('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [duesFilter, setDuesFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Flutterwave Config State
  const [flwConfig, setFlwConfig] = useState<FlutterwaveConfig>(getSavedFlutterwaveConfig());
  const [flwSavedSuccess, setFlwSavedSuccess] = useState(false);

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [editingPq, setEditingPq] = useState<PastQuestion | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChapterEvent | null>(null);

  // Dues clearance & payment management state
  const [duesModalStudent, setDuesModalStudent] = useState<User | null>(null);
  const [duesForm, setDuesForm] = useState({
    status: 'Paid' as 'Paid' | 'Pending',
    amount: 2000,
    session: '2025/2026',
    paymentMethod: 'Direct Bank Transfer (LASUSTECH NAPS Account)',
    reference: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    idCardStatus: 'Ready' as 'Ready' | 'Not Registered',
    note: ''
  });

  // Batch Dues Actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchDuesConfig, setBatchDuesConfig] = useState({
    status: 'Paid' as 'Paid' | 'Pending',
    amount: 2000,
    session: '2025/2026',
    paymentMethod: 'Direct Bank Transfer (LASUSTECH NAPS Account)'
  });

  // Record Payment for Any Student Modal
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [recordPaymentStudentId, setRecordPaymentStudentId] = useState('');

  // Editing existing transaction in ledger
  const [editingTransaction, setEditingTransaction] = useState<{
    studentId: string;
    payment: PaymentRecord;
  } | null>(null);

  const showFeedback = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. New Past Question Form State
  const [pqForm, setPqForm] = useState({
    courseCode: '',
    courseTitle: '',
    level: '200 Level' as AcademicLevel,
    semester: 'Harmattan' as 'Harmattan' | 'Rain',
    session: '2024/2025',
    examType: 'Examination' as 'Examination' | 'Continuous Assessment (CA)' | 'Lab Practical',
    fileSize: '2.5 MB'
  });

  // 2. New Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    eventTag: 'Physics Week',
    description: '',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
    upcoming: true
  });

  // 3. New Executive Form State
  const [execForm, setExecForm] = useState({
    name: '',
    post: '',
    level: '300 Level',
    description: '',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    category: 'directors' as never
  });

  // 4. Broadcast Notice state
  const [noticeInput, setNoticeInput] = useState(broadcastNotice || '');

  // 5. New Student Manual Form
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    matricNumber: '',
    level: '100 Level',
    discipline: 'Theoretical & Astrophysics',
    email: '',
    phoneNumber: '+234 800 000 0000',
    duesStatus: 'Paid' as 'Paid' | 'Pending'
  });

  // Financial Analytics
  const totalStudents = students.length;
  const clearedStudents = students.filter((s) => s.duesStatus === 'Paid').length;
  const pendingStudents = students.filter((s) => s.duesStatus === 'Pending').length;
  const clearanceRate = totalStudents > 0 ? Math.round((clearedStudents / totalStudents) * 100) : 0;
  
  const totalRevenue = students.reduce((sum, s) => {
    return sum + (s.payments?.reduce((pSum, p) => pSum + (p.amount || 0), 0) || (s.duesStatus === 'Paid' ? (flwConfig.duesAmount || 2000) : 0));
  }, 0);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.discipline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || s.level === levelFilter;
    const matchesDues = duesFilter === 'All' || s.duesStatus === duesFilter;
    return matchesSearch && matchesLevel && matchesDues;
  });

  // All transactions flattened with studentId
  const allTransactions: (PaymentRecord & { studentId?: string })[] = students.flatMap((s) => 
    (s.payments || []).map((p) => ({
      ...p,
      studentId: s.id,
      studentName: p.studentName || s.fullName,
      matricNumber: p.matricNumber || s.matricNumber
    }))
  ).sort((a, b) => ((b.created_at || b.date || '') > (a.created_at || a.date || '') ? 1 : -1));

  // Save Flutterwave configuration
  const handleSaveFlutterwaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFlutterwaveConfig(flwConfig);
    setFlwSavedSuccess(true);
    showFeedback('Flutterwave payment gateway settings saved successfully!');
    setTimeout(() => setFlwSavedSuccess(false), 3000);
  };

  // Open Single Student Dues Clearance Modal
  const handleOpenDuesModal = (student: User) => {
    const latestPayment = (student.payments && student.payments.length > 0) ? student.payments[0] : null;
    const defaultRef = latestPayment?.reference || `FLW-ADM-${Math.floor(100000 + Math.random() * 900000)}`;
    setDuesForm({
      status: student.duesStatus,
      amount: latestPayment?.amount || flwConfig.duesAmount || 2000,
      session: latestPayment?.session || '2025/2026',
      paymentMethod: latestPayment?.paymentMethod || 'Direct Bank Transfer (LASUSTECH NAPS Account)',
      reference: defaultRef,
      date: latestPayment?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      idCardStatus: student.idCardStatus || (student.duesStatus === 'Paid' ? 'Ready' : 'Ready'),
      note: ''
    });
    setDuesModalStudent(student);
  };

  // Save Single Student Dues Clearance
  const handleSaveDuesClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duesModalStudent) return;

    const targetStudentId = duesModalStudent.id;
    const updated = students.map((s) => {
      if (s.id === targetStudentId) {
        let updatedPayments = [...(s.payments || [])];
        if (duesForm.status === 'Paid') {
          const pmtObj: PaymentRecord = {
            id: `pmt-adm-${Date.now()}`,
            reference: duesForm.reference.trim() || `FLW-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
            matricNumber: s.matricNumber,
            studentName: s.fullName,
            level: s.level,
            session: duesForm.session,
            amount: Number(duesForm.amount) || 2000,
            date: duesForm.date,
            created_at: new Date().toISOString(),
            status: 'Successful',
            paymentMethod: duesForm.paymentMethod
          };
          // If reference exists, update it, else prepend
          const existingIdx = updatedPayments.findIndex(p => p.reference === pmtObj.reference);
          if (existingIdx >= 0) {
            updatedPayments[existingIdx] = pmtObj;
          } else {
            updatedPayments = [pmtObj, ...updatedPayments];
          }
        }
        return {
          ...s,
          duesStatus: duesForm.status,
          idCardStatus: duesForm.status === 'Paid' ? ('Ready' as const) : duesForm.idCardStatus,
          payments: updatedPayments
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setDuesModalStudent(null);
    showFeedback(`Dues status for ${duesModalStudent.fullName} updated to ${duesForm.status}.`);
  };

  // Toggle Dues clearance (1-click fast toggle)
  const handleToggleDues = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const nextStatus = target.duesStatus === 'Paid' ? 'Pending' : 'Paid';
    const updated = students.map((s) => {
      if (s.id === studentId) {
        let updatedPayments = [...(s.payments || [])];
        if (nextStatus === 'Paid' && updatedPayments.length === 0) {
          updatedPayments.push({
            id: `pmt-adm-${Date.now()}`,
            reference: `FLW-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
            matricNumber: s.matricNumber,
            studentName: s.fullName,
            level: s.level,
            session: '2025/2026',
            amount: flwConfig.duesAmount || 2000,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            created_at: new Date().toISOString(),
            status: 'Successful',
            paymentMethod: 'Direct Bank Transfer / Admin Clearance'
          });
        }
        return {
          ...s,
          duesStatus: nextStatus,
          idCardStatus: nextStatus === 'Paid' ? ('Ready' as const) : ('Not Registered' as const),
          payments: updatedPayments
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    showFeedback(`Student ${target.fullName} marked as ${nextStatus}.`);
  };

  // Batch toggle student selection
  const handleToggleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  // Batch Update Dues
  const handleApplyBatchDues = () => {
    if (selectedStudentIds.length === 0) return;

    const updated = students.map((s) => {
      if (selectedStudentIds.includes(s.id)) {
        let updatedPayments = [...(s.payments || [])];
        if (batchDuesConfig.status === 'Paid') {
          const pmtObj: PaymentRecord = {
            id: `pmt-batch-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            reference: `FLW-ADM-BULK-${Math.floor(100000 + Math.random() * 900000)}`,
            matricNumber: s.matricNumber,
            studentName: s.fullName,
            level: s.level,
            session: batchDuesConfig.session,
            amount: Number(batchDuesConfig.amount) || 2000,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            created_at: new Date().toISOString(),
            status: 'Successful',
            paymentMethod: batchDuesConfig.paymentMethod
          };
          updatedPayments = [pmtObj, ...updatedPayments];
        }
        return {
          ...s,
          duesStatus: batchDuesConfig.status,
          idCardStatus: batchDuesConfig.status === 'Paid' ? ('Ready' as const) : ('Not Registered' as const),
          payments: updatedPayments
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    showFeedback(`Updated dues clearance for ${selectedStudentIds.length} students to ${batchDuesConfig.status}.`);
    setSelectedStudentIds([]);
    setShowBatchModal(false);
  };

  // Record Payment for Any Student
  const handleSaveRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordPaymentStudentId) {
      alert('Please select a student from the list.');
      return;
    }

    const targetStudent = students.find(s => s.id === recordPaymentStudentId);
    if (!targetStudent) return;

    const pmtObj: PaymentRecord = {
      id: `pmt-adm-${Date.now()}`,
      reference: duesForm.reference.trim() || `FLW-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
      matricNumber: targetStudent.matricNumber,
      studentName: targetStudent.fullName,
      level: targetStudent.level,
      session: duesForm.session,
      amount: Number(duesForm.amount) || 2000,
      date: duesForm.date,
      created_at: new Date().toISOString(),
      status: 'Successful',
      paymentMethod: duesForm.paymentMethod
    };

    const updated = students.map((s) => {
      if (s.id === recordPaymentStudentId) {
        return {
          ...s,
          duesStatus: 'Paid' as const,
          idCardStatus: 'Ready' as const,
          payments: [pmtObj, ...(s.payments || [])]
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setShowRecordPaymentModal(false);
    setRecordPaymentStudentId('');
    showFeedback(`Payment recorded for ${targetStudent.fullName}! Dues marked as Paid.`);
  };

  // Edit Existing Transaction in Ledger
  const handleSaveEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const { studentId, payment } = editingTransaction;
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const updatedPayments = (s.payments || []).map((p) => 
          p.id === payment.id || p.reference === payment.reference ? { ...p, ...payment } : p
        );
        return {
          ...s,
          payments: updatedPayments
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setEditingTransaction(null);
    showFeedback(`Transaction ${payment.reference} updated successfully.`);
  };

  // Void / Delete Transaction in Ledger
  const handleDeleteTransaction = (studentId: string, paymentId: string, ref: string) => {
    if (window.confirm(`Are you sure you want to void / delete transaction ${ref}?`)) {
      const updated = students.map((s) => {
        if (s.id === studentId) {
          const remainingPayments = (s.payments || []).filter(p => p.id !== paymentId && p.reference !== ref);
          return {
            ...s,
            duesStatus: remainingPayments.length > 0 ? ('Paid' as const) : ('Pending' as const),
            idCardStatus: remainingPayments.length > 0 ? ('Ready' as const) : ('Not Registered' as const),
            payments: remainingPayments
          };
        }
        return s;
      });

      onUpdateStudents(updated);
      showFeedback(`Transaction ${ref} removed. Student dues status updated.`);
    }
  };

  // Delete student
  const handleDeleteStudent = (studentId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the department roster?`)) {
      const updated = students.filter(s => s.id !== studentId);
      onUpdateStudents(updated);
      showFeedback(`Student ${name} removed.`);
    }
  };

  // Add new Student manually
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.fullName || !newStudentForm.matricNumber) {
      alert('Please fill in required fields.');
      return;
    }

    const duesVal = newStudentForm.duesStatus;
    const newStudent: User = {
      id: `usr-${Date.now()}`,
      fullName: newStudentForm.fullName,
      matricNumber: newStudentForm.matricNumber.toUpperCase(),
      email: newStudentForm.email || `${newStudentForm.matricNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.lasustech.edu.ng`,
      phoneNumber: newStudentForm.phoneNumber || '+234 800 000 0000',
      level: newStudentForm.level,
      discipline: newStudentForm.discipline,
      duesStatus: duesVal,
      idCardStatus: duesVal === 'Paid' ? 'Ready' : 'Not Registered',
      role: 'student',
      payments: duesVal === 'Paid' ? [
        {
          id: `pay-manual-${Date.now()}`,
          reference: `FLW-NAPS-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: flwConfig.duesAmount || 2000,
          session: '2025/2026',
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          created_at: new Date().toISOString(),
          status: 'Successful',
          paymentMethod: 'Flutterwave / Admin Verified'
        }
      ] : []
    };

    onUpdateStudents([newStudent, ...students]);
    setShowAddStudentModal(false);
    setNewStudentForm({
      fullName: '',
      matricNumber: '',
      level: '100 Level',
      discipline: 'Theoretical & Astrophysics',
      email: '',
      phoneNumber: '+234 800 000 0000',
      duesStatus: 'Paid'
    });
    showFeedback(`Student ${newStudent.fullName} enrolled into chapter roster!`);
  };

  // Update existing student
  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    let updatedStudent = { ...editingStudent };
    if (updatedStudent.duesStatus === 'Paid') {
      updatedStudent.idCardStatus = 'Ready';
      if (!updatedStudent.payments || updatedStudent.payments.length === 0) {
        updatedStudent.payments = [
          {
            id: `pmt-adm-${Date.now()}`,
            reference: `FLW-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
            matricNumber: updatedStudent.matricNumber,
            studentName: updatedStudent.fullName,
            level: updatedStudent.level,
            session: '2025/2026',
            amount: flwConfig.duesAmount || 2000,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            created_at: new Date().toISOString(),
            status: 'Successful',
            paymentMethod: 'Admin Clearance'
          }
        ];
      }
    } else {
      updatedStudent.idCardStatus = 'Not Registered';
    }

    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    onUpdateStudents(updated);
    setEditingStudent(null);
    showFeedback(`Details for ${updatedStudent.fullName} updated.`);
  };

  // Publish Past Question
  const handlePublishPq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pqForm.courseCode || !pqForm.courseTitle) {
      alert('Please provide Course Code and Course Title.');
      return;
    }

    const newPq: PastQuestion = {
      id: `pq-${Date.now()}`,
      courseCode: pqForm.courseCode.toUpperCase(),
      courseTitle: pqForm.courseTitle,
      level: pqForm.level,
      semester: pqForm.semester,
      session: pqForm.session,
      examType: pqForm.examType,
      downloads: 0,
      fileSize: pqForm.fileSize || '2.8 MB'
    };

    onUpdatePastQuestions([newPq, ...pastQuestions]);
    setPqForm({
      courseCode: '',
      courseTitle: '',
      level: '200 Level',
      semester: 'Harmattan',
      session: '2024/2025',
      examType: 'Examination',
      fileSize: '2.5 MB'
    });
    showFeedback(`Past Question ${newPq.courseCode} published to student archive!`);
  };

  const handleDeletePq = (id: string) => {
    if (window.confirm('Are you sure you want to remove this past question?')) {
      onUpdatePastQuestions(pastQuestions.filter((q) => q.id !== id));
      showFeedback('Past question removed.');
    }
  };

  // Publish Event
  const handlePublishEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      alert('Please provide Event Title and Date.');
      return;
    }

    const newEvent: ChapterEvent = {
      id: `evt-${Date.now()}`,
      title: eventForm.title,
      date: eventForm.date,
      eventTag: eventForm.eventTag,
      description: eventForm.description,
      image: eventForm.image,
      upcoming: eventForm.upcoming
    };

    onUpdateEvents([newEvent, ...events]);
    setEventForm({
      title: '',
      date: '',
      eventTag: 'Physics Week',
      description: '',
      image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
      upcoming: true
    });
    showFeedback(`Chapter Event "${newEvent.title}" published live!`);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Delete this event?')) {
      onUpdateEvents(events.filter((e) => e.id !== id));
      showFeedback('Event deleted.');
    }
  };

  // Add Executive
  const handleAddExecutive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!execForm.name || !execForm.post) {
      alert('Please fill executive details.');
      return;
    }

    const newExec: Executive = {
      name: execForm.name,
      post: execForm.post,
      level: execForm.level,
      description: execForm.description,
      image: execForm.image,
      category: execForm.category
    };

    onUpdateExecutives([...executives, newExec]);
    setExecForm({
      name: '',
      post: '',
      level: '300 Level',
      description: '',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      category: 'directors'
    });
    showFeedback(`Executive ${newExec.name} added to public leadership board!`);
  };

  const handleDeleteExecutive = (name: string) => {
    if (window.confirm(`Remove ${name} from executive directory?`)) {
      onUpdateExecutives(executives.filter((ex) => ex.name !== name));
      showFeedback('Executive directory updated.');
    }
  };

  // Save Notice
  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBroadcastNotice(noticeInput.trim() ? noticeInput.trim() : null);
    showFeedback('Broadcast notification banner updated.');
  };

  // Export CSV
  const handleExportStudentsCsv = () => {
    const headers = ['Matric Number', 'Full Name', 'Level', 'Discipline', 'Email', 'Phone', 'Dues Status'];
    const rows = filteredStudents.map(s => [
      s.matricNumber,
      `"${s.fullName}"`,
      s.level,
      `"${s.discipline}"`,
      s.email,
      s.phoneNumber || '',
      s.duesStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `naps_lasustech_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('Student roster exported to CSV.');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-28">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-100 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-sky-500/40 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Top Command Header */}
      <div className="bg-[#07111e] text-white py-5 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Atom className="h-6 w-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                  NAPS Administration & Financial Console
                </h1>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Flutterwave Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive Access: <span className="text-emerald-400 font-semibold">Authorized Session</span> • LASUSTECH Physics Chapter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={() => {
                if (students[0] && onTestPayment) {
                  onTestPayment(students[0]);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Test Flutterwave</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Exit Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Events ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Gallery ({gallery.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('constitution')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'constitution'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Constitution</span>
            </button>

            <button
              onClick={() => setActiveTab('awards')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'awards'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Awards ({awards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('voting')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'voting'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Vote className="h-3.5 w-3.5" />
              <span>Voting & Polls</span>
            </button>

            <button
              onClick={() => setActiveTab('publish-pq')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'publish-pq'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Past Questions ({pastQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'people'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>People & Leaders</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>Student Roster ({students.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Info</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MenuIcon className="h-3.5 w-3.5" />
              <span>Navigation Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Site Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('flutterwave')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'flutterwave'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Financial Ledger</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-orange-400/30 text-orange-200">
                {allTransactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'broadcast'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Dues Revenue
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-slate-900">
                    ₦{totalRevenue.toLocaleString()}.00
                  </span>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Cleared via Flutterwave & Bank Inflows
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Compliance Rate
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-slate-900">
                    {clearanceRate}% Cleared
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {clearedStudents} of {totalStudents} students verified
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enrolled Students
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-slate-900">
                    {totalStudents} Members
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    100L - 400L Undergraduate Roster
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Digital Repository
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-display text-2xl font-black text-slate-900">
                    {pastQuestions.length} PQs / {events.length} Events
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Published on Public Archive
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b1626] to-[#152a4a] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 uppercase tracking-wide">
                  Quick Administration Actions
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  Manage Chapter Resources & Payment Operations
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Enroll new students, configure Flutterwave API parameters, publish new exam syllabi, and dispatch chapter broadcasts.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Student</span>
                </button>

                <button
                  onClick={() => setActiveTab('flutterwave')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Flutterwave Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('publish-pq')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Upload Past Question</span>
                </button>
              </div>
            </div>

            {/* Recent Flutterwave Transactions Snippet */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Recent Dues Inflows & Flutterwave Receipts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Latest validated session dues transactions across channels
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('flutterwave')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>View All In Ledger</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Transaction Ref</th>
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">Matric No</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Method / Channel</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTransactions.slice(0, 5).map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {tx.reference}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {tx.studentName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {tx.matricNumber}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          ₦{(tx.amount || 2000).toLocaleString()}.00
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {tx.paymentMethod || 'Flutterwave Gateway'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            Verified
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: FLUTTERWAVE PAYMENT GATEWAY MANAGEMENT & LEDGER */}
        {/* ================================================================= */}
        {activeTab === 'flutterwave' && (
          <div className="space-y-6">
            {/* Gateway Configuration Panel */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Flutterwave Gateway Integration Parameters
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure your Flutterwave API credentials, transaction currency, and official receiving bank account.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    flwConfig.isTestMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {flwConfig.isTestMode ? '● Flutterwave Test Mode' : '● Live Production'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveFlutterwaveConfig} className="mt-5 space-y-4 text-xs">
                {flwSavedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Configuration updated and synchronized with checkout modals!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Flutterwave Public Key:
                    </label>
                    <input
                      type="text"
                      value={flwConfig.publicKey}
                      onChange={(e) => setFlwConfig({ ...flwConfig, publicKey: e.target.value })}
                      placeholder="FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxx-X"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      From your Flutterwave Dashboard &gt; Settings &gt; API Keys.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Session Dues Amount (₦):
                    </label>
                    <input
                      type="number"
                      value={flwConfig.duesAmount}
                      onChange={(e) => setFlwConfig({ ...flwConfig, duesAmount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Standard fee billed to students for 2025/2026 session clearance.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Official Receiving Bank:
                    </label>
                    <input
                      type="text"
                      value={flwConfig.bankName}
                      onChange={(e) => setFlwConfig({ ...flwConfig, bankName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Account Number:
                    </label>
                    <input
                      type="text"
                      value={flwConfig.accountNumber}
                      onChange={(e) => setFlwConfig({ ...flwConfig, accountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Account Name:
                    </label>
                    <input
                      type="text"
                      value={flwConfig.accountName}
                      onChange={(e) => setFlwConfig({ ...flwConfig, accountName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 font-semibold"
                    />
                  </div>
                </div>

                {/* Mode Toggle & Actions */}
                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flwConfig.isTestMode}
                      onChange={(e) => setFlwConfig({ ...flwConfig, isTestMode: e.target.checked })}
                      className="h-4 w-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                    <span className="font-semibold text-slate-700">
                      Enable Flutterwave Test/Sandbox Mode (allows instant test card evaluation)
                    </span>
                  </label>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Flutterwave Settings</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Flutterwave Transactions Ledger Table */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Official Flutterwave Transactions Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time payment logs with Flutterwave reference tracking and verification states
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvRows = [
                        ['Reference', 'Student Name', 'Matric Number', 'Amount (NGN)', 'Channel', 'Date', 'Status'],
                        ...allTransactions.map(t => [
                          t.reference,
                          `"${t.studentName}"`,
                          t.matricNumber,
                          t.amount,
                          `"${t.paymentMethod || 'Flutterwave'}"`,
                          t.date,
                          t.status
                        ])
                      ];
                      const csvStr = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
                      const link = document.createElement('a');
                      link.href = encodeURI(csvStr);
                      link.download = `flutterwave_ledger_${Date.now()}.csv`;
                      link.click();
                      showFeedback('Ledger exported to CSV.');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Ledger CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      setRecordPaymentStudentId(students.find(s => s.duesStatus === 'Pending')?.id || students[0]?.id || '');
                      setShowRecordPaymentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Record Dues Inflow</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Tx Ref</th>
                      <th className="py-3 px-3">Flw Ref</th>
                      <th className="py-3 px-3">Student</th>
                      <th className="py-3 px-3">Matric</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Channel</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTransactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {tx.reference}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {tx.flwRef || `FLW-${tx.id}`}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {tx.studentName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {tx.matricNumber}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          ₦{(tx.amount || 2000).toLocaleString()}.00
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {tx.paymentMethod || 'Flutterwave Card'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {tx.date}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            Verified
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors"
                            title="Print Clearance Certificate"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTransaction({
                              studentId: tx.studentId || '',
                              payment: tx
                            })}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Edit Payment Record Details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {tx.studentId && (
                            <button
                              onClick={() => handleDeleteTransaction(tx.studentId!, tx.id, tx.reference)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Void / Delete Transaction"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: STUDENT ROSTER & DUES CLEARANCE */}
        {/* ================================================================= */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            {/* Quick Filter Header Cards */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDuesFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    duesFilter === 'All' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All Students ({totalStudents})
                </button>
                <button
                  type="button"
                  onClick={() => setDuesFilter('Paid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    duesFilter === 'Paid' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Paid / Cleared ({clearedStudents})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDuesFilter('Pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    duesFilter === 'Pending' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Pending Dues ({pendingStudents})</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{filteredStudents.length}</span> students
              </div>
            </div>

            {/* Action & Filter Bar */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, matric, or stream..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="All">All Academic Levels</option>
                  <option value="100 Level">100 Level</option>
                  <option value="200 Level">200 Level</option>
                  <option value="300 Level">300 Level</option>
                  <option value="400 Level">400 Level</option>
                </select>

                <select
                  value={duesFilter}
                  onChange={(e) => setDuesFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="All">All Dues Statuses</option>
                  <option value="Paid">Paid (Cleared)</option>
                  <option value="Pending">Pending (Uncleared)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const firstPending = students.find(s => s.duesStatus === 'Pending') || students[0];
                    setRecordPaymentStudentId(firstPending ? firstPending.id : '');
                    setShowRecordPaymentModal(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  title="Record dues payment or clearance for any student"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Record Dues Payment</span>
                </button>

                <button
                  onClick={handleExportStudentsCsv}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            {/* Batch Action Toolbar */}
            {selectedStudentIds.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-orange-950 bg-orange-200/80 px-2.5 py-1 rounded-lg">
                    {selectedStudentIds.length} Student{selectedStudentIds.length > 1 ? 's' : ''} Selected
                  </span>
                  <span className="text-orange-900 font-medium">
                    Perform batch clearance action:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBatchDuesConfig(prev => ({ ...prev, status: 'Paid' }));
                      setShowBatchModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Selected as Paid</span>
                  </button>
                  <button
                    onClick={() => {
                      setBatchDuesConfig(prev => ({ ...prev, status: 'Pending' }));
                      setShowBatchModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Mark as Pending</span>
                  </button>
                  <button
                    onClick={() => setSelectedStudentIds([])}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Cancel Selection
                  </button>
                </div>
              </div>
            )}

            {/* Students Table */}
            <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                          onChange={handleToggleSelectAll}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer h-3.5 w-3.5"
                          title="Select all"
                        />
                      </th>
                      <th className="py-3.5 px-3">Student</th>
                      <th className="py-3.5 px-3">Matric No</th>
                      <th className="py-3.5 px-3">Level</th>
                      <th className="py-3.5 px-3">Discipline</th>
                      <th className="py-3.5 px-3">Dues Status & Clearance</th>
                      <th className="py-3.5 px-3 text-center">ID Card</th>
                      <th className="py-3.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((st) => {
                      const isSelected = selectedStudentIds.includes(st.id);
                      const latestPayment = st.payments && st.payments.length > 0 ? st.payments[0] : null;

                      return (
                        <tr 
                          key={st.id} 
                          className={`transition-colors ${
                            isSelected ? 'bg-orange-50/50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectStudent(st.id)}
                              className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer h-3.5 w-3.5"
                            />
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={st.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                                alt={st.fullName}
                                className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {st.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {st.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                            {st.matricNumber}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 font-medium">
                            {st.level}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 max-w-[140px] truncate" title={st.discipline}>
                            {st.discipline}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              {st.duesStatus === 'Paid' ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDuesModal(st)}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer group"
                                  title="Click to view or edit clearance details"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  <span>Paid (₦{(latestPayment?.amount || 2000).toLocaleString()})</span>
                                  <Edit className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDuesModal(st)}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors flex items-center gap-1 cursor-pointer group"
                                  title="Click to clear student and record payment"
                                >
                                  <AlertCircle className="h-3 w-3 text-amber-600" />
                                  <span>Pending</span>
                                  <span className="text-[9px] bg-amber-200/80 px-1 py-0.2 rounded font-bold ml-0.5">Clear</span>
                                </button>
                              )}

                              {/* Quick 1-click toggle button */}
                              <button
                                type="button"
                                onClick={() => handleToggleDues(st.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title={`Fast toggle status to ${st.duesStatus === 'Paid' ? 'Pending' : 'Paid'}`}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => onPreviewId(st)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold transition-colors"
                              title="Preview PVC Student ID Card"
                            >
                              <BadgeCheck className="h-3.5 w-3.5" />
                              <span>Preview</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-1 whitespace-nowrap">
                            {/* Update Dues Clearance button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDuesModal(st)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors"
                              title="Update Dues Clearance & Payment Details"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Update Dues</span>
                            </button>

                            <button
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-block"
                              title="Edit Student Info"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st.id, st.fullName)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors inline-block"
                              title="Delete Student"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PAST QUESTIONS REPOSITORY PUBLISHER */}
        {/* ================================================================= */}
        {activeTab === 'publish-pq' && (
          <PastQuestionManagementSection
            pastQuestions={pastQuestions}
            onUpdatePastQuestions={onUpdatePastQuestions}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 5: EVENTS & SYMPOSIA MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'events' && (
          <EventsManagementSection
            events={events}
            onUpdateEvents={onUpdateEvents}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: GALLERY ALBUMS & MEDIA MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'gallery' && onUpdateGallery && (
          <GalleryManagementSection
            items={gallery}
            onUpdateGallery={onUpdateGallery}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: CONSTITUTION & LEGAL ARTICLES */}
        {/* ================================================================= */}
        {activeTab === 'constitution' && constitutionDoc && onUpdateConstitutionDoc && onUpdateConstitutionArticles && (
          <ConstitutionManagementSection
            docInfo={constitutionDoc}
            onUpdateDocInfo={onUpdateConstitutionDoc}
            articles={constitutionArticles}
            onUpdateArticles={onUpdateConstitutionArticles}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: HONORS, AWARDS & RECOGNITIONS */}
        {/* ================================================================= */}
        {activeTab === 'awards' && onUpdateAwards && (
          <AwardsManagementSection
            awards={awards}
            onUpdateAwards={onUpdateAwards}
            categories={votingCategories}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: STUDENT VOTING & BALLOT MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'voting' && votingSettings && onUpdateVotingSettings && onUpdateVotingCategories && (
          <VotingManagementSection
            settings={votingSettings}
            onUpdateSettings={onUpdateVotingSettings}
            categories={votingCategories}
            onUpdateCategories={onUpdateVotingCategories}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: PEOPLE, EXECUTIVES & LEADERSHIP DIRECTORY */}
        {/* ================================================================= */}
        {activeTab === 'people' && onUpdatePeople && (
          <PeopleManagementSection
            people={people}
            onSavePerson={async (person) => {
              try {
                const exists = people.find(p => p.id === person.id);
                let saved;
                if (exists) {
                  saved = await updatePersonApi(person);
                } else {
                  saved = await createPersonApi(person);
                }
                const updated = exists 
                  ? people.map(p => p.id === saved.id ? saved : p)
                  : [saved, ...people];
                onUpdatePeople(updated);
              } catch (e: any) {
                console.error("Save person error:", e);
                alert("Failed to save person: " + (e.message || 'Unknown error'));
              }
            }}
            onDeletePerson={async (id) => {
              try {
                await deletePersonApi(id);
                onUpdatePeople(people.filter(p => p.id !== id));
              } catch (e: any) {
                console.error("Delete person error:", e);
                alert("Failed to delete person: " + (e.message || 'Unknown error'));
              }
            }}
            onUpdatePeople={onUpdatePeople}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: SECRETARIAT & CONTACT INFORMATION */}
        {/* ================================================================= */}
        {activeTab === 'contact' && contactInfo && onUpdateContactInfo && (
          <ContactManagementSection
            contact={contactInfo}
            onUpdateContact={onUpdateContactInfo}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: NAVIGATION MENU LINKS */}
        {/* ================================================================= */}
        {activeTab === 'menu' && onUpdateMenuItems && (
          <MenuManagementSection
            menuItems={menuItems}
            onUpdateMenuItems={onUpdateMenuItems}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB: SITE SETTINGS & BRANDING */}
        {/* ================================================================= */}
        {activeTab === 'settings' && siteSettings && onUpdateSiteSettings && (
          <SiteSettingsManagementSection
            settings={siteSettings}
            onUpdateSettings={onUpdateSiteSettings}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 6: EXECUTIVE COUNCIL ROSTER MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'executives' && (
          <ExecutiveManagementSection
            executives={executives}
            onUpdateExecutives={onUpdateExecutives}
            showFeedback={showFeedback}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 7: BROADCAST ANNOUNCEMENTS & NOTICE BOARD */}
        {/* ================================================================= */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Site-Wide Broadcast Announcement
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Publish instant announcements displayed as a marquee alert banner at the top of the entire website.
              </p>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Announcement Text:
                </label>
                <textarea
                  rows={4}
                  value={noticeInput}
                  onChange={(e) => setNoticeInput(e.target.value)}
                  placeholder="e.g. 📢 Physics Week 2026: Symposium, Lab Apparatus Exhibition & Annual Dinner registration is ongoing! Ensure session dues are cleared for admission."
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Publish Site-Wide Notice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNoticeInput('');
                    onUpdateBroadcastNotice(null);
                    showFeedback('Broadcast notification cleared.');
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Clear Notice
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW STUDENT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Enroll New Student
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Babatunde Peter"
                  value={newStudentForm.fullName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Matriculation Number:
                </label>
                <input
                  type="text"
                  placeholder="LASUSTECH/PHYS/25/0000"
                  value={newStudentForm.matricNumber}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, matricNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Level:
                  </label>
                  <select
                    value={newStudentForm.level}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Dues Status:
                  </label>
                  <select
                    value={newStudentForm.duesStatus}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, duesStatus: e.target.value as never })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
                  >
                    <option value="Paid">Paid (Generate Clearance)</option>
                    <option value="Pending">Pending (Uncleared)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Physics Stream / Discipline:
                </label>
                <select
                  value={newStudentForm.discipline}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, discipline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
                >
                  <option value="Theoretical & Astrophysics">Theoretical & Astrophysics</option>
                  <option value="Electronics & Computational Physics">Electronics & Computational Physics</option>
                  <option value="Applied Geophysics">Applied Geophysics</option>
                  <option value="Radiation & Health Physics">Radiation & Health Physics</option>
                  <option value="Renewable Energy & Material Science">Renewable Energy & Material Science</option>
                  <option value="Physics (General)">Physics (General)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Edit Student Details
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Matriculation Number:
                </label>
                <input
                  type="text"
                  value={editingStudent.matricNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, matricNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Level:
                  </label>
                  <select
                    value={editingStudent.level}
                    onChange={(e) => setEditingStudent({ ...editingStudent, level: e.target.value as AcademicLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
                  >
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dues Status:
                  </label>
                  <select
                    value={editingStudent.duesStatus}
                    onChange={(e) => setEditingStudent({ ...editingStudent, duesStatus: e.target.value as never })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs"
                  >
                    <option value="Paid">Paid (Cleared)</option>
                    <option value="Pending">Pending (Uncleared)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINTABLE OFFICIAL RECEIPT VIEW */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                Flutterwave Verified Inflow
              </span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center space-y-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Official Chapter Dues Receipt
              </h3>
              <p className="text-[11px] text-slate-400">
                National Association of Physics Students • LASUSTECH Chapter
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matriculation:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.matricNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-emerald-600">₦{(selectedReceipt.amount || 2000).toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod || 'Flutterwave'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{selectedReceipt.date}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INDIVIDUAL STUDENT DUES CLEARANCE & PAYMENT DETAILS */}
      {duesModalStudent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 leading-tight">
                    Update Dues & Clearance
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {duesModalStudent.matricNumber} • {duesModalStudent.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDuesModalStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDuesClearance} className="space-y-4 text-xs">
              {/* Clearance Status Radio Cards */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Dues Clearance Status:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuesForm({ ...duesForm, status: 'Paid' })}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      duesForm.status === 'Paid'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border ${
                      duesForm.status === 'Paid' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {duesForm.status === 'Paid' && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span>Paid (Cleared)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Issue clearance certificate & unlock ID card
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuesForm({ ...duesForm, status: 'Pending' })}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      duesForm.status === 'Pending'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border ${
                      duesForm.status === 'Pending' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                    }`}>
                      {duesForm.status === 'Pending' && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Pending Dues</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Uncleared. Restricts ID card printing
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details if status is Paid */}
              {duesForm.status === 'Paid' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Payment & Inflow Audit Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Amount Paid (₦):
                      </label>
                      <input
                        type="number"
                        value={duesForm.amount}
                        onChange={(e) => setDuesForm({ ...duesForm, amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Academic Session:
                      </label>
                      <input
                        type="text"
                        value={duesForm.session}
                        onChange={(e) => setDuesForm({ ...duesForm, session: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Method / Inflow Channel:
                    </label>
                    <select
                      value={duesForm.paymentMethod}
                      onChange={(e) => setDuesForm({ ...duesForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="Direct Bank Transfer (LASUSTECH NAPS Account)">
                        Direct Bank Transfer (LASUSTECH NAPS Account)
                      </option>
                      <option value="Cash Payment at Department Secretariat">
                        Cash Payment at Department Secretariat
                      </option>
                      <option value="Flutterwave Online Payment Gateway">
                        Flutterwave Online Payment Gateway
                      </option>
                      <option value="POS Terminal (Faculty Cashier)">
                        POS Terminal (Faculty Cashier)
                      </option>
                      <option value="Departmental Exco / Student Waiver">
                        Departmental Exco / Student Waiver
                      </option>
                      <option value="Scholarship / Merit Exemption">
                        Scholarship / Merit Exemption
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">
                          Transaction Reference:
                        </label>
                        <button
                          type="button"
                          onClick={() => setDuesForm({
                            ...duesForm,
                            reference: `FLW-ADM-${Math.floor(100000 + Math.random() * 900000)}`
                          })}
                          className="text-[10px] text-orange-600 hover:underline font-bold"
                        >
                          New Ref
                        </button>
                      </div>
                      <input
                        type="text"
                        value={duesForm.reference}
                        onChange={(e) => setDuesForm({ ...duesForm, reference: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] font-bold bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Clearance Date:
                      </label>
                      <input
                        type="text"
                        value={duesForm.date}
                        onChange={(e) => setDuesForm({ ...duesForm, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Payment History */}
              {duesModalStudent.payments && duesModalStudent.payments.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="block font-bold text-slate-700 mb-2">
                    Payment History Records ({duesModalStudent.payments.length}):
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {duesModalStudent.payments.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-mono font-bold text-slate-800 block">{p.reference}</span>
                          <span className="text-slate-500">{p.date} • {p.paymentMethod || 'Direct Transfer'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">₦{(p.amount || 2000).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceipt({ ...p, studentName: duesModalStudent.fullName, matricNumber: duesModalStudent.matricNumber });
                            }}
                            className="p-1 rounded bg-orange-50 hover:bg-orange-100 text-orange-600"
                            title="Print receipt"
                          >
                            <Printer className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setDuesModalStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all active:scale-95"
                >
                  Save Dues Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: BATCH DUES CLEARANCE MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Batch Dues Clearance
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 font-medium">
                You are about to update dues status for{' '}
                <span className="font-bold underline">{selectedStudentIds.length} students</span> at once.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Status:
                </label>
                <select
                  value={batchDuesConfig.status}
                  onChange={(e) => setBatchDuesConfig({ ...batchDuesConfig, status: e.target.value as never })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Paid">Mark All as Paid (Issue Clearances)</option>
                  <option value="Pending">Mark All as Pending (Uncleared)</option>
                </select>
              </div>

              {batchDuesConfig.status === 'Paid' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Method / Channel:
                    </label>
                    <select
                      value={batchDuesConfig.paymentMethod}
                      onChange={(e) => setBatchDuesConfig({ ...batchDuesConfig, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="Direct Bank Transfer (LASUSTECH NAPS Account)">
                        Direct Bank Transfer (LASUSTECH NAPS Account)
                      </option>
                      <option value="Cash Payment at Department Secretariat">
                        Cash Payment at Department Secretariat
                      </option>
                      <option value="POS Terminal (Faculty Cashier)">
                        POS Terminal (Faculty Cashier)
                      </option>
                      <option value="Flutterwave Online Payment Gateway">
                        Flutterwave Online Payment Gateway
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Amount (₦) each:
                      </label>
                      <input
                        type="number"
                        value={batchDuesConfig.amount}
                        onChange={(e) => setBatchDuesConfig({ ...batchDuesConfig, amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Academic Session:
                      </label>
                      <input
                        type="text"
                        value={batchDuesConfig.session}
                        onChange={(e) => setBatchDuesConfig({ ...batchDuesConfig, session: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchDues}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md transition-all active:scale-95"
                >
                  Apply to {selectedStudentIds.length} Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: RECORD PAYMENT FOR ANY STUDENT */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Record Dues Payment
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Log an offline, cash or transfer payment and mark student as paid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Student:
                </label>
                <select
                  value={recordPaymentStudentId}
                  onChange={(e) => setRecordPaymentStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select a Student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.matricNumber}) — {st.duesStatus === 'Paid' ? 'Paid' : 'Pending'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount Paid (₦):
                  </label>
                  <input
                    type="number"
                    value={duesForm.amount}
                    onChange={(e) => setDuesForm({ ...duesForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Session:
                  </label>
                  <input
                    type="text"
                    value={duesForm.session}
                    onChange={(e) => setDuesForm({ ...duesForm, session: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Method / Channel:
                </label>
                <select
                  value={duesForm.paymentMethod}
                  onChange={(e) => setDuesForm({ ...duesForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Direct Bank Transfer (LASUSTECH NAPS Account)">
                    Direct Bank Transfer (LASUSTECH NAPS Account)
                  </option>
                  <option value="Cash Payment at Department Secretariat">
                    Cash Payment at Department Secretariat
                  </option>
                  <option value="Flutterwave Online Payment Gateway">
                    Flutterwave Online Payment Gateway
                  </option>
                  <option value="POS Terminal (Faculty Cashier)">
                    POS Terminal (Faculty Cashier)
                  </option>
                  <option value="Departmental Exco / Student Waiver">
                    Departmental Exco / Student Waiver
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Receipt Ref:
                  </label>
                  <input
                    type="text"
                    placeholder="FLW-ADM-..."
                    value={duesForm.reference}
                    onChange={(e) => setDuesForm({ ...duesForm, reference: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-[11px] font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date Paid:
                  </label>
                  <input
                    type="text"
                    value={duesForm.date}
                    onChange={(e) => setDuesForm({ ...duesForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all active:scale-95"
                >
                  Record Payment & Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT TRANSACTION IN LEDGER */}
      {editingTransaction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Edit Payment Record
              </h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transaction Reference:
                </label>
                <input
                  type="text"
                  value={editingTransaction.payment.reference}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    payment: { ...editingTransaction.payment, reference: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Amount (₦):
                </label>
                <input
                  type="number"
                  value={editingTransaction.payment.amount}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    payment: { ...editingTransaction.payment, amount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Channel:
                </label>
                <input
                  type="text"
                  value={editingTransaction.payment.paymentMethod || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    payment: { ...editingTransaction.payment, paymentMethod: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Date:
                </label>
                <input
                  type="text"
                  value={editingTransaction.payment.date}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    payment: { ...editingTransaction.payment, date: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
