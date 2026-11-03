import React, { useState } from 'react';
import { KundliResult, SANSKRIT_SIGNS } from '../types';

interface KundliChartProps {
  chart: KundliResult;
  title?: string;
}

export const KundliChartSvg: React.FC<KundliChartProps> = ({ chart, title = 'Lagna Kundli (D-1)' }) => {
  const [chartType, setChartType] = useState<'north' | 'south'>('north');

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

  // Calculate sign in each house (House 1 has ascendant sign, 1-indexed)
  const ascSignIdx = chart.ascendant.signIndex; // 0 to 11
  const signNumberInHouse = (houseNum: number) => {
    return ((ascSignIdx + (houseNum - 1)) % 12) + 1;
  };

  return (
    <div className="cosmic-glass rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-2xl space-y-4">
      {/* Header and Style Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/15 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200">
            {title}
          </h3>
          <p className="text-xs text-slate-400">
            Ascendant: <span className="text-purple-300 font-medium">{chart.ascendant.sign}</span> ({chart.ascendant.degreeInSign}°) · Nakshatra: <span className="text-cyan-300">{chart.ascendant.nakshatra} (Pada {chart.ascendant.pada})</span>
          </p>
        </div>

        {/* Chart Style Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-purple-500/20 text-xs self-start sm:self-auto">
          <button
            onClick={() => setChartType('north')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              chartType === 'north'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            North Indian (Diamond)
          </button>
          <button
            onClick={() => setChartType('south')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              chartType === 'south'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            South Indian (Grid)
          </button>
        </div>
      </div>

      {/* Chart Diagram SVG */}
      <div className="flex justify-center items-center py-2">
        {chartType === 'north' ? (
          /* North Indian Diamond Vedic Kundli */
          <div className="relative w-full max-w-[420px] aspect-square">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.25)] select-none"
            >
              <defs>
                <linearGradient id="chartBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="houseFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#131735" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0b0e24" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Background Square */}
              <rect
                x="10"
                y="10"
                width="380"
                height="380"
                fill="url(#houseFill)"
                stroke="url(#chartBorder)"
                strokeWidth="2.5"
                rx="8"
              />

              {/* Diagonal lines connecting corners */}
              <line x1="10" y1="10" x2="390" y2="390" stroke="url(#chartBorder)" strokeWidth="1.8" opacity="0.8" />
              <line x1="10" y1="390" x2="390" y2="10" stroke="url(#chartBorder)" strokeWidth="1.8" opacity="0.8" />

              {/* Inner Diamond connecting midpoints: (200,10), (390,200), (200,390), (10,200) */}
              <polygon
                points="200,10 390,200 200,390 10,200"
                fill="none"
                stroke="url(#chartBorder)"
                strokeWidth="2"
                opacity="0.9"
              />

              {/* HOUSE LABELS & PLANET ENTRIES */}
              {/* House 1 (Top Center Diamond) */}
              <g transform="translate(200, 105)" textAnchor="middle">
                <text y="-35" fill="#a78bfa" fontSize="13" fontWeight="bold">Asc ({signNumberInHouse(1)})</text>
                {planetsByHouse[1]?.map((p, idx) => (
                  <text key={idx} y={-10 + idx * 16} fill="#f1f5f9" fontSize="13" fontWeight="bold">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="10">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 2 (Top Left Triangle) */}
              <g transform="translate(100, 60)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(2)}</text>
                {planetsByHouse[2]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 3 (Upper Left Triangle) */}
              <g transform="translate(60, 110)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(3)}</text>
                {planetsByHouse[3]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 4 (Left Center Diamond) */}
              <g transform="translate(105, 200)" textAnchor="middle">
                <text y="-25" fill="#a78bfa" fontSize="12" fontWeight="bold">{signNumberInHouse(4)}</text>
                {planetsByHouse[4]?.map((p, idx) => (
                  <text key={idx} y={-5 + idx * 15} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 5 (Lower Left Triangle) */}
              <g transform="translate(60, 290)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(5)}</text>
                {planetsByHouse[5]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 6 (Bottom Left Triangle) */}
              <g transform="translate(100, 340)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(6)}</text>
                {planetsByHouse[6]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 7 (Bottom Center Diamond) */}
              <g transform="translate(200, 295)" textAnchor="middle">
                <text y="-20" fill="#a78bfa" fontSize="12" fontWeight="bold">{signNumberInHouse(7)}</text>
                {planetsByHouse[7]?.map((p, idx) => (
                  <text key={idx} y={0 + idx * 15} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 8 (Bottom Right Triangle) */}
              <g transform="translate(300, 340)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(8)}</text>
                {planetsByHouse[8]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 9 (Lower Right Triangle) */}
              <g transform="translate(340, 290)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(9)}</text>
                {planetsByHouse[9]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 10 (Right Center Diamond) */}
              <g transform="translate(295, 200)" textAnchor="middle">
                <text y="-25" fill="#a78bfa" fontSize="12" fontWeight="bold">{signNumberInHouse(10)}</text>
                {planetsByHouse[10]?.map((p, idx) => (
                  <text key={idx} y={-5 + idx * 15} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 11 (Upper Right Triangle) */}
              <g transform="translate(340, 110)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(11)}</text>
                {planetsByHouse[11]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>

              {/* House 12 (Top Right Triangle) */}
              <g transform="translate(300, 60)" textAnchor="middle">
                <text y="-5" fill="#a78bfa" fontSize="11" fontWeight="600">{signNumberInHouse(12)}</text>
                {planetsByHouse[12]?.map((p, idx) => (
                  <text key={idx} y={15 + idx * 14} fill="#f1f5f9" fontSize="12" fontWeight="600">
                    {p.short}{p.retro ? '®' : ''} <tspan fill="#38bdf8" fontSize="9">{Math.floor(p.deg)}°</tspan>
                  </text>
                ))}
              </g>
            </svg>
          </div>
        ) : (
          /* South Indian Grid Kundli */
          <div className="w-full max-w-[420px] aspect-square grid grid-cols-4 grid-rows-4 border-2 border-purple-500/50 rounded-xl overflow-hidden bg-slate-900/60 p-1 gap-1">
            {/* South Indian layout: Signs are fixed clockwise starting from Pisces (row 0, col 0 is Pisces) */}
            {[
              { rashi: 'Pisces', rashiNum: 12, row: 'col-start-1 row-start-1' },
              { rashi: 'Aries', rashiNum: 1, row: 'col-start-2 row-start-1' },
              { rashi: 'Taurus', rashiNum: 2, row: 'col-start-3 row-start-1' },
              { rashi: 'Gemini', rashiNum: 3, row: 'col-start-4 row-start-1' },
              { rashi: 'Aquarius', rashiNum: 11, row: 'col-start-1 row-start-2' },
              { rashi: 'Cancer', rashiNum: 4, row: 'col-start-4 row-start-2' },
              { rashi: 'Capricorn', rashiNum: 10, row: 'col-start-1 row-start-3' },
              { rashi: 'Leo', rashiNum: 5, row: 'col-start-4 row-start-3' },
              { rashi: 'Sagittarius', rashiNum: 9, row: 'col-start-1 row-start-4' },
              { rashi: 'Scorpio', rashiNum: 8, row: 'col-start-2 row-start-4' },
              { rashi: 'Libra', rashiNum: 7, row: 'col-start-3 row-start-4' },
              { rashi: 'Virgo', rashiNum: 6, row: 'col-start-4 row-start-4' }
            ].map(cell => {
              const planetsInSign = chart.planets.filter(p => p.signIndex === cell.rashiNum - 1);
              const isAscSign = chart.ascendant.signIndex === cell.rashiNum - 1;

              return (
                <div
                  key={cell.rashi}
                  className={`${cell.row} border border-purple-500/25 bg-slate-950/70 p-1.5 flex flex-col justify-between text-[11px] rounded`}
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold text-purple-300">{cell.rashi.substring(0, 3)}</span>
                    {isAscSign && <span className="text-amber-400 font-bold px-1 rounded bg-amber-400/20">ASC</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {planetsInSign.map((p, idx) => (
                      <span key={idx} className="font-bold text-white text-[10px]">
                        {planetShortNames[p.name] || p.name.substring(0, 2)}
                        {p.isRetrograde ? '®' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Center Area */}
            <div className="col-start-2 col-span-2 row-start-2 row-span-2 flex flex-col items-center justify-center border border-purple-500/20 bg-purple-950/20 rounded-lg p-2 text-center">
              <span className="font-cinzel text-xs font-bold text-amber-300">AASTRONIQ</span>
              <span className="text-[10px] text-slate-400 mt-0.5">_astrology (D-1)</span>
              <span className="text-[10px] text-cyan-400 mt-1 font-mono">Ayanamsa: {chart.ayanamsa}°</span>
            </div>
          </div>
        )}
      </div>

      {/* Planetary Table */}
      <div className="overflow-x-auto border-t border-purple-500/15 pt-3">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-purple-500/10">
              <th className="pb-2 font-medium">Planet (Graha)</th>
              <th className="pb-2 font-medium">Sign (Rashi)</th>
              <th className="pb-2 font-medium">Degree</th>
              <th className="pb-2 font-medium">House</th>
              <th className="pb-2 font-medium">Nakshatra</th>
              <th className="pb-2 font-medium">Dignity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10 text-slate-200">
            {chart.planets.map(p => (
              <tr key={p.name} className="hover:bg-purple-950/20 transition-colors">
                <td className="py-2 font-semibold text-purple-200 flex items-center gap-1.5">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({p.sanskritName})</span>
                  {p.isRetrograde && <span className="text-[10px] text-amber-400 font-mono">®</span>}
                </td>
                <td className="py-2 text-slate-300">{p.sign}</td>
                <td className="py-2 font-mono text-cyan-300">{p.degreeInSign}°</td>
                <td className="py-2 font-medium text-slate-300">House {p.house}</td>
                <td className="py-2 text-slate-400">
                  {p.nakshatra} <span className="text-purple-400">P{p.pada}</span>
                </td>
                <td className="py-2">
                  <span className={`text-[11px] font-medium ${
                    p.dignity === 'Exalted' ? 'text-emerald-400' :
                    p.dignity === 'Debilitated' ? 'text-rose-400' :
                    p.dignity === 'Own' ? 'text-purple-300' : 'text-slate-300'
                  }`}>
                    {p.dignity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
