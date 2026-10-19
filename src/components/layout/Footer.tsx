import React from 'react';
import { Logo } from '../common/Logo';
import { Mail, MapPin, ExternalLink, Heart, Atom } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, tab?: string) => void;
  onOpenLogin: (tab?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLogin }) => {
  return (
    <footer className="bg-[#08111d] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="dark" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Official digital portal of the National Association of Physics Students (NAPS), 
              Lagos State University of Science and Technology (LASUSTECH) Chapter. 
              Pioneering theoretical inquiry, experimental science, and technological innovation.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-semibold uppercase tracking-wider bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full">
                <Atom className="w-3 h-3 text-sky-400" />
                <span>Advancing Science, Unlocking the Universe</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('executives')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Executive Council
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('past-questions')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Past Questions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('events')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Chapter Events
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('gallery')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Photo Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Student Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Student Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onOpenLogin('overview')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Member Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLogin('dues')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Pay Session Dues (₦2,000)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLogin('idcard')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Digital Student ID
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('constitution')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Chapter Constitution
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('awards')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Awards & Voting
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('donate')} 
                  className="text-slate-300 hover:text-sky-400 transition-colors"
                >
                  Support NAPS Lab
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Secretariat
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Department of Physics, Faculty of Science, LASUSTECH, Ikorodu, Lagos State</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <a href="mailto:napslasustech@gmail.com" className="hover:text-sky-400 transition-colors">
                  napslasustech@gmail.com
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-6">
              <p className="text-xs text-slate-400 mb-2 font-medium">Follow NAPS LASUSTECH</p>
              <div className="flex items-center gap-2">
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-sky-600 flex items-center justify-center text-white transition-colors"
                  title="Twitter / X"
                >
                  𝕏
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-white transition-colors"
                  title="Instagram"
                >
                  📷
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-white transition-colors"
                  title="LinkedIn"
                >
                  in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NAPS LASUSTECH CHAPTER. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('constitution')} className="hover:text-slate-400 transition-colors">
              Constitution
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-400 transition-colors">
              Help Desk
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for Physics Scholars
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
