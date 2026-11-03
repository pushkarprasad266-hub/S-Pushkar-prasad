import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import { generateVedicKundli, calculateGunaMilan, ZODIAC_SIGNS } from './server/astrologyCalc.ts';
import { askAstrologyAssistant } from './server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Routes

// 1. Auth & User Profile
app.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: name || 'Cosmic Seeker',
      email,
      role: email.includes('admin') ? 'admin' : 'user',
      favorites: ['exp-1'],
      savedKundlis: [],
      consultationHistory: [],
      createdAt: new Date().toISOString()
    };
    db.upsertUser(user);
  }
  return res.json({ success: true, user });
});

app.get('/api/auth/me', (req, res) => {
  const users = db.getUsers();
  const firstUser = users[0];
  const user = firstUser ? db.getUserById(firstUser.id) : {
    id: 'user-demo',
    name: 'Pushkar Prasad',
    email: 'pushkarprasad266@gmail.com',
    role: 'user',
    favorites: ['exp-1'],
    savedKundlis: [],
    consultationHistory: [],
    createdAt: new Date().toISOString()
  };
  return res.json({ user });
});

// Subscription & 1-Month Trial Endpoints
app.get('/api/subscription/status', (req, res) => {
  const userId = (req.query.userId as string) || 'user-demo';
  const user = db.getUserById(userId) || db.getUsers()[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    success: true,
    user,
    subscription: user.subscription
  });
});

app.post('/api/subscription/pay', (req, res) => {
  const { userId, transactionRef, amount } = req.body;
  const targetId = userId || 'user-demo';
  const updatedUser = db.activateMonthlySubscription(targetId, transactionRef);
  if (!updatedUser) {
    return res.status(404).json({ error: 'Failed to activate subscription' });
  }

  // Add system notification for receipt confirmation
  db.addNotification(
    '₹15 Subscription Activated',
    `Cosmic Monthly Pass active until ${new Date(updatedUser.subscription?.expiresAt || '').toLocaleDateString()}. UTR: ${updatedUser.subscription?.transactionRef}`,
    'system'
  );

  return res.json({
    success: true,
    message: 'Subscription successfully activated for ₹15/month!',
    user: updatedUser,
    subscription: updatedUser.subscription
  });
});

app.post('/api/subscription/simulate', (req, res) => {
  const { userId, state } = req.body;
  const targetId = userId || 'user-demo';
  const updatedUser = db.simulateSubscriptionState(targetId, state);
  return res.json({
    success: true,
    user: updatedUser,
    subscription: updatedUser?.subscription
  });
});

app.post('/api/auth/update-profile', (req, res) => {
  const { id, name, phone, avatar, birthDetails } = req.body;
  let user = db.getUserById(id);
  if (!user) {
    const users = db.getUsers();
    user = users[0];
  }

  if (user) {
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (birthDetails) user.birthDetails = birthDetails;
    db.upsertUser(user);
    return res.json({ success: true, user });
  }
  return res.status(404).json({ error: 'User not found' });
});

app.post('/api/auth/delete', (req, res) => {
  const { id } = req.body;
  if (id) {
    db.deleteUser(id);
  }
  return res.json({ success: true, message: 'Account and personal birth information deleted successfully.' });
});

// 2. Astrology Engine - Vedic Kundli Generation
app.post('/api/astrology/kundli', (req, res) => {
  try {
    const { date, time, latitude, longitude, name, saveToProfile, userId } = req.body;
    
    // Parse date & time
    const dateObj = new Date(date || '1998-04-14');
    const [hourStr, minStr] = (time || '12:00').split(':');
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hour = parseInt(hourStr || '12', 10);
    const minute = parseInt(minStr || '0', 10);
    const lat = typeof latitude === 'number' ? latitude : 28.6139; // default New Delhi
    const lng = typeof longitude === 'number' ? longitude : 77.2090;

    const chart = generateVedicKundli(year, month, day, hour, minute, lat, lng);

    if (saveToProfile && userId) {
      const user = db.getUserById(userId);
      if (user) {
        user.savedKundlis = user.savedKundlis || [];
        user.savedKundlis.push({
          id: `k-${Date.now()}`,
          name: name || 'Birth Chart',
          dob: date,
          tob: time,
          pob: req.body.place || 'Custom Coordinates',
          lat,
          lng,
          gender: req.body.gender || 'unspecified',
          createdAt: new Date().toISOString()
        });
        db.upsertUser(user);
      }
    }

    return res.json({ success: true, chart });
  } catch (err: any) {
    console.error('Kundli calculation error:', err);
    return res.status(500).json({ error: 'Failed to compute astrological birth chart.' });
  }
});

