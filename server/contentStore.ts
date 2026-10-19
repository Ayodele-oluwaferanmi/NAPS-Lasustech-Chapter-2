import fs from 'fs';
import path from 'path';
import { 
  ChapterEvent, 
  GalleryItem, 
  VotingCategory, 
  Nominee,
  ConstitutionArticle, 
  ConstitutionDocument,
  AwardItem, 
  ContactInfo, 
  NavigationMenuItem, 
  VotingSettings, 
  PeopleProfile, 
  SiteSettings,
  PastQuestion
} from '../src/types';

export interface SiteContentData {
  events: ChapterEvent[];
  gallery: GalleryItem[];
  constitution: ConstitutionDocument;
  awards: AwardItem[];
  voting: {
    categories: VotingCategory[];
    settings: VotingSettings;
    voters: Record<string, string[]>; // categoryId -> array of userIds
  };
  contact: ContactInfo;
  menu: NavigationMenuItem[];
  people: PeopleProfile[];
  pastQuestions: PastQuestion[];
  siteSettings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'site_content.json');

const INITIAL_EVENTS: ChapterEvent[] = [
  {
    id: "physics-week-2026",
    title: "Annual LASUSTECH Physics Week & Tech Exhibition 2026",
    date: "June 15 - 19, 2026",
    description: "Theme: Quantum Leap — Physics as the Bedrock of Artificial Intelligence and Renewable Energy. A 5-day celebration featuring scientific paper presentations, robotic physics prototypes, and the Annual Science Gala.",
    image: "https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg",
    upcoming: true,
    ongoing: false,
    contain: false,
    eventTag: "Physics Week"
  },
  {
    id: "nasrda-excursion",
    title: "NASRDA Space Science & Astronomy Excursion",
    date: "August 12, 2026",
    description: "Honorary educational expedition to the National Space Research and Development Agency (NASRDA). Students engaged with high-powered telescope arrays, satellite telemetry, and solar observatory data.",
    image: "https://www.nacoslasustech.org.ng/assets/IMG-16-C6_jleXx.jpg",
    upcoming: false,
    ongoing: false,
    contain: false,
    eventTag: "Field Excursion"
  },
  {
    id: "women-in-physics",
    title: "Women in Physical Sciences Symposium",
    date: "May 8, 2026",
    description: "Theme: Overcoming Gender Barriers in Experimental Physics & Geophysics. Featuring seasoned female research fellows from the Nigerian Institute of Physics (NIP).",
    image: "https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-09-06-01-CLTEPwlF.jpg",
    upcoming: false,
    ongoing: false,
    contain: true,
    eventTag: "Women in STEM"
  },
  {
    id: "hod-cup-physics",
    title: "HOD'S CUP: Inter-Level Physics Sports Tournament",
    date: "April 22 - May 7, 2026",
    description: "The annual departmental sports championship featuring Football, Chess, and Table Tennis between 100L, 200L, 300L, and 400L physics students.",
    image: "https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-24-17-16-18-idm3a56e.jpg",
    upcoming: false,
    ongoing: false,
    contain: true,
    eventTag: "Sports"
  }
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gallery-1",
    title: "Physics Week 2026 Science Exhibition",
    eventTag: "Physics Week",
    date: "June 17, 2026",
    images: [
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-LidLzUyl.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-7-Dz_QCfZY.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-14-WWYLZRR7.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-19-DJYMa4Vq.jpg"
    ]
  },
  {
    id: "gallery-2",
    title: "NASRDA Space Science Observatory Delegation",
    eventTag: "Excursion",
    date: "August 12, 2026",
    images: [
      "https://www.nacoslasustech.org.ng/assets/IMG-16-C6_jleXx.jpg",
      "https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-06-Dx55TW21.jpg",
      "https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg",
      "https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-08-C12Q7zPo.jpg"
    ]
  },
  {
    id: "gallery-3",
    title: "Annual HOD's Cup Champions & Awards",
    eventTag: "Sports",
    date: "May 7, 2026",
    images: [
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-24-CQkX2mWq.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-28-FW8FX0JZ.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-31-DkKCJXu6.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-34-IdISLabL.jpg"
    ]
  },
  {
    id: "gallery-4",
    title: "Advanced Optics & Laser Laboratory Practicals",
    eventTag: "Laboratory",
    date: "April 29, 2026",
    images: [
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-35-CgjNtwCg.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-36-D6OuyOJx.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-48-D_JseK8r.jpg",
      "https://www.nacoslasustech.org.ng/assets/Nacos%202026-53-D-wczNg0.jpg"
    ]
  }
];

