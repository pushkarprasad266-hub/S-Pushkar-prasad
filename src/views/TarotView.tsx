import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, RotateCw, Eye } from 'lucide-react';
import { TarotCardSpread } from '../types';
import { api } from '../services/api';
import { EthicalAstrologyBanner } from '../components/Disclaimers';

export const TarotView: React.FC = () => {
  const [spread, setSpread] = useState<TarotCardSpread[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [loading, setLoading] = useState(false);

  const drawReading = async () => {
    setLoading(true);
    setRevealed([false, false, false]);
    try {
      const res = await api.getTarotReading();
      setSpread(res.spread);
      // Auto-reveal cards sequentially with smooth mystical timing
      setTimeout(() => setRevealed([true, false, false]), 400);
      setTimeout(() => setRevealed([true, true, false]), 900);
      setTimeout(() => setRevealed([true, true, true]), 1400);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    drawReading();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-violet-400" />
            <span>Interactive 3-Card Tarot Oracle</span>
          </h1>
          <p className="text-xs text-slate-400">
            Past foundation, Present crossroads, and Future potential
          </p>
        </div>

        <button
          onClick={drawReading}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-auto transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Draw New Spread</span>
        </button>
      </div>

      <EthicalAstrologyBanner compact />

      {/* 3 Cards Spread Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {spread.map((item, idx) => {
          const isFlipped = revealed[idx];
          return (
            <div
              key={idx}
              className="cosmic-glass rounded-3xl p-5 border border-purple-500/20 flex flex-col items-center space-y-4 shadow-xl hover:border-purple-400/40 transition-all"
            >
              <div className="text-center">
                <span className="text-[10px] font-space uppercase tracking-widest text-cyan-400 font-bold block">
                  {item.position}
                </span>
                <p className="text-xs text-slate-400">Position {idx + 1}</p>
              </div>

              {/* Card visual container */}
              <div
                onClick={() => {
                  const updated = [...revealed];
                  updated[idx] = !updated[idx];
                  setRevealed(updated);
                }}
                className="w-48 h-72 rounded-2xl cursor-pointer perspective-1000 select-none group"
              >
                <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
                  isFlipped ? '' : 'rotate-y-180'
                }`}>
                  {/* Front Side */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#161b3d] to-[#0a0d24] border-2 border-purple-400/40 p-4 flex flex-col justify-between items-center text-center shadow-2xl backface-hidden">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-cyan-300">
                        {item.card.arcana} Arcana · {item.card.element}
                      </span>
                      <h3 className="font-cinzel text-base font-bold text-white">
                        {item.card.name}
                      </h3>
                      {item.isReversed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/30 text-rose-300">
                          Reversed
                        </span>
                      )}
                    </div>

                    {/* Esoteric Mandala Graphic */}
                    <div className="w-20 h-20 rounded-full border border-purple-400/30 flex items-center justify-center p-2">
                      <div className="w-full h-full rounded-full border border-dashed border-cyan-400/40 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-purple-300 animate-pulse" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic line-clamp-3 leading-snug">
                      "{item.isReversed ? item.card.reversed : item.card.upright}"
                    </p>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-950 to-slate-950 border-2 border-purple-500/30 p-4 flex flex-col items-center justify-center text-center shadow-xl backface-hidden rotate-y-180">
                    <div className="w-16 h-16 rounded-full border-2 border-purple-400/40 flex items-center justify-center">
                      <Layers className="w-8 h-8 text-cyan-300" />
                    </div>
                    <span className="font-cinzel text-xs font-bold text-purple-200 mt-3">ZORVEXA</span>
                    <span className="text-[10px] text-slate-500 mt-1">Tap to Reveal</span>
                  </div>
                </div>
              </div>

              {/* Interpretation text */}
              <div className="w-full pt-2 border-t border-purple-500/15 space-y-1 text-xs">
                <span className="font-semibold text-purple-200 block">Esoteric Meaning:</span>
                <p className="text-slate-300 leading-snug text-[11px]">
                  {item.isReversed ? item.card.reversed : item.card.upright}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
