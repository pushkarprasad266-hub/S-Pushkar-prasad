import React, { useState, useEffect } from 'react';
import { User, Astrologer } from './types';
import { api } from './services/api';
import { CosmicBackground } from './components/CosmicBackground';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { SubscriptionModal } from './components/SubscriptionModal';

// Views
import { HomeDashboard } from './views/HomeDashboard';
import { AiAstrologerAssistant } from './views/AiAstrologerAssistant';
import { KundliView } from './views/KundliView';
import { HoroscopeView } from './views/HoroscopeView';
import { ExpertsView } from './views/ExpertsView';
import { ConsultationSessionView } from './views/ConsultationSessionView';
import { LiveSessionsView } from './views/LiveSessionsView';
import { MatchmakingView } from './views/MatchmakingView';
import { PanchangView } from './views/PanchangView';
import { TarotView } from './views/TarotView';
import { NumerologyView } from './views/NumerologyView';
import { VastuView } from './views/VastuView';
import { ArticlesView } from './views/ArticlesView';
import { UserProfileView } from './views/UserProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { ServicesDirectoryView } from './views/ServicesDirectoryView';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Initial user fetch
  useEffect(() => {
    api.getCurrentUser()
      .then(u => {
        setUser(u);
        // Check if user has birth details
        if (!u.birthDetails) {
          setShowOnboarding(true);
        }
      })
      .catch(() => {
        // Fallback default user
        setUser({
          id: 'user-demo',
          name: 'Pushkar Prasad',
          email: 'pushkarprasad266@gmail.com',
          role: 'user',
          birthDetails: {
            date: '1998-04-14',
            time: '08:30',
            place: 'New Delhi, India',
            latitude: 28.6139,
            longitude: 77.2090,
            gender: 'male'
          },
          favorites: ['exp-1'],
          savedKundlis: [],
          consultationHistory: [],
          createdAt: new Date().toISOString(),
          avatar: '/assets/aistudio/IMG_20261102_142408_4767b95b.jpg'
        });
      });
  }, []);

  const handleNavigate = (view: string, extra?: any) => {
    // If trial is expired and attempting to access restricted features, open the payment modal
    const premiumViews = ['kundli', 'ai-astrologer', 'consult-session', 'matchmaking'];
    if (user?.subscription?.status === 'expired' && premiumViews.includes(view)) {
      setShowSubscriptionModal(true);
      return;
    }
    setCurrentView(view);
    setViewParams(extra || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = async (updates: Partial<User>) => {
    if (user) {
      try {
        const updated = await api.updateProfile(user.id, updates);
        setUser(updated);
      } catch (e) {
        setUser({ ...user, ...updates } as User);
      }
    }
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 flex flex-col font-outfit relative selection:bg-purple-600 selection:text-white">
      {/* Dynamic Cosmic Starfield & Glow */}
      <CosmicBackground />

      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* First-time Onboarding Modal */}
      {showOnboarding && !showSplash && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* 1-Month Trial & Monthly ₹15 Paywall / Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        user={user}
        onUserUpdate={setUser}
      />

      {/* Top Application Header */}
      <Navbar
        user={user}
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-5 pb-24 z-10">
        {currentView === 'home' && (
          <HomeDashboard
            user={user}
            onNavigate={handleNavigate}
            onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
            onUserUpdate={setUser}
          />
        )}

        {currentView === 'ai-astrologer' && (
          <AiAstrologerAssistant />
        )}

        {currentView === 'kundli' && (
          <KundliView user={user} />
        )}

        {currentView === 'horoscope' && (
          <HoroscopeView initialSign={viewParams?.sign || 'Aries'} />
        )}

        {currentView === 'experts' && (
          <ExpertsView
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'consult-session' && viewParams?.expert && (
          <ConsultationSessionView
            expert={viewParams.expert}
            initialMode={viewParams.mode || 'chat'}
            notes={viewParams.notes}
            onEnd={() => handleNavigate('experts')}
          />
        )}

        {currentView === 'live-sessions' && (
          <LiveSessionsView />
        )}

        {currentView === 'matchmaking' && (
          <MatchmakingView />
        )}

        {currentView === 'panchang' && (
          <PanchangView />
        )}

        {currentView === 'tarot' && (
          <TarotView />
        )}

        {currentView === 'numerology' && (
          <NumerologyView />
        )}

        {currentView === 'vastu' && (
          <VastuView />
        )}

        {currentView === 'articles' && (
          <ArticlesView />
        )}

        {currentView === 'services' && (
          <ServicesDirectoryView onNavigate={handleNavigate} />
        )}

        {currentView === 'profile' && (
          <UserProfileView
            user={user}
            onUserUpdate={setUser}
            onNavigate={handleNavigate}
            initialTab={viewParams?.tab}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Down side at right: Founder of the App Floating Badge */}
      <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-30">
        <button
          type="button"
          onClick={() => handleNavigate('profile', { tab: 'founder' })}
          className="group flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full bg-slate-900/95 hover:bg-slate-800/95 backdrop-blur-xl border border-amber-400/50 hover:border-amber-400 shadow-xl shadow-black/80 hover:shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          title="App Founder: PUSHKAR PRASAD S"
        >
          {/* Small Picture of Founder */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-purple-500 to-cyan-400 shrink-0">
            <img
              src="/assets/aistudio/image_968d68c8.png"
              alt="PUSHKAR PRASAD S - Founder"
              className="w-full h-full object-cover object-top rounded-full"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-[#060814] flex items-center justify-center text-[8px] font-black border border-[#060814]">
              ★
            </span>
          </div>

          <div className="text-left pr-1 hidden xs:block sm:block">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400">
                Founder
              </span>
            </div>
            <span className="font-cinzel text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-200 transition-colors leading-tight block mt-0.5">
              PUSHKAR PRASAD S
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Android-Style Navigation Dock */}
      <BottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
