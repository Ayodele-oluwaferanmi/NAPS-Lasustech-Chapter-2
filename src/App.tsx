import { safeGetItem, safeSetItem, safeRemoveItem } from './utils/storage';
import React, { useState, useEffect } from 'react';
import { 
  User, 
  PastQuestion, 
  ChapterEvent, 
  Executive, 
  PaymentRecord,
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
} from './types';
import { 
  DEMO_USERS, 
  PAST_QUESTIONS_DATA, 
  EVENTS_DATA, 
  EXECUTIVES_DATA,
  GALLERY_ITEMS,
  CONSTITUTION_ARTICLES,
  VOTING_CATEGORIES
} from './data/mockData';
import { apiGetMe, apiLogout, clearStoredAuthToken } from './utils/authClient';
import { fetchAllContent } from './utils/contentClient';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Modals
import { LoginModal } from './components/common/LoginModal';
import { PaymentGatewayModal } from './components/common/PaymentGatewayModal';
import { IdCardPreviewModal } from './components/common/IdCardPreviewModal';

// Views
import { HomeView } from './components/public/HomeView';
import { ExecutivesView } from './components/public/ExecutivesView';
import { PastQuestionsView } from './components/public/PastQuestionsView';
import { EventsView } from './components/public/EventsView';
import { GalleryView } from './components/public/GalleryView';
import { AwardsView } from './components/public/AwardsView';
import { ConstitutionView } from './components/public/ConstitutionView';
import { DonateView } from './components/public/DonateView';
import { ContactView } from './components/public/ContactView';
import { StudentDashboard } from './components/portal/StudentDashboard';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { Bell, ShieldAlert, Sparkles, X } from 'lucide-react';