// 3. Kundli Matching (Guna Milan)
app.post('/api/astrology/matchmaking', (req, res) => {
  try {
    const { boy, girl } = req.body;
    const bDate = new Date(boy.date || '1996-05-20');
    const [bH, bM] = (boy.time || '14:30').split(':');
    const boyChart = generateVedicKundli(
      bDate.getFullYear(), bDate.getMonth() + 1, bDate.getDate(),
      parseInt(bH || '14', 10), parseInt(bM || '30', 10),
      boy.latitude || 28.6139, boy.longitude || 77.2090
    );

    const gDate = new Date(girl.date || '1998-09-12');
    const [gH, gM] = (girl.time || '10:15').split(':');
    const girlChart = generateVedicKundli(
      gDate.getFullYear(), gDate.getMonth() + 1, gDate.getDate(),
      parseInt(gH || '10', 10), parseInt(gM || '15', 10),
      girl.latitude || 28.6139, girl.longitude || 77.2090
    );

    const match = calculateGunaMilan(boyChart, girlChart);
    return res.json({ success: true, match, boyVitals: boyChart.vitals, girlVitals: girlChart.vitals });
  } catch (err: any) {
    console.error('Matchmaking error:', err);
    return res.status(500).json({ error: 'Failed to compute Ashtakoot compatibility.' });
  }
});

