import React, { useState } from 'react';
import { BookOpen, Sparkles, ChevronRight, X } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  author: string;
}

const ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'The Sacred Science of the 27 Nakshatras',
    category: 'Vedic Foundations',
    readTime: '6 min read',
    summary: 'How lunar mansions influence the subconscious mind, emotional patterns, and innate gifts far beyond simple Sun signs.',
    author: 'Acharya Devendra Shastri',
    content: `In ancient Vedic astronomy, the ecliptic is partitioned into 27 equal segments of 13° 20' each, termed Nakshatras (lunar mansions). While the Sun resides in a sign for roughly 30 days, the Moon transits through a different Nakshatra every 24 hours.

Each Nakshatra is governed by a cosmic deity, a planetary lord, and possesses a unique mythological archetype. For instance, Rohini in Taurus represents artistic creativity, fertility, and magnetic charm; whereas Ardra in Gemini represents fierce intellectual transformation and the clearing of stagnant karmic energy.

Understanding your Janma Nakshatra (birth star where the Moon was positioned) unlocks the deepest psychological motivations of your life path, guiding optimal timing for creative ventures and spiritual sadhana.`
  },
  {
    id: 'art-2',
    title: 'Demystifying Planetary Retrogrades (Vakra Grahas)',
    category: 'Transits & Timing',
    readTime: '5 min read',
    summary: 'Why apparent backward motion is an invitation for deep inner recalibration rather than fear or disaster.',
    author: 'Dr. Maitreyi Krishnan',
    content: `When a planet appears to move backward against the background of fixed stars, classical Jyotish terms it "Vakra" (crooked or retrograde). Modern pop culture frequently instills panic regarding Mercury or Saturn retrograde periods, yet classical texts view retrogrades quite differently.

In Parashari astrology, a retrograde natural benefic planet (like Jupiter or Venus) gains Chesta Bala (motional strength), making its spiritual and creative impulses especially potent. A retrograde planet demands that we re-evaluate, revise, and reflect before launching outward actions.

Rather than postponing life decisions, retrogrades invite you to fine-tune ongoing work, reconnect with neglected dreams, and practice deeper mindful discernment.`
  },
  {
    id: 'art-3',
    title: 'The Real Principles of Vedic Gemstone Alignment',
    category: 'Remedies & Energetics',
    readTime: '7 min read',
    summary: 'The physics of crystalline light refraction and ethical precautions before adorning precious stones like Yellow Sapphire or Blue Sapphire.',
    author: 'Pandit Rajeshwar Joshi',
    content: `Vedic gemstones (Ratnas) operate as natural optical filters that absorb specific cosmic wavelengths from the planetary rays and infuse them into the wearer's bio-magnetic aura.

A classical rule often ignored in commercial astrology: Never wear a gemstone merely based on your Sun sign or general desire for wealth. A stone strengthens the planet it represents in your natal chart. If that planet rules difficult dusthana houses (6th, 8th, or 12th) without mitigation, strengthening it can intensify obstacles.

Always evaluate Lagna lordship, planetary strength in the D-9 Navamsha, and consult an authentic scholar before wearing high-energy gems such as Neelam (Blue Sapphire) or Manikya (Ruby).`
  }
];

export const ArticlesView: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <span>Zorvexa Cosmic Library & Educational Guides</span>
        </h1>
        <p className="text-xs text-slate-400">
          Peer-reviewed articles, classical Vedic cosmology, and pragmatic guidance
        </p>
      </div>

      {/* Articles Grid */}
      <div className="space-y-4">
        {ARTICLES.map(art => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="cosmic-glass cosmic-glass-hover rounded-3xl p-6 border border-purple-500/20 cursor-pointer space-y-3 transition-all"
          >
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <span>{art.category}</span>
              <span>·</span>
              <span className="text-slate-400">{art.readTime}</span>
              <span>·</span>
              <span className="text-purple-300">By {art.author}</span>
            </div>

            <h2 className="font-cinzel text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              {art.title}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {art.summary}
            </p>

            <div className="flex items-center gap-1 text-xs text-purple-300 font-medium pt-1">
              <span>Read Full Insight</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Full Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-900 border border-purple-500/20 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                {selectedArticle.category} · {selectedArticle.readTime}
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                {selectedArticle.title}
              </h2>
              <p className="text-xs text-purple-300">Written by {selectedArticle.author}</p>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap space-y-4 pt-3 border-t border-purple-500/20">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-purple-500/15 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
