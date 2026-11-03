import React from 'react';
import { 
  Compass, Bot, Sparkles, Heart, PhoneCall, 
  Video, Calendar, Layers, Star, BookOpen, ChevronRight 
} from 'lucide-react';

interface ServicesDirectoryViewProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const ServicesDirectoryView: React.FC<ServicesDirectoryViewProps> = ({ onNavigate }) => {
  const ALL_SERVICES = [
    {
      id: 'kundli',
      title: 'Vedic Kundli (Birth Chart)',
      desc: 'Generate complete North and South Indian Kundlis with exact Lahiri ephemeris, Nakshatras, and Doshas.',
      icon: Compass,
      badge: 'Core Vedic',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'ai-astrologer',
      title: 'AASTRONIQ AI Astrologer',
      desc: 'Instant, intelligent conversational astrology powered by server-side Gemini 3.8 Flash.',
      icon: Bot,
      badge: 'AI Powered',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'horoscope',
      title: 'Daily & Yearly Horoscopes',
      desc: 'Explore daily, weekly, monthly, and 2026 predictions for all 12 zodiac signs across love and career.',
      icon: Sparkles,
      badge: '12 Signs',
      color: 'from-fuchsia-500 to-purple-600'
    },
    {
      id: 'matchmaking',
      title: 'Kundli Matching (Guna Milan)',
      desc: 'Comprehensive 36-point Ashtakoot compatibility matching for marriage, love, and partnerships.',
      icon: Heart,
      badge: '36 Gunas',
      color: 'from-rose-500 to-pink-600'
    },
    {
      id: 'experts',
      title: 'Consult Verified Scholars',
      desc: 'Connect with verified practitioners in Vedic Jyotish, KP, Tarot, and Vastu via chat, audio, or video.',
      icon: PhoneCall,
      badge: 'Certified',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'live-sessions',
      title: 'Live Masterclasses',
      desc: 'Join live streaming video masterclasses, ask questions, and discuss planetary transits.',
      icon: Video,
      badge: 'Live',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'panchang',
      title: 'Daily Vedic Panchang',
      desc: 'Tithi, Nakshatra, Yoga, Karana, Abhijit Muhurat, and Rahu Kaal computed for any calendar date.',
      icon: Calendar,
      badge: 'Muhurat',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'tarot',
      title: '3-Card Tarot Oracle',
      desc: 'Draw past, present, and future cards from the Major and Minor Arcana with interactive 3D flips.',
      icon: Layers,
      badge: 'Oracle',
      color: 'from-violet-500 to-purple-700'
    },
    {
      id: 'numerology',
      title: 'Numerology Frequency Matrix',
      desc: 'Decode your Life Path and Destiny numbers derived from name vibration and birth date.',
      icon: Star,
      badge: 'Chaldean',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'vastu',
      title: 'Vastu Shastra Guide',
      desc: 'Optimize the 8 magnetic directions of your home or workspace for peace and abundance.',
      icon: BookOpen,
      badge: 'Directional',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'articles',
      title: 'Cosmic Library & Guides',
      desc: 'Authoritative educational articles on Nakshatras, planetary retrogrades, and gemstone energetics.',
      icon: BookOpen,
      badge: 'Knowledge',
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>All AASTRONIQ_astrology Services & Portals</span>
        </h1>
        <p className="text-xs text-slate-400">
          Explore our complete suite of Vedic calculations, esoteric divination, and expert consultations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_SERVICES.map(srv => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              onClick={() => onNavigate(srv.id)}
              className="cosmic-glass cosmic-glass-hover rounded-3xl p-5 border border-purple-500/15 cursor-pointer flex flex-col justify-between space-y-4 group shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${srv.color} p-[1.5px] shadow-lg group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full bg-[#090c23] rounded-[14px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950/50 border border-purple-500/20 text-purple-200 font-semibold font-mono">
                    {srv.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-cinzel text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-purple-300 font-medium pt-2 border-t border-purple-500/15">
                <span>Access Service</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