export default function App() {
  // Current user state (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeGetItem('naps_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to null if no active authenticated session
    return null;
  });

  // Students database (persisted in localStorage)
  const [students, setStudents] = useState<User[]>(() => {
    const saved = safeGetItem('naps_students_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS;
      }
    }
    return DEMO_USERS;
  });

  // Dynamic content states (allowing admin publishing & updates)
  const [pastQuestions, setPastQuestions] = useState<PastQuestion[]>(() => {
    const saved = safeGetItem('naps_past_questions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return PAST_QUESTIONS_DATA;
      }
    }
    return PAST_QUESTIONS_DATA;
  });

  const [events, setEvents] = useState<ChapterEvent[]>(() => {
    const saved = safeGetItem('naps_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return EVENTS_DATA;
      }
    }
    return EVENTS_DATA;
  });

  const [executives, setExecutives] = useState<Executive[]>(() => {
    const saved = safeGetItem('naps_executives');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return EXECUTIVES_DATA;
      }
    }
    return EXECUTIVES_DATA;
  });

  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(() => {
    return safeGetItem('naps_broadcast') || 
      '📢 Physics Week 2026: Symposium, Lab Apparatus Exhibition & Annual Dinner registration is ongoing! Ensure session dues are cleared for admission.';
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = safeGetItem('naps_gallery');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return GALLERY_ITEMS; }
    }
    return GALLERY_ITEMS;
  });

  const [constitutionArticles, setConstitutionArticles] = useState<ConstitutionArticle[]>(() => {
    const saved = safeGetItem('naps_constitution_articles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return CONSTITUTION_ARTICLES; }
    }
    return CONSTITUTION_ARTICLES;
  });

  const [constitutionDoc, setConstitutionDoc] = useState<ConstitutionDocument | undefined>(() => {
    const saved = safeGetItem('naps_constitution_doc');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return undefined; }
    }
    return undefined;
  });

  const [awards, setAwards] = useState<AwardItem[]>(() => {
    const saved = safeGetItem('naps_awards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [votingCategories, setVotingCategories] = useState<VotingCategory[]>(() => {
    const saved = safeGetItem('naps_voting_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return VOTING_CATEGORIES; }
    }
    return VOTING_CATEGORIES;
  });

  const [votingSettings, setVotingSettings] = useState<VotingSettings | undefined>(() => {
    const saved = safeGetItem('naps_voting_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return undefined; }
    }
    return undefined;
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo | undefined>(() => {
    const saved = safeGetItem('naps_contact_info');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return undefined; }
    }
    return undefined;
  });

  const [menuItems, setMenuItems] = useState<NavigationMenuItem[] | undefined>(() => {
    const saved = safeGetItem('naps_menu_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return undefined; }
    }
    return undefined;
  });

  const [people, setPeople] = useState<PeopleProfile[]>(() => {
    const saved = safeGetItem('naps_people');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>(() => {
    const saved = safeGetItem('naps_site_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return undefined; }
    }
    return undefined;
  });

  // Current view state
  const [currentView, setCurrentView] = useState<string>('home');
  const [portalTargetTab, setPortalTargetTab] = useState<string>('overview');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'student' | 'admin' | 'register'>('student');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [activeModalStudent, setActiveModalStudent] = useState<User>(() => DEMO_USERS[0]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      safeSetItem('naps_user', JSON.stringify(currentUser));
    } else {
      safeRemoveItem('naps_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeSetItem('naps_students_v2', JSON.stringify(students));
  }, [students]);

  // Synchronize currentUser with students database whenever students change (e.g. dues toggled in admin or payment completed)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      const matched = students.find(s => 
        s.id === currentUser.id || 
        s.matricNumber.trim().toUpperCase() === currentUser.matricNumber.trim().toUpperCase()
      );
      if (matched) {
        const hasChanged = 
          matched.duesStatus !== currentUser.duesStatus ||
          matched.idCardStatus !== currentUser.idCardStatus ||
          (matched.payments || []).length !== (currentUser.payments || []).length ||
          matched.fullName !== currentUser.fullName;
        if (hasChanged) {
          const updated = { ...currentUser, ...matched };
          setCurrentUser(updated);
          safeSetItem('naps_user', JSON.stringify(updated));
        }
      }
    }
  }, [students]);

  useEffect(() => {
    safeSetItem('naps_past_questions', JSON.stringify(pastQuestions));
  }, [pastQuestions]);

  useEffect(() => {
    safeSetItem('naps_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    safeSetItem('naps_executives', JSON.stringify(executives));
  }, [executives]);

  useEffect(() => {
    if (broadcastNotice) {
      safeSetItem('naps_broadcast', broadcastNotice);
    } else {
      safeRemoveItem('naps_broadcast');
    }
  }, [broadcastNotice]);

  // Hydrate all content from backend API on mount
  useEffect(() => {
    fetchAllContent()
      .then(data => {
        if (!data) return;
        if (data.events && data.events.length > 0) setEvents(data.events);
        if (data.gallery && data.gallery.length > 0) setGallery(data.gallery);
        if (data.constitution) {
          setConstitutionDoc(data.constitution);
          if (data.constitution.articles) setConstitutionArticles(data.constitution.articles);
        }
        if (data.awards) setAwards(data.awards);
        if (data.voting) {
          if (data.voting.categories) setVotingCategories(data.voting.categories);
          if (data.voting.settings) setVotingSettings(data.voting.settings);
        }
        if (data.contact) setContactInfo(data.contact);
        if (data.menu) setMenuItems(data.menu);
        if (data.people && data.people.length > 0) setPeople(data.people);
        if (data.pastQuestions && data.pastQuestions.length > 0) setPastQuestions(data.pastQuestions);
        if (data.executives && data.executives.length > 0) setExecutives(data.executives);
        if (data.siteSettings) {
          setSiteSettings(data.siteSettings);
          if (data.siteSettings.broadcastNotice) {
            setBroadcastNotice(data.siteSettings.broadcastNotice);
          }
        }
      })
      .catch(err => {
        console.warn('API content sync deferred, fallback to cached state', err);
      });
  }, []);

  useEffect(() => {
    safeSetItem('naps_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    safeSetItem('naps_constitution_articles', JSON.stringify(constitutionArticles));
  }, [constitutionArticles]);

  useEffect(() => {
    if (constitutionDoc) safeSetItem('naps_constitution_doc', JSON.stringify(constitutionDoc));
  }, [constitutionDoc]);

  useEffect(() => {
    safeSetItem('naps_awards', JSON.stringify(awards));
  }, [awards]);

  useEffect(() => {
    safeSetItem('naps_voting_categories', JSON.stringify(votingCategories));
  }, [votingCategories]);

  useEffect(() => {
    if (votingSettings) safeSetItem('naps_voting_settings', JSON.stringify(votingSettings));
  }, [votingSettings]);

  useEffect(() => {
    if (contactInfo) safeSetItem('naps_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    if (menuItems) safeSetItem('naps_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    safeSetItem('naps_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    if (siteSettings) safeSetItem('naps_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  // Handler for navigation
  const handleNavigate = (view: string, tab?: string) => {
    if (tab) {
      setPortalTargetTab(tab);
    }
    if (view === 'portal' && !currentUser) {
      setLoginModalMode('student');
      setIsLoginModalOpen(true);
      return;
    }
    if (view === 'admin') {
      handleTriggerAdmin();
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (tab?: string, mode?: 'student' | 'admin' | 'register') => {
    if (tab) {
      setPortalTargetTab(tab);
    }
    setLoginModalMode(mode || 'student');
    if (currentUser && mode !== 'admin') {
      setCurrentView('portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Verify active session with server on initial mount
  useEffect(() => {
    apiGetMe().then(res => {
      if (res.success && res.user) {
        setCurrentUser(res.user);
      } else if (res.error === 'unauthorized') {
        setCurrentUser(null);
        safeRemoveItem('naps_user');
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    safeRemoveItem('naps_user');
    clearStoredAuthToken();
    if (currentView === 'portal' || currentView === 'admin') {
      setCurrentView('home');
    }
    showToast('Signed out securely. Session invalidated.');
  };

  const handleLoginSuccess = (user: User, targetTab?: string) => {
    setCurrentUser(user);
    if (user.role === 'admin' || targetTab === 'admin') {
      setCurrentView('admin');
      showToast(`Admin privileges confirmed. Welcome, ${user.fullName}!`);
    } else {
      if (targetTab) {
        setPortalTargetTab(targetTab);
      }
      setCurrentView('portal');
      showToast(`Welcome, ${user.fullName}!`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Direct Payment Modal (always loads freshest student data)
  const handleTriggerPayment = (student?: User) => {
    const target = student || currentUser || students[0] || DEMO_USERS[0];
    const fresh = students.find(s => 
      s.id === target.id || 
      s.matricNumber.trim().toUpperCase() === target.matricNumber.trim().toUpperCase()
    );
    setActiveModalStudent(fresh || target);
    setIsPaymentModalOpen(true);
  };

  // Open Direct ID Card Preview Modal (always loads freshest student data)
  const handleTriggerIdPreview = (student?: User) => {
    const target = student || currentUser || students[0] || DEMO_USERS[0];
    const fresh = students.find(s => 
      s.id === target.id || 
      s.matricNumber.trim().toUpperCase() === target.matricNumber.trim().toUpperCase()
    );
    setActiveModalStudent(fresh || target);
    setIsIdCardModalOpen(true);
  };

  // Secure Admin Console Entry - Requires authentication if not logged in as Admin
  const handleTriggerAdmin = () => {
    if (currentUser && currentUser.role === 'admin') {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoginModalMode('admin');
      setIsLoginModalOpen(true);
      showToast('Admin password required to access Executive Console.');
    }
  };

  // Process Completed Payment: atomically update students roster, activeModalStudent, currentUser, and localStorage
  const handlePaymentSuccess = (updatedUser: User, paymentRecord: PaymentRecord) => {
    // 1. Update students list
    setStudents(prevStudents => {
      const index = prevStudents.findIndex(s => 
        s.id === updatedUser.id || 
        s.matricNumber.trim().toUpperCase() === updatedUser.matricNumber.trim().toUpperCase()
      );
      let updatedList: User[];
      if (index >= 0) {
        updatedList = prevStudents.map((s, i) => (i === index ? { ...s, ...updatedUser } : s));
      } else {
        updatedList = [updatedUser, ...prevStudents];
      }
      safeSetItem('naps_students_v2', JSON.stringify(updatedList));
      return updatedList;
    });

    // 2. Update active modal student
    setActiveModalStudent(updatedUser);

    // 3. Update currentUser if same student
    setCurrentUser(prevUser => {
      if (prevUser && (
        prevUser.id === updatedUser.id || 
        prevUser.matricNumber.trim().toUpperCase() === updatedUser.matricNumber.trim().toUpperCase()
      )) {
        const merged = { ...prevUser, ...updatedUser };
        safeSetItem('naps_user', JSON.stringify(merged));
        return merged;
      }
      return prevUser;
    });

    showToast(`Payment Verified! Reference: ${paymentRecord.reference}. Dues cleared successfully.`);
  };

  // Update Photo on ID Card
  const handleUpdateStudentPhoto = (studentId: string, newPhotoUrl: string) => {
    const updatedList = students.map(s => 
      s.id === studentId ? { ...s, profileImage: newPhotoUrl } : s
    );
    setStudents(updatedList);

    if (currentUser && currentUser.id === studentId) {
      setCurrentUser({ ...currentUser, profileImage: newPhotoUrl });
    }
    if (activeModalStudent && activeModalStudent.id === studentId) {
      setActiveModalStudent({ ...activeModalStudent, profileImage: newPhotoUrl });
    }
    showToast('Photo uploaded and updated on ID Card.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-100 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-500/40 text-xs font-semibold flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onOpenIdPreview={() => handleTriggerIdPreview()}
        onOpenAdmin={handleTriggerAdmin}
        menuItems={menuItems}
      />

      {/* Chapter Broadcast Alert Banner (if set by Admin and not in Admin view) */}
      {broadcastNotice && currentView !== 'admin' && (
        <div className="bg-gradient-to-r from-sky-900 via-[#1F5FAF] to-blue-900 text-white px-4 py-2 text-xs font-medium border-b border-sky-400/20 flex items-center justify-between gap-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-hidden">
            <span className="bg-sky-400/20 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-sky-300" />
              Notice
            </span>
            <p className="truncate text-slate-100">{broadcastNotice}</p>
          </div>
          <button 
            onClick={() => setBroadcastNotice(null)}
            className="text-slate-300 hover:text-white shrink-0 p-1"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main App Content Views */}
      <main className="flex-1 w-full">
        {currentView === 'home' && (
          <HomeView 
            onNavigate={handleNavigate} 
            onOpenLogin={handleOpenLogin}
            onOpenIdPreview={() => handleTriggerIdPreview()}
            onOpenPayment={() => handleTriggerPayment()}
            executives={executives}
            people={people}
            events={events}
            pastQuestions={pastQuestions}
            gallery={gallery}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'executives' && (
          <ExecutivesView data={executives} people={people} />
        )}

        {currentView === 'past-questions' && (
          <PastQuestionsView data={pastQuestions} />
        )}

        {currentView === 'events' && (
          <EventsView data={events} />
        )}

        {currentView === 'gallery' && (
          <GalleryView data={gallery} />
        )}

        {currentView === 'awards' && (
          <AwardsView 
            awards={awards} 
            categories={votingCategories} 
            settings={votingSettings} 
            currentUser={currentUser}
            onOpenLogin={handleOpenLogin}
          />
        )}

        {currentView === 'constitution' && (
          <ConstitutionView 
            articles={constitutionArticles} 
            docInfo={constitutionDoc} 
          />
        )}

        {currentView === 'donate' && (
          <DonateView />
        )}

        {currentView === 'contact' && (
          <ContactView contact={contactInfo} />
        )}

        {currentView === 'portal' && (
          currentUser ? (
            <StudentDashboard
              user={currentUser}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                safeSetItem('naps_user', JSON.stringify(updated));
                setStudents(prevStudents => {
                  const index = prevStudents.findIndex(s => 
                    s.id === updated.id || 
                    s.matricNumber.trim().toUpperCase() === updated.matricNumber.trim().toUpperCase()
                  );
                  let updatedList: User[];
                  if (index >= 0) {
                    updatedList = prevStudents.map((s, i) => (i === index ? { ...s, ...updated } : s));
                  } else {
                    updatedList = [updated, ...prevStudents];
                  }
                  safeSetItem('naps_students_v2', JSON.stringify(updatedList));
                  return updatedList;
                });
                showToast('Profile updated successfully.');
              }}
              initialTab={portalTargetTab}
              onOpenPaymentModal={(st) => handleTriggerPayment(st)}
              onOpenIdPreviewModal={(st) => handleTriggerIdPreview(st)}
            />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                Please sign in with your matriculation number to access your student dashboard, pay session dues, and generate your digital ID card.
              </p>
              <button
                onClick={() => {
                  setLoginModalMode('student');
                  setIsLoginModalOpen(true);
                }}
                className="rounded-xl bg-sky-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
              >
                Sign In to Student Portal
              </button>
            </div>
          )
        )}

        {/* Admin Executive Dashboard View - Guarded with Strict RBAC */}
        {currentView === 'admin' && (
          currentUser && currentUser.role === 'admin' ? (
            <AdminDashboardView
              students={students}
              onUpdateStudents={(newStudents) => {
                setStudents(newStudents);
                safeSetItem('naps_students_v2', JSON.stringify(newStudents));

                // If current user is one of the modified students, sync immediately
                setCurrentUser(prevUser => {
                  if (prevUser && prevUser.role !== 'admin') {
                    const matched = newStudents.find(s => 
                      s.id === prevUser.id || 
                      s.matricNumber.trim().toUpperCase() === prevUser.matricNumber.trim().toUpperCase()
                    );
                    if (matched) {
                      const merged = { ...prevUser, ...matched };
                      safeSetItem('naps_user', JSON.stringify(merged));
                      return merged;
                    }
                  }
                  return prevUser;
                });
                showToast('Student roster synchronized.');
              }}
              pastQuestions={pastQuestions}
              onUpdatePastQuestions={(newPQs) => {
                setPastQuestions(newPQs);
                showToast('Past Questions archive updated and published.');
              }}
              events={events}
              onUpdateEvents={(newEvents) => {
                setEvents(newEvents);
                showToast('Chapter events published.');
              }}
              executives={executives}
              onUpdateExecutives={(newExecs) => {
                setExecutives(newExecs);
                showToast('Executive roster updated.');
              }}
              broadcastNotice={broadcastNotice}
              onUpdateBroadcastNotice={(notice) => {
                setBroadcastNotice(notice);
                showToast('Chapter broadcast notice published.');
              }}
              gallery={gallery}
              onUpdateGallery={(newGallery) => {
                setGallery(newGallery);
                showToast('Gallery images and albums updated.');
              }}
              constitutionArticles={constitutionArticles}
              onUpdateConstitutionArticles={(newArticles) => {
                setConstitutionArticles(newArticles);
                showToast('Constitution articles published.');
              }}
              constitutionDoc={constitutionDoc}
              onUpdateConstitutionDoc={(newDoc) => {
                setConstitutionDoc(newDoc);
                showToast('Constitution document published.');
              }}
              awards={awards}
              onUpdateAwards={(newAwards) => {
                setAwards(newAwards);
                showToast('Awards catalog updated.');
              }}
              votingCategories={votingCategories}
              onUpdateVotingCategories={(newCats) => {
                setVotingCategories(newCats);
                showToast('Voting ballot updated.');
              }}
              votingSettings={votingSettings}
              onUpdateVotingSettings={(newSettings) => {
                setVotingSettings(newSettings);
                showToast('Voting settings updated.');
              }}
              contactInfo={contactInfo}
              onUpdateContactInfo={(newContact) => {
                setContactInfo(newContact);
                showToast('Secretariat contact details updated.');
              }}
              menuItems={menuItems}
              onUpdateMenuItems={(newMenu) => {
                setMenuItems(newMenu);
                showToast('Navigation menu items updated.');
              }}
              people={people}
              onUpdatePeople={(newPeople) => {
                setPeople(newPeople);
                showToast('Department directory updated.');
              }}
              siteSettings={siteSettings}
              onUpdateSiteSettings={(newSettings) => {
                setSiteSettings(newSettings);
                if (newSettings.broadcastNotice !== undefined) {
                  setBroadcastNotice(newSettings.broadcastNotice);
                }
                showToast('Site settings updated.');
              }}
              onPreviewId={(student) => handleTriggerIdPreview(student)}
              onTestPayment={(student) => handleTriggerPayment(student)}
              onExitAdmin={() => handleNavigate('home')}
            />
          ) : (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-100">
              <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
                <div className="h-16 w-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  Access Restricted (403 Forbidden)
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900 mt-3 mb-2">
                  Executive Authorization Required
                </h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {currentUser
                    ? `You are authenticated as a student (${currentUser.fullName}). You do not have executive administrator privileges to access this area.`
                    : 'The Executive Admin Console requires administrative authorization. Please sign in with your administrator credentials.'}
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setLoginModalMode('admin');
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In as Administrator</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Return to Public Homepage
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Global Footer (hidden in admin mode to maximize console workspace) */}
      {currentView !== 'admin' && (
        <Footer 
          onNavigate={handleNavigate} 
          onOpenLogin={handleOpenLogin} 
        />
      )}

      {/* 1. Login / Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        targetTab={portalTargetTab}
        initialMode={loginModalMode}
        onRegisterUser={(newUser) => {
          setStudents(prev => {
            const updated = [newUser, ...prev];
            safeSetItem('naps_students_v2', JSON.stringify(updated));
            return updated;
          });
          showToast(`Student profile registered for ${newUser.fullName}.`);
        }}
      />

      {/* 2. Realistic Interactive Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        user={activeModalStudent}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenIdPreview={(st) => handleTriggerIdPreview(st)}
        amount={2000}
        purpose="2025/2026 Session Dues & Lab Apparatus Clearance"
      />

      {/* 3. PVC Digital Student ID Card Preview Modal */}
      <IdCardPreviewModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        student={activeModalStudent}
        allStudents={students}
        onSelectStudent={(selected) => setActiveModalStudent(selected)}
        onOpenPayment={(st) => {
          setIsIdCardModalOpen(false);
          handleTriggerPayment(st);
        }}
        onUpdatePhoto={handleUpdateStudentPhoto}
      />
    </div>
  );
}
