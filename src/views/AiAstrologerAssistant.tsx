import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RotateCcw, Copy, Check, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { EthicalAstrologyBanner } from '../components/Disclaimers';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'Explain the significance of the 7th House in Vedic astrology',
  'What happens during Saturn Sade Sati and how to balance it?',
  'How do Rahu and Ketu karmic axis influence my chart?',
  'What is Manglik Dosha and is it actually harmful?',
  'Which gemstone harmonizes Jupiter in my horoscope?'
];

export const AiAstrologerAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Namaste! I am **AASTRONIQ AI**, your cosmic intelligence assistant.\n\nI can explain Vedic astrological concepts, planetary transits, houses (*Bhavas*), nakshatras, zodiac alignments, and psychological archetypes.\n\nHow may I illuminate your celestial path today?`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const res = await api.askAi(query, historyPayload);
      const modelMsg: Message = {
        role: 'model',
        content: res.reply || 'The cosmic energies are shifting. Please ask your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Unable to reach the celestial servers. Please verify your connection and try again.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'model',
        content: `Conversation reset. I am ready to guide you on any astrology topic or birth chart question.`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="cosmic-glass rounded-2xl p-4 sm:p-5 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-[#080c24] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <span>AASTRONIQ AI Astrologer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Vedic & Western cosmological knowledge engine · Free instant insights
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900/60 border border-purple-500/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <EthicalAstrologyBanner compact />

      {/* Chat Messages Log */}
      <div className="cosmic-glass rounded-3xl border border-purple-500/20 p-4 sm:p-6 min-h-[480px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isUser
                  ? 'bg-purple-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-md shadow-purple-600/30'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-100" />}
              </div>

              {/* Message Bubble */}
              <div className={`relative max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-tr-none shadow-md shadow-purple-700/20'
                  : 'bg-slate-900/90 border border-purple-500/25 text-slate-200 rounded-tl-none shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                <div className={`mt-2 flex items-center justify-between text-[10px] ${isUser ? 'text-purple-200' : 'text-slate-500'} pt-1 border-t border-white/10`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/90 border border-purple-500/25 rounded-2xl rounded-tl-none p-3.5 text-xs text-purple-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Zorvexa AI is consulting cosmic planetary positions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-slate-400 font-medium px-1">Suggested Inquiries:</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-purple-950/60 border border-purple-500/20 text-slate-300 hover:text-white transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about Vedic charts, houses, transits, or horoscopes..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 text-xs sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Entertainment / Safety Notice */}
      <p className="text-[10px] text-center text-slate-500 leading-tight">
        * Zorvexa AI interpretations are generated for educational and cultural discovery. Not a substitute for professional legal, medical, or financial counsel.
      </p>
    </div>
  );
};
