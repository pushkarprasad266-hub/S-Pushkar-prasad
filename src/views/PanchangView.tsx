import React, { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, Sparkles, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { PanchangData } from '../types';
import { api } from '../services/api';

export const PanchangView: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getPanchang(date)
      .then(res => setPanchang(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>Daily Vedic Panchang & Muhurat</span>
          </h1>
          <p className="text-xs text-slate-400">
            The five sacred limbs of Vedic timekeeping: Tithi, Nakshatra, Yoga, Karana, and Vara
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-purple-300 text-xs">
          Calculating solar & lunar angles for {date}...
        </div>
      ) : panchang && (
        <div className="space-y-6">
          {/* Main Panchang Card */}
          <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
              <div>
                <span className="text-xs font-space uppercase tracking-widest text-cyan-400 font-bold">
                  {panchang.day} · {panchang.date}
                </span>
                <h2 className="font-cinzel text-xl font-bold text-white mt-0.5">
                  {panchang.tithi}
                </h2>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Sun className="w-4 h-4" />
                  <span>{panchang.sunrise} – {panchang.sunset}</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300">
                  <Moon className="w-4 h-4" />
                  <span>{panchang.moonrise} – {panchang.moonset}</span>
                </div>
              </div>
            </div>

            {/* 5 Elements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Nakshatra</span>
                <p className="font-bold text-sm text-cyan-200">{panchang.nakshatra}</p>
                <span className="text-[11px] text-slate-500">Lunar Mansion</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Yoga</span>
                <p className="font-bold text-sm text-purple-200">{panchang.yoga}</p>
                <span className="text-[11px] text-slate-500">Solar-Lunar Conjunction</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Karana</span>
                <p className="font-bold text-sm text-amber-200">{panchang.karana}</p>
                <span className="text-[11px] text-slate-500">Half Tithi Division</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Zodiac Rashi</span>
                <p className="font-bold text-sm text-white">{panchang.moonSign}</p>
                <span className="text-[11px] text-slate-500">Sun: {panchang.sunSign}</span>
              </div>
            </div>

            {/* Auspicious & Inauspicious Timings (Muhurat) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Auspicious */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Auspicious Timings (Shubha Muhurat)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-emerald-500/10">
                    <span className="text-slate-300 font-medium">Abhijit Muhurat</span>
                    <span className="font-mono text-emerald-300 font-bold">{panchang.auspiciousTimings.abhijitMuhurat}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-emerald-500/10">
                    <span className="text-slate-300 font-medium">Amrit Kalam</span>
                    <span className="font-mono text-emerald-300">{panchang.auspiciousTimings.amritKalam}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-300 font-medium">Brahma Muhurta</span>
                    <span className="font-mono text-emerald-300">{panchang.auspiciousTimings.brahmaMuhurta}</span>
                  </div>
                </div>
              </div>

              {/* Inauspicious */}
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-rose-300 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Inauspicious Windows (Varjya)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-rose-500/10">
                    <span className="text-slate-300 font-medium">Rahu Kaal</span>
                    <span className="font-mono text-rose-300 font-bold">{panchang.inauspiciousTimings.rahuKaal}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-rose-500/10">
                    <span className="text-slate-300 font-medium">Yamaganda</span>
                    <span className="font-mono text-rose-300">{panchang.inauspiciousTimings.yamaganda}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-300 font-medium">Gulika Kaal</span>
                    <span className="font-mono text-rose-300">{panchang.inauspiciousTimings.gulikaKaal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Practical Guidance */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-purple-200">Daily Vedic Guidance: </strong>
                <span className="text-slate-300">{panchang.recommendation}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
