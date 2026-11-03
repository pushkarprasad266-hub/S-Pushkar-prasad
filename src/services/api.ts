import {
  User,
  UserSubscription,
  Astrologer,
  KundliResult,
  HoroscopeResponse,
  PanchangData,
  GunaMatchResult,
  TarotCardSpread,
  LiveSession
} from '../types';

export const api = {
  // Auth & Profile
  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to fetch user');
    const data = await res.json();
    return data.user;
  },

  async login(email: string, name?: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    if (!res.ok) throw new Error('Failed to login');
    const data = await res.json();
    return data.user;
  },

  async updateProfile(id: string, updates: Partial<User>): Promise<User> {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const data = await res.json();
    return data.user;
  },

  async deleteAccount(id: string): Promise<boolean> {
    const res = await fetch('/api/auth/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return res.ok;
  },

  // 1-Month Trial & Subscription (₹15/month)
  async getSubscriptionStatus(userId?: string): Promise<{ success: boolean; user: User; subscription: UserSubscription }> {
    const res = await fetch(`/api/subscription/status${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch subscription status');
    return res.json();
  },

  async paySubscription(params: { userId?: string; transactionRef?: string; amount?: number }): Promise<{ success: boolean; user: User; subscription: UserSubscription; message: string }> {
    const res = await fetch('/api/subscription/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: params.userId || 'user-demo',
        transactionRef: params.transactionRef,
        amount: params.amount || 15
      })
    });
    if (!res.ok) throw new Error('Failed to process payment');
    return res.json();
  },

  async simulateSubscription(userId: string, state: 'trial' | 'expired' | 'active'): Promise<{ success: boolean; user: User; subscription: UserSubscription }> {
    const res = await fetch('/api/subscription/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, state })
    });
    if (!res.ok) throw new Error('Failed to update subscription simulation');
    return res.json();
  },

  // Kundli
  async calculateKundli(params: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    name?: string;
    place?: string;
    gender?: string;
    saveToProfile?: boolean;
    userId?: string;
  }): Promise<KundliResult> {
    const res = await fetch('/api/astrology/kundli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to generate Kundli');
    const data = await res.json();
    return data.chart;
  },

  // Matchmaking (Guna Milan)
  async calculateMatchmaking(boy: any, girl: any): Promise<{
    match: GunaMatchResult;
    boyVitals: any;
    girlVitals: any;
  }> {
    const res = await fetch('/api/astrology/matchmaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boy, girl })
    });
    if (!res.ok) throw new Error('Failed to compute compatibility');
    return res.json();
  },

  // Horoscope
  async getHoroscope(sign: string, timeframe: string): Promise<HoroscopeResponse> {
    const res = await fetch(`/api/astrology/horoscope?sign=${encodeURIComponent(sign)}&timeframe=${encodeURIComponent(timeframe)}`);
    if (!res.ok) throw new Error('Failed to fetch horoscope');
    return res.json();
  },

  // Panchang
  async getPanchang(date?: string): Promise<PanchangData> {
    const res = await fetch(`/api/astrology/panchang${date ? `?date=${encodeURIComponent(date)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch Panchang');
    const data = await res.json();
    return data.panchang;
  },

  // Tarot
  async getTarotReading(): Promise<{ spread: TarotCardSpread[]; fullDeckCount: number }> {
    const res = await fetch('/api/astrology/tarot');
    if (!res.ok) throw new Error('Failed to draw Tarot cards');
    return res.json();
  },

  // Numerology
  async getNumerology(name: string, dob: string) {
    const res = await fetch('/api/astrology/numerology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, dob })
    });
    if (!res.ok) throw new Error('Failed to calculate numerology');
    return res.json();
  },

  // Vastu
  async getVastuZones() {
    const res = await fetch('/api/astrology/vastu');
    if (!res.ok) throw new Error('Failed to fetch Vastu guide');
    return res.json();
  },

  // AI Assistant Chat
  async askAi(prompt: string, history: any[] = []) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history })
    });
    if (!res.ok) throw new Error('Failed to query AI');
    return res.json();
  },

  // Experts
  async getExperts(specialization?: string): Promise<Astrologer[]> {
    const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : '';
    const res = await fetch(`/api/experts${query}`);
    if (!res.ok) throw new Error('Failed to fetch experts');
    const data = await res.json();
    return data.experts;
  },

  async getExpertDetail(id: string): Promise<{ expert: Astrologer; reviews: any[] }> {
    const res = await fetch(`/api/experts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch expert detail');
    return res.json();
  },

  async submitReview(expertId: string, payload: { rating: number; comment: string; userName: string; userId?: string }) {
    const res = await fetch(`/api/experts/${expertId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Consultation Booking
  async bookConsultation(params: { userId: string; expertId: string; serviceType: 'chat' | 'audio' | 'video'; notes?: string }) {
    const res = await fetch('/api/consultations/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to book consultation');
    return res.json();
  },

  // Live Sessions
  async getLiveSessions(): Promise<LiveSession[]> {
    const res = await fetch('/api/live-sessions');
    if (!res.ok) throw new Error('Failed to fetch live sessions');
    const data = await res.json();
    return data.liveSessions;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  // Admin
  async getAdminStats() {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminReviews() {
    const res = await fetch('/api/admin/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async updateReviewStatus(id: string, status: string) {
    const res = await fetch('/api/admin/review-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    return res.json();
  },

  async saveAstrologer(data: any) {
    const res = await fetch('/api/admin/astrologer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async broadcastNotification(title: string, message: string, type: string) {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, type })
    });
    return res.json();
  }
};