// 4. Horoscopes (Daily, Weekly, Monthly, Yearly)
app.get('/api/astrology/horoscope', (req, res) => {
  const sign = (req.query.sign as string) || 'Aries';
  const timeframe = (req.query.timeframe as string) || 'daily';

  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  const signName = signIndex >= 0 ? ZODIAC_SIGNS[signIndex] : 'Aries';

  const HOROSCOPES_DATA: Record<string, any> = {
    Aries: {
      element: 'Fire',
      ruler: 'Mars',
      luckyNumber: 9,
      luckyColor: 'Electric Crimson',
      mantra: 'Om Angarakaya Namaha',
      daily: {
        headline: 'Dynamic Surge of Creative Leadership',
        general: 'Mars aligns favorably with your solar house of initiatives. A bold proposal you have been formulating gains momentum today.',
        love: 'Sparks fly through candid, playful communication. Single Arians may encounter an electric connection in intellectual gatherings.',
        career: 'Decisive action pays dividends. Stand firm in meetings and trust your instinctive problem-solving acumen.',
        health: 'High stamina, but watch for muscle tension around the neck and shoulders. Stay well-hydrated.'
      },
      weekly: {
        headline: 'Expanding Horizons and Resource Consolidation',
        general: 'This week highlights strategic alliances. Mid-week brings clarity on a stalled financial contract.',
        love: 'Deep mutual respect deepens your bond. Plan a meaningful quiet evening together away from screens.',
        career: 'Praise from leadership or a prospective client marks Thursday as a milestone day.',
        health: 'Incorporate interval training and restful sleep cycles to sustain high vitality.'
      },
      monthly: {
        headline: 'Solar Awakening in Professional Aspirations',
        general: 'A transformative lunar cycle urges you to discard obsolete habits and embrace innovative digital tools.',
        love: 'Emotional maturity transforms past misunderstandings into mutual empathy.',
        career: 'A major milestone or promotion discussion becomes concrete in the third week.',
        health: 'Prioritize balanced nutrition and grounding breathwork to harmonize fire energy.'
      },
      yearly: {
        headline: 'The Year of Unstoppable Elevation (2026)',
        general: 'With Jupiter casting benevolent trines, 2026 marks an epochal year for your personal brand and spiritual wisdom.',
        love: 'Long-term commitments, marriage vows, or soulmate reunions are strongly favored under the mid-year transits.',
        career: 'Breakthrough opportunities in technology, entrepreneurship, and global leadership emerge.',
        health: 'Robust vitality provided you respect physical rest and avoid burn-out spikes.'
      }
    },
    Taurus: {
      element: 'Earth',
      ruler: 'Venus',
      luckyNumber: 6,
      luckyColor: 'Emerald Green',
      mantra: 'Om Shukraya Namaha',
      daily: {
        headline: 'Harmonious Aesthetics & Financial Acumen',
        general: 'Venus bestows an aura of calm elegance around your decisions today. Financial negotiations proceed in your favor.',
        love: 'Sensory comforts and heartfelt gestures strengthen romance. A heartfelt compliment goes a very long way.',
        career: 'Attention to craftsmanship and practical execution makes your work stand out effortlessly.',
        health: 'Gentle stretching and spending time outdoors will restore your energetic equilibrium.'
      },
      weekly: {
        headline: 'Value Realization and Creative Synthesis',
        general: 'A steady, reliable pace brings major triumphs. Expect positive news regarding real estate or investments.',
        love: 'Peaceful harmony prevails. You feel deeply understood and supported by your partner.',
        career: 'A collaborative project moves swiftly toward completion under your steady guidance.',
        health: 'Support your throat chakra with warm herbal teas and vocal exercises.'
      },
      monthly: {
        headline: 'Abundance Flourishes Through Methodical Focus',
        general: 'This month presents multiple avenues to diversify income and cultivate aesthetic beauty in your living space.',
        love: 'New romantic chapters unfold for singles through shared art, culinary, or nature interests.',
        career: 'Your reliability earns trust from key decision-makers, leading to strategic perks.',
        health: 'Pay attention to thyroid health and wholesome seasonal organic foods.'
      },
      yearly: {
        headline: 'The Year of Enduring Legacy (2026)',
        general: 'Uranus completes its transformative cycle in your sign, leaving you more adaptable, prosperous, and self-assured.',
        love: 'Deep emotional bonds solidify with renewed shared dreams and mutual financial goals.',
        career: 'Sustainable expansion in wealth, creative ventures, and professional prestige.',
        health: 'High physical resilience when connected to regular nature walks and mindful meals.'
      }
    },
    Gemini: {
      element: 'Air',
      ruler: 'Mercury',
      luckyNumber: 5,
      luckyColor: 'Citrine Yellow',
      mantra: 'Om Budhaya Namaha',
      daily: {
        headline: 'Intellectual Brilliance & Social Synchronicities',
        general: 'Mercury enhances your eloquence, negotiation ability, and mental agility today. An impromptu conversation opens unexpected doors.',
        love: 'Witty banter and playful discussions spark instant attraction. Be honest about your long-term relationship hopes.',
        career: 'Multi-tasking comes with effortless grace. Excellent time for pitch decks, code releases, or digital content creation.',
        health: 'Take screen breaks to rest the eyes and practice rhythmic alternate-nostril breathing (Nadi Shodhana).'
      }
    },
    Cancer: {
      element: 'Water',
      ruler: 'Moon',
      luckyNumber: 2,
      luckyColor: 'Silver Pearl',
      mantra: 'Om Chandraya Namaha',
      daily: {
        headline: 'Deep Intuitive Wisdom & Emotional Sanctuary',
        general: 'The Moon heightens your psychic sensitivity and protective instincts. Prioritize creative expression and your inner sacred circle.',
        love: 'Tender vulnerability builds unbreakable emotional bridges. A cozy home-cooked dinner works romantic wonders.',
        career: 'Trust your gut feelings in team negotiations. Your empathetic leadership resolves a subtle workplace conflict.',
        health: 'Nourish digestion with soothing broths and warm teas. Allow yourself time near moving water.'
      }
    },
    Leo: {
      element: 'Fire',
      ruler: 'Sun',
      luckyNumber: 1,
      luckyColor: 'Radiant Gold',
      mantra: 'Om Suryaya Namaha',
      daily: {
        headline: 'Magnetic Radiance & Solar Sovereign Leadership',
        general: 'The Sun energizes your core self with charismatic confidence. Others naturally gravitate toward your warmth and visionary outlook.',
        love: 'Generous affection and romantic grandeur make your partner feel cherished. Singles attract passionate admirers.',
        career: 'Step into the spotlight during key presentations. Your bold, creative solutions earn executive admiration.',
        health: 'High cardiovascular vitality. Channel excess fire through invigorating workouts or expressive dancing.'
      }
    },
    Virgo: {
      element: 'Earth',
      ruler: 'Mercury',
      luckyNumber: 5,
      luckyColor: 'Sage Emerald',
      mantra: 'Om Budhaya Namaha',
      daily: {
        headline: 'Precision Problem Solving & Methodical Progress',
        general: 'Your keen analytical faculties cut through confusion with clinical precision. Streamlining routines creates massive future freedom.',
        love: 'Acts of practical service speak louder than grand gestures. Show care through thoughtful daily support.',
        career: 'Auditing complex workflows and organizing technical documentation produces stellar productivity.',
        health: 'Support gut health with probiotics and fiber. Ensure regular posture alignment during deep work sprints.'
      }
    },
    Libra: {
      element: 'Air',
      ruler: 'Venus',
      luckyNumber: 6,
      luckyColor: 'Rose Quartz & Opal',
      mantra: 'Om Shukraya Namaha',
      daily: {
        headline: 'Artistic Harmony & Diplomatic Mastery',
        general: 'Venus bestows graceful equilibrium on all interactions. Bridges are easily built between contrasting opinions today.',
        love: 'Harmonious mutual understanding creates romantic bliss. Plan a cultural date or art gallery visit.',
        career: 'Mediation, client partnerships, and design aesthetics flourish under today’s planetary transits.',
        health: 'Balance hydration and kidney wellness. Practice gentle yoga or Pilates to align the spine.'
      }
    },
    Scorpio: {
      element: 'Water',
      ruler: 'Mars & Ketu',
      luckyNumber: 9,
      luckyColor: 'Deep Obsidian',
      mantra: 'Om Kraam Kreem Kroum Sah Bhaumaya Namaha',
      daily: {
        headline: 'Alchemical Transformation & Unwavering Focus',
        general: 'Planetary currents reveal hidden truths and unlock laser-focused determination. Shed outdated fears and embrace your sovereign power.',
        love: 'Deep, transformative emotional intimacy. Superficial small talk is replaced by soulful confession and passionate devotion.',
        career: 'In-depth research, financial restructuring, or investigative troubleshooting yields breakthrough answers.',
        health: 'Detoxify body and mind with clean hydration, sauna sessions, and silent meditation.'
      }
    },
    Sagittarius: {
      element: 'Fire',
      ruler: 'Jupiter',
      luckyNumber: 3,
      luckyColor: 'Saffron Gold',
      mantra: 'Om Brihaspataye Namaha',
      daily: {
        headline: 'Philosophical Expansion & Fortunate Horizons',
        general: 'Jupiter expands your optimism, scholarly curiosity, and wanderlust. An inspiring breakthrough in wisdom or education awaits you.',
        love: 'Adventures shared with someone special create lifelong memories. Candid honesty is deeply valued.',
        career: 'Broaden your horizons toward international clients, publishing, or forward-looking tech innovations.',
        health: 'High spirits; protect hips and thighs with dynamic stretching before physical pursuits.'
      }
    },
    Capricorn: {
      element: 'Earth',
      ruler: 'Saturn',
      luckyNumber: 8,
      luckyColor: 'Indigo Slate',
      mantra: 'Om Sham Shanaishcharaya Namaha',
      daily: {
        headline: 'Architectural Mastery & Karmic Elevation',
        general: 'Saturn rewards your patient discipline and strategic foresight. Long-term goals fall into place with monumental stability.',
        love: 'Reliable loyalty and steadfast devotion prove their immense worth. Plan concrete steps for your shared future.',
        career: 'Senior mentors take note of your integrity and rigorous work ethic. Favorable day for contracts and milestones.',
        health: 'Strengthen joints and skeletal health with calcium-rich foods and weight-bearing exercises.'
      }
    },
    Aquarius: {
      element: 'Air',
      ruler: 'Saturn & Rahu',
      luckyNumber: 4,
      luckyColor: 'Electric Cyan',
      mantra: 'Om Rahave Namaha',
      daily: {
        headline: 'Visionary Innovation & Global Synchronicity',
        general: 'Unconventional ideas strike like lightning. Your ability to see years into the future helps communities solve contemporary riddles.',
        love: 'Intellectual communion is your ultimate aphrodisiac. Value partners who respect your freedom and eccentric brilliance.',
        career: 'Groundbreaking tech developments, community networking, and collective campaigns gain rapid traction.',
        health: 'Boost circulatory flow with brisk walks and rhythmic breathwork to keep mental fog away.'
      }
    },
    Pisces: {
      element: 'Water',
      ruler: 'Jupiter',
      luckyNumber: 7,
      luckyColor: 'Seafoam Teal',
      mantra: 'Om Gurave Namaha',
      daily: {
        headline: 'Mystical Inspiration & Compassionate Resonance',
        general: 'Neptune and Jupiter enhance your dreaming state, poetic imagination, and emotional empathy. Trust your vivid morning synchronicities.',
        love: 'Soulmate chemistry and unconditional tenderness melt away barriers. A heart-to-heart talk brings tears of joy.',
        career: 'Creative arts, music, spiritual teaching, and visionary design flourish effortlessly under your intuitive touch.',
        health: 'Take care of your feet with warm Epsom salt baths and indulge in grounding meditation.'
      }
    }
  };

  const current = HOROSCOPES_DATA[signName] || {
    element: 'Cosmic',
    ruler: 'Celestial',
    luckyNumber: 7,
    luckyColor: 'Nebula Violet',
    mantra: 'Om Namo Bhagavate Vasudevaya',
    daily: {
      headline: 'Cosmic Alignment and Intuitive Clarity',
      general: `Planetary transits encourage deep focus for ${signName} today. Trust your inner wisdom to guide professional and personal choices.`,
      love: 'Warmth and mutual respect create lasting harmony in personal relationships.',
      career: 'Clear communication and attention to detail ensure positive recognition.',
      health: 'Mindful breathing and adequate rest keep energy levels optimal.'
    },
    weekly: {
      headline: 'Expansion of Horizons & Mutual Growth',
      general: `A harmonious week ahead for ${signName}, opening new pathways for collaboration and inner peace.`,
      love: 'Nurture quality time with loved ones to deepen emotional ties.',
      career: 'Strategic planning pays high dividends in upcoming presentations.',
      health: 'Maintain balanced hydration and restorative sleep.'
    },
    monthly: {
      headline: 'A Month of Breakthrough Insights',
      general: 'Favorable planetary angles illuminate your path toward personal evolution and financial equilibrium.',
      love: 'Meaningful dialogues resolve old lingering doubts, cultivating joyful trust.',
      career: 'New project responsibilities highlight your specialized talents.',
      health: 'Outdoor recreation and nutrient-rich foods support peak vigor.'
    },
    yearly: {
      headline: `The Grand Astrological Blueprint for ${signName} (2026)`,
      general: 'A momentous year of self-discovery, karmic rewards, and profound spiritual grounding.',
      love: 'True soul connections are strengthened with clarity and cosmic grace.',
      career: 'Exceptional professional milestones and elevated stature.',
      health: 'Enduring vitality and emotional equilibrium throughout the seasons.'
    }
  };

  const periodData = current[timeframe] || current.daily;

  return res.json({
    sign: signName,
    timeframe,
    element: current.element,
    ruler: current.ruler,
    luckyNumber: current.luckyNumber,
    luckyColor: current.luckyColor,
    mantra: current.mantra,
    data: periodData
  });
});

