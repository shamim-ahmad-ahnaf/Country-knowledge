
import React from 'react';
import { TOURIST_LANDMARKS } from '../constants';

interface TourismGalleryProps {
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const TourismGallery: React.FC<TourismGalleryProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
      {TOURIST_LANDMARKS.map((spot, idx) => (
        <button
          key={spot.id}
          onClick={() => onSelect(spot.query)}
          disabled={isLoading}
          className={`group relative overflow-hidden rounded-[40px] aspect-[4/5] themed-card border-0 shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ animationDelay: `${idx * 150}ms` }}
        >
          {/* Background Image */}
          <img
            src={spot.image}
            alt={spot.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-125"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"></div>

          {/* Floating Border Overlay (Visual decoration) */}
          <div className="absolute inset-4 border border-white/20 rounded-[30px] opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100"></div>

          {/* Content */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-left">
            <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
              <span className="inline-block px-3 py-1 mb-4 rounded-full bg-bd-red text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                {spot.subtitle}
              </span>
              <h4 className="text-3xl md:text-4xl font-black text-white font-noto mb-4 drop-shadow-md">
                {spot.title}
              </h4>
              <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                {spot.description}
              </p>
              
              <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                গবেষণা শুরু করুন
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-bd-red transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sparkle Effect on Hover */}
          <div className="absolute top-8 right-8 text-4xl opacity-0 group-hover:opacity-100 transition-all duration-1000 rotate-12 group-hover:rotate-0">✨</div>
        </button>
      ))}
    </div>
  );
};

export default TourismGallery;
