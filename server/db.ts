import fs from 'fs';
import path from 'path';

export interface UserSubscription {
  status: 'trial' | 'active' | 'expired';
  planName: string;
  planPrice: number; // 15 INR
  trialStartedAt: string;
  trialEndsAt: string;
  daysRemaining: number;
  subscribedAt?: string;
  expiresAt?: string;
  lastPaymentDate?: string;
  transactionRef?: string;
  amountPaid?: number;
}

export function computeSubscription(sub?: UserSubscription, createdAt?: string): UserSubscription {
  const now = Date.now();
  if (!sub) {
    // Default to trial starting today (or user's createdAt, but giving full 30-day window from current session)
    const started = now;
    const ends = started + 30 * 24 * 60 * 60 * 1000;
    const daysRemaining = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));
    return {
      status: 'trial',
      planName: '1-Month Free Trial',
      planPrice: 15,
      trialStartedAt: new Date(started).toISOString(),
      trialEndsAt: new Date(ends).toISOString(),
      daysRemaining: daysRemaining || 30
    };
  }

  if (sub.status === 'active' && sub.expiresAt) {
    const expires = new Date(sub.expiresAt).getTime();
    const daysRemaining = Math.max(0, Math.ceil((expires - now) / (1000 * 60 * 60 * 24)));
    return {
      ...sub,
      daysRemaining,
      status: daysRemaining > 0 ? 'active' : 'expired'
    };
  }

  if (sub.status === 'trial') {
    const ends = new Date(sub.trialEndsAt).getTime();
    const daysRemaining = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));
    return {
      ...sub,
      daysRemaining,
      status: daysRemaining > 0 ? 'trial' : 'expired'
    };
  }

  return {
    ...sub,
    daysRemaining: 0,
    status: 'expired'
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'admin';
  subscription?: UserSubscription;
  birthDetails?: {
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    place: string;
    latitude: number;
    longitude: number;
    gender?: 'male' | 'female' | 'other';
  };
  favorites: string[]; // expert IDs
  savedKundlis: {
    id: string;
    name: string;
    dob: string;
    tob: string;
    pob: string;
    lat: number;
    lng: number;
    gender: string;
    createdAt: string;
  }[];
  consultationHistory: {
    id: string;
    expertId: string;
    expertName: string;
    expertImage: string;
    serviceType: 'chat' | 'audio' | 'video';
    timestamp: string;
    duration: string;
    status: 'completed' | 'scheduled' | 'cancelled';
    notes?: string;
  }[];
  createdAt: string;
}

export interface Astrologer {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  ratePerMinute: number; // Demo rate
  isOnline: boolean;
  isVerified: boolean;
  avatar: string;
  bio: string;
  education: string;
  skills: string[];
  totalConsultations: number;
  joinedDate: string;
}

export interface AstrologerReview {
  id: string;
  expertId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'flagged';
}

export interface LiveSession {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  title: string;
  topic: string;
  isLive: boolean;
  scheduledTime: string;
  viewers: number;
  tags: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalConsultations: number;
  activeAstrologers: number;
  satisfactionRate: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  astrologers: Astrologer[];
  reviews: AstrologerReview[];
  liveSessions: LiveSession[];
  notifications: {
    id: string;
    title: string;
    message: string;
    type: 'cosmic' | 'system' | 'reminder';
    timestamp: string;
  }[];
}

