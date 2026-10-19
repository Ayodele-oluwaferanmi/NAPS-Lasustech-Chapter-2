import { 
  Executive, 
  ChapterEvent, 
  GalleryItem, 
  VotingCategory, 
  User, 
  PaymentRecord, 
  ConstitutionArticle,
  PastQuestion 
} from '../types';

export const ASSET_BASE = "https://www.nacoslasustech.org.ng";

export const LASUSTECH_LOGO = `${ASSET_BASE}/assets/lasustech_logo-C0F4g4g-.png`;
export const HERO_BG_IMAGE = `${ASSET_BASE}/assets/PHOTO-2026-04-29-19-36-06-Dx55TW21.jpg`;

// Local NAPS LASUSTECH official crest/logo replacement
export const NAPS_LOGO_SVG = '/src/components/public/NAPS Lasustech.png.png';
export const NAPS_LOGO = NAPS_LOGO_SVG;

export const EXECUTIVES_DATA: Executive[] = [
  {
    name: "Comr. Olatunji Michael Adebayo",
    post: "Chapter President",
    level: "400 Level",
    description: "Leading NAPS LASUSTECH with vision, academic mentorship, laboratory modernization, and inter-university research collaborations.",
    image: `${ASSET_BASE}/assets/president-uUAJ9fqn.jpg`,
    objectPosition: "object-top",
    category: "top"
  },
  {
    name: "Comr. Bakare Toluwani Moses",
    post: "Vice President",
    level: "400 Level",
    description: "Spearheading academic tutorials, past question compilation, and departmental symposia for physics scholars.",
    image: `${ASSET_BASE}/assets/VP-DOsR2Z6w.jpg`,
    objectPosition: "object-center",
    category: "top"
  },
  {
    name: "Comr. Owolabi Grace Oluwafunmilayo",
    post: "Lady Vice-President",
    level: "300 Level",
    description: "Pioneering Women in STEM initiatives, student welfare drives, and orientation for female physics students.",
    image: `${ASSET_BASE}/assets/lady_vice-DsWRa3YC.jpeg`,
    objectPosition: "object-top",
    category: "top"
  },
  {
    name: "Comr. Oladepo Damilare David",
    post: "General Secretary",
    level: "400 Level",
    description: "Custodian of chapter secretariat records, departmental correspondence, and official communiques.",
    image: `${ASSET_BASE}/assets/Gen_Sec-C_FkWv-X.jpg`,
    category: "secretariat"
  },
  {
    name: "Comr. Emmanuel Ariyo Ogunfunwa",
    post: "Assistant General Secretary",
    level: "300 Level",
    description: "Assisting administrative documentation, student directory, and academic council meeting proceedings.",
    image: `${ASSET_BASE}/assets/Ass_Gen_Sec-Bv1w7w06.jpg`,
    category: "secretariat"
  },
  {
    name: "Comr. Onaade Abdulmuqtadir Ayomide",
    post: "Financial Secretary",
    level: "300 Level",
    description: "Supervising departmental session dues, dues clearance receipts, and transparent chapter budget execution.",
    image: `${ASSET_BASE}/assets/Fin_Sec-CYfM6oP4.jpg`,
    category: "secretariat"
  },
  {
    name: "Comr. Ebhojie Oluwadamilola",
    post: "Treasurer",
    level: "300 Level",
    description: "Managing chapter fiscal reserves, laboratory project funding, and financial audits.",
    image: `${ASSET_BASE}/assets/Treasurer-DWbW718L.jpeg`,
    category: "secretariat"
  },
  {
    name: "Comr. Akinrinade Moses Imisioluwa",
    post: "Director of Academics & Research",
    level: "400 Level",
    description: "Coordinating peer tutoring in Quantum Physics, Electrodynamics, and past question syllabus archives.",
    image: `${ASSET_BASE}/assets/DOS-B6b-Q-L6.jpeg`,
    category: "directors"
  },
  {
    name: "Comr. Aladekoye Samuel",
    post: "Public Relations Officer (P.R.O)",
    level: "300 Level",
    description: "Managing NAPS digital broadcasting, student announcements, and official social media press releases.",
    image: `${ASSET_BASE}/assets/PRO-C-UuL55U.jpeg`,
    category: "directors"
  },
  {
    name: "Comr. Fatai Adewale",
    post: "Social Director",
    level: "300 Level",
    description: "Curator of the Annual Physics Gala, Science Excursions, and departmental dinner events.",
    image: `${ASSET_BASE}/assets/Social-DKl88fM6.jpeg`,
    category: "directors"
  },
  {
    name: "Comr. Egba Uthman Temitayo",
    post: "Sports Director",
    level: "300 Level",
    description: "Championing departmental sports, fitness events, and the annual HOD Physics Football Tournament.",
    image: `${ASSET_BASE}/assets/Sport-DY2DkL-b.jpeg`,
    category: "directors"
  },
  {
    name: "Comr. Oluwatobi Oluwaseyi Isaac",
    post: "Welfare Director",
    level: "300 Level",
    description: "Ensuring student laboratory safety conditions, lecture hall logistics, and student health welfare.",
    image: `${ASSET_BASE}/assets/Welfare-1u7iZ-Kx.jpeg`,
    category: "directors"
  },
  {
    name: "Olagunju Basheer Olaniyi",
    post: "Head of Class (400 Level)",
    level: "400 Level",
    description: "Class representative coordinating final-year physics seminars, projects, and departmental liaison.",
    image: `${ASSET_BASE}/assets/HOC%20400L-Dr-f2B04.jpg`,
    category: "hocs"
  },
  {
    name: "Adegoke Muhammed",
    post: "Head of Class (300 Level)",
    level: "300 Level",
    description: "Representing penultimate physics students, coordinating SIWES industrial training logistics.",
    image: `${ASSET_BASE}/assets/HOC%20300L-1h6dGvKk.jpeg`,
    category: "hocs"
  },
  {
    name: "Osho Aishat",
    post: "Head of Class (200 Level)",
    level: "200 Level",
    description: "Liaison for sophomore physics students, organizing intermediate mechanics and practical labs.",
    image: `${ASSET_BASE}/assets/HOC%20200L-DWkX_1kS.jpeg`,
    category: "hocs"
  },
  {
    name: "Ayara Michael",
    post: "Head of Class (100 Level)",
    level: "100 Level",
    description: "Freshers' academic coordinator, bridging general physics courses and laboratory orientation.",
    image: `${ASSET_BASE}/assets/HOC%20100L-C4k62v_r.jpeg`,
    category: "hocs"
  }
];

