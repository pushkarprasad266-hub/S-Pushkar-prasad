import React, { useState } from 'react';
import { 
  X, Check, Sparkles, Shield, Clock, QrCode, 
  CreditCard, CheckCircle2, AlertTriangle, ArrowRight, 
  Copy, RefreshCw, Star, Zap, Lock, Download, HelpCircle
} from 'lucide-react';
import { User, UserSubscription } from '../types';
import { api } from '../services/api';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdate: (user: User) => void;
  initialMode?: 'default' | 'paywall';
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  initialMode = 'default'
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'qr' | 'history'>('plan');

  if (!isOpen) return null;

  const sub: UserSubscription = user?.subscription || {
    status: 'trial',
    planName: '1-Month Free Trial',
    planPrice: 15,
    trialStartedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 27 * 86400000).toISOString(),
    daysRemaining: 27
  };

  const isExpired = sub.status === 'expired' || sub.daysRemaining <= 0;
  const isPaidActive = sub.status === 'active';
  const isTrial = sub.status === 'trial';

  const upiId = 'pushkarprasad266@fampay'; // Direct UPI ID corresponding to QR code

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleAutofillDemoUtr = () => {
    const demoUtr = `4${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    setUtrNumber(demoUtr);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.paySubscription({
        userId: user?.id,
        transactionRef: utrNumber.trim() || `UPI-AUTOPAY-${Date.now().toString().slice(-6)}`,
        amount: 15
      });
      if (res.success && res.user) {
        onUserUpdate(res.user);
        setSuccessMsg('Payment of ₹15 verified successfully! Your 30-day Cosmic Membership is now ACTIVE.');
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      setError(err?.message || 'Payment confirmation failed. Please check your transaction reference.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (state: 'trial' | 'expired' | 'active') => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.simulateSubscription(user.id, state);
      if (res.success && res.user) {
        onUserUpdate(res.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-gradient-to-b from-[#13112c] via-[#0b0c1e] to-[#070814] rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(147,51,234,0.35)] overflow-hidden">
        
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative p-5 pb-4 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/25">
              <div className="w-full h-full bg-[#0d0f24] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
                  AASTRONIQ Premium
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  ₹15 / Month
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1-Month Free Trial • ₹15 Monthly Renewal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alert Banner */}
        <div className="p-4 bg-purple-950/40 border-b border-purple-500/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isExpired ? (
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : isPaidActive ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {isExpired
                      ? '1-Month Free Trial Expired'
                      : isPaidActive
                      ? 'Cosmic Membership Active'
                      : '1-Month Free Trial Active'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isExpired 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : isPaidActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {sub.daysRemaining} {sub.daysRemaining === 1 ? 'Day' : 'Days'} Remaining
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isExpired
                    ? 'Scan the UPI QR code below to renew for ₹15 and unlock all features.'
                    : `Valid from ${formatDate(sub.trialStartedAt)} to ${formatDate(sub.expiresAt || sub.trialEndsAt)}`}
                </p>
              </div>
            </div>

            {/* Price Tag Highlight */}
            <div className="text-right shrink-0">
              <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 font-cinzel">
                ₹15
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                / 30 Days (₹0.50/day)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-500/20 px-5 pt-3 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('plan')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'plan'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Plan Benefits & Numbers
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            UPI QR Code & Pay ₹15
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Billing & Receipt
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'plan' && (
            <div className="space-y-4">
              {/* Numeric Metric Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                    {sub.daysRemaining}
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                    Days Remaining
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                    ₹15
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                    Monthly Fee
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                    ₹0.50
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                    Cost Per Day
                  </p>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="p-4 rounded-2xl bg-[#090b1c] border border-purple-500/20 space-y-2.5 text-xs">
                <h4 className="font-semibold text-purple-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Everything Included in 1-Month Trial & Monthly Pass
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Vedic Kundli & Dosha Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Daily Horoscope for all 12 signs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>AI Astrology Assistant Chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Ashtakoot 36 Guna Milan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Daily Vedic Panchang & Muhurat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tarot Wisdom & Numerology Matrix</span>
                  </div>
                </div>
              </div>

              {/* Call to Action Button */}
              <button
                onClick={() => setActiveTab('qr')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>{isExpired ? 'Pay ₹15 via UPI QR Code to Unlock' : 'View UPI QR Code & Pay ₹15'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  Scan & Pay ₹15 Monthly
                </span>
                <h4 className="text-sm font-bold text-white">
                  Pay via any UPI App (GPay, PhonePe, Paytm, FamPay, Cred)
                </h4>
              </div>

              {/* The Scanned QR Code Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/30 shadow-xl relative">
                <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-amber-400/40 relative">
                  <img
                    src="/assets/aistudio/Screenshot_20261102_152900_a2e2e40c.jpg"
                    alt="AASTRONIQ UPI Payment QR Code"
                    className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black font-extrabold text-xs rounded-full shadow-md whitespace-nowrap">
                    Amount: ₹15.00
                  </div>
                </div>

                {/* UPI ID Copy Row */}
                <div className="mt-5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-xs">
                  <span className="text-slate-400">UPI ID:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{upiId}</span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step instructions */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-500/10">
                  <span className="font-bold text-amber-300 block mb-0.5">Step 1</span>
                  Scan QR code with your UPI app
                </div>
                <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-500/10">
                  <span className="font-bold text-amber-300 block mb-0.5">Step 2</span>
                  Complete payment of ₹15
                </div>
                <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-500/10">
                  <span className="font-bold text-amber-300 block mb-0.5">Step 3</span>
                  Enter UTR & Click Verify
                </div>
              </div>

              {/* UTR Reference Input & Verify */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0a0d22] border border-purple-500/25">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">
                    UPI 12-Digit Ref / UTR No.
                  </label>
                  <button
                    onClick={handleAutofillDemoUtr}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Autofill Demo UTR
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 431987123456"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Verify & Unlock</span>
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {error}
                  </p>
                )}
                {successMsg && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {successMsg}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#090b1c] border border-purple-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="text-slate-400">Account ID</span>
                  <span className="font-mono text-white">{user?.id || 'user-demo'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="text-slate-400">Current Plan</span>
                  <span className="font-semibold text-amber-300">{sub.planName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="text-slate-400">Monthly Pricing</span>
                  <span className="font-mono text-white">₹15 / Month</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="text-slate-400">Trial Period</span>
                  <span className="text-slate-200">
                    {formatDate(sub.trialStartedAt)} - {formatDate(sub.trialEndsAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="text-slate-400">Valid Until</span>
                  <span className="font-semibold text-cyan-300">
                    {formatDate(sub.expiresAt || sub.trialEndsAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Transaction / UTR</span>
                  <span className="font-mono text-xs text-emerald-400">
                    {sub.transactionRef || 'Trial Registration (Free)'}
                  </span>
                </div>
              </div>

              {/* Tax Invoice Note */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/10 text-[11px] text-slate-400 space-y-1">
                <p className="font-medium text-slate-300">Billing Policy & Transparency</p>
                <p>
                  • 1st Month is completely free (30 calendar days).<br />
                  • Subsequent months are charged at a flat rate of ₹15/month via UPI.<br />
                  • No auto-debit without explicit user confirmation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom / Interactive Dev Testing Bar */}
        <div className="p-3.5 bg-black/60 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Modes:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulate('trial')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors"
            >
              Simulate Active Trial (27 Days)
            </button>
            <button
              onClick={() => handleSimulate('expired')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-[11px] font-medium transition-colors"
            >
              Simulate Expired Trial (0 Days)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
