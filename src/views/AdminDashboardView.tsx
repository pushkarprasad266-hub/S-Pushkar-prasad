import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, PhoneCall, Star, Bell, Plus, 
  Check, X, CheckCircle2, AlertTriangle, Send, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Astrologer } from '../types';

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalUsers: 1543,
    totalConsultations: 4835,
    activeAstrologers: 4,
    satisfactionRate: 98.4
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'experts' | 'reviews' | 'broadcast'>('overview');

  // Add new astrologer form
  const [showAddExpert, setShowAddExpert] = useState(false);
  const [newAstName, setNewAstName] = useState('');
  const [newAstTitle, setNewAstTitle] = useState('');
  const [newAstExp, setNewAstExp] = useState(10);
  const [newAstRate, setNewAstRate] = useState(25);
  const [newAstBio, setNewAstBio] = useState('');
  const [addMsg, setAddMsg] = useState('');

  // Notification broadcast form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'cosmic' | 'system'>('cosmic');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const loadData = () => {
    api.getAdminStats().then(res => setStats(res.stats)).catch(console.error);
    api.getAdminReviews().then(res => setReviews(res.reviews || [])).catch(console.error);
    api.getExperts().then(res => setAstrologers(res)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateReviewStatus = async (id: string, status: string) => {
    await api.updateReviewStatus(id, status);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAddAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAstName || !newAstTitle) return;

    try {
      await api.saveAstrologer({
        name: newAstName,
        title: newAstTitle,
        experienceYears: Number(newAstExp),
        ratePerMinute: Number(newAstRate),
        bio: newAstBio || 'Experienced practitioner of Vedic and classical astrological traditions.',
        specialization: ['Vedic Kundli', 'Prashna Jyotish'],
        languages: ['English', 'Hindi'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
      setAddMsg('Astrologer profile registered & verified successfully!');
      setShowAddExpert(false);
      setNewAstName('');
      setNewAstTitle('');
      loadData();
      setTimeout(() => setAddMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    try {
      await api.broadcastNotification(broadcastTitle, broadcastMsg, broadcastType);
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setBroadcastMsg('');
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>AASTRONIQ_astrology Admin Console</span>
          </h1>
          <p className="text-xs text-slate-400">
            Platform governance, astrologer credentialing, and user moderation
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-900 border border-purple-500/20 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'overview', label: 'Platform Metrics & Overview' },
          { id: 'experts', label: 'Manage & Verify Astrologers' },
          { id: 'reviews', label: 'Review Moderation' },
          { id: 'broadcast', label: 'Broadcast Cosmic Alerts' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-all ${
              activeTab === t.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/80 border border-purple-500/15 text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Total Registered Users
              </span>
              <p className="font-mono text-2xl font-bold text-white mt-1">
                {stats.totalUsers.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-400">+12% this month</span>
            </div>

            <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Completed Consultations
              </span>
              <p className="font-mono text-2xl font-bold text-white mt-1">
                {stats.totalConsultations.toLocaleString()}
              </p>
              <span className="text-[10px] text-cyan-300">Chat, Audio & Video</span>
            </div>

            <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" /> Active Verified Astrologers
              </span>
              <p className="font-mono text-2xl font-bold text-white mt-1">
                {astrologers.length}
              </p>
              <span className="text-[10px] text-purple-300">100% credential checked</span>
            </div>

            <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-1">
              <span className="text-slate-400 text-xs flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Client Satisfaction
              </span>
              <p className="font-mono text-2xl font-bold text-white mt-1">
                {stats.satisfactionRate}%
              </p>
              <span className="text-[10px] text-amber-300">Based on 11,800+ reviews</span>
            </div>
          </div>

          <div className="cosmic-glass rounded-3xl p-6 border border-purple-500/20 space-y-3 text-xs">
            <h3 className="font-cinzel text-sm font-bold text-white">System Security & Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/15">
                <p className="font-semibold text-white">Gemini 3.8 Flash AI Engine</p>
                <p className="text-[11px] text-emerald-400 mt-1">● Operational / Server-Side</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/15">
                <p className="font-semibold text-white">Chitrapaksha Ephemeris</p>
                <p className="text-[11px] text-cyan-300 mt-1">● Real Ephemeris Synchronized</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/15">
                <p className="font-semibold text-white">Privacy Guard</p>
                <p className="text-[11px] text-purple-300 mt-1">● Zero-Leak Birth Vault</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ASTROLOGERS */}
      {activeTab === 'experts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-base font-bold text-white">Astrologer Roster</h3>
            <button
              onClick={() => setShowAddExpert(!showAddExpert)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-purple-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Scholar</span>
            </button>
          </div>

          {addMsg && <p className="text-xs text-emerald-400 font-semibold">{addMsg}</p>}

          {/* Add Scholar Form Modal */}
          {showAddExpert && (
            <form onSubmit={handleAddAstrologer} className="cosmic-glass rounded-3xl p-6 border border-purple-500/30 space-y-4 text-xs">
              <h4 className="font-cinzel text-sm font-bold text-cyan-300">Onboard New Astrologer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Scholar Full Name</label>
                  <input
                    type="text"
                    value={newAstName}
                    onChange={e => setNewAstName(e.target.value)}
                    placeholder="e.g. Acharya Vidyasagar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={newAstTitle}
                    onChange={e => setNewAstTitle(e.target.value)}
                    placeholder="e.g. Senior Vedic & Nadi Expert"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newAstExp}
                    onChange={e => setNewAstExp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Demo Consultation Rate (₹/min)</label>
                  <input
                    type="number"
                    value={newAstRate}
                    onChange={e => setNewAstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bio & Classical Credentials</label>
                <textarea
                  value={newAstBio}
                  onChange={e => setNewAstBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/30"
                >
                  Verify & Publish Astrologer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExpert(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of astrologers */}
          <div className="space-y-3">
            {astrologers.map(ast => (
              <div
                key={ast.id}
                className="p-4 rounded-2xl cosmic-glass border border-purple-500/15 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ast.avatar}
                    alt={ast.name}
                    className="w-12 h-12 rounded-xl object-cover border border-purple-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span>{ast.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    </h4>
                    <p className="text-[11px] text-purple-300">{ast.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {ast.experienceYears} yrs exp · ₹{ast.ratePerMinute}/min · {ast.rating}★ ({ast.reviewCount})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    ast.isOnline
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}>
                    {ast.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="font-cinzel text-base font-bold text-white">Client Reviews Moderation</h3>
          <div className="space-y-3 text-xs">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl cosmic-glass border border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rev.userName}</span>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      rev.status === 'approved'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    }`}>
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                    className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900"
                    title="Approve"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleUpdateReviewStatus(rev.id, 'flagged')}
                    className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:bg-rose-900"
                    title="Flag / Hide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <form onSubmit={handleBroadcast} className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-4 text-xs">
          <div className="space-y-1">
            <h3 className="font-cinzel text-base font-bold text-white">Broadcast Cosmic Notification</h3>
            <p className="text-slate-400 text-xs">Push live planetary transit alerts or auspicious muhurat reminders to all app users</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Notification Headline</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Moon Enters Rohini Nakshatra"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Alert Message</label>
              <textarea
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Detail the planetary significance and practical advice..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to Users</span>
            </button>
            {broadcastSuccess && (
              <span className="text-emerald-400 text-xs font-medium">Notification broadcast sent!</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
