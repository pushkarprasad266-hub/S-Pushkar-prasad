import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, 
  VideoOff, Send, Sparkles, Clock, Compass, ShieldAlert,
  MessageSquare, User, ArrowLeft
} from 'lucide-react';
import { Astrologer } from '../types';

interface ConsultationSessionProps {
  expert: Astrologer;
  initialMode: 'chat' | 'audio' | 'video';
  notes?: string;
  onEnd: () => void;
}

export const ConsultationSessionView: React.FC<ConsultationSessionProps> = ({
  expert,
  initialMode,
  notes,
  onEnd
}) => {
  const [mode, setMode] = useState<'chat' | 'audio' | 'video'>(initialMode);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChartOverlay, setShowChartOverlay] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'expert',
      text: `Namaste! I am ${expert.name}. I have reviewed your astrological energy. ${notes ? `Regarding "${notes}", ` : ''}let us examine the current planetary transits together. What specific aspect of your life would you like to explore?`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (text?: string) => {
    const messageContent = text || inputText;
    if (!messageContent.trim() || isTyping) return;

    const newMsg = {
      sender: 'user',
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    if (!text) setInputText('');
    setIsTyping(true);

    // Realistic expert response generation
    setTimeout(() => {
      const lower = messageContent.toLowerCase();
      let reply = `Looking at your celestial transits, the energy suggests focused patience. The planetary aspects favor strategic preparation. Maintain regular meditation and align your actions with ethical purpose.`;

      if (lower.includes('career') || lower.includes('job') || lower.includes('business')) {
        reply = `Your 10th house of profession (Karma Bhava) is receiving beneficial aspects. The upcoming transition of Jupiter marks a significant window for leadership initiatives. Be cautious about hasty negotiations, but embrace new responsibilities.`;
      } else if (lower.includes('marriage') || lower.includes('love') || lower.includes('relationship')) {
        reply = `In relationship synastry, the 7th house and Venus determine emotional resonance. Open, transparent dialogue will dissolve recent minor friction. A harmonious transit phase approaches over the next few lunar cycles.`;
      } else if (lower.includes('sade sati') || lower.includes('saturn') || lower.includes('shani')) {
        reply = `Saturn's transit tests our inner integrity. Do not view this with fear; it is a period of supreme maturity. Engage in selfless service, practice daily discipline, and chant the Shani Gayatri for spiritual fortitude.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'expert',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Top Session Bar */}
      <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/25 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onEnd}
            className="p-2 rounded-xl bg-slate-900 border border-purple-500/20 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="relative">
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-10 h-10 rounded-xl object-cover border border-purple-400/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#060814]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>{expert.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                Connected
              </span>
            </h3>
            <p className="text-[10px] text-purple-300">{expert.title}</p>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={onEnd}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'chat', label: 'In-App Chat', icon: MessageSquare },
          { id: 'audio', label: 'Audio Consultation', icon: Mic },
          { id: 'video', label: 'Video Call', icon: Video },
        ].map(m => {
          const Icon = m.icon;
          const isAct = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                isAct
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-purple-500/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODE 1: CHAT */}
      {mode === 'chat' && (
        <div className="space-y-3">
          <div className="cosmic-glass rounded-3xl p-4 sm:p-6 border border-purple-500/20 min-h-[440px] max-h-[520px] overflow-y-auto space-y-3">
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isUser ? 'bg-purple-600 text-white' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-purple-500/20 text-slate-200 rounded-tl-none'
                  }`}>
                    <p>{m.text}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5 text-right">{m.time}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-purple-300 p-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span>{expert.name} is examining your planetary transits...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              'When will my career make a breakthrough?',
              'What do the planetary aspects indicate for love?',
              'How to mitigate Saturn Sade Sati stress?'
            ].map(q => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-purple-500/20 text-slate-300 hover:text-white text-[11px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask your astrologer a question..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* MODE 2: AUDIO CALL */}
      {mode === 'audio' && (
        <div className="cosmic-glass rounded-3xl p-8 border border-purple-500/25 flex flex-col items-center justify-center space-y-8 min-h-[440px]">
          <div className="relative">
            {/* Pulsing soundwave rings */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping opacity-30" />
            <div className="absolute -inset-4 rounded-full border border-cyan-400/30 animate-pulse" />
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-2xl relative z-10"
            />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-cinzel text-xl font-bold text-white">{expert.name}</h3>
            <p className="text-xs text-purple-300">{expert.title}</p>
            <p className="text-sm font-mono text-cyan-300 pt-1">{formatTimer(secondsElapsed)}</p>
          </div>

          {/* Simulated audio waveform */}
          <div className="flex items-center gap-1.5 h-12">
            {[40, 65, 85, 30, 95, 70, 50, 90, 60, 80, 45, 75, 30, 85, 55].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full border transition-all ${
                isMuted
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-900 border-purple-500/30 text-slate-300 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={onEnd}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/40"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 rounded-full border transition-all ${
                !isSpeakerOn
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-900 border-purple-500/30 text-slate-300 hover:text-white'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: VIDEO CALL */}
      {mode === 'video' && (
        <div className="relative cosmic-glass rounded-3xl overflow-hidden border border-purple-500/25 min-h-[440px] flex flex-col justify-between p-4">
          {/* Simulated Expert Video Screen */}
          <div className="absolute inset-0 z-0">
            <img
              src={expert.avatar}
              alt="Video Feed"
              className="w-full h-full object-cover filter brightness-75 blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          </div>

          {/* Self-Camera Pip Simulator */}
          <div className="relative z-10 self-end w-32 sm:w-40 aspect-video rounded-2xl overflow-hidden border-2 border-purple-400/50 shadow-2xl bg-slate-900 flex items-center justify-center">
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-950 to-purple-950 flex flex-col items-center justify-center p-2 text-center">
                <User className="w-8 h-8 text-purple-300 mb-1" />
                <span className="text-[10px] text-slate-300">Self Feed (Camera Active)</span>
              </div>
            ) : (
              <div className="text-slate-500 text-xs flex flex-col items-center gap-1">
                <VideoOff className="w-4 h-4" />
                <span className="text-[9px]">Camera Muted</span>
              </div>
            )}
          </div>

          {/* Overlay info and controls */}
          <div className="relative z-10 flex items-center justify-between pt-16">
            <div className="p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-purple-500/30">
              <p className="font-bold text-xs text-white">{expert.name}</p>
              <p className="text-[10px] text-purple-300">{expert.title}</p>
              <span className="text-[10px] font-mono text-cyan-300">{formatTimer(secondsElapsed)}</span>
            </div>

            {/* Video Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-2xl border transition-all ${
                  !isVideoOn ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900/80 border-purple-500/30 text-white'
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl border transition-all ${
                  isMuted ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900/80 border-purple-500/30 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={onEnd}
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/40"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
