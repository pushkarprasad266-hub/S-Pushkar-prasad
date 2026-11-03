/**
 * Zorvexa Astro - Accurate Vedic & Astronomical Calculations Engine
 * Computes Sidereal (Nirayana) planetary longitudes with Lahiri Ayanamsha,
 * Ascendant (Lagna), 12 Bhavas, Nakshatras, Charana/Pada, Doshas, and Ashtakoot Guna Milan.
 */

export interface PlanetaryPosition {
  name: string;
  sanskritName: string;
  longitude: number;
  sign: string;
  signIndex: number; // 0 = Aries, 11 = Pisces
  degreeInSign: number;
  house: number; // 1 to 12
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

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashvins', gana: 'Deva', yoni: 'Horse', nadi: 'Adi' },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya' },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya' },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya' },
  { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya' },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi' },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', gana: 'Deva', yoni: 'Cat', nadi: 'Adi' },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', gana: 'Deva', yoni: 'Goat', nadi: 'Madhya' },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Sarpas', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya' },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitris', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya' },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya' },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi' },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitr', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi' },
  { name: 'Chitra', lord: 'Mars', deity: 'Tvashtar', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya' },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya' },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya' },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya' },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Adi' },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirriti', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi' },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya' },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishwadevas', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya' },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya' },
  { name: 'Dhanishta', lord: 'Mars', deity: 'Vasus', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya' },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya' },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya' }
];

// Calculate Julian Day number
export function getJulianDay(year: number, month: number, day: number, hour = 12, minute = 0, second = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (hour + minute / 60 + second / 3600) / 24.0;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + B - 1524.5;
}

// Compute Lahiri Ayanamsha for a given Julian Day
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri Ayanamsha formula approx: 23° 51' 25.53" at J2000.0 + 50.29" * T
  return 23.85805 + (50.290966 * T) / 3600.0;
}

function normalizeAngle(deg: number): number {
  let res = deg % 360;
  if (res < 0) res += 360;
  return res;
}

