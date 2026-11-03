import React, { useState, useEffect } from 'react';
import { Star, Hash, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { EthicalAstrologyBanner } from '../components/Disclaimers';

export const NumerologyView: React.FC = () => {
  const [name, setName] = useState('Pushkar Prasad');
  const [dob, setDob] = useState('1998-04-14');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.getNumerology(name, dob);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-cyan-400" />
          <span>Vedic & Chaldean Numerology Matrix</span>
        </h1>
        <p className="text-xs text-slate-400">
          Decipher the numerical vibrations governing your soul blueprint and worldly path
        </p>
      </div>

      <EthicalAstrologyBanner compact />

      {/* Calculator Input Form */}
      <form onSubmit={calculate} className="cosmic-glass rounded-2xl p-5 border border-purple-500/20 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-2"
        >
          <Hash className="w-4 h-4" />
          <span>{loading ? 'Calculating Vibrations...' : 'Compute Numerology Grid'}</span>
        </button>
      </form>

      {/* Result Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Life Path Card */}
          <div className="cosmic-glass rounded-3xl p-6 border border-purple-500/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
              <div>
                <span className="text-[10px] font-space uppercase tracking-widest text-cyan-400 font-bold block">
                  Solar Blueprint
                </span>
                <h3 className="font-cinzel text-base font-bold text-white">
                  Life Path Number
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-mono text-2xl font-black text-white shadow-lg shadow-purple-600/40">
                {result.lifePathNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-sm text-purple-200">{result.lifePathInfo.title}</h4>
              <p className="text-slate-300">
                Ruling Archetype: <strong className="text-cyan-300">{result.lifePathInfo.archetype}</strong>
              </p>
              <p className="text-slate-400 leading-relaxed">
                Core Qualities: {result.lifePathInfo.qualities}
              </p>
            </div>
          </div>

          {/* Destiny / Expression Card */}
          <div className="cosmic-glass rounded-3xl p-6 border border-purple-500/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
              <div>
                <span className="text-[10px] font-space uppercase tracking-widest text-purple-400 font-bold block">
                  Name Frequency
                </span>
                <h3 className="font-cinzel text-base font-bold text-white">
                  Expression / Destiny Number
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-mono text-2xl font-black text-white shadow-lg shadow-indigo-600/40">
                {result.destinyNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-sm text-purple-200">{result.destinyInfo.title}</h4>
              <p className="text-slate-300">
                Ruling Archetype: <strong className="text-cyan-300">{result.destinyInfo.archetype}</strong>
              </p>
              <p className="text-slate-400 leading-relaxed">
                Core Qualities: {result.destinyInfo.qualities}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
