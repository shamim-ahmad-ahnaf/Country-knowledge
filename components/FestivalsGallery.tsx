
import React from 'react';
import { CULTURAL_FESTIVALS } from '../constants';

interface FestivalsGalleryProps {
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const FestivalsGallery: React.FC<FestivalsGalleryProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {CULTURAL_FESTIVALS.map((fest, idx) => (
        <button
          key={fest.id}
          onClick={() => onSelect(fest.query)}
          disabled={isLoading}
          className={`group relative overflow-hidden rounded-[50px] aspect-[1/1] themed-card border-0 shadow-xl transition-all duration-1000 hover:shadow-[0_40px_120px_-20px_rgba(244,42,65,0.25)] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ animationDelay: `${idx * 150}ms` }}
        >
          {/* Main Visual */}
          <div className="absolute inset-0">
            <img
              src={fest.image}
              alt={fest.title}
              className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-125 group-hover:rotate-1"
            />
            {/* Colorful Vibrant Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bd-red/90 via-black/20 to-transparent mix-blend-multiply opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-bd-green/40 to-transparent mix-blend-screen opacity-30"></div>
          </div>

          {/* Floating Elements for "Festival Feel" */}
          <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl animate-float">
             🎉
          </div>

          {/* Text Content */}
          <div className="absolute inset-0 p-10 flex flex-col justify-end text-left z-20">
            <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
              <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-white text-bd-red text-[11px] font-black uppercase tracking-[0.2em] shadow-xl">
                {fest.subtitle}
              </span>
              <h4 className="text-3xl md:text-5xl font-black text-white font-noto mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                {fest.title}
              </h4>
              <p className="text-white/90 text-sm md:text-lg font-medium leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 line-clamp-2">
                {fest.description}
              </p>
              
              <div className="flex items-center gap-4 text-white font-black uppercase text-[10px] tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                উৎসবের বিস্তারিত
                <div className="w-10 h-10 rounded-full bg-bd-green text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      ))}
    </div>
  );
};

export default FestivalsGallery;
