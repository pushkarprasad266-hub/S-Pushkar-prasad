import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, Star, ShieldCheck, MessageSquare, Video, 
  Award, Globe, Filter, X, Check, Heart
} from 'lucide-react';
import { Astrologer, User } from '../types';
import { api } from '../services/api';
import { DemoConsultationNotice } from '../components/Disclaimers';

interface ExpertsViewProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
}

const CATEGORIES = ['All', 'Vedic Kundli', 'KP Astrology', 'Tarot', 'Vastu', 'Numerology', 'Love & Marriage'];

export const ExpertsView: React.FC<ExpertsViewProps> = ({ user, onNavigate }) => {
  const [experts, setExperts] = useState<Astrologer[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedExpert, setSelectedExpert] = useState<Astrologer | null>(null);
  const [expertReviews, setExpertReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingModal, setBookingModal] = useState<Astrologer | null>(null);
  const [selectedService, setSelectedService] = useState<'chat' | 'audio' | 'video'>('chat');
  const [consultNotes, setConsultNotes] = useState('');

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getExperts(activeCategory === 'All' ? undefined : activeCategory)
      .then(res => setExperts(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const openExpertDetail = (expert: Astrologer) => {
    setSelectedExpert(expert);
    api.getExpertDetail(expert.id)
      .then(res => setExpertReviews(res.reviews || []))
      .catch(console.error);
  };

  const handleStartConsultation = async () => {
    if (!bookingModal) return;
    try {
      await api.bookConsultation({
        userId: user?.id || 'user-demo',
        expertId: bookingModal.id,
        serviceType: selectedService,
        notes: consultNotes
      });
      // Navigate to live consultation session simulation
      onNavigate('consult-session', {
        expert: bookingModal,
        mode: selectedService,
        notes: consultNotes
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert || !newComment.trim()) return;

    try {
      const res = await api.submitReview(selectedExpert.id, {
        rating: newRating,
        comment: newComment,
        userName: user?.name || 'Cosmic Seeker',
        userId: user?.id
      });
      setExpertReviews(prev => [res.review, ...prev]);
      setReviewSubmitted(true);
      setNewComment('');
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-emerald-400" />
            <span>Consult Verified Astrology Scholars</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real certified practitioners in Vedic Jyotish, KP, Tarot, and Vastu
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 border border-purple-500/20 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <DemoConsultationNotice />

      {/* Astrologers Directory Grid */}
      {loading ? (
        <div className="text-center py-16 text-purple-300 text-xs">
          Gathering active astrologer availability...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map(ast => (
            <div
              key={ast.id}
              className="cosmic-glass rounded-3xl p-5 border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={ast.avatar}
                      alt={ast.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/30 shadow-md"
                    />
                    {ast.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#060814]" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-sm truncate">{ast.name}</h3>
                      {ast.isVerified && <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-purple-300 line-clamp-1">{ast.title}</p>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="flex items-center gap-0.5 text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{ast.rating}</span>
                      </div>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{ast.experienceYears} yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {ast.specialization.slice(0, 3).map(s => (
                    <span
                      key={s}
                      className="text-[10px] px-2.5 py-0.5 rounded-lg bg-purple-950/40 text-purple-200 border border-purple-500/15"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Languages & Consultations */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-purple-500/15">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>{ast.languages.join(', ')}</span>
                  </span>
                  <span>{ast.totalConsultations}+ sessions</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-500/15">
                <div>
                  <span className="text-[10px] text-slate-500 block leading-tight">Rate:</span>
                  <p className="text-xs font-bold text-cyan-300">
                    ₹{ast.ratePerMinute}<span className="text-[10px] text-slate-400 font-normal">/min</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openExpertDetail(ast)}
                    className="px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs text-slate-300 hover:text-white hover:bg-purple-950/30 transition-colors"
                  >
                    View Bio
                  </button>
                  <button
                    onClick={() => setBookingModal(ast)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expert Profile & Reviews Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedExpert(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-900 border border-purple-500/20 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src={selectedExpert.avatar}
                alt={selectedExpert.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400/40 shadow-xl"
              />
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white">{selectedExpert.name}</h2>
                  {selectedExpert.isVerified && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-purple-300">{selectedExpert.title}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedExpert.rating} ({selectedExpert.reviewCount} reviews)
                  </span>
                  <span>·</span>
                  <span>{selectedExpert.experienceYears} Years Experience</span>
                </div>
              </div>
            </div>

            {/* Education & Bio */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-cyan-300">Credentials & Background</h4>
              <p className="text-purple-200 font-medium">{selectedExpert.education}</p>
              <p className="text-slate-300 leading-relaxed">{selectedExpert.bio}</p>
            </div>

            {/* Specialization Badges */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-cyan-300">Areas of Mastery</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedExpert.specialization.concat(selectedExpert.skills).map(item => (
                  <span key={item} className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-purple-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-3 pt-3 border-t border-purple-500/20 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-cyan-300">Client Reviews</h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {expertReviews.map(rev => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-900/70 border border-purple-500/15 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{rev.userName}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-snug">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Submit a review form */}
              <form onSubmit={handleReviewSubmit} className="space-y-2 p-3 rounded-2xl bg-purple-950/20 border border-purple-500/15">
                <span className="font-semibold text-purple-200 block">Leave a Review</span>
                <div className="flex items-center gap-1 text-slate-300">
                  <span className="mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setNewRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${num <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your consultation experience..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/30"
                >
                  Submit Review
                </button>
                {reviewSubmitted && (
                  <span className="text-emerald-400 text-[11px] ml-2 font-medium">Review submitted!</span>
                )}
              </form>
            </div>

            {/* Connect CTA */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  const target = selectedExpert;
                  setSelectedExpert(null);
                  setBookingModal(target);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Demo Consultation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Mode Selector Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md cosmic-glass rounded-3xl p-6 sm:p-7 border border-purple-500/30 shadow-2xl space-y-5">
            <button
              onClick={() => setBookingModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900 border border-purple-500/20 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Instant Demo Session
              </span>
              <h3 className="font-cinzel text-lg font-bold text-white">
                Connect with {bookingModal.name}
              </h3>
              <p className="text-xs text-slate-400">
                Choose your consultation mode. No payment will be deducted in demo mode.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              {[
                { id: 'chat', label: 'Live Chat', icon: MessageSquare },
                { id: 'audio', label: 'Audio Call', icon: PhoneCall },
                { id: 'video', label: 'Video Call', icon: Video },
              ].map(m => {
                const Icon = m.icon;
                const isSel = selectedService === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedService(m.id as any)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      isSel
                        ? 'bg-purple-600/30 border-purple-400 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'bg-slate-900/60 border-purple-500/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSel ? 'text-cyan-300' : ''}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-400">Topic or Question (Optional)</label>
              <input
                type="text"
                value={consultNotes}
                onChange={e => setConsultNotes(e.target.value)}
                placeholder="e.g. Career transition timing, marriage matching..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-[11px] text-emerald-200">
              ✓ Free instant connection · Real-time simulation environment ready.
            </div>

            <button
              onClick={handleStartConsultation}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <span>Launch {selectedService.toUpperCase()} Consultation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
