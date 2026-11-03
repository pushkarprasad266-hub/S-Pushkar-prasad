import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with server-side API key
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error('Failed to initialize GoogleGenAI client:', e);
  }
}

const SYSTEM_INSTRUCTION = `You are AASTRONIQ AI, the high-intelligence Vedic Astrology & Cosmic Wisdom Engine for AASTRONIQ_astrology ("Intelligence Beyond Limits.").
Your purpose is to explain Vedic and Western astrological concepts, planetary archetypes, houses (Bhavas), Nakshatras, zodiac signs, transits, and birth charts in an insightful, erudite, and modern way.

GUIDELINES & ETHICAL MANDATES:
1. Always maintain a calm, philosophical, empowering, and scientific Vedic tone. Explain the symbolic and psychological depth behind planetary alignments.
2. DISCLAIMER MANDATE: All astrological interpretations are intended for educational, philosophical, and cultural insight. NEVER claim 100% certainty or guaranteed predictions.
3. NEVER provide definitive medical diagnosis, legal outcomes, stock market guarantees, or fatalistic fear-inducing predictions.
4. If a user asks about heavy transit periods (like Sade Sati, Rahu Mahadasha, or Manglik dosha), dispel superstition and provide grounding, constructive advice: discipline, emotional intelligence, patience, mindfulness, and practical remedies (meditation, acts of service, satvik routine).
5. Format your answers beautifully using clear bullet points, bold keywords, and organized sections.`;

export async function askAstrologyAssistant(
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<string> {
  if (aiClient && apiKey) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API call failed or quota reached, using AASTRONIQ Astrology Knowledge Engine:', err.message);
    }
  }

  // Graceful, rich astrology knowledge engine fallback
  return getCosmicFallbackResponse(prompt);
}

function getCosmicFallbackResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('sade sati') || p.includes('shani') || p.includes('saturn')) {
    return `### **Saturn (Shani) & The Sade Sati Cycle**
In Vedic Astrology, Saturn (*Shani Dev*) is known as **Ayushkaraka** and the Lord of Karma (*Karmaphala Daata*).

**Understanding Sade Sati:**
- **The 7.5-Year Orbit:** Sade Sati occurs when Saturn transits the 12th, 1st, and 2nd houses from your natal Moon (*Chandra Lagna*).
- **The Three Distinct Phases:**
  1. **Rising Phase (12th House):** Psychological shifts, letting go of outdated attachments, and spiritual introspection.
  2. **Peak Phase (1st House / Natal Moon):** Maximum personal discipline, emotional restructuring, and confronting true realities.
  3. **Setting Phase (2nd House):** Stabilizing family dynamics, financial discipline, and establishing long-term wealth foundations.

**Vedic Perspective & Practical Remediation:**
Saturn never harms without cause; it strips away illusions and rewards genuine humility, perseverance, and ethical conduct. Recommended harmonizing practices include:
- Chanting the *Shani Gayatri* or *Hanuman Chalisa* on Saturdays.
- Daily mindfulness, maintaining a strict daily rhythm, and charitable service toward the elderly or underprivileged.

*(Note: Astrological insights are provided for educational and self-reflective awareness.)*`;
  }

  if (p.includes('manglik') || p.includes('mangal') || p.includes('mars')) {
    return `### **Kuja Dosha (Manglik Analysis) Demystified**
Mars (*Mangala*) represents primordial vitality, courage, drive, and personal boundaries.

**When Does Manglik Condition Arise?**
In classical Parashari Jyotish, Manglik Dosha is evaluated when Mars occupies the **1st, 2nd, 4th, 7th, 8th, or 12th house** from the Lagna (Ascendant), Moon, or Venus.

**Modern Perspective:**
- Traditional interpretations often exaggerated this placement. In reality, Mars in these houses simply denotes **high assertiveness, dynamic leadership, and passion**.
- It requires an equally dynamic or understanding partner to balance energy wavelengths.
- If both partners have Mars in similar positions, the energy is considered cancelled and mutually supportive (*Manglik Samyam*).

**Constructive Focus:**
Direct Mars energy constructively into physical fitness, purposeful career initiatives, and transparent relationship communication rather than internal frustration.

*(Note: Astrological guidance is designed for cultural contemplation and personal alignment.)*`;
  }

  if (p.includes('rahu') || p.includes('ketu') || p.includes('eclipse')) {
    return `### **The Karmic Axis: Rahu & Ketu in Vedic Astrology**
Rahu (North Lunar Node) and Ketu (South Lunar Node) are celestial shadow points (*Chhaya Grahas*) representing your soul's evolutionary vector.

- **Rahu (The Cosmic Catalyst):** Signifies insatiable curiosity, unconventional frontiers, innovative technology, and future destiny in this incarnation.
- **Ketu (The Liberation Spark):** Signifies past-life mastery, natural detachment, asceticism, deep intuition, and spiritual transcendence (*Moksha*).

**Balancing the Axis:**
Where Ketu sits in your chart shows where you feel natural ease; where Rahu sits shows the unfamiliar mountain you are meant to climb with courage and clear ethics.

*(Note: Educational interpretations for philosophical contemplation.)*`;
  }

  if (p.includes('kundli') || p.includes('birth chart') || p.includes('lagna')) {
    return `### **Anatomy of a Vedic Kundli (Birth Chart)**
A Vedic horoscope maps the exact cosmic sky at the precise latitude, longitude, and moment of your birth.

**The Three Primary Pillars:**
1. **Lagna (Ascendant):** The zodiac constellation rising on the eastern horizon. It defines your physical constitution, vitality, and life trajectory.
2. **Chandra Lagna (Moon Sign):** The subconscious mind (*Manas*), emotional responses, and mental peace.
3. **Surya (Sun Sign):** The core soul essence (*Atman*), willpower, vitality, and personal honor.

**The 12 Bhavas (Houses):**
- **Dharma Houses (1, 5, 9):** Purpose, virtue, creativity, and spiritual fortune.
- **Artha Houses (2, 6, 10):** Resources, career responsibilities, and worldly mastery.
- **Kama Houses (3, 7, 11):** Desires, partnerships, social networks, and community aspirations.
- **Moksha Houses (4, 8, 12):** Inner peace, transformation, and ultimate spiritual liberation.

*(Note: Provided for educational exploration of Vedic cosmological principles.)*`;
  }

  return `### **AASTRONIQ Cosmic Insight**
Astrology is the ancient study of celestial synchronicity—as the Hermetic principle states, *"As above, so below; as within, so without."*

**Key Cosmic Themes to Consider:**
- **Planetary Dasha Cycles:** In Vedic astrology, life unfolds in planetary periods (*Vimshottari Dasha*). Each planet tests different aspects of your character and expands consciousness.
- **Harmonizing with Natural Cycles:** When a planet feels challenging in your chart, its highest psychological vibration can always be cultivated through self-awareness and conscious action.
- **Free Will (*Purushartha*):** Fate (*Prarabdha Karma*) is merely the hand of cards dealt; how you play each hand with wisdom and integrity is completely under your conscious direction.

Feel free to ask AASTRONIQ AI about specific houses, planetary transits, zodiac compatibility, or your own birth chart placements!

*(Disclaimer: All astrological interpretations are offered for educational, cultural, and entertainment enjoyment.)*`;
}
