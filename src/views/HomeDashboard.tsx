import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Compass, Bot, PhoneCall, Heart, 
  BookOpen, Star, Calendar, Moon, ArrowRight, Video,
  Layers, ChevronRight, ShieldCheck, Zap
} from 'lucide-react';
import { User, Astrologer, HoroscopeResponse } from '../types';
import { api } from '../services/api';
import { EthicalAstrologyBanner } from '../components/Disclaimers';
import { DailyHoroscopeSummary } from '../components/DailyHoroscopeSummary';
import { TrialBanner } from '../components/TrialBanner';

interface HomeDashboardProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  onOpenSubscriptionModal?: () => void;
  onUserUpdate?: (user: User) => void;
}

const ZODIAC_LIST = [
  { name: 'Aries', dates: 'Mar 21 - Apr 19', element: 'Fire', symbol: '♈' },
  { name: 'Taurus', dates: 'Apr 20 - May 20', element: 'Earth', symbol: '♉' },
  { name: 'Gemini', dates: 'May 21 - Jun 20', element: 'Air', symbol: '♊' },
  { name: 'Cancer', dates: 'Jun 21 - Jul 22', element: 'Water', symbol: '♋' },
  { name: 'Leo', dates: 'Jul 23 - Aug 22', element: 'Fire', symbol: '♌' },
  { name: 'Virgo', dates: 'Aug 23 - Sep 22', element: 'Earth', symbol: '♍' },
  { name: 'Libra', dates: 'Sep 23 - Oct 22', element: 'Air', symbol: '♎' },
  { name: 'Scorpio', dates: 'Oct 23 - Nov 21', element: 'Water', symbol: '♏' },
  { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', element: 'Fire', symbol: '♐' },
  { name: 'Capricorn', dates: 'Dec 22 - Jan 19', element: 'Earth', symbol: '♑' },
  { name: 'Aquarius', dates: 'Jan 20 - Feb 18', element: 'Air', symbol: '♒' },
  { name: 'Pisces', dates: 'Feb 19 - Mar 20', element: 'Water', symbol: '♓' },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  user, 
  onNavigate, 
  onOpenSubscriptionModal, 
  onUserUpdate 
}) => {
  const [experts, setExperts] = useState<Astrologer[]>([]);

  useEffect(() => {
    api.getExperts()
      .then(res => setExperts(res.slice(0, 4)))
      .catch(console.error);
  }, []);

  const QUICK_SERVICES = [
    { id: 'kundli', title: 'Kundli / Birth Chart', desc: 'Vedic planetary chart & doshas', icon: Compass, color: 'from-purple-500 to-indigo-600' },
    { id: 'ai-astrologer', title: 'AASTRONIQ AI Astrologer', desc: 'Instant cosmic chat assistant', icon: Bot, color: 'from-cyan-500 to-blue-600' },
    { id: 'horoscope', title: 'Horoscope Insights', desc: 'Daily, weekly, monthly & 2026', icon: Sparkles, color: 'from-fuchsia-500 to-purple-600' },
    { id: 'matchmaking', title: 'Kundli Matching', desc: 'Ashtakoot 36 Guna Milan', icon: Heart, color: 'from-rose-500 to-pink-600' },
    { id: 'experts', title: 'Talk to Astrologer', desc: 'Chat, audio & video consultation', icon: PhoneCall, color: 'from-emerald-500 to-teal-600' },
    { id: 'live-sessions', title: 'Live Sessions', desc: 'Live astrology masterclasses', icon: Video, color: 'from-amber-500 to-orange-600' },
    { id: 'panchang', title: 'Today\'s Panchang', desc: 'Tithi, Nakshatra & Muhurat', icon: Calendar, color: 'from-indigo-500 to-blue-600' },
    { id: 'tarot', title: 'Tarot Wisdom', desc: 'Interactive 3-card spread', icon: Layers, color: 'from-violet-500 to-purple-700' },
    { id: 'numerology', title: 'Numerology Matrix', desc: 'Life Path & destiny vibration', icon: Star, color: 'from-blue-500 to-cyan-600' },
    { id: 'vastu', title: 'Vastu Shastra', desc: 'Architectural cosmic harmony', icon: BookOpen, color: 'from-teal-500 to-emerald-600' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl cosmic-glass border border-purple-500/25 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-wider text-amber-300 font-mono font-semibold">
                AASTRONIQ_astrology
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-purple-300 flex items-center gap-1">
                <Moon className="w-3 h-3" /> Waxing Gibbous
              </span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
              Namaste, {user?.name || 'Cosmic Seeker'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Planetary alignments currently emphasize heightened intuition and creative problem-solving. Review your daily horoscope or generate a precise Vedic birth chart.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('kundli')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Generate Kundli</span>
            </button>
            <button
              onClick={() => onNavigate('ai-astrologer')}
              className="px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Astro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Month Free Trial & ₹15 Monthly Subscription Banner */}
      <TrialBanner
        user={user}
        onOpenSubscriptionModal={() => onOpenSubscriptionModal && onOpenSubscriptionModal()}
        onUserUpdate={onUserUpdate}
      />

      {/* Trust & Safety Banner */}
      <EthicalAstrologyBanner compact />

      {/* Daily Horoscope Summary: Personalized prediction based on user's zodiac sign with cosmic-themed card design */}
      <DailyHoroscopeSummary
        user={user}
        onNavigate={onNavigate}
      />

      {/* Quick Services Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-white">Astrological Services</h2>
            <p className="text-xs text-slate-400">Vedic computations, esoteric divination, and expert consultations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_SERVICES.map(srv => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                onClick={() => onNavigate(srv.id)}
                className="cosmic-glass cosmic-glass-hover rounded-2xl p-4 cursor-pointer flex flex-col justify-between space-y-3 border border-purple-500/15 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${srv.color} p-[1.5px] shadow-md group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full bg-[#080b22] rounded-[10px] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {srv.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Verified Experts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-white">Verified Astrology Scholars</h2>
            <p className="text-xs text-slate-400">Top-rated astrologers available for instant consultation</p>
          </div>
          <button
            onClick={() => onNavigate('experts')}
            className="text-xs font-medium text-purple-300 hover:text-purple-200 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {experts.map(ast => (
            <div
              key={ast.id}
              className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 flex flex-col justify-between space-y-3 hover:border-purple-400/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={ast.avatar}
                    alt={ast.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-purple-400/30 shadow-md"
                  />
                  {ast.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060814]" />
                  )}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{ast.name}</h4>
                    {ast.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-purple-300 truncate">{ast.title}</p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-300">{ast.rating}</span>
                    <span className="text-slate-500 text-[10px]">({ast.reviewCount})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {ast.specialization.slice(0, 2).map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-500/15">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-purple-500/15">
                <div>
                  <span className="text-[10px] text-slate-400">Demo Rate:</span>
                  <p className="text-xs font-bold text-cyan-300">₹{ast.ratePerMinute}/min</p>
                </div>
                <button
                  onClick={() => onNavigate('consult-session', { expertId: ast.id, expert: ast, mode: 'chat' })}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1 shadow-md shadow-purple-600/30"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Consult</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Masterclasses Teaser */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-950/40 to-slate-900/60 border border-purple-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Live Streaming</span>
          </div>
          <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
            Saturn in Pisces: Navigating 2026 Karmic Transits
          </h3>
          <p className="text-xs text-slate-300">
            With Acharya Devendra Shastri · 1,420 viewers actively discussing remedies & insights
          </p>
        </div>

        <button
          onClick={() => onNavigate('live-sessions')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold shrink-0 shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
        >
          <Video className="w-4 h-4" />
          <span>Join Live Stream</span>
        </button>
      </div>
    </div>
  );
};
