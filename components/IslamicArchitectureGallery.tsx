
import React from 'react';
import { ISLAMIC_ARCHITECTURE } from '../constants';

interface IslamicArchitectureGalleryProps {
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const IslamicArchitectureGallery: React.FC<IslamicArchitectureGalleryProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {ISLAMIC_ARCHITECTURE.map((site, idx) => (
        <button
          key={site.id}
          onClick={() => onSelect(site.query)}
          disabled={isLoading}
          className={`group relative flex flex-col themed-card rounded-[40px] md:rounded-[60px] border-2 shadow-lg hover:shadow-[0_40px_100px_-20px_rgba(0,106,78,0.2)] transition-all duration-700 overflow-hidden text-left h-full ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {/* Image Container */}
          <div className="w-full aspect-[4/3] overflow-hidden relative">
            <img
              src={site.image}
              alt={site.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
            />
            {/* Architectural Frame Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bd-green/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Text Content */}
          <div className="p-8 md:p-12 flex flex-col justify-between flex-grow bg-white dark:bg-gray-900/40 backdrop-blur-sm relative">
            {/* Decorative Icon */}
            <div className="absolute -top-6 right-10 w-12 h-12 bg-bd-green rounded-2xl flex items-center justify-center text-white text-xl shadow-xl group-hover:rotate-[360deg] transition-transform duration-1000">
              🕌
            </div>
            
            <div>
              <span className="text-bd-red font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-4 block">
                {site.subtitle}
              </span>
              <h4 className="text-2xl md:text-3xl font-black text-bd-green font-noto mb-5 leading-tight group-hover:text-bd-red transition-colors">
                {site.title}
              </h4>
              <p className="themed-text-muted text-base md:text-lg font-medium leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                {site.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-bd-green font-black uppercase text-[10px] tracking-[0.2em] self-start mt-auto">
              <span>স্থাপত্যশৈলী জানুন</span>
              <div className="w-8 h-8 rounded-full border-2 border-bd-green/20 flex items-center justify-center group-hover:bg-bd-green group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default IslamicArchitectureGallery;
