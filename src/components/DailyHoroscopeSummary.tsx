import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Zap, Compass, Bot, ChevronRight, 
  RotateCw, ShieldCheck, Sun, Moon, Flame, Wind, Droplets, Mountain
} from 'lucide-react';
import { User, HoroscopeResponse } from '../types';
import { api } from '../services/api';

interface DailyHoroscopeSummaryProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  defaultSign?: string;
}

export const ZODIAC_METADATA: Record<string, {
  symbol: string;
  sanskrit: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  ruler: string;
  stone: string;
  luckyHours: string;
  defaultScore: number;
}> = {
  Aries: { symbol: '♈', sanskrit: 'Mesha', dates: 'Mar 21 - Apr 19', element: 'Fire', ruler: 'Mars (Mangal)', stone: 'Red Coral', luckyHours: '11:45 AM - 01:15 PM', defaultScore: 94 },
  Taurus: { symbol: '♉', sanskrit: 'Vrishabha', dates: 'Apr 20 - May 20', element: 'Earth', ruler: 'Venus (Shukra)', stone: 'Diamond / White Sapphire', luckyHours: '09:30 AM - 11:00 AM', defaultScore: 91 },
  Gemini: { symbol: '♊', sanskrit: 'Mithuna', dates: 'May 21 - Jun 20', element: 'Air', ruler: 'Mercury (Budha)', stone: 'Emerald', luckyHours: '02:15 PM - 03:45 PM', defaultScore: 89 },
  Cancer: { symbol: '♋', sanskrit: 'Karka', dates: 'Jun 21 - Jul 22', element: 'Water', ruler: 'Moon (Chandra)', stone: 'Pearl / Moonstone', luckyHours: '07:00 PM - 08:30 PM', defaultScore: 95 },
  Leo: { symbol: '♌', sanskrit: 'Simha', dates: 'Jul 23 - Aug 22', element: 'Fire', ruler: 'Sun (Surya)', stone: 'Ruby', luckyHours: '10:00 AM - 11:30 AM', defaultScore: 96 },
  Virgo: { symbol: '♍', sanskrit: 'Kanya', dates: 'Aug 23 - Sep 22', element: 'Earth', ruler: 'Mercury (Budha)', stone: 'Emerald / Peridot', luckyHours: '01:00 PM - 02:30 PM', defaultScore: 90 },
  Libra: { symbol: '♎', sanskrit: 'Tula', dates: 'Sep 23 - Oct 22', element: 'Air', ruler: 'Venus (Shukra)', stone: 'Opal / Blue Topaz', luckyHours: '04:30 PM - 06:00 PM', defaultScore: 92 },
  Scorpio: { symbol: '♏', sanskrit: 'Vrishchika', dates: 'Oct 23 - Nov 21', element: 'Water', ruler: 'Mars / Ketu', stone: 'Red Coral / Cat’s Eye', luckyHours: '08:15 AM - 09:45 AM', defaultScore: 93 },
  Sagittarius: { symbol: '♐', sanskrit: 'Dhanu', dates: 'Nov 22 - Dec 21', element: 'Fire', ruler: 'Jupiter (Brihaspati)', stone: 'Yellow Sapphire', luckyHours: '12:00 PM - 01:30 PM', defaultScore: 97 },
  Capricorn: { symbol: '♑', sanskrit: 'Makara', dates: 'Dec 22 - Jan 19', element: 'Earth', ruler: 'Saturn (Shani)', stone: 'Blue Sapphire', luckyHours: '03:30 PM - 05:00 PM', defaultScore: 88 },
  Aquarius: { symbol: '♒', sanskrit: 'Kumbha', dates: 'Jan 20 - Feb 18', element: 'Air', ruler: 'Saturn / Rahu', stone: 'Hessonite / Sapphire', luckyHours: '06:00 PM - 07:30 PM', defaultScore: 93 },
  Pisces: { symbol: '♓', sanskrit: 'Meena', dates: 'Feb 19 - Mar 20', element: 'Water', ruler: 'Jupiter (Brihaspati)', stone: 'Yellow Sapphire', luckyHours: '08:30 AM - 10:00 AM', defaultScore: 94 },
};

