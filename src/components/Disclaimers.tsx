import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const EthicalAstrologyBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/80">
        <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Interpretations are for cultural and personal insight, not guaranteed predictions.</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/20 p-3.5 text-xs text-slate-300">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-purple-200">Ethical Astrology & Privacy Commitment</p>
          <p className="text-slate-400 leading-relaxed">
            Zorvexa Astro offers astronomical calculations, Vedic traditions, and AI perspectives for philosophical awareness and self-discovery. We never issue fatalistic predictions or advise on financial, medical, or legal decisions. Your birth data is kept private and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export const DemoConsultationNotice: React.FC = () => {
  return (
    <div className="py-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span><strong>Consultation Demo Mode:</strong> Free instant simulation. Paid bookings and billing are disabled in this build.</span>
      </div>
    </div>
  );
};
