import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Briefcase, Activity, Star, Moon, Shield } from 'lucide-react';
import { HoroscopeResponse } from '../types';
import { api } from '../services/api';
import { EthicalAstrologyBanner } from '../components/Disclaimers';

const ALL_SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' },
];

interface HoroscopeViewProps {
  initialSign?: string;
}

export const HoroscopeView: React.FC<HoroscopeViewProps> = ({ initialSign = 'Aries' }) => {
  const [selectedSign, setSelectedSign] = useState(initialSign);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [horoscope, setHoroscope] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getHoroscope(selectedSign, timeframe)
      .then(res => setHoroscope(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSign, timeframe]);

  const activeSignData = ALL_SIGNS.find(s => s.name === selectedSign) || ALL_SIGNS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>Zodiac Horoscope & Planetary Alignments</span>
          </h1>
          <p className="text-xs text-slate-400">
            In-depth Vedic & Western celestial guidance for every sign
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-purple-500/25 self-start sm:self-auto text-xs">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-all ${
                timeframe === t
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'yearly' ? '2026 Outlook' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Zodiac Sign Grid/Slider */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {ALL_SIGNS.map(s => {
          const isSelected = s.name === selectedSign;
          return (
            <button
              key={s.name}
              onClick={() => setSelectedSign(s.name)}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-600 to-indigo-700 border-purple-400 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-slate-900/60 border-purple-500/15 text-slate-400 hover:text-white hover:border-purple-500/40'
              }`}
            >
              <span className="text-xl mb-1">{s.symbol}</span>
              <span className="text-xs font-bold">{s.name}</span>
            </button>
          );
        })}
      </div>

      <EthicalAstrologyBanner compact />

      {/* Main Horoscope Content Card */}
      {loading ? (
        <div className="cosmic-glass rounded-3xl p-12 text-center text-purple-300 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-sm">Consulting astrological ephemeris for {selectedSign}...</span>
        </div>
      ) : horoscope && (
        <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6 shadow-2xl">
          {/* Sign Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/15 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                {activeSignData.symbol}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                    {horoscope.sign}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300">
                    {activeSignData.element} Element
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeSignData.dates} · Ruling Celestial Body: <strong className="text-cyan-300">{horoscope.ruler}</strong>
                </p>
              </div>
            </div>

            {/* Lucky Meta */}
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/15 text-center">
                <span className="text-[10px] text-slate-400 block">Lucky No</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{horoscope.luckyNumber}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/15 text-center">
                <span className="text-[10px] text-slate-400 block">Color</span>
                <span className="font-bold text-purple-200 text-xs">{horoscope.luckyColor}</span>
              </div>
            </div>
          </div>

          {/* Headline & General Theme */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest font-space">
              Cosmic Alignment
            </span>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200">
              "{horoscope.data.headline}"
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {horoscope.data.general}
            </p>
          </div>

          {/* 3 Core Pillars: Love, Career, Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                <Heart className="w-4 h-4" />
                <span>Love & Relationships</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {horoscope.data.love}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
                <Briefcase className="w-4 h-4" />
                <span>Career & Ambition</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {horoscope.data.career}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <Activity className="w-4 h-4" />
                <span>Health & Vitality</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {horoscope.data.health}
              </p>
            </div>
          </div>

          {/* Sacred Mantra */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 block">
                Harmonizing Vedic Chanting
              </span>
              <p className="font-mono text-cyan-200 text-sm font-semibold mt-0.5">
                {horoscope.mantra}
              </p>
            </div>
            <span className="text-slate-400 text-[11px] max-w-xs text-right">
              Chant 11 or 108 times at dawn to align personal prana with the ruling planetary frequency.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