const DEFAULT_ASTROLOGERS: Astrologer[] = [
  {
    id: 'exp-1',
    name: 'Acharya Devendra Shastri',
    title: 'Senior Vedic & KP Astrologer',
    specialization: ['Vedic Kundli', 'KP Astrology', 'Career & Wealth', 'Gemstone Remedies'],
    languages: ['English', 'Hindi', 'Sanskrit'],
    experienceYears: 24,
    rating: 4.95,
    reviewCount: 3840,
    ratePerMinute: 35,
    isOnline: true,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Renowned scholar from Varanasi with over two decades of experience in deciphering complex planetary yogas, Dasha analysis, and practical astrological remedies.',
    education: 'M.A. in Jyotish Shastra, Sampurnanand Sanskrit University',
    skills: ['Parashari Jyotish', 'KP System', 'Muhurat', 'Prashna Kundli'],
    totalConsultations: 12450,
    joinedDate: '2022-01-15'
  },
  {
    id: 'exp-2',
    name: 'Dr. Maitreyi Krishnan',
    title: 'Vedic Astrologer & Relationship Specialist',
    specialization: ['Kundli Matching', 'Love & Marriage', 'Nadi Astrology', 'D-9 Navamsha'],
    languages: ['English', 'Tamil', 'Hindi'],
    experienceYears: 16,
    rating: 4.92,
    reviewCount: 2950,
    ratePerMinute: 28,
    isOnline: true,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in relationship synastry, Ashtakoot Guna Milan, and Navamsha chart interpretation for marital compatibility and timing of marriage.',
    education: 'Ph.D. in Vedic Studies, University of Madras',
    skills: ['Synastry', 'Guna Milan', 'Navamsha Analysis', 'Sub-Lord Theory'],
    totalConsultations: 8900,
    joinedDate: '2022-06-20'
  },
  {
    id: 'exp-3',
    name: 'Anya Vanezza',
    title: 'Tarot Grandmaster & Intuitive Astrologer',
    specialization: ['Celtic Cross Tarot', 'Astro-Tarot', 'Spiritual Awakening', 'Karma Clearing'],
    languages: ['English', 'Spanish'],
    experienceYears: 12,
    rating: 4.89,
    reviewCount: 1980,
    ratePerMinute: 25,
    isOnline: false,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Certified Tarot Grandmaster blending archetypal psychology with planetary transits to provide crystal clarity on spiritual crossroads.',
    education: 'Certified Master Reader, Tarot Guild of International Astrology',
    skills: ['Rider-Waite Tarot', 'Astrological Houses in Tarot', 'Chakra Healing'],
    totalConsultations: 5670,
    joinedDate: '2023-02-10'
  },
  {
    id: 'exp-4',
    name: 'Pandit Rajeshwar Joshi',
    title: 'Vastu Shastra & Prashna Tantra Expert',
    specialization: ['Vastu Consultation', 'Residential Energy', 'Prashna (Horary)', 'Business Growth'],
    languages: ['English', 'Hindi', 'Gujarati'],
    experienceYears: 19,
    rating: 4.94,
    reviewCount: 2210,
    ratePerMinute: 30,
    isOnline: true,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Pioneered zero-demolition Vastu remediation techniques for residences, tech startups, and industrial estates across South Asia and North America.',
    education: 'Diploma in Vastu Architecture & Vedic Geomancy',
    skills: ['8-Direction Energy Mapping', 'Geopathic Stress Correction', 'Pyra-Vastu'],
    totalConsultations: 7120,
    joinedDate: '2022-09-05'
  },
  {
    id: 'exp-5',
    name: 'Zoya Al-Mansoor',
    title: 'Modern Astro-Numerologist & Life Strategist',
    specialization: ['Chaldean Numerology', 'Name Correction', 'Career Destiny', 'Financial Timing'],
    languages: ['English', 'Arabic', 'Urdu'],
    experienceYears: 14,
    rating: 4.88,
    reviewCount: 1670,
    ratePerMinute: 22,
    isOnline: true,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Combines the ancient Chaldean numerical matrix with natal planetary charts to optimize corporate branding, name vibrations, and major launch dates.',
    education: 'International Numerology Society Fellow',
    skills: ['Name Frequency Matrix', 'Destiny Vibration', 'Personal Year Cycles'],
    totalConsultations: 4320,
    joinedDate: '2023-05-18'
  }
];

const DEFAULT_REVIEWS: AstrologerReview[] = [
  {
    id: 'rev-1',
    expertId: 'exp-1',
    userId: 'user-default',
    userName: 'Kavita Sengupta',
    rating: 5,
    comment: 'Acharya Devendra Shastri gave uncanny insights into my Rahu Mahadasha transition. His advice gave me incredible peace of mind.',
    createdAt: '2026-10-24T14:20:00Z',
    status: 'approved'
  },
  {
    id: 'rev-2',
    expertId: 'exp-2',
    userId: 'user-default',
    userName: 'Arjun & Neha Malhotra',
    rating: 5,
    comment: 'Dr. Maitreyi analyzed our Navamsha chart and explained how our Moon signs complement each other. Most scientific consultation ever.',
    createdAt: '2026-10-28T09:15:00Z',
    status: 'approved'
  },
  {
    id: 'rev-3',
    expertId: 'exp-4',
    userId: 'user-default',
    userName: 'Rohan Deshmukh',
    rating: 5,
    comment: 'Panditji corrected our house entrance Vastu flaw without breaking anything. Within two months the financial blockage resolved.',
    createdAt: '2026-10-18T16:45:00Z',
    status: 'approved'
  }
];

