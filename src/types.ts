export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SANSKRIT_SIGNS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrishchika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

export interface PlanetaryPosition {
  name: string;
  sanskritName: string;
  longitude: number;
  sign: string;
  signIndex: number;
  degreeInSign: number;
  house: number;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  isRetrograde: boolean;
  dignity: 'Exalted' | 'Moolatrikona' | 'Own' | 'Friend' | 'Neutral' | 'Enemy' | 'Debilitated';
}

export interface KundliResult {
  ayanamsa: number;
  julianDay: number;
  ascendant: {
    longitude: number;
    sign: string;
    signIndex: number;
    degreeInSign: number;
    nakshatra: string;
    pada: number;
  };
  planets: PlanetaryPosition[];
  houses: {
    houseNumber: number;
    sign: string;
    signIndex: number;
    ruler: string;
    occupants: string[];
  }[];
  doshas: {
    isManglik: boolean;
    manglikSeverity: 'None' | 'Mild' | 'Moderate' | 'High';
    manglikReason: string;
    hasKaalSarp: boolean;
    kaalSarpType?: string;
    sadeSatiStatus: {
      inSadeSati: boolean;
      phase: 'None' | 'Rising (First Phase)' | 'Peak (Second Phase)' | 'Setting (Third Phase)';
      description: string;
    };
  };
  vitals: {
    rashi: string;
    sunSign: string;
    nakshatra: string;
    nakshatraLord: string;
    charan: number;
    varna: string;
    vashya: string;
    yoni: string;
    gana: string;
    nadi: string;
  };
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
  ratePerMinute: number;
  isOnline: boolean;
  isVerified: boolean;
  avatar: string;
  bio: string;
  education: string;
  skills: string[];
  totalConsultations: number;
  joinedDate: string;
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'admin';
  subscription?: UserSubscription;
  birthDetails?: {
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    gender?: 'male' | 'female' | 'other';
  };
  favorites: string[];
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

export interface HoroscopeResponse {
  sign: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  element: string;
  ruler: string;
  luckyNumber: number;
  luckyColor: string;
  mantra: string;
  data: {
    headline: string;
    general: string;
    love: string;
    career: string;
    health: string;
  };
}

export interface PanchangData {
  date: string;
  day: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  sunSign: string;
  moonSign: string;
  auspiciousTimings: {
    abhijitMuhurat: string;
    amritKalam: string;
    brahmaMuhurta: string;
  };
  inauspiciousTimings: {
    rahuKaal: string;
    yamaganda: string;
    gulikaKaal: string;
  };
  recommendation: string;
}

export interface GunaMatchResult {
  totalScore: number;
  maxScore: number;
  recommendation: string;
  verdictColor: string;
  isManglikCompatible: boolean;
  breakdown: {
    name: string;
    score: number;
    max: number;
    desc: string;
  }[];
}

export interface TarotCardSpread {
  position: string;
  card: {
    id: string;
    name: string;
    arcana: string;
    upright: string;
    reversed: string;
    element: string;
  };
  isReversed: boolean;
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
