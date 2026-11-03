import React, { useState } from 'react';
import { Sparkles, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface OnboardingModalProps {
  onComplete: (userUpdates: Partial<User>) => void;
  onSkip: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1998-04-14');
  const [tob, setTob] = useState('08:30');
  const [city, setCity] = useState('New Delhi, India');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Kundli', 'Daily Horoscope', 'AI Astro']);

  const INTERESTS = [
    'Daily Horoscope', 'Vedic Kundli', 'AI Astro Assistant',
    'Kundli Matching', 'Expert Live Calls', 'Tarot Wisdom',
    'Vastu Shastra', 'Numerology'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFinish = () => {
    onComplete({
      name: name || 'Cosmic Seeker',
      birthDetails: {
        date: dob,
        time: tob,
        place: city,
        latitude: city.toLowerCase().includes('mumbai') ? 19.0760 : city.toLowerCase().includes('london') ? 51.5074 : city.toLowerCase().includes('new york') ? 40.7128 : 28.6139,
        longitude: city.toLowerCase().includes('mumbai') ? 72.8777 : city.toLowerCase().includes('london') ? -0.1278 : city.toLowerCase().includes('new york') ? -74.0060 : 77.2090,
        gender: 'other'
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/15">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-200">
              AASTRONIQ_astrology
            </span>
            <span className="text-slate-500 text-xs">· Step {step} of 3</span>
          </div>
          <button onClick={onSkip} className="text-xs text-slate-400 hover:text-slate-200">
            Skip for now
          </button>
        </div>

        {/* Step 1: Cosmic Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[2px] shadow-xl shadow-purple-600/30">
              <div className="w-full h-full bg-[#0a0d24] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">
                Welcome to Cosmic Clarity
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                Step into the future of Vedic astrology. Real planetary ephemeris, AI-powered cosmic guidance, and verified scholars at your fingertips.
              </p>
            </div>

            <div className="space-y-2 text-left bg-purple-950/20 p-4 rounded-2xl border border-purple-500/15 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lahiri Ayanamsha & precise Vedic planetary charts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zorvexa AI Astrologer with real-time wisdom</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Simulated live consultations, audio, and video</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Personalize My Chart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Birth Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-white">Your Celestial Coordinates</h3>
              <p className="text-xs text-slate-400">Exact birth details ensure accurate Vedic Kundli calculation.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Pushkar Prasad"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Time of Birth</label>
                  <input
                    type="time"
                    value={tob}
                    onChange={e => setTob(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Place of Birth (City, Country)</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai, London, New York"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl border border-purple-500/30 text-slate-300 text-xs font-medium hover:bg-purple-950/30"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Astrological Interests */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-white">Select Your Cosmic Focus</h3>
              <p className="text-xs text-slate-400">Choose the astrological subjects you care about most.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {INTERESTS.map(item => {
                const isSelected = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-400 text-white font-medium'
                        : 'bg-slate-900/60 border-purple-500/20 text-slate-400 hover:border-purple-500/40'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 rounded-xl border border-purple-500/30 text-slate-300 text-xs font-medium hover:bg-purple-950/30"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/40"
              >
                <Compass className="w-4 h-4" />
                <span>Enter AASTRONIQ Astrology</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