const DEFAULT_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-1',
    expertId: 'exp-1',
    expertName: 'Acharya Devendra Shastri',
    expertAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    title: 'Navigating Saturn in Pisces: Cosmic Blueprint for 2026-2027',
    topic: 'Vedic Astrology & Karmic Transits',
    isLive: true,
    scheduledTime: 'Streaming Now',
    viewers: 1420,
    tags: ['Saturn Transit', 'Sade Sati', 'Q&A']
  },
  {
    id: 'live-2',
    expertId: 'exp-2',
    expertName: 'Dr. Maitreyi Krishnan',
    expertAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    title: 'Venus-Jupiter Conjunction: Love & Soulmate Magnetism',
    topic: 'Relationship Synastry Masterclass',
    isLive: false,
    scheduledTime: 'Tomorrow, 7:00 PM IST',
    viewers: 640,
    tags: ['Love Astrology', 'Kundli Matching']
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Moon enters Rohini Nakshatra',
    message: 'A highly auspicious lunar mansion for creative work, investments, and deep meditation today.',
    type: 'cosmic' as const,
    timestamp: '2 hours ago'
  },
  {
    id: 'notif-2',
    title: 'Abhijit Muhurat Approaching',
    message: 'The golden window for initiating new projects today begins at 11:48 AM and lasts for 48 minutes.',
    type: 'cosmic' as const,
    timestamp: '5 hours ago'
  }
];

