
import React from 'react';
import { HERITAGE_ELEMENTS } from '../constants';

interface HeritageGalleryProps {
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const HeritageGallery: React.FC<HeritageGalleryProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
      {HERITAGE_ELEMENTS.map((element, idx) => (
        <button
          key={element.id}
          onClick={() => onSelect(element.query)}
          disabled={isLoading}
          className={`group flex flex-col themed-card rounded-[40px] md:rounded-[60px] border-0 shadow-lg hover:shadow-[0_40px_100px_rgba(0,106,78,0.15)] transition-all duration-1000 overflow-hidden text-left h-full ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ animationDelay: `${idx * 150}ms` }}
        >
          {/* Image Part */}
          <div className="w-full aspect-[16/10] overflow-hidden relative">
            <img
              src={element.image}
              alt={element.title}
              className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Category Tag */}
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-bd-green/90 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-[0.3em]">
              ঐতিহ্য ও সংস্কৃতি
            </div>
          </div>

          {/* Content Part */}
          <div className="p-8 md:p-12 flex flex-col flex-grow bg-white dark:bg-gray-900/40 backdrop-blur-sm">
            <h4 className="text-2xl md:text-4xl font-black text-bd-green dark:text-bd-green font-noto mb-4 group-hover:text-bd-red transition-colors">
              {element.title}
            </h4>
            <span className="text-bd-red font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6 block opacity-70">
              {element.subtitle}
            </span>
            <p className="themed-text-muted text-base md:text-lg font-medium leading-relaxed mb-10 flex-grow opacity-80 group-hover:opacity-100 transition-opacity">
              {element.description}
            </p>

            <div className="flex items-center gap-4 text-bd-green font-black uppercase text-[10px] tracking-[0.3em] self-start mt-auto">
              <span>বিস্তারিত পড়ুন</span>
              <div className="w-10 h-10 rounded-full bg-bd-green/5 flex items-center justify-center group-hover:bg-bd-red group-hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default HeritageGallery;