export const EVENTS_DATA: ChapterEvent[] = [
  {
    id: "physics-week-2026",
    title: "Annual LASUSTECH Physics Week & Tech Exhibition 2026",
    date: "June 15 - 19, 2026",
    description: "Theme: Quantum Leap — Physics as the Bedrock of Artificial Intelligence and Renewable Energy. A 5-day celebration featuring scientific paper presentations, robotic physics prototypes, and the Annual Science Gala.",
    image: `${ASSET_BASE}/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg`,
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
    image: `${ASSET_BASE}/assets/IMG-16-C6_jleXx.jpg`,
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
    image: `${ASSET_BASE}/assets/PHOTO-2026-04-29-09-06-01-CLTEPwlF.jpg`,
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
    image: `${ASSET_BASE}/assets/PHOTO-2026-04-24-17-16-18-idm3a56e.jpg`,
    upcoming: false,
    ongoing: false,
    contain: true,
    eventTag: "Sports"
  }
];

export const PAST_QUESTIONS_DATA: PastQuestion[] = [
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
    downloads: 1290,
    fileSize: "3.1 MB"
  },
  {
    id: "pq-191",
    courseCode: "PHY 191",
    courseTitle: "Practical Physics I (Laboratory Experiments & Errors)",
    level: "100 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Lab Practical",
    downloads: 980,
    fileSize: "1.8 MB"
  },
  {
    id: "pq-201",
    courseCode: "PHY 201",
    courseTitle: "Classical Mechanics I (Newtonian & Lagrangian Dynamics)",
    level: "200 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Examination",
    downloads: 870,
    fileSize: "2.7 MB"
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
    id: "pq-204",
    courseCode: "PHY 204",
    courseTitle: "Thermal Physics & Thermodynamics",
    level: "200 Level",
    semester: "Rain",
    session: "2023/2024",
    examType: "Examination",
    downloads: 650,
    fileSize: "2.2 MB"
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
    id: "pq-303",
    courseCode: "PHY 303",
    courseTitle: "Electrodynamics II & Relativistic Fields",
    level: "300 Level",
    semester: "Harmattan",
    session: "2024/2025",
    examType: "Examination",
    downloads: 580,
    fileSize: "3.8 MB"
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
  },
  {
    id: "pq-403",
    courseCode: "PHY 403",
    courseTitle: "Nuclear & Particle Physics (Radioactivity & Accelerators)",
    level: "400 Level",
    semester: "Rain",
    session: "2023/2024",
    examType: "Examination",
    downloads: 510,
    fileSize: "3.6 MB"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gallery-1",
    title: "Physics Week 2026 Science Exhibition",
    eventTag: "Physics Week",
    date: "June 17, 2026",
    images: [
      `${ASSET_BASE}/assets/Nacos%202026-LidLzUyl.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-7-Dz_QCfZY.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-14-WWYLZRR7.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-19-DJYMa4Vq.jpg`
    ]
  },
  {
    id: "gallery-2",
    title: "NASRDA Space Science Observatory Delegation",
    eventTag: "Excursion",
    date: "August 12, 2026",
    images: [
      `${ASSET_BASE}/assets/IMG-16-C6_jleXx.jpg`,
      `${ASSET_BASE}/assets/PHOTO-2026-04-29-19-36-06-Dx55TW21.jpg`,
      `${ASSET_BASE}/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg`,
      `${ASSET_BASE}/assets/PHOTO-2026-04-29-19-36-08-C12Q7zPo.jpg`
    ]
  },
  {
    id: "gallery-3",
    title: "Annual HOD's Cup Champions & Awards",
    eventTag: "Sports",
    date: "May 7, 2026",
    images: [
      `${ASSET_BASE}/assets/Nacos%202026-24-CQkX2mWq.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-28-FW8FX0JZ.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-31-DkKCJXu6.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-34-IdISLabL.jpg`
    ]
  },
  {
    id: "gallery-4",
    title: "Advanced Optics & Laser Laboratory Practicals",
    eventTag: "Laboratory",
    date: "April 29, 2026",
    images: [
      `${ASSET_BASE}/assets/Nacos%202026-35-CgjNtwCg.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-36-D6OuyOJx.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-48-D_JseK8r.jpg`,
      `${ASSET_BASE}/assets/Nacos%202026-53-D-wczNg0.jpg`
    ]
  }
];

