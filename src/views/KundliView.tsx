import React, { useState, useEffect } from 'react';
import { 
  Compass, Calendar, Clock, MapPin, Printer, 
  CheckCircle, AlertTriangle, ShieldCheck, Download, Share2,
  FileText, Sparkles, CheckCircle2, Loader2, ExternalLink
} from 'lucide-react';
import { User, KundliResult } from '../types';
import { api } from '../services/api';
import { KundliChartSvg } from '../components/KundliChartSvg';
import { EthicalAstrologyBanner } from '../components/Disclaimers';
import { generateVedicKundliPdf } from '../services/pdfReportGenerator';

interface KundliViewProps {
  user: User | null;
}

const POPULAR_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

export const KundliView: React.FC<KundliViewProps> = ({ user }) => {
  const [name, setName] = useState(user?.name || 'Pushkar Prasad');
  const [dob, setDob] = useState(user?.birthDetails?.date || '1998-04-14');
  const [tob, setTob] = useState(user?.birthDetails?.time || '08:30');
  const [city, setCity] = useState(user?.birthDetails?.place || 'New Delhi, India');
  const [latitude, setLatitude] = useState<number>(user?.birthDetails?.latitude || 28.6139);
  const [longitude, setLongitude] = useState<number>(user?.birthDetails?.longitude || 77.2090);
  const [gender, setGender] = useState(user?.birthDetails?.gender || 'male');
  
  const [chart, setChart] = useState<KundliResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);

  const handleCitySelect = (selected: typeof POPULAR_CITIES[0]) => {
    setCity(selected.name);
    setLatitude(selected.lat);
    setLongitude(selected.lng);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await api.calculateKundli({
        name,
        date: dob,
        time: tob,
        latitude,
        longitude,
        place: city,
        gender,
        saveToProfile: true,
        userId: user?.id
      });
      setChart(res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to compute chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate on first mount with current details
    handleGenerate();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async (openInNewTab = false) => {
    if (!chart) return;
    setPdfGenerating(true);
    setPdfSuccessMsg(null);

    try {
      // Allow slight tick for UI feedback
      await new Promise(r => setTimeout(r, 200));

      const doc = generateVedicKundliPdf(chart, {
        name,
        dob,
        tob,
        pob: city,
        lat: latitude,
        lng: longitude,
        gender
      });

      const sanitizedName = name.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Native';
      const fileName = `AASTRONIQ_Vedic_Kundli_${sanitizedName}.pdf`;

      if (openInNewTab) {
        const blobUrl = doc.output('bloburl');
        window.open(blobUrl, '_blank');
        setPdfSuccessMsg('PDF Report opened in new window!');
      } else {
        doc.save(fileName);
        setPdfSuccessMsg(`Report downloaded as ${fileName}!`);
      }

      setTimeout(() => setPdfSuccessMsg(null), 4500);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
        <div>
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-purple-400" />
            <span>Vedic Kundli & Planetary Positions</span>
          </h1>
          <p className="text-xs text-slate-400">
            Computed with Chitrapaksha (Lahiri) Ayanamsha & high-precision planetary ephemeris
          </p>
        </div>

        {chart && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Download PDF Button in Top Bar */}
            <button
              onClick={() => handleDownloadPdf(false)}
              disabled={pdfGenerating}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Download 3-Page Formatted Vedic Horoscope PDF Report"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Formatting PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        )}
      </div>

      {/* PDF Generation Success Notification */}
      {pdfSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{pdfSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">Chitrapaksha Lahiri • 300 DPI</span>
        </div>
      )}

      {/* Input Form */}
      <div className="cosmic-glass rounded-2xl p-5 border border-purple-500/20 shadow-xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Enter Birth Particulars
        </h2>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Date of Birth</label>
            <div className="relative">
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Time of Birth (24hr)</label>
            <div className="relative">
              <input
                type="time"
                value={tob}
                onChange={e => setTob(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Place of Birth</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
              placeholder="City, Country"
              required
            />
          </div>

          {/* Quick city selectors */}
          <div className="col-span-full pt-1">
            <span className="text-[11px] text-slate-400 mr-2">Quick Cities:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {POPULAR_CITIES.map(c => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => handleCitySelect(c)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    city === c.name
                      ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                      : 'bg-slate-900/60 border-purple-500/15 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-full flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Coordinates:</span>
              <span className="font-mono text-[11px] text-cyan-300">
                {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Compass className="w-4 h-4" />
              <span>{loading ? 'Calculating Ephemeris...' : 'Generate Kundli'}</span>
            </button>
          </div>
        </form>

        {savedSuccess && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Kundli chart calculated and saved to your profile!</span>
          </div>
        )}
      </div>

      <EthicalAstrologyBanner compact />

      {/* Chart Results Display */}
      {chart && (
        <div className="space-y-6">
          {/* Vitals Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl cosmic-glass border border-purple-500/15">
              <span className="text-slate-400 text-[10px] block">Ascendant (Lagna)</span>
              <p className="font-bold text-sm text-purple-200 mt-0.5">{chart.ascendant.sign}</p>
              <span className="text-[10px] text-slate-500">{chart.ascendant.degreeInSign}°</span>
            </div>

            <div className="p-3 rounded-2xl cosmic-glass border border-purple-500/15">
              <span className="text-slate-400 text-[10px] block">Moon Sign (Rashi)</span>
              <p className="font-bold text-sm text-cyan-200 mt-0.5">{chart.vitals.rashi}</p>
              <span className="text-[10px] text-slate-500">Chandra Lagna</span>
            </div>

            <div className="p-3 rounded-2xl cosmic-glass border border-purple-500/15">
              <span className="text-slate-400 text-[10px] block">Nakshatra</span>
              <p className="font-bold text-sm text-amber-200 mt-0.5">{chart.vitals.nakshatra}</p>
              <span className="text-[10px] text-slate-500">Pada {chart.vitals.charan} · {chart.vitals.nakshatraLord}</span>
            </div>

            <div className="p-3 rounded-2xl cosmic-glass border border-purple-500/15">
              <span className="text-slate-400 text-[10px] block">Sun Sign (Surya)</span>
              <p className="font-bold text-sm text-white mt-0.5">{chart.vitals.sunSign}</p>
              <span className="text-[10px] text-slate-500">Soul Essence</span>
            </div>

            <div className="p-3 rounded-2xl cosmic-glass border border-purple-500/15">
              <span className="text-slate-400 text-[10px] block">Gana / Yoni</span>
              <p className="font-bold text-sm text-purple-200 mt-0.5">{chart.vitals.gana}</p>
              <span className="text-[10px] text-slate-500">Yoni: {chart.vitals.yoni}</span>
            </div>

            <div className="p-3 rounded-2xl cosmic-glass border border-purple-500/15">
              <span className="text-slate-400 text-[10px] block">Nadi / Varna</span>
              <p className="font-bold text-sm text-cyan-200 mt-0.5">{chart.vitals.nadi}</p>
              <span className="text-[10px] text-slate-500">{chart.vitals.varna}</span>
            </div>
          </div>

          {/* North and South Indian Kundli Chart Visualizer */}
          <KundliChartSvg chart={chart} title={`Vedic Birth Chart for ${name}`} />

          {/* Dosha Analysis Cards */}
          <div className="space-y-3">
            <h3 className="font-cinzel text-base font-bold text-white">
              Dosha & Planetary Transit Assessments
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Manglik Analysis */}
              <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Manglik Dosha</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    chart.doshas.isManglik
                      ? chart.doshas.manglikSeverity === 'High'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {chart.doshas.isManglik ? `${chart.doshas.manglikSeverity} Presence` : 'Absent'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {chart.doshas.manglikReason}
                </p>
              </div>

              {/* Kaal Sarp Analysis */}
              <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Kaal Sarp Yoga</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    chart.doshas.hasKaalSarp
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {chart.doshas.hasKaalSarp ? (chart.doshas.kaalSarpType || 'Present') : 'Not Present'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {chart.doshas.hasKaalSarp
                    ? 'Planets are bordered within the Rahu-Ketu karmic axis, promoting concentrated spiritual focus.'
                    : 'Planets are distributed harmoniously without Rahu-Ketu confinement.'}
                </p>
              </div>

              {/* Saturn Sade Sati */}
              <div className="cosmic-glass rounded-2xl p-4 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Saturn Sade Sati</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    chart.doshas.sadeSatiStatus.inSadeSati
                      ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {chart.doshas.sadeSatiStatus.phase}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {chart.doshas.sadeSatiStatus.description}
                </p>
              </div>
            </div>
          </div>

          {/* Formatted PDF Report Generation Banner */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-indigo-950/60 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Comprehensive 3-Page Vedic Jyotish Document</span>
                </div>

                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-tight">
                  Download Formatted Vedic Birth Chart & Astrological Report (PDF)
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Export a clean, publication-grade Vedic astrological dossier generated with precision Lahiri ephemeris. Includes your native birth particulars, vector D-1 Diamond Rashi Kundli, 9-planet Graha Spashta coordinates table, 120-year Vimshottari Mahadasha progression, and customized Vedic remedies (Ratna, Mantras & Rudraksha).
                </p>

                {/* Summary badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-cyan-400" />
                    <span>Vector Kundli</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Dasha Timeline</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Dosha Analysis</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Vedic Remedies</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(false)}
                  disabled={pdfGenerating}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-purple-600/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {pdfGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating PDF Document...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>Download PDF Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf(true)}
                  disabled={pdfGenerating}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-purple-500/30 flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview in New Tab</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
