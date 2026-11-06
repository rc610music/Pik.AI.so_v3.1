import React, { useMemo } from 'react';

export const StarryGalaxyBackground: React.FC = () => {
  // Generate a list of randomized stars to avoid repetitive CSS
  const stars = useMemo(() => {
    const starList = [];
    for (let i = 0; i < 120; i++) {
      starList.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        delay: `${Math.random() * 5}s`,
        duration: `${3 + Math.random() * 5}s`,
      });
    }
    return starList;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
      {/* Galaxy Deep Space Gradients */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #07041a 0%, #020108 100%)',
        }}
      />

      {/* Large Glowing Nebulas (matching user's galaxy image) */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full filter blur-[120px] opacity-[0.25] animate-pulse"
        style={{
          top: '15%',
          left: '10%',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          animationDuration: '18s',
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-[0.2] animate-pulse"
        style={{
          bottom: '15%',
          right: '5%',
          background: 'radial-gradient(circle, #db2777 0%, transparent 70%)',
          animationDuration: '14s',
        }}
      />
      <div 
        className="absolute w-[450px] h-[450px] rounded-full filter blur-[90px] opacity-[0.18] animate-pulse"
        style={{
          top: '60%',
          left: '50%',
          background: 'radial-gradient(circle, #0891b2 0%, transparent 70%)',
          animationDuration: '22s',
        }}
      />

      {/* Starfield Layer */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
              boxShadow: star.size > 1.8 ? '0 0 5px 2px rgba(255, 255, 255, 0.4)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Fine Dust Grid (Overlay) */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default StarryGalaxyBackground;
