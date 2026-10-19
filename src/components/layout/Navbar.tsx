import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  HeartHandshake, 
  BookOpen, 
  Mail, 
  Trophy, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  BadgeCheck,
  FileText,
  Atom,
  LogIn,
  Vote
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { User, NavigationMenuItem } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, tab?: string) => void;
  currentUser: User | null;
  onOpenLogin: (tab?: string) => void;
  onLogout: () => void;
  onOpenIdPreview?: () => void;
  onOpenAdmin?: () => void;
  menuItems?: NavigationMenuItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenIdPreview,
  onOpenAdmin,
  menuItems
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Icon lookup map
  const getIconForView = (view: string) => {
    switch (view) {
      case 'home': return Home;
      case 'executives': return Users;
      case 'past-questions': return FileText;
      case 'events': return Calendar;
      case 'gallery': return ImageIcon;
      case 'constitution': return BookOpen;
      case 'awards': return Trophy;
      case 'voting': return Vote;
      case 'donate': return HeartHandshake;
      case 'contact': return Mail;
      default: return FileText;
    }
  };

  // Compile navigation links dynamically from menuItems or default list
  const mapMenuItem = (item: NavigationMenuItem) => ({
    id: item.targetView,
    label: item.label,
    icon: getIconForView(item.targetView),
    badge: item.badge,
    isExternal: item.isExternal,
    externalUrl: item.externalUrl,
    children: item.children?.map(mapMenuItem)
  });

  const activeNavItems = React.useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return [...menuItems]
        .filter(m => m.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(mapMenuItem);
    }

    return [
      { id: 'home', label: 'Home', icon: Home },
      {
        id: 'executives',
        label: 'Executives & People',
        icon: Users,
        children: [
          {
            id: 'awards',
            label: 'Awards & Voting',
            icon: Trophy,
            children: [
              { id: 'gallery', label: 'Gallery', icon: ImageIcon }
            ]
          }
        ]
      },
      { id: 'past-questions', label: 'Past Questions', icon: FileText },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'constitution', label: 'Constitution', icon: BookOpen },
      { id: 'donate', label: 'Donate', icon: HeartHandshake },
      { id: 'contact', label: 'Contact', icon: Mail }
    ];
  }, [menuItems]);

  const handleItemClick = (item: { id: string; isExternal?: boolean; externalUrl?: string }) => {
    if (item.isExternal && item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    onNavigate(item.id);
  };

  const renderMobileNavBranch = (item: any, depth = 0) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => {
            handleItemClick(item);
            setMobileMenuOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${depth > 0 ? 'ml-3' : ''} ${
            isActive 
              ? 'bg-[#1F5FAF] text-white font-bold' 
              : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.children?.length > 0 && <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
        </button>

        {item.children?.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 pt-1 pl-4">
            {item.children.map((child: any) => renderMobileNavBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'border-b border-sky-950/10 bg-white/95 backdrop-blur-md shadow-xs' 
        : 'border-b border-slate-200/80 bg-white/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-[72px] items-center">
          {/* Logo Brand: left zone */}
          <div className="flex items-center flex-shrink-0 min-w-[150px]">
            <div 
              onClick={() => onNavigate('home')} 
              className="cursor-pointer select-none"
            >
              <Logo />
            </div>
          </div>

          {/* Desktop Nav Items: centered zone */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {activeNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const hasChildren = Boolean(item.children?.length);

                if (hasChildren) {
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-[#1F5FAF] text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>

                      <div className="absolute left-0 top-full pt-2 hidden group-hover:block group-focus-within:block z-40">
                        <div className="min-w-[220px] rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const childIsActive = currentView === child.id;
                            const childHasChildren = Boolean(child.children?.length);

                            return (
                              <div key={child.id} className="relative">
                                <button
                                  onClick={() => handleItemClick(child)}
                                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                                    childIsActive
                                      ? 'bg-[#1F5FAF] text-white'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <ChildIcon className="h-3.5 w-3.5" />
                                    <span>{child.label}</span>
                                  </span>
                                  {childHasChildren && <ChevronDown className="h-3.5 w-3.5" />}
                                </button>

                                {childHasChildren && (
                                  <div className="absolute left-full top-0 ml-2 hidden group-hover:block group-focus-within:block z-50">
                                    <div className="min-w-[180px] rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                      {child.children?.map((grandChild) => {
                                        const GrandChildIcon = grandChild.icon;
                                        const grandChildIsActive = currentView === grandChild.id;
                                        return (
                                          <button
                                            key={grandChild.id}
                                            onClick={() => handleItemClick(grandChild)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                                              grandChildIsActive
                                                ? 'bg-[#1F5FAF] text-white'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                          >
                                            <GrandChildIcon className="h-3.5 w-3.5" />
                                            <span>{grandChild.label}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#1F5FAF] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action: Login / Profile / Admin Console */}
          <div className="hidden sm:flex items-center justify-end gap-2.5 flex-shrink-0 min-w-[180px]">
            {/* Admin Console Shortcut (Only visible when user has admin role) */}
            {currentUser?.role === 'admin' && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Open Executive Administration Console"
              >
                <Atom className="h-3.5 w-3.5 text-sky-400" />
                <span>Admin Console</span>
              </button>
            )}

            {currentUser ? (
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.profileImage ? (
                      <img src={currentUser.profileImage} alt={currentUser.fullName} className="h-full w-full object-cover" />
                    ) : (
                      currentUser.fullName.charAt(0)
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                      {currentUser.fullName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-sky-600 font-semibold leading-tight">
                      {currentUser.role === 'admin' ? 'Administrator' : (currentUser.post || 'Student')}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] text-slate-500">{currentUser.matricNumber || currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          currentUser.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : currentUser.duesStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {currentUser.role === 'admin' ? 'Executive Admin' : `Dues: ${currentUser.duesStatus}`}
                        </span>
                      </div>
                    </div>

                    {currentUser.role === 'admin' && onOpenAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-bold my-1 cursor-pointer"
                      >
                        <Atom className="h-4 w-4 text-sky-400" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('portal', 'overview');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-sky-600" />
                      <span>Student Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('portal', 'dues');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                      <span>Session Dues & Clearance</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenIdPreview) onOpenIdPreview();
                        else onNavigate('portal', 'idcard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <BadgeCheck className="h-4 w-4 text-sky-600" />
                      <span>Digital ID Card</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Clearly labeled "Login" authentication button */
              <button
                onClick={() => onOpenLogin()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5FAF] hover:bg-[#174983] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            {onOpenIdPreview && (
              <button
                onClick={onOpenIdPreview}
                className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200"
              >
                ID
              </button>
            )}
            {!currentUser && (
              <button
                onClick={() => onOpenLogin()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F5FAF] text-white text-[11px] font-bold"
              >
                <LogIn className="h-3 w-3" />
                <span>Login</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {activeNavItems.map((item) => renderMobileNavBranch(item))}
          </div>

          {currentUser && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-500">
                      {currentUser.role === 'admin' ? 'Administrator' : currentUser.matricNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {currentUser.role === 'admin' && onOpenAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Atom className="h-4 w-4 text-sky-400" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onNavigate('portal', 'dues');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200"
                >
                  Pay Dues (₦2,000)
                </button>
                <button
                  onClick={() => {
                    onNavigate('portal', 'idcard');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold text-center border border-sky-200"
                >
                  Digital ID Card
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