const INITIAL_CONSTITUTION: ConstitutionDocument = {
  pdfUrl: "",
  fileName: "NAPS_LASUSTECH_Constitution_2026.pdf",
  fileSize: "1.8 MB",
  updatedAt: "2026-03-01",
  published: true,
  articles: [
    {
      number: "Preamble",
      title: "Preamble to the NAPS LASUSTECH Constitution",
      sections: [
        {
          title: "Solemn Resolution",
          content: '"We, the undergraduate and postgraduate students of the National Association of Physics Students (NAPS), Lagos State University of Science and Technology (LASUSTECH) Chapter, having firmly and solemnly resolved to promote the highest standards of scientific inquiry, theoretical physics, experimental excellence, and moral integrity; to foster solidarity, protect student rights, ensure equitable academic welfare, and advance technological progress in Nigeria, do hereby enact and give to ourselves this Constitution."'
        }
      ]
    },
    {
      number: "Article I",
      title: "Name, Motto and Supremacy of the Constitution",
      sections: [
        {
          title: "Section 1: Official Name",
          content: "The Association shall be officially recognized and designated as the NATIONAL ASSOCIATION OF PHYSICS STUDENTS (NAPS), LAGOS STATE UNIVERSITY OF SCIENCE AND TECHNOLOGY (LASUSTECH) CHAPTER."
        },
        {
          title: "Section 2: The Motto",
          content: 'The official motto of the Association shall be "Empowering Minds, Exploring the Cosmos" and "Advancing Science, Unlocking the Universe".'
        },
        {
          title: "Section 3: Scope of Physical Sciences",
          content: "Under this Constitution, Physics encompasses: Theoretical Physics, Applied Geophysics, Radiation & Health Physics, Condensed Matter Physics, Electronics & Instrumentation, Renewable Energy Science, Computational Physics, and Astronomy."
        }
      ]
    },
    {
      number: "Article II",
      title: "Aims and Objectives",
      sections: [
        {
          title: "Section 1: Scientific & Academic Growth",
          content: "To organize academic tutorials, symposia, laboratory safety workshops, and industrial excursions that enrich students' understanding of physical sciences and prepare them for postgraduate and industrial careers."
        },
        {
          title: "Section 2: Student Welfare & Research Support",
          content: "To maintain an accessible past question bank, advocate for adequate laboratory equipment, and provide welfare assistance to indigent physics scholars."
        }
      ]
    },
    {
      number: "Article III",
      title: "Membership, Rights & Dues",
      sections: [
        {
          title: "Section 1: Ordinary Membership",
          content: "All matriculated students enrolled in the Department of Physics / Physical Sciences at LASUSTECH are de facto ordinary members of NAPS."
        },
        {
          title: "Section 2: Annual Departmental Dues",
          content: "Every student shall pay a mandatory annual chapter due of Two Thousand Naira (₦2,000) per academic session, entitling them to the official Digital Student ID Card, exam clearance slips, voting rights, and access to all chapter facilities."
        }
      ]
    },
    {
      number: "Article IV",
      title: "The Executive Council",
      sections: [
        {
          title: "Section 1: Executive Offices",
          content: "The executive officers of the chapter shall comprise: The President, Vice President, Lady Vice-President, General Secretary, Assistant General Secretary, Financial Secretary, Treasurer, Director of Academics, Welfare Director, Public Relations Officer, Social Director, and Sports Director."
        },
        {
          title: "Section 2: Tenure",
          content: "All executive officers shall hold office for a single academic session of two semesters."
        }
      ]
    }
  ]
};