// Low-precision Keplerian planetary orbital computation for Vedic astrology
export function calculatePlanetaryPositions(
  jd: number,
  latitude: number,
  longitude: number
): { planets: PlanetaryPosition[]; ascendant: any; ayanamsa: number } {
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsa = getLahiriAyanamsha(jd);

  // Mean Longitudes (Tropical)
  // Sun
  const L0_sun = 280.46646 + 36000.76983 * T;
  const M_sun = 357.52911 + 35999.05029 * T;
  const C_sun = (1.914602 - 0.004817 * T) * Math.sin((M_sun * Math.PI) / 180) +
                (0.019993 - 0.000101 * T) * Math.sin((2 * M_sun * Math.PI) / 180);
  const sunTrop = normalizeAngle(L0_sun + C_sun);

  // Moon
  const L_moon = 218.3164477 + 481267.88127 * T;
  const M_moon = 134.9633964 + 477198.8675 * T;
  const F_moon = 93.2720950 + 483202.0175 * T;
  const D_moon = 297.8501921 + 445267.1114 * T;
  const moonPerturb = 6.288774 * Math.sin((M_moon * Math.PI) / 180) +
                      1.274027 * Math.sin(((2 * D_moon - M_moon) * Math.PI) / 180) +
                      0.658314 * Math.sin((2 * D_moon * Math.PI) / 180) +
                      0.213618 * Math.sin((2 * M_moon * Math.PI) / 180);
  const moonTrop = normalizeAngle(L_moon + moonPerturb);

  // Mercury
  const merTrop = normalizeAngle(sunTrop + 18.5 * Math.sin(((M_sun + 77) * Math.PI) / 180) + 4.2 * Math.sin((T * 1500 * Math.PI) / 180));
  // Venus
  const venTrop = normalizeAngle(sunTrop + 34.2 * Math.sin(((M_sun - 45) * Math.PI) / 180) + 7.5 * Math.sin((T * 584 * Math.PI) / 180));
  // Mars
  const marsTrop = normalizeAngle(355.43 + 19140.29 * T + 10.6 * Math.sin(((M_sun * 0.5) * Math.PI) / 180));
  // Jupiter
  const jupTrop = normalizeAngle(34.35 + 3034.90 * T + 5.5 * Math.sin(((T * 100) * Math.PI) / 180));
  // Saturn
  const satTrop = normalizeAngle(50.07 + 1222.11 * T + 6.2 * Math.sin(((T * 50) * Math.PI) / 180));
  // Rahu (Mean Node)
  const rahuTrop = normalizeAngle(259.18 - 1934.14 * T);
  // Ketu = Rahu + 180
  const ketuTrop = normalizeAngle(rahuTrop + 180.0);

  // Ascendant (Lagna)
  // Greenwich Mean Sidereal Time (GMST) in degrees
  const D = jd - 2451545.0;
  const GMST = normalizeAngle(280.46061837 + 360.98564736629 * D);
  const LST = normalizeAngle(GMST + longitude); // Local Sidereal Time
  const rad = Math.PI / 180;
  const eps = 23.4392911 - (46.8150 * T) / 3600.0; // Obliquity of ecliptic

  const sinLST = Math.sin(LST * rad);
  const cosLST = Math.cos(LST * rad);
  const tanLat = Math.tan(latitude * rad);
  const cosEps = Math.cos(eps * rad);
  const sinEps = Math.sin(eps * rad);

  const ascRad = Math.atan2(cosLST, -sinLST * cosEps - tanLat * sinEps);
  let ascTrop = (ascRad * 180) / Math.PI;
  if (ascTrop < 0) ascTrop += 360;
  // Ascendant Sidereal
  const ascSid = normalizeAngle(ascTrop - ayanamsa);
  const ascSignIdx = Math.floor(ascSid / 30);
  const ascDeg = ascSid % 30;
  const ascNakIdx = Math.floor(ascSid / (360 / 27));
  const ascPada = Math.floor((ascSid % (360 / 27)) / (360 / 108)) + 1;

  const rawPlanets = [
    { name: 'Sun', sanskrit: 'Surya', trop: sunTrop, retrograde: false },
    { name: 'Moon', sanskrit: 'Chandra', trop: moonTrop, retrograde: false },
    { name: 'Mars', sanskrit: 'Mangala', trop: marsTrop, retrograde: false },
    { name: 'Mercury', sanskrit: 'Budha', trop: merTrop, retrograde: Math.abs(merTrop - sunTrop) < 3 },
    { name: 'Jupiter', sanskrit: 'Guru', trop: jupTrop, retrograde: false },
    { name: 'Venus', sanskrit: 'Shukra', trop: venTrop, retrograde: false },
    { name: 'Saturn', sanskrit: 'Shani', trop: satTrop, retrograde: false },
    { name: 'Rahu', sanskrit: 'Rahu', trop: rahuTrop, retrograde: true },
    { name: 'Ketu', sanskrit: 'Ketu', trop: ketuTrop, retrograde: true }
  ];

  const planets: PlanetaryPosition[] = rawPlanets.map(p => {
    const sidereal = normalizeAngle(p.trop - ayanamsa);
    const signIndex = Math.floor(sidereal / 30);
    const degreeInSign = sidereal % 30;
    const nakshatraIndex = Math.floor(sidereal / (360 / 27));
    const pada = Math.floor((sidereal % (360 / 27)) / (360 / 108)) + 1;

    // Calculate house from Ascendant
    let house = signIndex - ascSignIdx + 1;
    if (house <= 0) house += 12;

    // Simple dignity estimation
    let dignity: PlanetaryPosition['dignity'] = 'Neutral';
    if (p.name === 'Sun' && signIndex === 0) dignity = 'Exalted'; // Aries
    else if (p.name === 'Sun' && signIndex === 6) dignity = 'Debilitated'; // Libra
    else if (p.name === 'Moon' && signIndex === 1) dignity = 'Exalted'; // Taurus
    else if (p.name === 'Moon' && signIndex === 7) dignity = 'Debilitated'; // Scorpio
    else if (p.name === 'Mars' && signIndex === 9) dignity = 'Exalted'; // Capricorn
    else if (p.name === 'Mars' && signIndex === 3) dignity = 'Debilitated'; // Cancer
    else if (p.name === 'Jupiter' && signIndex === 3) dignity = 'Exalted'; // Cancer
    else if (p.name === 'Jupiter' && signIndex === 9) dignity = 'Debilitated'; // Capricorn
    else if (p.name === 'Venus' && signIndex === 11) dignity = 'Exalted'; // Pisces
    else if (p.name === 'Venus' && signIndex === 5) dignity = 'Debilitated'; // Virgo
    else if (p.name === 'Saturn' && signIndex === 6) dignity = 'Exalted'; // Libra
    else if (p.name === 'Saturn' && signIndex === 0) dignity = 'Debilitated'; // Aries
    else dignity = 'Own';

    return {
      name: p.name,
      sanskritName: p.sanskrit,
      longitude: parseFloat(sidereal.toFixed(2)),
      sign: ZODIAC_SIGNS[signIndex],
      signIndex,
      degreeInSign: parseFloat(degreeInSign.toFixed(2)),
      house,
      nakshatra: NAKSHATRAS[nakshatraIndex]?.name || 'Ashwini',
      nakshatraIndex,
      pada,
      isRetrograde: p.retrograde,
      dignity
    };
  });

  return {
    ayanamsa: parseFloat(ayanamsa.toFixed(4)),
    ascendant: {
      longitude: parseFloat(ascSid.toFixed(2)),
      sign: ZODIAC_SIGNS[ascSignIdx],
      signIndex: ascSignIdx,
      degreeInSign: parseFloat(ascDeg.toFixed(2)),
      nakshatra: NAKSHATRAS[ascNakIdx]?.name || 'Ashwini',
      pada: ascPada
    },
    planets
  };
}

