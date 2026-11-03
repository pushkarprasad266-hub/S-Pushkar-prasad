import React, { useState, useEffect } from 'react';
import { Video, Sparkles, Users, MessageSquare, Send, Heart, Flame, ShieldCheck } from 'lucide-react';
import { LiveSession } from '../types';
import { api } from '../services/api';

export const LiveSessionsView: React.FC = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [viewers, setViewers] = useState(1420);
  const [comments, setComments] = useState<any[]>([
    { id: 1, user: 'Pooja V.', text: 'Acharyaji, how does Jupiter transit affect Virgo ascendant?', time: '2m ago' },
    { id: 2, user: 'Amit S.', text: 'Pranams Guruji! Very clear explanation of Sade Sati phases.', time: '1m ago' },
    { id: 3, user: 'Sunita K.', text: 'Chanting Shani mantra has really helped my mental peace 🙏', time: 'Just now' },
  ]);
  const [inputComment, setInputComment] = useState('');
  const [likeCount, setLikeCount] = useState(384);

  useEffect(() => {
    api.getLiveSessions()
      .then(res => {
        setSessions(res);
        if (res.length) setActiveSession(res[0]);
      })
      .catch(console.error);

    // Simulate real-time viewer fluctuations
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputComment.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: Date.now(),
        user: 'You',
        text: inputComment,
        time: 'Just now'
      }
    ]);
    setInputComment('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-rose-400" />
          <span>Live Astrology Masterclasses & Sessions</span>
        </h1>
        <p className="text-xs text-slate-400">
          Watch certified scholars analyze current planetary transits and answer live questions
        </p>
      </div>

      {/* Main Live Stage */}
      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Stream Player View (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-2xl flex items-center justify-center">
              <img
                src={activeSession.expertAvatar}
                alt={activeSession.expertName}
                className="w-full h-full object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Live Overlay Header */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/40">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>LIVE</span>
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px]">
                    <Users className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="font-mono">{viewers.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setLikeCount(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-rose-300 text-xs hover:scale-105 transition-transform"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>{likeCount}</span>
                </button>
              </div>

              {/* Stream Title Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                  {activeSession.topic}
                </span>
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-white drop-shadow">
                  {activeSession.title}
                </h2>
                <p className="text-xs text-purple-200">
                  Host: <strong className="text-white">{activeSession.expertName}</strong>
                </p>
              </div>
            </div>

            {/* Quick Reactions Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLikeCount(prev => prev + 5)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 hover:text-white flex items-center gap-1.5"
              >
                <span>🙏 Send Pranam</span>
              </button>
              <button
                onClick={() => setLikeCount(prev => prev + 10)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 hover:text-white flex items-center gap-1.5"
              >
                <span>✨ Offer Shanti</span>
              </button>
              <button
                onClick={() => setLikeCount(prev => prev + 15)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 hover:text-white flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Diya</span>
              </button>
            </div>
          </div>

          {/* Live Chat & Questions Feed (1 Col) */}
          <div className="cosmic-glass rounded-3xl p-4 border border-purple-500/25 flex flex-col justify-between h-[420px] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
              <span className="font-cinzel text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Audience Feed</span>
              </span>
              <span className="text-[10px] text-emerald-400">Moderated Live</span>
            </div>

            {/* Comment Log */}
            <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 text-xs">
              {comments.map(c => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/15 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-purple-300">{c.user}</span>
                    <span className="text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-slate-200 text-xs">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-purple-500/15">
              <input
                type="text"
                value={inputComment}
                onChange={e => setInputComment(e.target.value)}
                placeholder="Ask the host a question..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none text-xs"
              />
              <button
                type="submit"
                disabled={!inputComment.trim()}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Sessions List */}
      <div className="space-y-3 pt-4">
        <h3 className="font-cinzel text-base font-bold text-white">Upcoming Masterclasses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSession(s)}
              className={`p-4 rounded-2xl cosmic-glass border cursor-pointer transition-all flex items-center justify-between ${
                activeSession?.id === s.id
                  ? 'border-purple-400 bg-purple-950/30'
                  : 'border-purple-500/15 hover:border-purple-500/30'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">
                  {s.scheduledTime}
                </span>
                <h4 className="font-bold text-xs text-white">{s.title}</h4>
                <p className="text-[11px] text-slate-400">With {s.expertName}</p>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/30 text-xs text-purple-200 font-medium">
                {s.isLive ? 'Watch Live' : 'Set Reminder'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
