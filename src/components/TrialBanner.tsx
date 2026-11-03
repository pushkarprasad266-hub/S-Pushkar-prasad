import React, { useState } from 'react';
import { Sparkles, Clock, QrCode, AlertTriangle, ArrowRight, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { User, UserSubscription } from '../types';
import { api } from '../services/api';

interface TrialBannerProps {
  user: User | null;
  onOpenSubscriptionModal: () => void;
  onUserUpdate?: (user: User) => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  user,
  onOpenSubscriptionModal,
  onUserUpdate
}) => {
  const [simulating, setSimulating] = useState(false);

  const sub: UserSubscription = user?.subscription || {
    status: 'trial',
    planName: '1-Month Free Trial',
    planPrice: 15,
    trialStartedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 27 * 86400000).toISOString(),
    daysRemaining: 27
  };

  const isExpired = sub.status === 'expired' || sub.daysRemaining <= 0;
  const isPaid = sub.status === 'active';
  const daysTotal = 30;
  const daysPassed = Math.max(0, Math.min(daysTotal, daysTotal - (sub.daysRemaining || 0)));
  const progressPercent = Math.round((daysPassed / daysTotal) * 100);

  const handleQuickToggle = async () => {
    if (!user || !onUserUpdate) return;
    setSimulating(true);
    try {
      const nextState = isExpired ? 'trial' : 'expired';
      const res = await api.simulateSubscription(user.id, nextState);
      if (res.success && res.user) {
        onUserUpdate(res.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all ${
      isExpired
        ? 'bg-gradient-to-r from-rose-950/60 via-red-950/40 to-purple-950/60 border-rose-500/40 shadow-lg shadow-rose-950/50'
        : isPaid
        ? 'bg-gradient-to-r from-emerald-950/50 via-purple-950/40 to-cyan-950/50 border-emerald-500/30 shadow-lg shadow-emerald-950/30'
        : 'bg-gradient-to-r from-purple-950/50 via-[#0e102b] to-indigo-950/50 border-purple-500/30 shadow-lg shadow-purple-950/30'
    } p-4 sm:p-5`}>
      
      {/* Background glow accent */}
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        isExpired ? 'bg-rose-500/15' : isPaid ? 'bg-emerald-500/15' : 'bg-cyan-500/10'
      }`} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isExpired
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : isPaid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {isExpired ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  TRIAL EXPIRED
                </>
              ) : isPaid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  PREMIUM PASS ACTIVE
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-cyan-400" />
                  1-MONTH FREE TRIAL
                </>
              )}
            </span>

            <span className="text-xs font-mono font-semibold text-amber-300">
              ₹15 / Month
            </span>

            <span className="text-[11px] text-slate-400">
              • {sub.daysRemaining} {sub.daysRemaining === 1 ? 'day' : 'days'} remaining
            </span>
          </div>

          <h3 className="font-cinzel text-sm sm:text-base font-bold text-white">
            {isExpired
              ? 'Your 1-Month Free Trial has ended! Renew for ₹15 to continue.'
              : isPaid
              ? 'Cosmic Membership Active — Full Astrological Intelligence'
              : `1-Month Free Trial: ${sub.daysRemaining} Days Left`}
          </h3>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {isExpired
              ? 'Scan the UPI QR Code with Google Pay, PhonePe, Paytm, or FamPay to pay ₹15 and instantly restore unlimited Kundli, daily horoscopes & AI assistant.'
              : isPaid
              ? `Your subscription is active until ${formatDate(sub.expiresAt)}. Monthly renewal is only ₹15 (approx. ₹0.50/day).`
              : `Enjoy complete unlimited access for 30 days until ${formatDate(sub.trialEndsAt)}. After the trial, stay connected for just ₹15 monthly.`}
          </p>

          {/* Progress bar for 30-day trial */}
          {!isPaid && (
            <div className="pt-1.5 space-y-1 max-w-md">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Start: {formatDate(sub.trialStartedAt)}</span>
                <span>{sub.daysRemaining} days left</span>
                <span>End: {formatDate(sub.trialEndsAt)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-purple-500/20">
                <div
                  className={`h-full transition-all duration-500 ${
                    isExpired
                      ? 'bg-rose-500 w-full'
                      : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400'
                  }`}
                  style={{ width: `${isExpired ? 100 : Math.max(5, 100 - (sub.daysRemaining / 30) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSubscriptionModal}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all ${
              isExpired
                ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-purple-600 hover:brightness-110 text-white shadow-rose-600/40'
                : 'bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:brightness-110 text-white shadow-purple-600/30'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isExpired ? 'Pay ₹15 via UPI QR' : 'View UPI QR Code (₹15)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onUserUpdate && (
            <button
              onClick={handleQuickToggle}
              disabled={simulating}
              className="px-3 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Toggle trial expired vs active to test the experience"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isExpired ? 'Reset Trial (30d)' : 'Simulate Expired'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