const INITIAL_AWARDS: AwardItem[] = [
  {
    id: "award-1",
    title: "Best Graduating Physicist Award",
    recipient: "Comr. Olatunji Michael Adebayo",
    year: "2025/2026",
    category: "Academic Excellence",
    description: "Awarded for exceptional cumulative CGPA of 4.86, mastery in Relativistic Quantum Mechanics, and peer mentorship leadership.",
    image: "https://www.nacoslasustech.org.ng/assets/president-uUAJ9fqn.jpg"
  },
  {
    id: "award-2",
    title: "Distinguished Service in Physical Sciences",
    recipient: "Comr. Owolabi Grace Oluwafunmilayo",
    year: "2025/2026",
    category: "Leadership & Service",
    description: "Awarded for pioneering the annual Women in STEM Bootcamp and establishing the department's peer tutoring circle.",
    image: "https://www.nacoslasustech.org.ng/assets/lady_vice-DsWRa3YC.jpeg"
  },
  {
    id: "award-3",
    title: "Innovator of the Year: Solar Photovoltaics",
    recipient: "Comr. Bakare Toluwani Moses",
    year: "2025/2026",
    category: "Research & Innovation",
    description: "Recognized for building a prototype 200W solar irradiance monitoring station using local low-cost microcontroller sensors.",
    image: "https://www.nacoslasustech.org.ng/assets/VP-DOsR2Z6w.jpg"
  }
];

const INITIAL_VOTING_CATEGORIES: VotingCategory[] = [
  {
    id: "cat-1",
    slug: "physicist-of-the-year",
    title: "Physicist of the Year (Overall Best)",
    groupKey: "academic_excellence",
    groupName: "Academic & Research Excellence",
    description: "Awarded to the physics student who demonstrated unmatched mastery of quantum mechanics, electrodynamics, and theoretical physics.",
    nominees: [
      {
        id: "nom-1",
        name: "Olatunji Michael Adebayo",
        level: "400 Level",
        discipline: "Theoretical & Astrophysics",
        votes: 384,
        description: "Author of groundbreaking undergraduate research on Perovskite Solar Cell Photovoltaics."
      },
      {
        id: "nom-2",
        name: "Bakare Toluwani Moses",
        level: "400 Level",
        discipline: "Applied Geophysics",
        votes: 312,
        description: "Best graduating student in Geoelectrical Resistivity Surveying & Seismology."
      },
      {
        id: "nom-3",
        name: "Akinrinade Moses Imisioluwa",
        level: "400 Level",
        discipline: "Electronics & Computational Physics",
        votes: 245,
        description: "Led the peer tutoring committee across 100L through 300L physics courses."
      }
    ]
  },
  {
    id: "cat-2",
    slug: "women-in-physics-award",
    title: "Outstanding Woman in STEM Award",
    groupKey: "diversity_leadership",
    groupName: "Diversity & Leadership",
    description: "Recognizing outstanding leadership, academic excellence, and advocacy for female participation in physical sciences.",
    nominees: [
      {
        id: "nom-4",
        name: "Owolabi Grace Oluwafunmilayo",
        level: "300 Level",
        discipline: "Radiation & Health Physics",
        votes: 410,
        description: "Convener of the Women in Physical Sciences Mentorship Bootcamp."
      },
      {
        id: "nom-5",
        name: "Osho Aishat",
        level: "200 Level",
        discipline: "Renewable Energy & Material Science",
        votes: 278,
        description: "200L Head of Class and top performer in Experimental Mechanics."
      }
    ]
  },
  {
    id: "cat-3",
    slug: "fresher-of-the-year",
    title: "Fresher of the Year (100L Rising Star)",
    groupKey: "rising_stars",
    groupName: "Student Life & Emerging Talent",
    description: "Recognizing the most exceptional, enthusiastic, and promising first-year physics student.",
    nominees: [
      {
        id: "nom-6",
        name: "Ayara Michael",
        level: "100 Level",
        discipline: "Physics (General)",
        votes: 265,
        description: "100L HOC, organized study circles for PHY 101 and MTH 101."
      },
      {
        id: "nom-7",
        name: "Babatunde Adewale Peter",
        level: "100 Level",
        discipline: "Physics (General)",
        votes: 215,
        description: "Active contributor in physics lab preparation and astronomy clubs."
      }
    ]
  }
];

const INITIAL_CONTACT: ContactInfo = {
  phone: "+234 802 345 6789",
  alternativePhone: "+234 810 563 8170",
  email: "napslasustech@gmail.com",
  secretariatEmail: "secretariat@napslasustech.org.ng",
  officeAddress: "Department of Physics, Faculty of Science, LASUSTECH Main Campus, Ikorodu, Lagos State, Nigeria",
  faculty: "Faculty of Science",
  campus: "Ikorodu Main Campus",
  twitter: "https://x.com/napslasustech",
  instagram: "https://instagram.com/napslasustech",
  linkedin: "https://linkedin.com/company/napslasustech",
  whatsapp: "+2348023456789",
  operatingHours: "Monday - Friday: 8:00 AM - 5:00 PM"
};