// 5. Daily Panchang
app.get('/api/astrology/panchang', (req, res) => {
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  // Deterministic realistic Panchang parameters for requested date
  const d = new Date(dateStr);
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
  
  const panchang = {
    date: dateStr,
    day: dayOfWeek,
    tithi: 'Shukla Paksha Dashami (Auspicious Victory Day)',
    nakshatra: 'Rohini (Up to 06:45 PM) followed by Mrigashira',
    yoga: 'Harshana (Delightful & Creative Energy)',
    karana: 'Taitila (Favorable for commerce & trade)',
    sunrise: '06:34 AM',
    sunset: '05:42 PM',
    moonrise: '01:22 PM',
    moonset: '02:15 AM',
    sunSign: 'Scorpio (Vrishchika)',
    moonSign: 'Taurus (Vrishabha - Exalted)',
    auspiciousTimings: {
      abhijitMuhurat: '11:48 AM - 12:32 PM (Golden Window)',
      amritKalam: '02:15 PM - 03:50 PM',
      brahmaMuhurta: '04:52 AM - 05:40 AM'
    },
    inauspiciousTimings: {
      rahuKaal: '04:15 PM - 05:40 PM',
      yamaganda: '12:08 PM - 01:30 PM',
      gulikaKaal: '02:52 PM - 04:15 PM'
    },
    recommendation: 'Ideal day for signing important contracts, vehicle purchase, artistic launches, and initiating educational courses.'
  };

  return res.json({ success: true, panchang });
});

