import React from 'react';

interface LogoProps {
  className?: string;
}

export const PikAisoLogo: React.FC<LogoProps> = ({ className }) => (
  <svg 
    viewBox="0 0 280 120" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Cyan to Ocean Blue Gradient for 'pik' and '.so.' */}
      <linearGradient id="pik-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="100%" stopColor="#4facfe" />
      </linearGradient>
      
      {/* Intense Magenta/Pink to Electric Violet Gradient for 'Ai' */}
      <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff007f" />
        <stop offset="50%" stopColor="#d946ef" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>

      {/* Swoosh Gradient matching the visual brush stroke */}
      <linearGradient id="swoosh-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="50%" stopColor="#d946ef" />
        <stop offset="100%" stopColor="#ff007f" />
      </linearGradient>

      {/* Drop shadow filter to elevate the brand asset */}
      <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#8b5cf6" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Brand Script Typography Group */}
    <g filter="url(#logo-glow)">
      {/* 'pik' in highly expressive, fluid cursive style */}
      <text 
        x="20" 
        y="65" 
        fontFamily="'Kaushan Script', 'Caveat', 'Pacifico', cursive" 
        fontWeight="700" 
        fontSize="54" 
        fill="url(#pik-grad)" 
        letterSpacing="0.5"
      >
        pik
      </text>
      
      {/* 'Ai' in a distinct, larger, thick brush-drawn calligraphic style */}
      <text 
        x="96" 
        y="66" 
        fontFamily="'Pacifico', 'Caveat', 'Kaushan Script', cursive" 
        fontWeight="700" 
        fontSize="58" 
        fill="url(#ai-grad)" 
        letterSpacing="-0.5"
      >
        Ai
      </text>
      
      {/* '.so.' in matched expressive cursive style */}
      <text 
        x="158" 
        y="65" 
        fontFamily="'Kaushan Script', 'Caveat', 'Pacifico', cursive" 
        fontWeight="700" 
        fontSize="54" 
        fill="url(#pik-grad)" 
        letterSpacing="0.5"
      >
        .so
      </text>
      
      {/* Floating circular dot matching the style of the script */}
      <circle cx="236" cy="62" r="5" fill="#00f2fe" />
    </g>

    {/* Sweeping calligraphic brush underline swoosh beneath the text */}
    <path 
      d="M 45 84 C 95 87, 145 82, 195 72 C 145 83, 95 85, 45 84" 
      stroke="url(#swoosh-grad)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="url(#swoosh-grad)" 
    />
          
    {/* Dynamic accent dash under the main swoosh line */}
    <path 
      d="M 105 97 C 113 98, 121 97, 129 95" 
      stroke="#00f2fe" 
      strokeWidth="5" 
      strokeLinecap="round" 
      fill="none" 
    />
  </svg>
);

export default PikAisoLogo;
