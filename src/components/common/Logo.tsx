import React from 'react';
import { NAPS_LOGO_SVG } from '../../data/mockData';
import lasustechLogo from '../public/lasustech.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'light',
  showText = true 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {/* NAPS Crest */}
        <div 
          title="NAPS National"
          className="transition-transform hover:scale-105 h-8 sm:h-10 w-8 sm:w-10 rounded-full flex items-center justify-center p-0.5 bg-[#08111d] border border-sky-400/40 shadow-xs"
        >
          <img 
            src={NAPS_LOGO_SVG} 
            alt="NAPS National" 
            className="h-full w-full object-contain"
          />
        </div>

        {/* LASUSTECH Crest */}
        <a 
          href="https://lasustech.edu.ng" 
          target="_blank" 
          rel="noopener noreferrer" 
          title="LASUSTECH"
          className="transition-transform hover:scale-105"
        >
          <img 
            src={lasustechLogo} 
            alt="LASUSTECH" 
            className="h-8 sm:h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </a>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-display text-xs sm:text-sm font-black tracking-tight uppercase ${
            variant === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            NAPS <span className="text-sky-500">LASUSTECH</span>
          </span>
          <span className={`text-[10px] sm:text-[10.5px] font-semibold tracking-wider uppercase ${
            variant === 'dark' ? 'text-sky-400' : 'text-slate-500'
          }`}>
            Dept. of Physics • Science
          </span>
        </div>
      )}
    </div>
  );
};