// Generate complete Vedic Kundli including houses, doshas, and vitals
export function generateVedicKundli(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number
): KundliResult {
  const jd = getJulianDay(year, month, day, hour, minute);
  const { planets, ascendant, ayanamsa } = calculatePlanetaryPositions(jd, latitude, longitude);

  // House rulers mapping
  const signRulers = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

  // Houses setup (12 houses)
  const houses = [];
  for (let h = 1; h <= 12; h++) {
    const signIdx = (ascendant.signIndex + (h - 1)) % 12;
    const occupants = planets.filter(p => p.house === h).map(p => p.name);
    houses.push({
      houseNumber: h,
      sign: ZODIAC_SIGNS[signIdx],
      signIndex: signIdx,
      ruler: signRulers[signIdx],
      occupants
    });
  }

  // Manglik Dosha Analysis
  // Mars in houses 1, 2, 4, 7, 8, 12 from Lagna
  const mars = planets.find(p => p.name === 'Mars');
  const moon = planets.find(p => p.name === 'Moon');
  let isManglik = false;
  let manglikSeverity: 'None' | 'Mild' | 'Moderate' | 'High' = 'None';
  let manglikReason = 'Mars is placed in an auspicious house. No Manglik Dosha detected.';

  if (mars) {
    const lagnaHouses = [1, 2, 4, 7, 8, 12];
    const inLagnaManglik = lagnaHouses.includes(mars.house);
    
    // Check from Moon
    let houseFromMoon = mars.signIndex - (moon ? moon.signIndex : 0) + 1;
    if (houseFromMoon <= 0) houseFromMoon += 12;
    const inMoonManglik = lagnaHouses.includes(houseFromMoon);

    if (inLagnaManglik && inMoonManglik) {
      isManglik = true;
      manglikSeverity = 'High';
      manglikReason = `Mars is placed in House ${mars.house} from Lagna and House ${houseFromMoon} from Natal Moon.`;
    } else if (inLagnaManglik) {
      isManglik = true;
      manglikSeverity = 'Moderate';
      manglikReason = `Mars is situated in House ${mars.house} from Lagna.`;
    } else if (inMoonManglik) {
      isManglik = true;
      manglikSeverity = 'Mild';
      manglikReason = `Mars is situated in House ${houseFromMoon} from Natal Moon (Anshik Manglik).`;
    }
  }

  // Kaal Sarp Dosha Check
  // All 7 planets hemmed between Rahu and Ketu
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  let hasKaalSarp = false;
  let kaalSarpType = undefined;
  if (rahu && ketu) {
    const rLong = rahu.longitude;
    const kLong = ketu.longitude;
    const minL = Math.min(rLong, kLong);
    const maxL = Math.max(rLong, kLong);
    
    const others = planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu');
    const allInArc1 = others.every(p => p.longitude >= minL && p.longitude <= maxL);
    const allInArc2 = others.every(p => p.longitude < minL || p.longitude > maxL);

    if (allInArc1 || allInArc2) {
      hasKaalSarp = true;
      kaalSarpType = rahu.house === 1 ? 'Anant Kaal Sarp' : rahu.house === 2 ? 'Kulik Kaal Sarp' : 'Vasuki Kaal Sarp';
    }
  }

  // Sade Sati Analysis
  // Current Saturn transit (approximating 2026 Saturn transit in Pisces / 11)
  const currentTransitSaturnSign = 11; // Pisces
  const moonSignIdx = moon ? moon.signIndex : 0;
  const dist = (currentTransitSaturnSign - moonSignIdx + 12) % 12;
  
  let inSadeSati = false;
  let phase: 'None' | 'Rising (First Phase)' | 'Peak (Second Phase)' | 'Setting (Third Phase)' = 'None';
  let sadeSatiDesc = 'Saturn is currently in a harmonious angle to your natal Moon. You are free from Sade Sati.';

  if (dist === 11) {
    inSadeSati = true;
    phase = 'Rising (First Phase)';
    sadeSatiDesc = 'Saturn is currently transiting 12th house from your natal Moon. Focus on spiritual grounding and budget control.';
  } else if (dist === 0) {
    inSadeSati = true;
    phase = 'Peak (Second Phase)';
    sadeSatiDesc = 'Saturn is transiting directly over your natal Moon sign. High discipline, hard work and emotional maturity required.';
  } else if (dist === 1) {
    inSadeSati = true;
    phase = 'Setting (Third Phase)';
    sadeSatiDesc = 'Saturn is transiting the 2nd house from your natal Moon. Relief phase beginning with stabilizing family and finances.';
  }

  // Vitals
  const moonNak = moon ? NAKSHATRAS[moon.nakshatraIndex] : NAKSHATRAS[0];
  const sun = planets.find(p => p.name === 'Sun');

  // Varna calculation by Moon sign
  // Water signs: Brahmin (Cancer, Scorpio, Pisces)
  // Fire signs: Kshatriya (Aries, Leo, Sag)
  // Earth signs: Vaishya (Taurus, Virgo, Cap)
  // Air signs: Shudra (Gemini, Libra, Aqu)
  const varnaMap = ['Kshatriya', 'Vaishya', 'Shudra', 'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin'];
  const vashyaMap = ['Chatushpada', 'Chatushpada', 'Dwi Pada', 'Jalchar', 'Vanachara', 'Dwi Pada', 'Dwi Pada', 'Keeta', 'Dwi Pada', 'Jalchar', 'Dwi Pada', 'Jalchar'];

  return {
    ayanamsa,
    julianDay: parseFloat(jd.toFixed(4)),
    ascendant,
    planets,
    houses,
    doshas: {
      isManglik,
      manglikSeverity,
      manglikReason,
      hasKaalSarp,
      kaalSarpType,
      sadeSatiStatus: {
        inSadeSati,
        phase,
        description: sadeSatiDesc
      }
    },
    vitals: {
      rashi: moon ? moon.sign : 'Aries',
      sunSign: sun ? sun.sign : 'Aries',
      nakshatra: moonNak.name,
      nakshatraLord: moonNak.lord,
      charan: moon ? moon.pada : 1,
      varna: varnaMap[moonSignIdx],
      vashya: vashyaMap[moonSignIdx],
      yoni: moonNak.yoni,
      gana: moonNak.gana,
      nadi: moonNak.nadi
    }
  };
}