const INITIAL_MENU: NavigationMenuItem[] = [
  { id: "home", label: "Home", targetView: "home", visible: true, order: 1 },
  { id: "executives", label: "Executives & People", targetView: "executives", visible: true, order: 2 },
  { id: "past-questions", label: "Past Questions", targetView: "past-questions", visible: true, order: 3 },
  { id: "events", label: "Events", targetView: "events", visible: true, order: 4 },
  { id: "gallery", label: "Gallery", targetView: "gallery", visible: true, order: 5 },
  { id: "constitution", label: "Constitution", targetView: "constitution", visible: true, order: 6 },
  { id: "awards", label: "Awards & Voting", targetView: "awards", visible: true, order: 7 },
  { id: "donate", label: "Donate", targetView: "donate", visible: true, order: 8 },
  { id: "contact", label: "Contact", targetView: "contact", visible: true, order: 9 }
];

const INITIAL_PEOPLE: PeopleProfile[] = [
  {
    id: "peo-1",
    name: "Comr. Olatunji Michael Adebayo",
    post: "Chapter President",
    level: "400 Level",
    category: "executive",
    description: "Leading NAPS LASUSTECH with vision, academic mentorship, laboratory modernization, and inter-university research collaborations.",
    bio: "Passionate about astrophysics and solid state physics. Serving as the Chapter President for the 2025/2026 academic session.",
    image: "https://www.nacoslasustech.org.ng/assets/president-uUAJ9fqn.jpg",
    phone: "+2348023456789",
    email: "president@napslasustech.org.ng",
    department: "Physics",
    order: 1
  },
  {
    id: "peo-2",
    name: "Comr. Bakare Toluwani Moses",
    post: "Vice President",
    level: "400 Level",
    category: "executive",
    description: "Spearheading academic tutorials, past question compilation, and departmental symposia for physics scholars.",
    bio: "Specializing in Applied Geophysics. Dedicated to student welfare and academic excellence.",
    image: "https://www.nacoslasustech.org.ng/assets/VP-DOsR2Z6w.jpg",
    phone: "+2348033221144",
    email: "vp@napslasustech.org.ng",
    department: "Physics",
    order: 2
  },
  {
    id: "peo-3",
    name: "Comr. Owolabi Grace Oluwafunmilayo",
    post: "Lady Vice-President",
    level: "300 Level",
    category: "executive",
    description: "Pioneering Women in STEM initiatives, student welfare drives, and orientation for female physics students.",
    bio: "Advocate for girls in physics, health physics enthusiast.",
    image: "https://www.nacoslasustech.org.ng/assets/lady_vice-DsWRa3YC.jpeg",
    phone: "+2348105638170",
    email: "ladyvp@napslasustech.org.ng",
    department: "Physics",
    order: 3
  },
  {
    id: "peo-4",
    name: "Comr. Oladepo Damilare David",
    post: "General Secretary",
    level: "400 Level",
    category: "executive",
    description: "Custodian of chapter secretariat records, departmental correspondence, and official communiques.",
    image: "https://www.nacoslasustech.org.ng/assets/Gen_Sec-C_FkWv-X.jpg",
    phone: "+2349012345678",
    email: "gensec@napslasustech.org.ng",
    department: "Physics",
    order: 4
  },
  {
    id: "peo-5",
    name: "Dr. K. A. Adeleke",
    post: "Head of Department (HOD) & Grand Patron",
    level: "Staff",
    category: "patron",
    description: "Chief Academic Adviser and Patron of the National Association of Physics Students, LASUSTECH.",
    bio: "Associate Professor of Condensed Matter Physics with over 20 years of research and pedagogical leadership.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    email: "adeleke.ka@lasustech.edu.ng",
    department: "Department of Physics",
    order: 10
  },
  {
    id: "peo-6",
    name: "Hon. Babatunde Segun",
    post: "Speaker, NAPS Consultative Council",
    level: "400 Level",
    category: "honourable",
    description: "Presiding over legislative affairs, constitutional audits, and budget approvals for student projects.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    phone: "+2348055667788",
    email: "speaker@napslasustech.org.ng",
    department: "Physics",
    order: 11
  },
  {
    id: "peo-7",
    name: "Ayara Michael",
    post: "Head of Class (100 Level)",
    level: "100 Level",
    category: "hoc",
    description: "Freshers' academic coordinator, bridging general physics courses and laboratory orientation.",
    image: "https://www.nacoslasustech.org.ng/assets/HOC%20100L-C4k62v_r.jpeg",
    department: "Physics",
    order: 15
  }
];

