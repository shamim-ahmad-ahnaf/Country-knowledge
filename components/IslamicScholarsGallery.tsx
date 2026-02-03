
import React from 'react';
import { ISLAMIC_SCHOLARS_LIST } from '../constants';

interface IslamicScholarsGalleryProps {
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const IslamicScholarsGallery: React.FC<IslamicScholarsGalleryProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
      {ISLAMIC_SCHOLARS_LIST.map((scholar, idx) => (
        <button
          key={scholar.id}
          onClick={() => onSelect(scholar.query)}
          disabled={isLoading}
          className={`group relative flex flex-col themed-card rounded-[40px] border-0 shadow-lg hover:shadow-[0_40px_100px_rgba(0,106,78,0.15)] transition-all duration-1000 overflow-hidden text-left h-full ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ animationDelay: `${idx * 150}ms` }}
        >
          {/* Portrait Container */}
          <div className="w-full aspect-[3/4] overflow-hidden relative">
            <img
              src={scholar.image}
              alt={scholar.title}
              className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110 filter sepia-[0.2] group-hover:sepia-0"
            />
            {/* Elegant vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            
            {/* Role/Honorific Tag */}
            <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-bd-green text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              {scholar.subtitle}
            </div>
          </div>

          {/* Content Part */}
          <div className="p-8 md:p-12 flex flex-col flex-grow bg-white dark:bg-gray-900/60 backdrop-blur-xl relative">
            {/* Decorative Icon */}
            <div className="absolute -top-6 right-10 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-bd-green rounded-2xl flex items-center justify-center text-bd-green text-xl shadow-xl group-hover:bg-bd-green group-hover:text-white transition-all duration-700">
              ✒️
            </div>

            <h4 className="text-3xl font-black text-bd-green dark:text-bd-green font-noto mb-4 group-hover:text-bd-red transition-colors">
              {scholar.title}
            </h4>
            
            <p className="themed-text-muted text-base md:text-lg font-medium leading-relaxed mb-10 flex-grow opacity-80 group-hover:opacity-100 transition-opacity">
              {scholar.description}
            </p>

            <div className="flex items-center gap-4 text-bd-green font-black uppercase text-[10px] tracking-[0.3em] self-start mt-auto border-t border-bd-green/10 pt-6 w-full">
              <span>জীবনী ও অবদান</span>
              <div className="w-10 h-10 rounded-full border-2 border-bd-green/20 flex items-center justify-center group-hover:bg-bd-red group-hover:border-bd-red group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default IslamicScholarsGallery;