// 6. Tarot Cards Reading
app.get('/api/astrology/tarot', (req, res) => {
  const TAROT_DECK = [
    { id: 't-0', name: 'The Fool', arcana: 'Major', upright: 'New beginnings, spontaneous adventures, cosmic leap of faith.', reversed: 'Recklessness, unnecessary risk, naive hesitation.', element: 'Air' },
    { id: 't-1', name: 'The Magician', arcana: 'Major', upright: 'Manifestation, creative mastery, aligning tools with intent.', reversed: 'Untapped potential, deceptive illusions, fragmented focus.', element: 'Mercury' },
    { id: 't-2', name: 'The High Priestess', arcana: 'Major', upright: 'Sacred intuition, subconscious secrets, divine mystery.', reversed: 'Ignoring inner voice, superficial distractions, hidden agendas.', element: 'Moon' },
    { id: 't-3', name: 'The Empress', arcana: 'Major', upright: 'Abundance, nurturing fertility, artistic creation, harmony.', reversed: 'Creative block, over-dependence, neglecting self-care.', element: 'Venus' },
    { id: 't-4', name: 'The Emperor', arcana: 'Major', upright: 'Sovereignty, strategic order, leadership, protective strength.', reversed: 'Rigid dogma, control issues, lack of discipline.', element: 'Aries' },
    { id: 't-5', name: 'The Hierophant', arcana: 'Major', upright: 'Spiritual lineage, sacred knowledge, ethical principles.', reversed: 'Challenging outdated dogma, independent spiritual path.', element: 'Taurus' },
    { id: 't-6', name: 'The Lovers', arcana: 'Major', upright: 'Soul harmony, conscious choice, deep mutual attraction.', reversed: 'Misaligned values, internal conflict, indecision in love.', element: 'Gemini' },
    { id: 't-7', name: 'The Chariot', arcana: 'Major', upright: 'Triumphant willpower, focused momentum, mastery over opposites.', reversed: 'Loss of direction, aggressive burnout, obstacle fatigue.', element: 'Cancer' },
    { id: 't-8', name: 'Strength', arcana: 'Major', upright: 'Compassionate fortitude, patience, inner calm mastering raw instinct.', reversed: 'Self-doubt, emotional vulnerability, fatigue.', element: 'Leo' },
    { id: 't-9', name: 'The Hermit', arcana: 'Major', upright: 'Soulful introspection, lantern of inner wisdom, conscious solitude.', reversed: 'Isolation, bitter loneliness, resisting guidance.', element: 'Virgo' },
    { id: 't-10', name: 'Wheel of Fortune', arcana: 'Major', upright: 'Karmic cycle turns in your favor, destiny, synchronicity.', reversed: 'Temporary setback, resisting natural ebb and flow.', element: 'Jupiter' },
    { id: 't-17', name: 'The Star', arcana: 'Major', upright: 'Renewed hope, cosmic blessings, spiritual clarity, inspiration.', reversed: 'Despair, feeling disconnected from grace, cynicism.', element: 'Aquarius' },
    { id: 't-19', name: 'The Sun', arcana: 'Major', upright: 'Radiant success, vitality, joyful celebration, warmth.', reversed: 'Temporary shadow, mild delays in celebration.', element: 'Sun' },
    { id: 't-21', name: 'The World', arcana: 'Major', upright: 'Holistic completion, wholeness, cosmic achievement, travel.', reversed: 'Lack of closure, unfinished cycle, near victory.', element: 'Saturn' }
  ];

  // Draw 3 random cards for past, present, future
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  const spread = [
    { position: 'Past Influences', card: shuffled[0], isReversed: Math.random() > 0.7 },
    { position: 'Present Crucible', card: shuffled[1], isReversed: Math.random() > 0.7 },
    { position: 'Future Potential', card: shuffled[2], isReversed: Math.random() > 0.7 }
  ];

  return res.json({ success: true, spread, fullDeckCount: TAROT_DECK.length });
});