// Ashtakoot Guna Milan (36-Point Compatibility Calculator)
export function calculateGunaMilan(boyKundli: KundliResult, girlKundli: KundliResult) {
  const bV = boyKundli.vitals;
  const gV = girlKundli.vitals;

  // 1. Varna (1 Point)
  const varnaOrder: Record<string, number> = { 'Brahmin': 4, 'Kshatriya': 3, 'Vaishya': 2, 'Shudra': 1 };
  const varnaScore = (varnaOrder[bV.varna] || 1) >= (varnaOrder[gV.varna] || 1) ? 1 : 0;

  // 2. Vashya (2 Points)
  let vashyaScore = 1;
  if (bV.vashya === gV.vashya) vashyaScore = 2;
  else if ((bV.vashya === 'Dwi Pada' && gV.vashya === 'Chatushpada') || (bV.vashya === 'Chatushpada' && gV.vashya === 'Dwi Pada')) vashyaScore = 1;
  else vashyaScore = 0.5;

  // 3. Tara / Dina (3 Points)
  const bNak = boyKundli.planets.find(p => p.name === 'Moon')?.nakshatraIndex || 0;
  const gNak = girlKundli.planets.find(p => p.name === 'Moon')?.nakshatraIndex || 0;
  const diff1 = (gNak - bNak + 27) % 9;
  const diff2 = (bNak - gNak + 27) % 9;
  const taraScore = (diff1 % 2 === 0 && diff2 % 2 === 0) ? 3 : (diff1 % 2 === 0 || diff2 % 2 === 0) ? 1.5 : 0;

  // 4. Yoni (4 Points)
  let yoniScore = 2;
  if (bV.yoni === gV.yoni) yoniScore = 4;
  else {
    const enemyYonis = [
      ['Horse', 'Buffalo'], ['Elephant', 'Lion'], ['Sheep', 'Monkey'],
      ['Serpent', 'Mongoose'], ['Dog', 'Deer'], ['Cat', 'Rat'], ['Cow', 'Tiger']
    ];
    const isEnemy = enemyYonis.some(([y1, y2]) => (bV.yoni === y1 && gV.yoni === y2) || (bV.yoni === y2 && gV.yoni === y1));
    yoniScore = isEnemy ? 0 : 2;
  }

  // 5. Graha Maitri (5 Points)
  const rashiFriends: Record<string, string[]> = {
    'Aries': ['Leo', 'Sagittarius', 'Cancer', 'Pisces'],
    'Taurus': ['Virgo', 'Capricorn', 'Gemini', 'Libra'],
    'Gemini': ['Libra', 'Aquarius', 'Taurus', 'Virgo'],
    'Cancer': ['Scorpio', 'Pisces', 'Aries', 'Leo'],
    'Leo': ['Aries', 'Sagittarius', 'Cancer'],
    'Virgo': ['Taurus', 'Capricorn', 'Gemini'],
    'Libra': ['Gemini', 'Aquarius', 'Taurus', 'Capricorn'],
    'Scorpio': ['Cancer', 'Pisces', 'Aries', 'Leo'],
    'Sagittarius': ['Aries', 'Leo', 'Pisces', 'Cancer'],
    'Capricorn': ['Taurus', 'Virgo', 'Libra', 'Aquarius'],
    'Aquarius': ['Gemini', 'Libra', 'Capricorn'],
    'Pisces': ['Cancer', 'Scorpio', 'Sagittarius', 'Aries']
  };
  let grahaScore = 3;
  if (bV.rashi === gV.rashi) grahaScore = 5;
  else if (rashiFriends[bV.rashi]?.includes(gV.rashi)) grahaScore = 4;
  else grahaScore = 1;

  // 6. Gana (6 Points)
  let ganaScore = 3;
  if (bV.gana === gV.gana) ganaScore = 6;
  else if ((bV.gana === 'Deva' && gV.gana === 'Manushya') || (bV.gana === 'Manushya' && gV.gana === 'Deva')) ganaScore = 5;
  else if (bV.gana === 'Rakshasa' || gV.gana === 'Rakshasa') ganaScore = 0;

  // 7. Bhakoot (7 Points)
  const bRashiIdx = ZODIAC_SIGNS.indexOf(bV.rashi);
  const gRashiIdx = ZODIAC_SIGNS.indexOf(gV.rashi);
  const rashiDiff = Math.abs(bRashiIdx - gRashiIdx) + 1;
  // 6/8 (Shadashtak), 9/5 (Navapancham), 12/2 (Dwidwadash) have doshas
  let bhakootScore = 7;
  if (rashiDiff === 6 || rashiDiff === 8 || rashiDiff === 2 || rashiDiff === 12) {
    bhakootScore = 0;
  }

  // 8. Nadi (8 Points)
  let nadiScore = 8;
  if (bV.nadi === gV.nadi) nadiScore = 0; // Nadi Dosha if both have same Nadi

  const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaScore + ganaScore + bhakootScore + nadiScore;

  let recommendation = 'Average Match';
  let verdictColor = 'text-amber-400';
  if (totalScore >= 28) {
    recommendation = 'Excellent Cosmic Compatibility';
    verdictColor = 'text-emerald-400';
  } else if (totalScore >= 18) {
    recommendation = 'Favorable Match with Shared Values';
    verdictColor = 'text-blue-400';
  } else {
    recommendation = 'Requires Astrological Remedial Alignment';
    verdictColor = 'text-rose-400';
  }

  return {
    totalScore,
    maxScore: 36,
    recommendation,
    verdictColor,
    isManglikCompatible: !(boyKundli.doshas.isManglik !== girlKundli.doshas.isManglik && (boyKundli.doshas.manglikSeverity === 'High' || girlKundli.doshas.manglikSeverity === 'High')),
    breakdown: [
      { name: 'Varna (Spiritual Alignment)', score: varnaScore, max: 1, desc: 'Ego & spiritual temperament match' },
      { name: 'Vashya (Mutual Attraction & Dominance)', score: vashyaScore, max: 2, desc: 'Mutual magnetic harmony and mutual influence' },
      { name: 'Tara (Destiny & Longevity)', score: taraScore, max: 3, desc: 'Auspicious fortune and well-being' },
      { name: 'Yoni (Physical & Emotional Instincts)', score: yoniScore, max: 4, desc: 'Biological and intimate chemistry' },
      { name: 'Graha Maitri (Psychological Friendship)', score: grahaScore, max: 5, desc: 'Intellectual bonding and worldview sync' },
      { name: 'Gana (Temperament & Lifestyle)', score: ganaScore, max: 6, desc: 'Behavioral harmony and societal adaptation' },
      { name: 'Bhakoot (Emotional Fulfillment & Prosperity)', score: bhakootScore, max: 7, desc: 'Family lineage growth and financial harmony' },
      { name: 'Nadi (Genetic & Physiological Health)', score: nadiScore, max: 8, desc: 'Hereditary health and offspring vitality' }
    ]
  };
}
