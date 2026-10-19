export type UserRole = 'student' | 'admin' | 'exco';

export type AcademicLevel = '100 Level' | '200 Level' | '300 Level' | '400 Level';

export type PhysicsDiscipline = 
  | 'Physics (General)'
  | 'Applied Geophysics'
  | 'Radiation & Health Physics'
  | 'Renewable Energy & Material Science'
  | 'Electronics & Computational Physics'
  | 'Theoretical & Astrophysics';

export interface User {
  id: string;
  fullName: string;
  matricNumber: string;
  email: string;
  password?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  level: AcademicLevel | string;
  discipline: PhysicsDiscipline | string;
  gender?: string;
  birthday?: string;
  post?: string;
  duesStatus: 'Paid' | 'Pending';
  idCardStatus?: 'Ready' | 'Not Registered';
  attendance?: number;
  resources?: number;
  profileImage?: string;
  role?: UserRole;
  payments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  reference: string;
  matricNumber?: string;
  studentName?: string;
  level?: string;
  session: string;
  amount: number;
  payment_type?: string;
  created_at?: string;
  date?: string;
  status: 'Successful' | 'Pending' | 'successful' | 'pending';
  flwRef?: string;
  paymentMethod?: string;
}

export interface Executive {
  id?: string;
  name: string;
  post: string;
  level: string;
  description: string;
  image: string;
  objectPosition?: string;
  category?: 'top' | 'secretariat' | 'directors' | 'hocs' | 'ass_hocs';
  phone?: string;
  email?: string;
  department?: string;
  order?: number;
}

export interface ChapterEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  upcoming?: boolean;
  ongoing?: boolean;
  contain?: boolean;
  eventTag?: string;
  time?: string;
  venue?: string;
  registrationInfo?: string;
  registrationUrl?: string;
}

export interface ManualQuestionItem {
  id: string;
  number: string | number;
  section?: string;
  text: string;
  options?: string[];
  answer?: string;
  marks?: string;
}

export interface PastQuestion {
  id: string;
  courseCode: string;
  courseTitle: string;
  level: AcademicLevel;
  semester: 'Harmattan' | 'Rain';
  session: string;
  examType: 'Examination' | 'Continuous Assessment (CA)' | 'Lab Practical';
  downloads: number;
  fileSize: string;
  formatType?: 'pdf' | 'images' | 'manual' | 'both';
  department?: string;
  instructions?: string;
  duration?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  images?: string[];
  manualQuestions?: ManualQuestionItem[];
  manualContent?: string;
  uploadedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  eventTag: string;
  date: string;
  dateSortValue?: string;
  images: string[];
}

export interface VotingCategory {
  id: string;
  slug: string;
  title: string;
  groupKey: string;
  groupName: string;
  description: string;
  nominees: Nominee[];
}

export interface Nominee {
  id: string;
  name: string;
  level: string;
  discipline: string;
  image?: string;
  votes: number;
  description?: string;
}

export interface ConstitutionArticle {
  number: string;
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export interface FlutterwaveConfig {
  publicKey: string;
  isTestMode: boolean;
  duesAmount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface FlutterwaveTransaction {
  id: number | string;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  charged_amount?: number;
  status: 'successful' | 'failed' | 'pending';
  payment_type: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    phone_number?: string;
  };
  matricNumber?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  recipient: string;
  year: string;
  category: string;
  description: string;
  image?: string;
  certificateUrl?: string;
}

export interface ConstitutionDocument {
  pdfUrl?: string;
  fileName?: string;
  fileSize?: string;
  updatedAt?: string;
  published: boolean;
  articles: ConstitutionArticle[];
}

export interface ContactInfo {
  phone: string;
  alternativePhone?: string;
  email: string;
  secretariatEmail?: string;
  officeAddress?: string;
  address?: string;
  faculty?: string;
  campus?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  telegram?: string;
  whatsapp?: string;
  whatsappGroup?: string;
  operatingHours?: string;
  officeHours?: string;
}

export interface NavigationMenuItem {
  id: string;
  label: string;
  targetView: string;
  visible: boolean;
  order: number;
  isExternal?: boolean;
  externalUrl?: string;
  badge?: string;
  children?: NavigationMenuItem[];
}

export interface VotingSettings {
  isOpen: boolean;
  title?: string;
  electionTitle?: string;
  session?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  allowMultipleCategoriesVote?: boolean;
  oneVotePerUser?: boolean;
  requireBiometrics?: boolean;
  strictMatricValidation?: boolean;
}

export interface PeopleProfile {
  id: string;
  name: string;
  post: string;
  level: string;
  description: string;
  bio?: string;
  image: string;
  category: 'executive' | 'honourable' | 'patron' | 'hoc' | 'official';
  phone?: string;
  email?: string;
  department?: string;
  order?: number;
}

export interface SiteSettings {
  associationName: string;
  chapterName?: string;
  shortName?: string;
  institution?: string;
  faculty?: string;
  department?: string;
  motto?: string;
  academicSession?: string;
  currentSession?: string;
  semester?: string;
  duesAmount: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  portalNotice?: string;
  broadcastNotice?: string | null;
  emergencyNotice?: string | null;
  registrationOpen?: boolean;
  allowRegistration?: boolean;
  allowVoting?: boolean;
  maintenanceMode?: boolean;
  contactEmail?: string;
}