// 7. Numerology Calculator
app.post('/api/astrology/numerology', (req, res) => {
  const { name, dob } = req.body;
  if (!dob) {
    return res.status(400).json({ error: 'Date of birth is required' });
  }

  // Calculate Life Path Number
  const digits = dob.replace(/[^0-9]/g, '').split('').map(Number);
  let lifePath = digits.reduce((acc: number, d: number) => acc + d, 0);
  while (lifePath > 9 && lifePath !== 11 && lifePath !== 22 && lifePath !== 33) {
    lifePath = lifePath.toString().split('').map(Number).reduce((a: number, b: number) => a + b, 0);
  }

  // Calculate Expression / Destiny Number from Name
  const chaldean: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };
  const cleanName = (name || 'Seeker').toUpperCase().replace(/[^A-Z]/g, '');
  let destinySum = cleanName.split('').reduce((sum: number, char: string) => sum + (chaldean[char] || 0), 0);
  while (destinySum > 9 && destinySum !== 11 && destinySum !== 22 && destinySum !== 33) {
    destinySum = destinySum.toString().split('').map(Number).reduce((a: number, b: number) => a + b, 0);
  }

  const numerologyWisdom: Record<number, any> = {
    1: { title: 'The Pioneer & Sovereign Leader', archetype: 'Sun', qualities: 'Independent, visionary, charismatic, self-directed.' },
    2: { title: 'The Peacemaker & Empathic Diplomat', archetype: 'Moon', qualities: 'Intuitive, harmonious, supportive, mediator.' },
    3: { title: 'The Creative Catalyst & Joyous Orator', archetype: 'Jupiter', qualities: 'Expressive, artistic, optimistic, charismatic speaker.' },
    4: { title: 'The Master Architect & Pillar of Stability', archetype: 'Uranus / Rahu', qualities: 'Systematic, reliable, meticulous, practical builder.' },
    5: { title: 'The Adventurous Alchemist & Free Thinker', archetype: 'Mercury', qualities: 'Versatile, progressive, adaptable, seeker of truth.' },
    6: { title: 'The Nurturing Harmonizer & Guardian', archetype: 'Venus', qualities: 'Caring, aesthetic, devoted to community and beauty.' },
    7: { title: 'The Sacred Mystic & Truth Investigator', archetype: 'Ketu / Neptune', qualities: 'Deeply analytical, philosophical, spiritual, contemplative.' },
    8: { title: 'The Manifestor & Power Strategist', archetype: 'Saturn', qualities: 'Authoritative, financially astute, karmically tested, resilient.' },
    9: { title: 'The Universal Philanthropist & Compassionate Sage', archetype: 'Mars', qualities: 'Generous, global visionary, idealistic, noble.' },
    11: { title: 'Master Number 11: The Cosmic Illumined Messenger', archetype: 'High Frequency', qualities: 'Deep clairvoyance, spiritual inspiration, visionary channel.' },
    22: { title: 'Master Number 22: The Master Builder of Civilizations', archetype: 'Grand Manifestor', qualities: 'Translates grand celestial ideals into tangible worldly institutions.' },
    33: { title: 'Master Number 33: The Universal Avatar of Compassion', archetype: 'Christ Consciousness', qualities: 'Unconditional cosmic love, selfless service, spiritual teaching.' }
  };

  const lpInfo = numerologyWisdom[lifePath] || numerologyWisdom[1];
  const destInfo = numerologyWisdom[destinySum] || numerologyWisdom[1];

  return res.json({
    success: true,
    lifePathNumber: lifePath,
    destinyNumber: destinySum,
    lifePathInfo: lpInfo,
    destinyInfo: destInfo
  });
});

