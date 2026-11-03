import React, { useState } from 'react';
import { Heart, Sparkles, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { GunaMatchResult } from '../types';
import { EthicalAstrologyBanner } from '../components/Disclaimers';

export const MatchmakingView: React.FC = () => {
  // Boy details
  const [bName, setBName] = useState('Rahul Verma');
  const [bDate, setBDate] = useState('1995-11-23');
  const [bTime, setBTime] = useState('14:30');
  const [bPlace, setBPlace] = useState('Delhi, India');

  // Girl details
  const [gName, setGName] = useState('Ananya Sen');
  const [gDate, setGDate] = useState('1997-06-18');
  const [gTime, setGTime] = useState('09:15');
  const [gPlace, setGPlace] = useState('Kolkata, India');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    match: GunaMatchResult;
    boyVitals: any;
    girlVitals: any;
  } | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.calculateMatchmaking(
        { name: bName, date: bDate, time: bTime, place: bPlace, latitude: 28.6139, longitude: 77.2090 },
        { name: gName, date: gDate, time: gTime, place: gPlace, latitude: 22.5726, longitude: 88.3639 }
      );
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-400" />
          <span>Vedic Kundli Matching (Ashtakoot Guna Milan)</span>
        </h1>
        <p className="text-xs text-slate-400">
          Traditional 36-point compatibility matrix evaluating spiritual, emotional, and physical harmony
        </p>
      </div>

      <EthicalAstrologyBanner compact />

      {/* Input Form */}
      <form onSubmit={handleMatch} className="cosmic-glass rounded-3xl p-6 border border-purple-500/20 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy Particulars */}
          <div className="space-y-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
            <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Partner 1 (Boy) Particulars</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={bName}
                  onChange={e => setBName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={bDate}
                    onChange={e => setBDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Birth Time</label>
                  <input
                    type="time"
                    value={bTime}
                    onChange={e => setBTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Birth Place</label>
                <input
                  type="text"
                  value={bPlace}
                  onChange={e => setBPlace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>
          </div>

          {/* Girl Particulars */}
          <div className="space-y-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Partner 2 (Girl) Particulars</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={gName}
                  onChange={e => setGName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={gDate}
                    onChange={e => setGDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Birth Time</label>
                  <input
                    type="time"
                    value={gTime}
                    onChange={e => setGTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Birth Place</label>
                <input
                  type="text"
                  value={gPlace}
                  onChange={e => setGPlace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Evaluating Ashtakoot Gunas...' : 'Calculate 36 Guna Compatibility'}</span>
        </button>
      </form>

      {/* Match Results */}
      {result && (
        <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-2xl">
          {/* Verdict Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Compatibility Synthesis
              </span>
              <h2 className={`font-cinzel text-xl sm:text-2xl font-bold ${result.match.verdictColor}`}>
                {result.match.recommendation}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {bName} ({result.boyVitals.rashi} · {result.boyVitals.nakshatra}) & {gName} ({result.girlVitals.rashi} · {result.girlVitals.nakshatra})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-purple-900/40 border border-purple-400/30 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Ashtakoot Score</span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-cyan-300">
                  {result.match.totalScore}
                  <span className="text-xs text-slate-400"> / {result.match.maxScore}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 8 Kootas Table */}
          <div className="space-y-3">
            <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              8 Koota Score Breakdown (36 Gunas)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.match.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-purple-950/50 border border-purple-500/20 font-mono font-bold text-cyan-300 text-xs shrink-0">
                    {item.score} / {item.max}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