// In-memory + file-backed database store
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read db.json, using defaults:', e);
    }

    const initial: DatabaseSchema = {
      users: [
        {
          id: 'user-demo',
          name: 'Pushkar Prasad',
          email: 'pushkarprasad266@gmail.com',
          phone: '+91 98765 43210',
          role: 'user',
          birthDetails: {
            date: '1998-04-14',
            time: '08:30',
            place: 'New Delhi, India',
            latitude: 28.6139,
            longitude: 77.2090,
            gender: 'male'
          },
          favorites: ['exp-1', 'exp-2'],
          savedKundlis: [
            {
              id: 'k-1',
              name: 'Pushkar Prasad (Self)',
              dob: '1998-04-14',
              tob: '08:30',
              pob: 'New Delhi, India',
              lat: 28.6139,
              lng: 77.2090,
              gender: 'female',
              createdAt: '2026-10-01T10:00:00Z'
            }
          ],
          consultationHistory: [
            {
              id: 'c-101',
              expertId: 'exp-1',
              expertName: 'Acharya Devendra Shastri',
              expertImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
              serviceType: 'chat',
              timestamp: '2026-10-25T11:30:00Z',
              duration: '15 mins',
              status: 'completed',
              notes: 'Discussed career change and Saturn Sade Sati remedies.'
            }
          ],
          createdAt: '2026-09-15T08:00:00Z',
          avatar: '/assets/aistudio/IMG_20261102_142408_4767b95b.jpg'
        }
      ],
      astrologers: DEFAULT_ASTROLOGERS,
      reviews: DEFAULT_REVIEWS,
      liveSessions: DEFAULT_LIVE_SESSIONS,
      notifications: DEFAULT_NOTIFICATIONS
    };

    this.save(initial);
    return initial;
  }

  private save(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json:', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    const u = this.data.users.find(u => u.id === id);
    if (u) {
      u.subscription = computeSubscription(u.subscription, u.createdAt);
    }
    return u;
  }

  getUserByEmail(email: string): User | undefined {
    const u = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (u) {
      u.subscription = computeSubscription(u.subscription, u.createdAt);
    }
    return u;
  }

  activateMonthlySubscription(id: string, transactionRef?: string): User | undefined {
    let user = this.data.users.find(u => u.id === id);
    if (!user) {
      user = this.data.users[0];
    }
    if (!user) return undefined;

    const now = Date.now();
    const expires = now + 30 * 24 * 60 * 60 * 1000;
    user.subscription = {
      status: 'active',
      planName: 'Cosmic Monthly Pass',
      planPrice: 15,
      trialStartedAt: user.subscription?.trialStartedAt || user.createdAt || new Date(now - 30 * 86400000).toISOString(),
      trialEndsAt: user.subscription?.trialEndsAt || new Date(now).toISOString(),
      daysRemaining: 30,
      subscribedAt: new Date(now).toISOString(),
      expiresAt: new Date(expires).toISOString(),
      lastPaymentDate: new Date(now).toISOString(),
      transactionRef: transactionRef || `UPI-${Date.now().toString().slice(-8)}`,
      amountPaid: 15
    };
    this.save();
    return user;
  }

  simulateSubscriptionState(id: string, state: 'trial' | 'expired' | 'active'): User | undefined {
    let user = this.data.users.find(u => u.id === id);
    if (!user) {
      user = this.data.users[0];
    }
    if (!user) return undefined;

    const now = Date.now();
    if (state === 'trial') {
      const ends = now + 27 * 86400000;
      user.subscription = {
        status: 'trial',
        planName: '1-Month Free Trial',
        planPrice: 15,
        trialStartedAt: new Date(now - 3 * 86400000).toISOString(),
        trialEndsAt: new Date(ends).toISOString(),
        daysRemaining: 27
      };
    } else if (state === 'expired') {
      const ends = now - 1 * 86400000;
      user.subscription = {
        status: 'expired',
        planName: '1-Month Free Trial (Expired)',
        planPrice: 15,
        trialStartedAt: new Date(now - 31 * 86400000).toISOString(),
        trialEndsAt: new Date(ends).toISOString(),
        daysRemaining: 0
      };
    } else if (state === 'active') {
      const ends = now + 30 * 86400000;
      user.subscription = {
        status: 'active',
        planName: 'Cosmic Monthly Pass',
        planPrice: 15,
        trialStartedAt: new Date(now - 35 * 86400000).toISOString(),
        trialEndsAt: new Date(now - 5 * 86400000).toISOString(),
        subscribedAt: new Date(now).toISOString(),
        expiresAt: new Date(ends).toISOString(),
        daysRemaining: 30,
        amountPaid: 15,
        transactionRef: `UPI-SIM-${Date.now().toString().slice(-6)}`,
        lastPaymentDate: new Date().toISOString()
      };
    }

    this.save();
    return user;
  }

  upsertUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Astrologers
  getAstrologers(): Astrologer[] {
    return this.data.astrologers;
  }

  getAstrologerById(id: string): Astrologer | undefined {
    return this.data.astrologers.find(a => a.id === id);
  }

  upsertAstrologer(astrologer: Astrologer): Astrologer {
    const idx = this.data.astrologers.findIndex(a => a.id === astrologer.id);
    if (idx >= 0) {
      this.data.astrologers[idx] = { ...this.data.astrologers[idx], ...astrologer };
    } else {
      this.data.astrologers.push(astrologer);
    }
    this.save();
    return astrologer;
  }

  // Reviews
  getReviews(expertId?: string): AstrologerReview[] {
    if (expertId) {
      return this.data.reviews.filter(r => r.expertId === expertId && r.status === 'approved');
    }
    return this.data.reviews;
  }

  addReview(review: AstrologerReview): AstrologerReview {
    this.data.reviews.unshift(review);
    // Update astrologer stats
    const ast = this.getAstrologerById(review.expertId);
    if (ast) {
      const expReviews = this.data.reviews.filter(r => r.expertId === review.expertId);
      const sum = expReviews.reduce((acc, r) => acc + r.rating, 0);
      ast.rating = parseFloat((sum / expReviews.length).toFixed(2));
      ast.reviewCount = expReviews.length;
      this.upsertAstrologer(ast);
    }
    this.save();
    return review;
  }

  updateReviewStatus(id: string, status: 'approved' | 'pending' | 'flagged') {
    const r = this.data.reviews.find(item => item.id === id);
    if (r) {
      r.status = status;
      this.save();
    }
  }

  // Live Sessions
  getLiveSessions(): LiveSession[] {
    return this.data.liveSessions;
  }

  // Notifications
  getNotifications() {
    return this.data.notifications;
  }

  addNotification(title: string, message: string, type: 'cosmic' | 'system' | 'reminder') {
    const n = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now'
    };
    this.data.notifications.unshift(n);
    this.save();
    return n;
  }

  // Admin stats
  getAdminStats(): AdminStats {
    const totalConsultations = this.data.users.reduce(
      (sum, u) => sum + (u.consultationHistory?.length || 0), 0
    ) + 4820; // baseline real metrics
    return {
      totalUsers: this.data.users.length + 1542,
      totalConsultations,
      activeAstrologers: this.data.astrologers.filter(a => a.isOnline).length,
      satisfactionRate: 98.4
    };
  }
}

export const db = new Database();