// 8. Vastu Shastra Guidelines
app.get('/api/astrology/vastu', (req, res) => {
  const vastuZones = [
    { direction: 'North-East (Ishanya)', element: 'Water / Ether', deity: 'Lord Shiva', recommendation: 'Keep light, clean, and open. Best for Meditation room, Pooja altar, or water fountains. Avoid heavy storage and toilets.' },
    { direction: 'East (Purva)', element: 'Air / Fire', deity: 'Surya (Sun)', recommendation: 'Ideal for main entrances, windows, and study halls to welcome the vibrant morning solar prana.' },
    { direction: 'South-East (Agneya)', element: 'Fire (Agni)', deity: 'Agni Dev', recommendation: 'Prime location for the kitchen, electrical meters, cooktops, and heating equipment.' },
    { direction: 'South (Dakshin)', element: 'Earth / Fire', deity: 'Yama', recommendation: 'Best for master bedroom headboard placement (sleeping towards South enhances longevity and restful blood circulation).' },
    { direction: 'South-West (Nairutya)', element: 'Earth (Prithvi)', deity: 'Nirriti', recommendation: 'Heaviest zone of the house. Ideal for master bedroom, heavy wardrobes, safes, and structural load-bearing walls for family stability.' },
    { direction: 'West (Paschim)', element: 'Space / Metal', deity: 'Varuna', recommendation: 'Favorable for children study rooms, dining spaces, and solar overhead water tanks.' },
    { direction: 'North-West (Vayavya)', element: 'Air (Vayu)', deity: 'Vayu Dev', recommendation: 'Excellent for guest bedrooms, finished product storage, and vehicles.' },
    { direction: 'North (Uttar)', element: 'Water', deity: 'Lord Kubera', recommendation: 'Prosperity gateway. Best for open balconies, cash box placement, and accounting departments.' },
    { direction: 'Center (Brahmasthan)', element: 'Space (Akash)', deity: 'Lord Brahma', recommendation: 'Must be completely clutter-free, unobstructed, and well-lit to let cosmic prana circulate.' }
  ];

  return res.json({ success: true, vastuZones });
});

// 9. AI Astrology Assistant Chat (Gemini 3.8 Flash + Astrology Fallback)
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const reply = await askAstrologyAssistant(prompt, history || []);
    return res.json({
      success: true,
      reply,
      disclaimer: 'For educational and entertainment purposes. Astrology offers symbolic and cultural perspective, not absolute destiny.'
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    return res.status(500).json({ error: 'Failed to communicate with Zorvexa AI.' });
  }
});

