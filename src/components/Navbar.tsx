import React, { useState, useEffect } from 'react';
import { Sparkles, Bell, Shield, User as UserIcon, X, QrCode } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenSubscription?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, currentView, onOpenSubscription }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Cosmic clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.getNotifications()
      .then(res => setNotifications(res.notifications || []))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#060814]/85 backdrop-blur-xl border-b border-purple-500/15">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-400/40 transition-all">
            <div className="w-full h-full bg-[#060814] rounded-[10px] overflow-hidden flex items-center justify-center">
              <img
                src="/assets/aistudio/1793610372476_6b90d080.jpg"
                alt="AASTRONIQ Emblem"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel font-black tracking-wider text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-300">
                AASTRONIQ
              </span>
              <span className="text-[10px] font-mono tracking-widest text-amber-300 font-semibold px-1 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                _astrology
              </span>
            </div>
            <p className="text-[9px] tracking-wider text-slate-400 font-medium -mt-0.5 hidden sm:block">
              INTELLIGENCE BEYOND LIMITS.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cosmic Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">Panchang:</span>
            <span className="font-mono font-medium text-cyan-300">{currentTime}</span>
          </div>

          {/* 1-Month Trial & ₹15/mo Subscription Status Badge */}
          <button
            onClick={onOpenSubscription}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              user?.subscription?.status === 'expired'
                ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/60 text-rose-300 shadow-md shadow-rose-950/50 animate-pulse'
                : user?.subscription?.status === 'active'
                ? 'bg-emerald-950/60 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                : 'bg-purple-950/50 hover:bg-purple-900/60 border-purple-500/30 text-amber-300 hover:border-amber-400/40'
            }`}
            title="1-Month Free Trial • ₹15/Month Subscription"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {user?.subscription?.status === 'expired'
                ? 'Trial Expired • Pay ₹15'
                : user?.subscription?.status === 'active'
                ? `Cosmic Pass • ${user?.subscription?.daysRemaining ?? 30}d`
                : `Trial: ${user?.subscription?.daysRemaining ?? 27}d Left`}
            </span>
            <span className="sm:hidden font-mono text-[11px]">
              {user?.subscription?.status === 'expired'
                ? 'Pay ₹15'
                : `${user?.subscription?.daysRemaining ?? 27}d`}
            </span>
          </button>

          {/* Admin Switch */}
          <button
            onClick={() => onNavigate(currentView === 'admin' ? 'home' : 'admin')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentView === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                : 'bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 border border-purple-500/20'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-purple-500/20 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 cosmic-glass rounded-2xl p-3 border border-purple-500/30 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 mb-2">
                  <span className="font-cinzel text-xs font-bold text-purple-200">Cosmic Alerts</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/10 text-xs space-y-1">
                      <p className="font-semibold text-purple-200">{n.title}</p>
                      <p className="text-slate-300 text-[11px] leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-500 block">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button */}
          <button
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
              currentView === 'profile'
                ? 'bg-purple-600/30 border-purple-400 text-white'
                : 'bg-slate-900/80 border-purple-500/20 hover:border-purple-400/40 text-slate-300'
            }`}
          >
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover object-top" />
              ) : user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-xs font-medium hidden sm:inline text-purple-100">
              {user?.name ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