export function getZodiacFromDob(dateStr?: string): string {
  if (!dateStr) return 'Aries';
  const parts = dateStr.split('-');
  if (parts.length < 3) return 'Aries';
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

export const DailyHoroscopeSummary: React.FC<DailyHoroscopeSummaryProps> = ({
  user,
  onNavigate,
  defaultSign
}) => {
  // Determine user's natal zodiac sign from saved birth details
  const natalSign = getZodiacFromDob(user?.birthDetails?.date);
  const [selectedSign, setSelectedSign] = useState<string>(defaultSign || natalSign);
  const [horoscope, setHoroscope] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const meta = ZODIAC_METADATA[selectedSign] || ZODIAC_METADATA['Aries'];
  const isUserPersonalSign = selectedSign === natalSign;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getHoroscope(selectedSign, 'daily')
      .then(res => {
        if (isMounted) setHoroscope(res);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedSign, refreshKey]);

  // If user prop updates, align default sign if needed
  useEffect(() => {
    if (!defaultSign && natalSign) {
      setSelectedSign(natalSign);
    }
  }, [natalSign, defaultSign]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getElementIcon = (elem: string) => {
    switch (elem) {
      case 'Fire': return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'Earth': return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Air': return <Wind className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Water': return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl cosmic-glass border border-purple-500/30 p-5 sm:p-7 shadow-2xl transition-all duration-300">
      {/* Background Cosmic Atmosphere & Radiant Aura */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Header Bar: Brand Identity & Cosmic Status */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-600/30 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#090c24] flex items-center justify-center overflow-hidden">
              <img
                src="/assets/aistudio/1793610372476_6b90d080.jpg"
                alt="ASTRONIQ"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-300">
                ASTRONIQ – AI Astrology & Horoscope
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-200">
                DAILY FORECAST
              </span>
            </div>
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>Daily Horoscope Summary</span>
              <span className="text-amber-400 text-sm">✦</span>
            </h2>
          </div>
        </div>

        {/* Refresh & Full Horoscope CTA */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh cosmic reading"
            className="p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 hover:text-white transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('horoscope', { sign: selectedSign })}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-100 text-xs font-medium transition-all"
          >
            <span>Full Horoscope</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* User Personalization Context Bar */}
      <div className="relative z-10 pt-3 pb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                Personalized for <strong className="text-white font-medium">{user.name}</strong>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300 font-mono text-[11px]">
                Natal: {natalSign} ({user.birthDetails?.date ? new Date(user.birthDetails.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Vedic Chart'})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>General daily cosmic transit reading</span>
            </div>
          )}
        </div>

        {/* Quick button to jump back to user's personal natal sign if viewing another sign */}
        {!isUserPersonalSign && user && (
          <button
            onClick={() => setSelectedSign(natalSign)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-[11px] font-medium transition-colors"
          >
            <span>Back to My Sign ({natalSign} {ZODIAC_METADATA[natalSign]?.symbol})</span>
          </button>
        )}
      </div>

      {/* Zodiac Quick Switcher Strip */}
      <div className="relative z-10 flex gap-1.5 overflow-x-auto py-2 no-scrollbar scroll-smooth">
        {Object.entries(ZODIAC_METADATA).map(([signName, data]) => {
          const isSelected = selectedSign === signName;
          const isNatal = signName === natalSign;
          return (
            <button
              key={signName}
              onClick={() => setSelectedSign(signName)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-md shadow-purple-600/40 scale-105'
                  : 'bg-slate-900/70 border-purple-500/20 text-slate-300 hover:border-purple-400/40 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-semibold">{data.symbol}</span>
              <span className="font-medium text-[11px]">{signName}</span>
              {isNatal && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" title="Your Natal Sign" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Cosmic Horoscope Card Body */}
      <div className="relative z-10 mt-3 pt-3 border-t border-purple-500/15 space-y-5">
        {/* Top Feature: Sign Badge, Alignment Gauge, & Headline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Column: Zodiac Celestial Medallion */}
          <div className="md:col-span-4 flex items-center gap-4 bg-purple-950/30 border border-purple-500/20 p-3.5 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-xl shadow-purple-600/30 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#070a1e] flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-2xl leading-none text-white font-bold">{meta.symbol}</span>
                <span className="text-[9px] font-mono tracking-widest text-cyan-300 uppercase mt-0.5">
                  {meta.sanskrit}
                </span>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-cinzel text-base font-bold text-white truncate">
                  {selectedSign}
                </h3>
                {isUserPersonalSign && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    YOU
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                {getElementIcon(meta.element)}
                <span>{meta.element} Element · {meta.ruler.split(' ')[0]}</span>
              </p>
              <p className="text-[10px] text-purple-300/80 font-mono">
                {meta.dates}
              </p>
            </div>
          </div>

          {/* Right Column: Cosmic Alignment Meter & Headline */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-semibold text-cyan-200">
                  Planetary Alignment Today: {meta.defaultScore}% High Harmony
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Transit: Sun in Libra · Moon Waxing
              </span>
            </div>

            {/* Glowing Harmony Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 border border-purple-500/20 overflow-hidden p-[1px]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 transition-all duration-1000 shadow-sm shadow-cyan-400/50"
                style={{ width: `${meta.defaultScore}%` }}
              />
            </div>

            <div className="pt-1">
              <h4 className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-200 leading-snug">
                "{horoscope?.data?.headline || 'Dynamic Surge of Creative Leadership & Momentum'}"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {isUserPersonalSign && user ? (
                  <span className="text-purple-200 font-medium">For {user.name}: </span>
                ) : null}
                {horoscope?.data?.general ||
                  `${selectedSign} receives harmonious cosmic rays today. Trust in your instinctive leadership to turn pending ideas into tangible accomplishments.`}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Prediction Pillars: Love, Career, Vitality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Love & Connection */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/25 to-purple-950/20 border border-rose-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Love & Connection</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                {meta.defaultScore - 2}%
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {horoscope?.data?.love || 'Heartfelt dialogues and magnetic charm dissolve past miscommunications.'}
            </p>
          </div>

          {/* Career & Wealth */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-cyan-950/25 to-purple-950/20 border border-cyan-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Career & Purpose</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {meta.defaultScore + 2 > 99 ? 99 : meta.defaultScore + 2}%
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {horoscope?.data?.career || 'Decisive, structured initiative wins confidence in critical conversations.'}
            </p>
          </div>

          {/* Vitality & Mind */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-950/25 to-purple-950/20 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vitality & Mind</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {meta.defaultScore - 3}%
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {horoscope?.data?.health || 'Vigorous physical endurance; balance high focus with mindful hydration.'}
            </p>
          </div>
        </div>

        {/* Auspicious Cosmic Coordinates & Remedies */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Golden Window */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/15 text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Golden Muhurat
            </span>
            <span className="font-mono text-xs font-bold text-amber-300 mt-0.5 block">
              {meta.luckyHours}
            </span>
          </div>

          {/* Lucky Number & Frequency */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/15 text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Cosmic Number
            </span>
            <span className="font-mono text-xs font-bold text-cyan-300 mt-0.5 block">
              {horoscope?.luckyNumber || 9} · Harmonic {horoscope?.luckyNumber ? (horoscope.luckyNumber * 108) : 972} Hz
            </span>
          </div>

          {/* Harmonizing Color & Stone */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/15 text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Color & Gem
            </span>
            <span className="text-xs font-bold text-purple-200 mt-0.5 block truncate">
              {horoscope?.luckyColor || 'Electric Crimson'} · {meta.stone}
            </span>
          </div>

          {/* Vedic Mantra */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/15 text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
              Sacred Mantra
            </span>
            <span className="font-mono text-[11px] font-bold text-amber-200 mt-0.5 block truncate">
              {horoscope?.mantra || 'Om Angarakaya Namaha'}
            </span>
          </div>
        </div>

        {/* Action Controls & AI Consultation Gateway */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-purple-500/15">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Vedic astronomical Sidereal calculations · Entertainment & cultural wisdom</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => onNavigate('kundli')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Birth Chart</span>
            </button>

            <button
              onClick={() => onNavigate('ai-astrologer', {
                initialMessage: `Explain today's astrological horoscope transits for ${selectedSign} and provide customized Vedic insights.`
              })}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask ASTRONIQ AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