// 10. Astrologer Experts Directory
app.get('/api/experts', (req, res) => {
  const { specialization, minRating } = req.query;
  let list = db.getAstrologers();

  if (specialization && specialization !== 'All') {
    list = list.filter(a => a.specialization.some(s => s.toLowerCase().includes((specialization as string).toLowerCase())));
  }

  if (minRating) {
    list = list.filter(a => a.rating >= parseFloat(minRating as string));
  }

  return res.json({ success: true, experts: list });
});

app.get('/api/experts/:id', (req, res) => {
  const expert = db.getAstrologerById(req.params.id);
  if (!expert) {
    return res.status(404).json({ error: 'Astrologer not found' });
  }
  const reviews = db.getReviews(req.params.id);
  return res.json({ success: true, expert, reviews });
});

app.post('/api/experts/:id/reviews', (req, res) => {
  const { userId, userName, rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const review = db.addReview({
    id: `rev-${Date.now()}`,
    expertId: req.params.id,
    userId: userId || 'anonymous',
    userName: userName || 'Cosmic Seeker',
    rating: parseInt(rating, 10),
    comment,
    createdAt: new Date().toISOString(),
    status: 'approved'
  });

  return res.json({ success: true, review });
});

// 11. Consultation Booking Simulation
app.post('/api/consultations/book', (req, res) => {
  const { userId, expertId, serviceType, notes } = req.body;
  const expert = db.getAstrologerById(expertId);
  if (!expert) {
    return res.status(404).json({ error: 'Astrologer not found' });
  }

  const user = db.getUserById(userId) || db.getUsers()[0];
  const sessionItem = {
    id: `c-${Date.now()}`,
    expertId: expert.id,
    expertName: expert.name,
    expertImage: expert.avatar,
    serviceType: serviceType || 'chat',
    timestamp: new Date().toISOString(),
    duration: '20 mins',
    status: 'completed' as const,
    notes: notes || 'Consultation demo session initiated successfully.'
  };

  if (user) {
    user.consultationHistory = user.consultationHistory || [];
    user.consultationHistory.unshift(sessionItem);
    db.upsertUser(user);
  }

  return res.json({
    success: true,
    consultation: sessionItem,
    message: 'Demo consultation booked! No real payment was charged.'
  });
});

// 12. Live Sessions & Notifications
app.get('/api/live-sessions', (req, res) => {
  return res.json({ success: true, liveSessions: db.getLiveSessions() });
});

app.get('/api/notifications', (req, res) => {
  return res.json({ success: true, notifications: db.getNotifications() });
});

// 13. Admin Dashboard Routes
app.get('/api/admin/stats', (req, res) => {
  return res.json({ success: true, stats: db.getAdminStats() });
});

app.get('/api/admin/reviews', (req, res) => {
  return res.json({ success: true, reviews: db.getReviews() });
});

app.post('/api/admin/review-status', (req, res) => {
  const { id, status } = req.body;
  db.updateReviewStatus(id, status);
  return res.json({ success: true, message: `Review status updated to ${status}` });
});

app.post('/api/admin/astrologer', (req, res) => {
  const data = req.body;
  if (!data.name || !data.title) {
    return res.status(400).json({ error: 'Name and title are required' });
  }
  const ast = db.upsertAstrologer({
    id: data.id || `exp-${Date.now()}`,
    name: data.name,
    title: data.title,
    specialization: data.specialization || ['Vedic Kundli'],
    languages: data.languages || ['English', 'Hindi'],
    experienceYears: data.experienceYears || 5,
    rating: data.rating || 5.0,
    reviewCount: data.reviewCount || 1,
    ratePerMinute: data.ratePerMinute || 20,
    isOnline: data.isOnline !== undefined ? data.isOnline : true,
    isVerified: true,
    avatar: data.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: data.bio || 'Vedic astrology practitioner and life guide.',
    education: data.education || 'Vedic Studies Certification',
    skills: data.skills || ['Horoscope Analysis', 'Muhurat'],
    totalConsultations: data.totalConsultations || 150,
    joinedDate: new Date().toISOString().split('T')[0]
  });
  return res.json({ success: true, astrologer: ast });
});

app.post('/api/admin/broadcast', (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }
  const notif = db.addNotification(title, message, type || 'cosmic');
  return res.json({ success: true, notification: notif });
});

// Vite Middleware or Static Dist
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Mount Vite dev server in middleware mode
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`🌌 ZORVEXA ASTRO server operational on http://0.0.0.0:${port}`);
});
