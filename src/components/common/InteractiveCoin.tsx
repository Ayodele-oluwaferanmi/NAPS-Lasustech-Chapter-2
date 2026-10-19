import React, { useState } from 'react';
import { NAPS_LOGO_SVG, LASUSTECH_LOGO } from '../../data/mockData';
import { Atom } from 'lucide-react';
import lasustechLogo from '../public/lasustech.png';

export const InteractiveCoin: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className="perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
        title="Click or hover to flip coin"
      >
        <div 
          className={`relative w-48 h-48 sm:w-60 sm:h-60 transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          } animate-flip-horizontal group-hover:[animation-play-state:paused]`}
        >
          {/* FRONT: NAPS Physics Coin */}
          <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-950 p-2 shadow-2xl [backface-visibility:hidden] flex items-center justify-center border-4 border-cyan-300/60 shadow-sky-500/20">
            <div className="w-full h-full rounded-full bg-[#08111d] flex flex-col items-center justify-center p-4 shadow-inner border border-sky-400/30">
              <img 
                src={NAPS_LOGO_SVG} 
                alt="NAPS Emblem" 
                className="w-20 sm:w-28 h-auto object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
              />
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-sky-400 uppercase mt-2 text-center">
                NAPS NATIONAL
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider">
                PHYSICS CHAPTER
              </span>
            </div>
          </div>

          {/* BACK: LASUSTECH University Coin */}
          <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-2 shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center border-4 border-amber-300/50 shadow-emerald-500/20">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-4 shadow-inner border border-emerald-200">
              <img 
                src={lasustechLogo} 
                alt="LASUSTECH Logo" 
                className="w-20 sm:w-28 h-auto object-contain drop-shadow-md"
              />
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-emerald-800 uppercase mt-2 text-center">
                LASUSTECH
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 tracking-wider">
                FACULTY OF SCIENCE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Atom className="w-3.5 h-3.5 text-sky-500 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="flex items-center gap-2">
          <img src={LASUSTECH_LOGO} alt="LASUSTECH" className="h-5 w-auto object-contain" />
          <img src={NAPS_LOGO_SVG} alt="NAPS" className="h-5 w-auto object-contain" />
          <span className="font-bold text-slate-700">Hover to pause • Click to flip</span>
        </span>
      </div>
    </div>
  );
};
