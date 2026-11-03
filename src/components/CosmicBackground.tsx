import React from 'react';

export const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep space base background */}
      <div className="absolute inset-0 bg-[#060814]" />
      
      {/* AASTRONIQ Sacred Celestial Star Wallpaper */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat bg-contain sm:bg-[length:650px_650px] opacity-25 mix-blend-screen transition-opacity duration-1000"
        style={{
          backgroundImage: `url('/assets/aistudio/1793610372476_6b90d080.jpg')`,
        }}
      />

      {/* Dark gradient mask over wallpaper for maximum contrast & legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060814]/90 via-[#060814]/75 to-[#060814]/95" />

      {/* Electric purple cosmic nebula aura */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(91, 33, 182, 0.2) 60%, transparent 100%)' }}
      />
      
      {/* Golden amber / cyan cosmic nebula aura */}
      <div 
        className="absolute top-[35%] -right-[15%] w-[650px] h-[650px] rounded-full blur-[150px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.4) 0%, rgba(56, 189, 248, 0.2) 50%, transparent 100%)' }}
      />
      
      {/* Deep magenta galactic core glow */}
      <div 
        className="absolute -bottom-[20%] left-[25%] w-[700px] h-[700px] rounded-full blur-[160px] opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.4) 0%, transparent 70%)' }}
      />

      {/* Subtle star particle grid */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 25px 35px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 120px 80px, #eab308, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 210px 180px, #38bdf8, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 320px 45px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 450px 220px, #c084fc, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 600px 130px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 780px 290px, #eab308, rgba(0,0,0,0))
          `,
          backgroundSize: '850px 350px'
        }}
      />
    </div>
  );
};