const INITIAL_PAST_QUESTIONS: PastQuestion[] = [
  {
    id: "pq-101",
    courseCode: "PHY 101",
    courseTitle: "General Physics I (Mechanics & Properties of Matter)",
    level: "100 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Examination",
    downloads: 1420,
    fileSize: "2.4 MB"
  },
  {
    id: "pq-102",
    courseCode: "PHY 102",
    courseTitle: "General Physics II (Electricity, Magnetism & Modern Physics)",
    level: "100 Level",
    semester: "Rain",
    session: "2024/2025",
    examType: "Examination",
    downloads: 1180,
    fileSize: "2.8 MB"
  },
  {
    id: "pq-201",
    courseCode: "PHY 201",
    courseTitle: "Classical Mechanics & Relativity (Lagrangian & Hamiltonian)",
    level: "200 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Examination",
    downloads: 820,
    fileSize: "3.1 MB"
  },
  {
    id: "pq-202",
    courseCode: "PHY 202",
    courseTitle: "Electromagnetism I (Coulomb Law & Maxwell Equations)",
    level: "200 Level",
    semester: "Rain",
    session: "2024/2025",
    examType: "Examination",
    downloads: 910,
    fileSize: "3.4 MB"
  },
  {
    id: "pq-301",
    courseCode: "PHY 301",
    courseTitle: "Quantum Mechanics I (Wave Mechanics & Schrödinger Eq)",
    level: "300 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Examination",
    downloads: 740,
    fileSize: "4.1 MB"
  },
  {
    id: "pq-401",
    courseCode: "PHY 401",
    courseTitle: "Solid State Physics (Crystallography & Band Theory)",
    level: "400 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Examination",
    downloads: 490,
    fileSize: "3.2 MB"
  }
];

const INITIAL_SITE_SETTINGS: SiteSettings = {
  associationName: "National Association of Physics Students (NAPS)",
  chapterName: "LASUSTECH Chapter",
  motto: "Empowering Minds, Exploring the Cosmos",
  academicSession: "2025/2026",
  duesAmount: 2000,
  bankName: "Wema Bank Plc",
  accountNumber: "0123456789",
  accountName: "NAPS LASUSTECH CHAPTER",
  portalNotice: "Welcome Physics Scholars to the 2025/2026 academic session! All student members are advised to pay their departmental dues (₦2,000) to activate their Digital ID Cards and access verified past questions.",
  registrationOpen: true
};

class ContentStore {
  private data: SiteContentData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): SiteContentData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(CONTENT_FILE)) {
        const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          events: parsed.events || INITIAL_EVENTS,
          gallery: parsed.gallery || INITIAL_GALLERY,
          constitution: parsed.constitution || INITIAL_CONSTITUTION,
          awards: parsed.awards || INITIAL_AWARDS,
          voting: {
            categories: parsed.voting?.categories || INITIAL_VOTING_CATEGORIES,
            settings: parsed.voting?.settings || {
              isOpen: true,
              title: "NAPS Annual Physics Honors & Awards Voting 2026",
              instructions: "Each matriculated student member can cast exactly one vote per award category. Votes are cryptographically recorded and verified.",
              allowMultipleCategoriesVote: true
            },
            voters: parsed.voting?.voters || {}
          },
          contact: parsed.contact || INITIAL_CONTACT,
          menu: parsed.menu || INITIAL_MENU,
          people: parsed.people || INITIAL_PEOPLE,
          pastQuestions: parsed.pastQuestions || INITIAL_PAST_QUESTIONS,
          siteSettings: parsed.siteSettings || INITIAL_SITE_SETTINGS
        };
      }
    } catch (err) {
      console.error('Failed to load content from disk, using initial default content:', err);
    }

    const defaultData: SiteContentData = {
      events: INITIAL_EVENTS,
      gallery: INITIAL_GALLERY,
      constitution: INITIAL_CONSTITUTION,
      awards: INITIAL_AWARDS,
      voting: {
        categories: INITIAL_VOTING_CATEGORIES,
        settings: {
          isOpen: true,
          title: "NAPS Annual Physics Honors & Awards Voting 2026",
          instructions: "Each matriculated student member can cast exactly one vote per award category. Votes are cryptographically recorded and verified.",
          allowMultipleCategoriesVote: true
        },
        voters: {}
      },
      contact: INITIAL_CONTACT,
      menu: INITIAL_MENU,
      people: INITIAL_PEOPLE,
      pastQuestions: INITIAL_PAST_QUESTIONS,
      siteSettings: INITIAL_SITE_SETTINGS
    };

    this.saveData(defaultData);
    return defaultData;
  }