export const GALLERY_DATA = GALLERY_ITEMS;

export const CONSTITUTION_ARTICLES: ConstitutionArticle[] = [
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
];

export const VOTING_CATEGORIES: VotingCategory[] = [
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

export const DEMO_USERS: User[] = [
  {
    id: "usr-1",
    fullName: "Olatunji Michael Adebayo",
    matricNumber: "LASU/STECH/PHY/22/0045",
    email: "olatunji.michael@student.lasustech.edu.ng",
    whatsappNumber: "+2348023456789",
    phoneNumber: "+2348023456789",
    level: "400 Level",
    discipline: "Theoretical & Astrophysics",
    gender: "Male",
    birthday: "2002-08-14",
    post: "Chapter President",
    duesStatus: "Paid",
    idCardStatus: "Ready",
    role: "student",
    attendance: 98,
    resources: 42,
    payments: [
      {
        id: "pay-1",
        reference: "NAPS-PAY-881923",
        matricNumber: "LASU/STECH/PHY/22/0045",
        studentName: "Olatunji Michael Adebayo",
        amount: 2000,
        session: "2025/2026",
        date: "March 2, 2026",
        status: "Successful",
        paymentMethod: "Debit Card (Mastercard)"
      }
    ],
    profileImage: `${ASSET_BASE}/assets/president-uUAJ9fqn.jpg`
  },
  {
    id: "usr-2",
    fullName: "Owolabi Grace Oluwafunmilayo",
    matricNumber: "LASU/STECH/PHY/23/0112",
    email: "owolabi.grace@student.lasustech.edu.ng",
    whatsappNumber: "+2348105638170",
    phoneNumber: "+2348105638170",
    level: "300 Level",
    discipline: "Radiation & Health Physics",
    gender: "Female",
    birthday: "2004-03-22",
    post: "Lady Vice-President",
    duesStatus: "Paid",
    idCardStatus: "Ready",
    role: "student",
    attendance: 95,
    resources: 38,
    payments: [
      {
        id: "pay-2",
        reference: "NAPS-PAY-447812",
        matricNumber: "LASU/STECH/PHY/23/0112",
        studentName: "Owolabi Grace Oluwafunmilayo",
        amount: 2000,
        session: "2025/2026",
        date: "March 5, 2026",
        status: "Successful",
        paymentMethod: "Bank Transfer (Wema)"
      }
    ],
    profileImage: `${ASSET_BASE}/assets/lady_vice-DsWRa3YC.jpeg`
  },
  {
    id: "usr-3",
    fullName: "Babatunde Adewale Peter",
    matricNumber: "LASU/STECH/PHY/24/0089",
    email: "babatunde.peter@student.lasustech.edu.ng",
    whatsappNumber: "+2347031122334",
    phoneNumber: "+2347031122334",
    level: "100 Level",
    discipline: "Physics (General)",
    gender: "Male",
    birthday: "2005-11-09",
    post: "Student Member",
    duesStatus: "Pending",
    idCardStatus: "Not Registered",
    role: "student",
    attendance: 84,
    resources: 12,
    payments: []
  },
  {
    id: "usr-4",
    fullName: "Ezekiel Chinonso David",
    matricNumber: "LASU/STECH/PHY/23/0074",
    email: "ezekiel.david@student.lasustech.edu.ng",
    whatsappNumber: "+2348033221144",
    phoneNumber: "+2348033221144",
    level: "200 Level",
    discipline: "Renewable Energy & Material Science",
    gender: "Male",
    birthday: "2003-05-19",
    post: "Student Member",
    duesStatus: "Paid",
    idCardStatus: "Ready",
    role: "student",
    attendance: 91,
    resources: 29,
    payments: [
      {
        id: "pay-4",
        reference: "NAPS-PAY-319042",
        matricNumber: "LASU/STECH/PHY/23/0074",
        studentName: "Ezekiel Chinonso David",
        amount: 2000,
        session: "2025/2026",
        date: "March 8, 2026",
        status: "Successful",
        paymentMethod: "Debit Card (Visa)"
      }
    ]
  },
  {
    id: "usr-5",
    fullName: "Sulaimon Aminat Kehinde",
    matricNumber: "LASU/STECH/PHY/22/0155",
    email: "sulaimon.aminat@student.lasustech.edu.ng",
    whatsappNumber: "+2349012345678",
    phoneNumber: "+2349012345678",
    level: "300 Level",
    discipline: "Applied Geophysics",
    gender: "Female",
    birthday: "2004-09-02",
    post: "Assistant General Secretary",
    duesStatus: "Paid",
    idCardStatus: "Ready",
    role: "student",
    attendance: 97,
    resources: 35,
    payments: [
      {
        id: "pay-5",
        reference: "NAPS-PAY-904128",
        matricNumber: "LASU/STECH/PHY/22/0155",
        studentName: "Sulaimon Aminat Kehinde",
        amount: 2000,
        session: "2025/2026",
        date: "Feb 28, 2026",
        status: "Successful",
        paymentMethod: "USSD (GTBank)"
      }
    ]
  },
  {
    id: "usr-6",
    fullName: "Adebayo Olumide Joshua",
    matricNumber: "LASU/STECH/PHY/25/0019",
    email: "adebayo.olumide@student.lasustech.edu.ng",
    whatsappNumber: "+2348123987654",
    phoneNumber: "+2348123987654",
    level: "100 Level",
    discipline: "Physics (General)",
    gender: "Male",
    birthday: "2006-01-28",
    post: "Fresher Representative",
    duesStatus: "Pending",
    idCardStatus: "Not Registered",
    role: "student",
    attendance: 79,
    resources: 8,
    payments: []
  }
];

export const INITIAL_USERS: User[] = DEMO_USERS;

