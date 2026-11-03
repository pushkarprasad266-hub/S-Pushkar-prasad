import { jsPDF } from 'jspdf';
import { KundliResult, PlanetaryPosition } from '../types';

export interface NativeDetails {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  lat: number;
  lng: number;
  gender?: string;
}

// Vimshottari Mahadasha ruler order and durations (Total = 120 years)
const DASHA_ORDER = [
  { lord: 'Ketu', years: 7, color: [168, 85, 247] },
  { lord: 'Venus', years: 20, color: [236, 72, 153] },
  { lord: 'Sun', years: 6, color: [245, 158, 11] },
  { lord: 'Moon', years: 10, color: [56, 189, 248] },
  { lord: 'Mars', years: 7, color: [239, 68, 68] },
  { lord: 'Rahu', years: 18, color: [139, 92, 246] },
  { lord: 'Jupiter', years: 16, color: [234, 179, 8] },
  { lord: 'Saturn', years: 19, color: [99, 102, 241] },
  { lord: 'Mercury', years: 17, color: [16, 185, 129] }
];

export function generateVedicKundliPdf(chart: KundliResult, native: NativeDetails): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Color Palette
  const primaryDark: [number, number, number] = [15, 23, 42]; // Slate 900
  const headerBg: [number, number, number] = [24, 18, 48]; // Deep cosmic purple
  const accentGold: [number, number, number] = [217, 119, 6]; // Amber gold
  const lightPurple: [number, number, number] = [124, 58, 237]; // Purple 600
  const cyanAccent: [number, number, number] = [14, 165, 233]; // Sky cyan
  const textColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const mutedText: [number, number, number] = [100, 116, 139]; // Slate 500
  const cardBg: [number, number, number] = [248, 250, 252]; // Slate 50
  const cardBorder: [number, number, number] = [226, 232, 240]; // Slate 200

  // Helper: Draw Header on any page
  const drawHeader = (title: string, subtitle: string, pageNum: number, totalPages: number) => {
    // Top decorative bar
    doc.setFillColor(...headerBg);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Golden accent bottom border
    doc.setFillColor(...accentGold);
    doc.rect(0, 28, pageWidth, 1.2, 'F');

    // App Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('AASTRONIQ', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(216, 180, 254); // light purple
    doc.text('_astrology  •  Vedic Jyotish Ephemeris Engine', margin + 35, 11);

    // Page Subject Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(253, 230, 138); // warm gold
    doc.text(title.toUpperCase(), margin, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, margin + 95, 21);

    // Native Name on top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(native.name, pageWidth - margin, 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(196, 181, 253);
    doc.text(`DOB: ${native.dob} (${native.tob})`, pageWidth - margin, 21, { align: 'right' });

    // Footer
    drawFooter(pageNum, totalPages);
  };

  // Helper: Draw Footer on any page
  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(...cardBorder);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedText);
    doc.text('Authentic Vedic Birth Chart Report • Chitrapaksha Lahiri Ayanamsha • For Self-Empowerment & Astrological Guidance', margin, pageHeight - 7);

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Helper: Draw a Section Heading
  const drawSectionHeading = (title: string, yPos: number): number => {
    doc.setFillColor(243, 232, 255); // Purple tint
    doc.roundedRect(margin, yPos, contentWidth, 7, 1.5, 1.5, 'F');

    doc.setFillColor(...lightPurple);
    doc.rect(margin, yPos, 2.5, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryDark);
    doc.text(title.toUpperCase(), margin + 6, yPos + 4.8);

    return yPos + 10;
  };

  // Map planets to short codes
  const planetShortNames: Record<string, string> = {
    Sun: 'Su',
    Moon: 'Mo',
    Mars: 'Ma',
    Mercury: 'Me',
    Jupiter: 'Ju',
    Venus: 'Ve',
    Saturn: 'Sa',
    Rahu: 'Ra',
    Ketu: 'Ke'
  };

  // Group planets by house number (1 to 12)
  const planetsByHouse: Record<number, { name: string; short: string; retro: boolean; deg: number }[]> = {};
  for (let i = 1; i <= 12; i++) {
    planetsByHouse[i] = [];
  }
  chart.planets.forEach(p => {
    if (planetsByHouse[p.house]) {
      planetsByHouse[p.house].push({
        name: p.name,
        short: planetShortNames[p.name] || p.name.substring(0, 2),
        retro: p.isRetrograde,
        deg: p.degreeInSign
      });
    }
  });

  const ascSignIdx = chart.ascendant.signIndex;
  const signNumberInHouse = (houseNum: number) => {
    return ((ascSignIdx + (houseNum - 1)) % 12) + 1;
  };

  // ==========================================
  // PAGE 1: Native Particulars, Vitals & Kundli Chart
  // ==========================================
  drawHeader('Vedic Birth Chart (Lagna Kundli)', 'Chitrapaksha Lahiri System (Nirayana)', 1, 3);

  let currentY = 34;

  // Box 1: Native Birth Particulars Strip
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...lightPurple);
  doc.text('NATIVE BIRTH PARTICULARS', margin + 4, currentY + 5);

  const colW = contentWidth / 4;
  const detailsY1 = currentY + 11;
  const detailsY2 = currentY + 18;

  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text('Full Name:', margin + 4, detailsY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(native.name, margin + 20, detailsY1);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Birth Date:', margin + colW + 4, detailsY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(native.dob, margin + colW + 20, detailsY1);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Birth Time:', margin + colW * 2 + 4, detailsY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(native.tob, margin + colW * 2 + 20, detailsY1);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Gender:', margin + colW * 3 + 4, detailsY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(native.gender ? native.gender.toUpperCase() : 'NOT SPECIFIED', margin + colW * 3 + 17, detailsY1);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Place of Birth:', margin + 4, detailsY2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(native.pob.length > 25 ? native.pob.substring(0, 25) + '...' : native.pob, margin + 24, detailsY2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Coordinates:', margin + colW + 4, detailsY2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(`${native.lat.toFixed(2)}°N, ${native.lng.toFixed(2)}°E`, margin + colW + 23, detailsY2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Ayanamsha:', margin + colW * 2 + 4, detailsY2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(`Lahiri ${chart.ayanamsa.toFixed(2)}°`, margin + colW * 2 + 21, detailsY2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('Julian Day:', margin + colW * 3 + 4, detailsY2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(chart.julianDay ? chart.julianDay.toFixed(1) : '2450917.8', margin + colW * 3 + 19, detailsY2);

  currentY += 27;

  // Box 2: Vedic Astrological Vitals (Lagna, Rashi, Nakshatra, Gana, etc.)
  currentY = drawSectionHeading('Vedic Astrological Vitals & Panchanga Elements', currentY);

  const vitals = [
    { label: 'Ascendant (Lagna)', val: `${chart.ascendant.sign} (${chart.ascendant.degreeInSign}°)`, sub: `Nak: ${chart.ascendant.nakshatra} P${chart.ascendant.pada}` },
    { label: 'Moon Sign (Rashi)', val: chart.vitals.rashi, sub: 'Chandra Lagna' },
    { label: 'Janma Nakshatra', val: chart.vitals.nakshatra, sub: `Pada ${chart.vitals.charan} • Lord: ${chart.vitals.nakshatraLord}` },
    { label: 'Sun Sign (Surya)', val: chart.vitals.sunSign, sub: 'Atmakaraka Essence' },
    { label: 'Gana / Yoni', val: chart.vitals.gana, sub: `Yoni: ${chart.vitals.yoni}` },
    { label: 'Nadi / Varna', val: chart.vitals.nadi, sub: `Varna: ${chart.vitals.varna}` }
  ];

  const vitalBoxW = (contentWidth - 10) / 3;
  const vitalBoxH = 14;

  vitals.forEach((item, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const vx = margin + col * (vitalBoxW + 5);
    const vy = currentY + row * (vitalBoxH + 3);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...cardBorder);
    doc.roundedRect(vx, vy, vitalBoxW, vitalBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedText);
    doc.text(item.label, vx + 3, vy + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryDark);
    doc.text(item.val, vx + 3, vy + 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...lightPurple);
    doc.text(item.sub, vx + 3, vy + 12);
  });

  currentY += 2 * (vitalBoxH + 3) + 4;

  // Box 3: North Indian Kundli Chart (Vector geometry)
  currentY = drawSectionHeading('D-1 Rashi Kundli (North Indian Diamond Format)', currentY);

  const chartSize = 100; // 100mm x 100mm
  const chartX = margin + (contentWidth - chartSize) / 2;
  const chartY = currentY + 1;

  // Background square
  doc.setFillColor(250, 248, 255);
  doc.setDrawColor(124, 58, 237); // Purple 600
  doc.setLineWidth(0.6);
  doc.rect(chartX, chartY, chartSize, chartSize, 'FD');

  // Outer double line
  doc.setDrawColor(217, 119, 6); // Amber
  doc.setLineWidth(0.3);
  doc.rect(chartX + 1.2, chartY + 1.2, chartSize - 2.4, chartSize - 2.4, 'S');

  // Diagonal corner-to-corner lines
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.4);
  doc.line(chartX, chartY, chartX + chartSize, chartY + chartSize);
  doc.line(chartX, chartY + chartSize, chartX + chartSize, chartY);

  // Inner diamond lines connecting midpoints
  const midX = chartX + chartSize / 2;
  const midY = chartY + chartSize / 2;
  doc.setLineWidth(0.5);
  doc.line(midX, chartY, chartX + chartSize, midY);
  doc.line(chartX + chartSize, midY, midX, chartY + chartSize);
  doc.line(midX, chartY + chartSize, chartX, midY);
  doc.line(chartX, midY, midX, chartY);

  // Draw House Numbers & Occupant Planets
  // House coordinate centers (x, y) relative to chartX and chartY
  const houseCoords: Record<number, { signX: number; signY: number; planX: number; planY: number }> = {
    1: { signX: midX, signY: chartY + 11, planX: midX, planY: chartY + 22 },
    2: { signX: chartX + 25, signY: chartY + 11, planX: chartX + 25, planY: chartY + 20 },
    3: { signX: chartX + 11, signY: chartY + 25, planX: chartX + 11, planY: chartY + 35 },
    4: { signX: chartX + 24, signY: midY - 6, planX: chartX + 24, planY: midY + 4 },
    5: { signX: chartX + 11, signY: chartY + 75, planX: chartX + 11, planY: chartY + 85 },
    6: { signX: chartX + 25, signY: chartY + 90, planX: chartX + 25, planY: chartY + 79 },
    7: { signX: midX, signY: chartY + 89, planX: midX, planY: chartY + 76 },
    8: { signX: chartX + 75, signY: chartY + 90, planX: chartX + 75, planY: chartY + 79 },
    9: { signX: chartX + 89, signY: chartY + 75, planX: chartX + 89, planY: chartY + 85 },
    10: { signX: chartX + 76, signY: midY - 6, planX: chartX + 76, planY: midY + 4 },
    11: { signX: chartX + 89, signY: chartY + 25, planX: chartX + 89, planY: chartY + 35 },
    12: { signX: chartX + 75, signY: chartY + 11, planX: chartX + 75, planY: chartY + 20 }
  };

  for (let h = 1; h <= 12; h++) {
    const coords = houseCoords[h];
    const signNum = signNumberInHouse(h);
    const occupants = planetsByHouse[h] || [];

    // Sign number badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...accentGold);
    doc.text(h === 1 ? `Asc (${signNum})` : `${signNum}`, coords.signX, coords.signY, { align: 'center' });

    // Planets inside house
    if (occupants.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...primaryDark);

      occupants.forEach((p, pIdx) => {
        const pLabel = `${p.short}${p.retro ? '®' : ''} ${Math.floor(p.deg)}°`;
        doc.text(pLabel, coords.planX, coords.planY + pIdx * 4.2, { align: 'center' });
      });
    }
  }

  currentY += chartSize + 5;

  // Chart legend banner
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text('Legend: Numbers in houses designate Sidereal Rasi signs (1=Mesha/Aries ... 12=Meena/Pisces). ® denotes Retrograde motion (Vakri).', margin + contentWidth / 2, currentY, { align: 'center' });

  // ==========================================
  // PAGE 2: Planetary Positions & Dasha Timeline
  // ==========================================
  doc.addPage();
  drawHeader('Planetary Positions & Dasha Timeline', 'Graha Spashta & Vimshottari Mahadasha', 2, 3);

  currentY = 34;
  currentY = drawSectionHeading('Graha Spashta (Precise Planetary Coordinates)', currentY);

  // Planetary Table
  const tableHeaders = ['Graha', 'Sanskrit', 'Rashi (Sign)', 'Longitude', 'House', 'Nakshatra', 'Dignity'];
  const colWidths = [22, 24, 28, 26, 20, 36, 26]; // sum = 182mm
  const rowHeight = 7.2;

  // Table Header Row
  doc.setFillColor(...headerBg);
  doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

  let tableX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(253, 230, 138); // warm gold
  tableHeaders.forEach((th, i) => {
    doc.text(th, tableX + 3, currentY + 4.8);
    tableX += colWidths[i];
  });

  currentY += rowHeight;

  // Table Body Rows
  chart.planets.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

    doc.setDrawColor(...cardBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

    tableX = margin;

    // Graha Name + Retrograde
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryDark);
    const retroStr = p.isRetrograde ? ' (R)' : '';
    doc.text(`${p.name}${retroStr}`, tableX + 3, currentY + 4.8);
    tableX += colWidths[0];

    // Sanskrit
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text(p.sanskritName || p.name, tableX + 3, currentY + 4.8);
    tableX += colWidths[1];

    // Rashi
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text(p.sign, tableX + 3, currentY + 4.8);
    tableX += colWidths[2];

    // Longitude in sign
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...cyanAccent);
    doc.text(`${p.degreeInSign.toFixed(2)}°`, tableX + 3, currentY + 4.8);
    tableX += colWidths[3];

    // House
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(`House ${p.house}`, tableX + 3, currentY + 4.8);
    tableX += colWidths[4];

    // Nakshatra & Pada
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryDark);
    doc.text(`${p.nakshatra} (P${p.pada})`, tableX + 3, currentY + 4.8);
    tableX += colWidths[5];

    // Dignity with color highlight
    doc.setFont('helvetica', 'bold');
    if (p.dignity === 'Exalted') {
      doc.setTextColor(16, 185, 129); // emerald
    } else if (p.dignity === 'Debilitated') {
      doc.setTextColor(239, 68, 68); // rose
    } else if (p.dignity === 'Own') {
      doc.setTextColor(124, 58, 237); // purple
    } else {
      doc.setTextColor(...mutedText);
    }
    doc.text(p.dignity, tableX + 3, currentY + 4.8);

    currentY += rowHeight;
  });

  currentY += 8;

  // Box: Vimshottari Mahadasha Progression Timeline
  currentY = drawSectionHeading('Vimshottari Mahadasha Timeline (120-Year Planetary Cycle)', currentY);

  // Compute Dasha sequence starting from the Nakshatra Lord of the Moon
  const moonNakLord = chart.vitals.nakshatraLord || 'Ketu';
  const startLordIndex = DASHA_ORDER.findIndex(d => d.lord.toLowerCase() === moonNakLord.toLowerCase());
  const birthYear = parseInt(native.dob.split('-')[0] || '1998', 10);

  // Construct dasha sequence for native
  let currentStartYear = birthYear;
  const dashaTimeline: { lord: string; start: number; end: number; years: number }[] = [];

  for (let i = 0; i < DASHA_ORDER.length; i++) {
    const idx = (startLordIndex + i) % DASHA_ORDER.length;
    const item = DASHA_ORDER[idx];
    const endYear = currentStartYear + item.years;
    dashaTimeline.push({
      lord: item.lord,
      start: currentStartYear,
      end: endYear,
      years: item.years
    });
    currentStartYear = endYear;
  }

  const dashaBoxW = (contentWidth - 6) / 3;
  const dashaBoxH = 13.5;
  const currentYearNow = new Date().getFullYear();

  dashaTimeline.slice(0, 6).forEach((d, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const dx = margin + col * (dashaBoxW + 3);
    const dy = currentY + row * (dashaBoxH + 3);

    const isCurrent = currentYearNow >= d.start && currentYearNow <= d.end;

    doc.setFillColor(isCurrent ? 245 : 255, isCurrent ? 243 : 255, isCurrent ? 255 : 255);
    doc.setDrawColor(isCurrent ? 147 : 226, isCurrent ? 51 : 232, isCurrent ? 234 : 240);
    doc.setLineWidth(isCurrent ? 0.5 : 0.2);
    doc.roundedRect(dx, dy, dashaBoxW, dashaBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(isCurrent ? lightPurple : primaryDark));
    doc.text(`${d.lord} Mahadasha (${d.years} Yrs)`, dx + 3, dy + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedText);
    doc.text(`Period: ${d.start} — ${d.end}`, dx + 3, dy + 9);

    if (isCurrent) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129); // green
      doc.text('• CURRENTLY ACTIVE PERIOD', dx + 3, dy + 12);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...mutedText);
      doc.text(currentYearNow > d.end ? 'Completed Phase' : 'Upcoming Phase', dx + 3, dy + 12);
    }
  });

  currentY += 2 * (dashaBoxH + 3) + 7;

  // Box: Dosha Assessments (Manglik, Kaal Sarp, Sade Sati)
  currentY = drawSectionHeading('Dosha & Karmic Alignment Diagnostics', currentY);

  const doshaBoxW = (contentWidth - 6) / 3;
  const doshaBoxH = 34;

  // Manglik Card
  const mX = margin;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(mX, currentY, doshaBoxW, doshaBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryDark);
  doc.text('Manglik Dosha (Kuja)', mX + 3, currentY + 5);

  const manglikBadgeColor: [number, number, number] = chart.doshas.isManglik ? [239, 68, 68] : [16, 185, 129];
  doc.setTextColor(...manglikBadgeColor);
  doc.setFontSize(7.5);
  doc.text(chart.doshas.isManglik ? `Status: ${chart.doshas.manglikSeverity} Presence` : 'Status: Absent (Nirdosh)', mX + 3, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  const manglikLines = doc.splitTextToSize(chart.doshas.manglikReason || 'Mars is placed in a neutral house, maintaining balanced marital harmony.', doshaBoxW - 6);
  doc.text(manglikLines, mX + 3, currentY + 15);

  // Kaal Sarp Card
  const ksX = margin + doshaBoxW + 3;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(ksX, currentY, doshaBoxW, doshaBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryDark);
  doc.text('Kaal Sarp Yoga', ksX + 3, currentY + 5);

  const ksColor: [number, number, number] = chart.doshas.hasKaalSarp ? accentGold : [16, 185, 129];
  doc.setTextColor(...ksColor);
  doc.setFontSize(7.5);
  doc.text(chart.doshas.hasKaalSarp ? `Status: ${chart.doshas.kaalSarpType || 'Present'}` : 'Status: Not Present (Free)', ksX + 3, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  const ksDesc = chart.doshas.hasKaalSarp
    ? 'All planets are bordered between Rahu and Ketu, creating concentrated spiritual growth and perseverance through hurdles.'
    : 'Planets are distributed harmoniously without Rahu-Ketu axis restriction, facilitating balanced material progress.';
  const ksLines = doc.splitTextToSize(ksDesc, doshaBoxW - 6);
  doc.text(ksLines, ksX + 3, currentY + 15);

  // Sade Sati Card
  const ssX = margin + (doshaBoxW + 3) * 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(ssX, currentY, doshaBoxW, doshaBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryDark);
  doc.text('Saturn Sade Sati', ssX + 3, currentY + 5);

  const ssColor: [number, number, number] = chart.doshas.sadeSatiStatus.inSadeSati ? lightPurple : [16, 185, 129];
  doc.setTextColor(...ssColor);
  doc.setFontSize(7.5);
  doc.text(`Phase: ${chart.doshas.sadeSatiStatus.phase}`, ssX + 3, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  const ssLines = doc.splitTextToSize(chart.doshas.sadeSatiStatus.description || 'Saturn transits favorably relative to natal Moon sign.', doshaBoxW - 6);
  doc.text(ssLines, ssX + 3, currentY + 15);

  // ==========================================
  // PAGE 3: Astrological Reading, Forecast & Remedies
  // ==========================================
  doc.addPage();
  drawHeader('Astrological Reading & Classical Vedic Remedies', 'Life Predictions & Upayas', 3, 3);

  currentY = 34;
  currentY = drawSectionHeading('Comprehensive Astrological Reading & Life Domains', currentY);

  const lagnaSign = chart.ascendant.sign;
  const moonSign = chart.vitals.rashi;
  const nakshatra = chart.vitals.nakshatra;

  const readings = [
    {
      title: `1. Physical Constitution & Ascendant (${lagnaSign} Lagna)`,
      body: `With ${lagnaSign} rising at ${chart.ascendant.degreeInSign}°, you possess natural initiative, sharp analytical clarity, and strong willpower. Your ruling planetary energy fuels purposeful action. In the physical realm, you are endowed with resilient stamina, though pacing your energy is vital to prevent burnout during stressful planetary transits.`
    },
    {
      title: `2. Emotional Disposition & Mind (${moonSign} Rashi • ${nakshatra})`,
      body: `Your Moon occupies ${moonSign} in ${nakshatra} Nakshatra. This alignment fosters deep intuition, intellectual depth, and keen emotional perception. You seek authentic relationships and have a profound talent for navigating complex life puzzles. Meditative focus and proximity to nature help anchor emotional serenity.`
    },
    {
      title: '3. Career, Karma & Professional Elevation (10th Bhava Analysis)',
      body: `The 10th house indicates remarkable potential in strategy, engineering, technology, management, and entrepreneurial domains. Planetary strengths favor ventures where autonomy and creative insight are paramount. Key expansion cycles align during benefic Mahadasha and Antardasha periods.`
    },
    {
      title: '4. Wealth, Financial Prosperity & Resource Flow (2nd & 11th Bhavas)',
      body: `Dhana Yogas (wealth combinations) in your chart reflect cumulative financial growth. Prudent investment in diversified, long-term avenues yields high returns. Generosity and ethical conduct amplify planetary blessings in your financial sphere.`
    }
  ];

  readings.forEach(item => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...cardBorder);
    doc.roundedRect(margin, currentY, contentWidth, 23, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...lightPurple);
    doc.text(item.title, margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...textColor);
    const bodyLines = doc.splitTextToSize(item.body, contentWidth - 8);
    doc.text(bodyLines, margin + 4, currentY + 10);

    currentY += 26;
  });

  currentY += 2;

  // Box: Classical Vedic Remedies (Upayas, Ratna, Mantras)
  currentY = drawSectionHeading('Recommended Classical Vedic Remedies (Upayas)', currentY);

  const remedies = [
    {
      title: 'Auspicious Gemstone (Ratna)',
      desc: lagnaSign === 'Aries' || lagnaSign === 'Scorpio'
        ? 'Red Coral (Moonga) or Yellow Sapphire (Pukhraj), mounted in copper or gold, worn after purification on Tuesday or Thursday.'
        : lagnaSign === 'Taurus' || lagnaSign === 'Libra'
        ? 'Diamond (Heera) or White Zircon, mounted in silver/platinum, worn on Friday morning.'
        : lagnaSign === 'Gemini' || lagnaSign === 'Virgo'
        ? 'Emerald (Panna) of 4-6 carats mounted in gold/bronze, worn on Wednesday morning.'
        : lagnaSign === 'Cancer'
        ? 'Natural Pearl (Moti) or Moonstone mounted in silver, worn on Monday morning.'
        : lagnaSign === 'Leo'
        ? 'Ruby (Manikya) in copper or gold, worn on Sunday morning during sunrise.'
        : 'Yellow Sapphire (Brihaspati Ratna) or Ruby, energised on auspicious Muhurats.'
    },
    {
      title: 'Sacred Vedic Mantra',
      desc: 'Chant the Gayatri Mantra or Mahamrityunjaya Mantra 108 times at sunrise: "Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat".'
    },
    {
      title: 'Beneficial Rudraksha',
      desc: 'Five-Mukhi (Panchamukhi) Rudraksha paired with a Three-Mukhi Rudraksha to awaken inner vitality, dispel fatigue, and cultivate peaceful mental clarity.'
    },
    {
      title: 'Beneficial Days & Lucky Colors',
      desc: `Lucky Days: Sunday & Thursday • Harmonious Colors: Golden Yellow, Royal White & Deep Saffron • Auspicious Directions: East & Northeast (Ishanya).`
    }
  ];

  const remBoxW = (contentWidth - 4) / 2;
  const remBoxH = 20;

  remedies.forEach((rem, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const rx = margin + col * (remBoxW + 4);
    const ry = currentY + row * (remBoxH + 3);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...cardBorder);
    doc.roundedRect(rx, ry, remBoxW, remBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...accentGold);
    doc.text(rem.title, rx + 3, ry + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...mutedText);
    const rLines = doc.splitTextToSize(rem.desc, remBoxW - 6);
    doc.text(rLines, rx + 3, ry + 9);
  });

  currentY += 2 * (remBoxH + 3) + 4;

  // Disclaimer Note Box
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...lightPurple);
  doc.text('ETHICAL ASTROLOGY & FREE WILL DISCLAIMER', margin + 3, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...mutedText);
  doc.text('Vedic astrology highlights energetic tendencies and karmic blueprints. Human consciousness, noble intention, and purposeful karma remain the supreme catalysts of destiny. Use this report for mindful reflection, personal growth, and spiritual alignment.', margin + 3, currentY + 8);

  return doc;
}
