
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 md:w-10 md:h-10 text-xl md:text-2xl',
    md: 'w-10 h-10 md:w-14 md:h-14 text-2xl md:text-3xl',
    lg: 'w-16 h-16 md:w-20 md:h-20 text-4xl md:text-5xl',
  };

  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-bd-green/20 blur-xl rounded-full group-hover:bg-bd-red/20 transition-all duration-700"></div>
      
      {/* SVG Emblem */}
      <div className={`${sizeClasses[size]} relative z-10 flex items-center justify-center rounded-[30%] bg-gradient-to-br from-bd-green via-emerald-800 to-green-900 text-white shadow-2xl transition-all duration-500 group-hover:rotate-[360deg] group-hover:shadow-bd-green/40 group-hover:rounded-full overflow-hidden border-2 border-white/10`}>
        {/* Inner subtle map/symbol shape */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10 scale-150 rotate-12">
          <circle cx="50" cy="50" r="40" fill="white" />
        </svg>
        
        <span className="font-black tracking-tighter drop-shadow-lg">BD</span>
        
        {/* Progress-like outer ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="46" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2"
          />
          <circle 
            cx="50" cy="50" r="46" 
            fill="none" 
            stroke="url(#logo-grad)" 
            strokeWidth="4"
            strokeDasharray="289"
            strokeDashoffset="70"
            strokeLinecap="round"
            className="group-hover:stroke-bd-red transition-all duration-1000"
          />
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#f42a41" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Logo;
