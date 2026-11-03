import React, { useEffect, useState } from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 700);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060814] transition-opacity duration-700 ${
      fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Background radial effects */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/25 blur-[120px] animate-pulse" />
      <div className="absolute w-80 h-80 rounded-full bg-cyan-500/20 blur-[140px] translate-y-12" />

      {/* Orbiting cosmic ring illustration */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-[spin_12s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-[spin_16s_linear_infinite_reverse]" />
        <div className="absolute inset-6 rounded-full border border-purple-400/20" />

        {/* Orbiting celestial icons */}
        <div className="absolute -top-1 w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80" />
        <div className="absolute -bottom-1 w-3 h-3 rounded-full bg-purple-400 shadow-md shadow-purple-400/80" />

        {/* Central emblem */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-purple-600 to-cyan-400 p-[2px] shadow-2xl shadow-amber-500/30">
          <div className="w-full h-full bg-[#060814] rounded-full overflow-hidden flex items-center justify-center">
            <img
              src="/assets/aistudio/1793610372476_6b90d080.jpg"
              alt="AASTRONIQ Celestial Star"
              className="w-full h-full object-cover scale-105"
            />
          </div>
        </div>
      </div>

      {/* Brand Title */}
      <div className="text-center space-y-2 z-10 px-4">
        <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-200">
          AASTRONIQ
        </h1>
        <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-amber-300 font-semibold uppercase">
          _astrology · Intelligence Beyond Limits
        </p>
      </div>

      {/* Loading indicator bar */}
      <div className="mt-12 w-48 h-1 rounded-full bg-slate-900 overflow-hidden border border-purple-500/20 z-10">
        <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 w-full animate-[shimmer_1.5s_infinite]" />
      </div>

      <div className="absolute bottom-8 flex items-center gap-3 text-slate-500 text-xs font-mono">
        <Moon className="w-3.5 h-3.5 text-purple-400" />
        <span>Vedic Intelligence · Ephemeris 2026</span>
        <Sun className="w-3.5 h-3.5 text-amber-400" />
      </div>
    </div>
  );
};
