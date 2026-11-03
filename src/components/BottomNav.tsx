import React from 'react';
import { Home, Compass, Bot, PhoneCall, Grid, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'kundli', label: 'Kundli', icon: Compass },
    { id: 'ai-astrologer', label: 'AI Astro', icon: Bot, highlight: true },
    { id: 'experts', label: 'Consult', icon: PhoneCall },
    { id: 'services', label: 'Services', icon: Grid },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#060814]/90 backdrop-blur-xl border-t border-purple-500/20 py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center p-[2px] shadow-lg transition-transform ${
                  isActive
                    ? 'bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-purple-500/50 scale-105'
                    : 'bg-gradient-to-tr from-purple-600/70 to-indigo-600/70 group-hover:scale-105'
                }`}>
                  <div className="w-full h-full bg-[#0a0d24] rounded-full flex items-center justify-center text-purple-300">
                    <Icon className="w-5 h-5 text-cyan-300 animate-pulse" />
                  </div>
                </div>
                <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-purple-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-purple-400' : ''}`} />
              <span className={`text-[11px] font-medium mt-1 ${isActive ? 'text-purple-200 font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
