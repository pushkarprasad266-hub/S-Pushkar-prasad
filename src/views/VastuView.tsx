import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const VastuView: React.FC = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  useEffect(() => {
    api.getVastuZones()
      .then(res => {
        setZones(res.vastuZones || []);
        if (res.vastuZones?.length) setSelectedZone(res.vastuZones[0]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-teal-400" />
          <span>Vastu Shastra: Architectural Cosmic Alignment</span>
        </h1>
        <p className="text-xs text-slate-400">
          Harmonizing the 5 primordial elements (Pancha Bhoota) and 8 magnetic directions for prosperity and peace
        </p>
      </div>

      {/* Interactive Compass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Directions Selector Column */}
        <div className="space-y-2">
          <span className="text-[10px] font-space uppercase tracking-widest text-cyan-400 font-bold block px-1">
            The 8 Cardinal & Ordinal Zones
          </span>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {zones.map(z => {
              const isSelected = selectedZone?.direction === z.direction;
              return (
                <button
                  key={z.direction}
                  onClick={() => setSelectedZone(z)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-400 text-white font-medium shadow-md shadow-purple-600/20'
                      : 'bg-slate-900/60 border-purple-500/15 text-slate-400 hover:text-white hover:border-purple-500/40'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{z.direction}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{z.element}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Zone Deep Dive Card */}
        {selectedZone && (
          <div className="md:col-span-2 cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-4">
              <div>
                <span className="text-[10px] font-space uppercase tracking-widest text-teal-300 font-bold">
                  Directional Energy Matrix
                </span>
                <h2 className="font-cinzel text-xl font-bold text-white mt-0.5">
                  {selectedZone.direction}
                </h2>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
                <span>Ruling Deity: </span>
                <strong className="text-cyan-300">{selectedZone.deity}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-cyan-400 block">
                Elemental Dominance
              </span>
              <p className="text-sm font-semibold text-purple-200">
                {selectedZone.element}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-cyan-400 block">
                Vedic Guidelines & Room Allocation
              </span>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm bg-slate-900/80 p-4 rounded-2xl border border-purple-500/20">
                {selectedZone.recommendation}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/20 text-xs text-teal-200 space-y-1">
              <span className="font-semibold block text-teal-300">Practical Vastu Harmony Principle:</span>
              <p className="text-slate-300 leading-snug">
                Energy must flow freely from North-East to South-West. Keeping the lighter zones open and stabilizing the heavier zones maintains physical well-being and domestic abundance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