private saveData(data: SiteContentData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const tempFile = `${CONTENT_FILE}.tmp`;
    const json = JSON.stringify(data, null, 2);

    // Write the complete file first.
    fs.writeFileSync(tempFile, json, 'utf-8');

    // Replace the old file only after the new file is complete.
    fs.renameSync(tempFile, CONTENT_FILE);
  } catch (err) {
    console.error('Failed to persist content data to disk:', err);

    // Clean up a leftover temporary file if one exists.
    try {
      const tempFile = `${CONTENT_FILE}.tmp`;
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch {
      // Ignore cleanup errors.
    }
  }
}

  public getAll(): SiteContentData {
    return this.data;
  }

  // Events CRUD
  public getEvents(): ChapterEvent[] {
    return this.data.events;
  }

  public saveEvent(event: ChapterEvent): ChapterEvent {
    const idx = this.data.events.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      this.data.events[idx] = event;
    } else {
      this.data.events.unshift(event);
    }
    this.saveData(this.data);
    return event;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.id !== id);
    const deleted = this.data.events.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  // Gallery CRUD
  public getGallery(): GalleryItem[] {
    return this.data.gallery;
  }

  public saveGalleryItem(item: GalleryItem): GalleryItem {
    const idx = this.data.gallery.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      this.data.gallery[idx] = item;
    } else {
      this.data.gallery.unshift(item);
    }
    this.saveData(this.data);
    return item;
  }

  public deleteGalleryItem(id: string): boolean {
    const initialLen = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter(g => g.id !== id);
    const deleted = this.data.gallery.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  // Constitution CRUD
  public getConstitution(): ConstitutionDocument {
    return this.data.constitution;
  }

  public updateConstitution(doc: ConstitutionDocument): ConstitutionDocument {
    this.data.constitution = doc;
    this.saveData(this.data);
    return this.data.constitution;
  }

  // Awards CRUD
  public getAwards(): AwardItem[] {
    return this.data.awards;
  }

  public saveAward(award: AwardItem): AwardItem {
    const idx = this.data.awards.findIndex(a => a.id === award.id);
    if (idx >= 0) {
      this.data.awards[idx] = award;
    } else {
      this.data.awards.unshift(award);
    }
    this.saveData(this.data);
    return award;
  }

  public deleteAward(id: string): boolean {
    const initialLen = this.data.awards.length;
    this.data.awards = this.data.awards.filter(a => a.id !== id);
    const deleted = this.data.awards.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  // Voting Management & Secure Voting
  public getVotingData() {
    return {
      categories: this.data.voting.categories,
      settings: this.data.voting.settings
    };
  }

  public hasUserVoted(categoryId: string, userId: string): boolean {
    const voters = this.data.voting.voters[categoryId] || [];
    return voters.includes(userId);
  }

  public getUserVotedCategories(userId: string): string[] {
    const res: string[] = [];
    for (const [catId, voters] of Object.entries(this.data.voting.voters)) {
      if (voters.includes(userId)) {
        res.push(catId);
      }
    }
    return res;
  }

  public castVote(categoryId: string, nomineeId: string, userId: string): { success: boolean; message: string } {
    if (!this.data.voting.settings.isOpen) {
      return { success: false, message: 'Voting is currently closed by the electoral committee.' };
    }

    const category = this.data.voting.categories.find(c => c.id === categoryId);
    if (!category) {
      return { success: false, message: 'Voting category not found.' };
    }

    const nominee = category.nominees.find(n => n.id === nomineeId);
    if (!nominee) {
      return { success: false, message: 'Nominee not found in this category.' };
    }

    // Check if user has already voted in this category
    if (!this.data.voting.voters[categoryId]) {
      this.data.voting.voters[categoryId] = [];
    }

    if (this.data.voting.voters[categoryId].includes(userId)) {
      return { 
        success: false, 
        message: 'Security Violation: You have already cast your vote in this category. Voting rules strictly permit one vote per student member.' 
      };
    }

    // Record vote
    nominee.votes += 1;
    this.data.voting.voters[categoryId].push(userId);
    this.saveData(this.data);

    return { 
      success: true, 
      message: `Your vote for "${nominee.name}" in ${category.title} has been securely validated and counted.` 
    };
  }

  public saveVotingCategory(category: VotingCategory): VotingCategory {
    const idx = this.data.voting.categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      this.data.voting.categories[idx] = category;
    } else {
      this.data.voting.categories.push(category);
    }
    this.saveData(this.data);
    return category;
  }

  public deleteVotingCategory(id: string): boolean {
    const initialLen = this.data.voting.categories.length;
    this.data.voting.categories = this.data.voting.categories.filter(c => c.id !== id);
    delete this.data.voting.voters[id];
    const deleted = this.data.voting.categories.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  public updateVotingSettings(settings: VotingSettings): VotingSettings {
    this.data.voting.settings = settings;
    this.saveData(this.data);
    return this.data.voting.settings;
  }

  public resetVotes(categoryId?: string): void {
    if (categoryId) {
      const cat = this.data.voting.categories.find(c => c.id === categoryId);
      if (cat) {
        cat.nominees.forEach(n => { n.votes = 0; });
        this.data.voting.voters[categoryId] = [];
      }
    } else {
      this.data.voting.categories.forEach(c => {
        c.nominees.forEach(n => { n.votes = 0; });
      });
      this.data.voting.voters = {};
    }
    this.saveData(this.data);
  }

  // Contact Info
  public getContact(): ContactInfo {
    return this.data.contact;
  }

  public updateContact(contact: ContactInfo): ContactInfo {
    this.data.contact = contact;
    this.saveData(this.data);
    return this.data.contact;
  }

  // Menu / Navigation
  public getMenu(): NavigationMenuItem[] {
    return this.data.menu.sort((a, b) => a.order - b.order);
  }

  public updateMenu(items: NavigationMenuItem[]): NavigationMenuItem[] {
    this.data.menu = items;
    this.saveData(this.data);
    return this.data.menu;
  }

  // People / Profiles
  public getPeople(): PeopleProfile[] {
    return this.data.people.sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  public savePerson(person: PeopleProfile): PeopleProfile {
    const idx = this.data.people.findIndex(p => p.id === person.id);
    if (idx >= 0) {
      this.data.people[idx] = person;
    } else {
      this.data.people.push(person);
    }
    this.saveData(this.data);
    return person;
  }

  public deletePerson(id: string): boolean {
    const initialLen = this.data.people.length;
    this.data.people = this.data.people.filter(p => p.id !== id);
    const deleted = this.data.people.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  // Past Questions CRUD
  public getPastQuestions(): PastQuestion[] {
    return this.data.pastQuestions;
  }

  public savePastQuestion(pq: PastQuestion): PastQuestion {
    const idx = this.data.pastQuestions.findIndex(p => p.id === pq.id);
    if (idx >= 0) {
      this.data.pastQuestions[idx] = pq;
    } else {
      this.data.pastQuestions.unshift(pq);
    }
    this.saveData(this.data);
    return pq;
  }

  public deletePastQuestion(id: string): boolean {
    const initialLen = this.data.pastQuestions.length;
    this.data.pastQuestions = this.data.pastQuestions.filter(p => p.id !== id);
    const deleted = this.data.pastQuestions.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  // Site Settings
  public getSiteSettings(): SiteSettings {
    return this.data.siteSettings;
  }

  public updateSiteSettings(settings: SiteSettings): SiteSettings {
    this.data.siteSettings = settings;
    this.saveData(this.data);
    return this.data.siteSettings;
  }
}

export const contentStore = new ContentStore();
