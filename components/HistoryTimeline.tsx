
import React from 'react';
import { HISTORICAL_ERAS } from '../constants';

interface HistoryTimelineProps {
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="relative py-20">
      {/* Central Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 md:w-2 bg-gradient-to-b from-bd-green via-bd-red to-bd-green opacity-20 hidden md:block" aria-hidden="true" />
      
      <div className="flex flex-col gap-24 md:gap-40">
        {HISTORICAL_ERAS.map((era, idx) => (
          <div 
            key={era.id} 
            className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 relative animate-reveal-stagger ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            style={{ animationDelay: `${idx * 200}ms` }}
          >
            {/* Connector Node */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <div className="w-16 h-16 rounded-full glass border-4 border-bd-green shadow-2xl flex items-center justify-center text-3xl group-hover:scale-125 transition-transform bg-white dark:bg-gray-800">
                {era.icon}
              </div>
            </div>

            {/* Visual Content */}
            <div className="w-full md:w-1/2 group">
              <div className="relative aspect-[16/10] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transition-all duration-700 group-hover:scale-[1.02]">
                <img 
                  src={era.image} 
                  alt={era.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8 md:p-12">
                   <div className="text-white">
                      <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-bd-red mb-2 block">{era.period}</span>
                      <h4 className="text-3xl md:text-5xl font-black font-noto leading-tight">{era.title}</h4>
                   </div>
                </div>
              </div>
            </div>

            {/* Textual Content */}
            <div className={`w-full md:w-1/2 text-left px-6 md:px-0 ${idx % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
              <div className="max-w-xl mx-auto md:mx-0">
                <div className="md:hidden flex items-center gap-4 mb-6">
                   <span className="text-4xl">{era.icon}</span>
                   <span className="text-xs font-black uppercase tracking-widest text-bd-red">{era.period}</span>
                </div>
                
                <p className="text-xl md:text-2xl themed-text-muted leading-relaxed font-medium font-noto mb-10 opacity-80">
                  {era.description}
                </p>
                
                <button 
                  onClick={() => onSelect(`${era.title} এর বিস্তারিত ইতিহাস ও তাৎপর্য`)}
                  className={`inline-flex items-center gap-4 px-10 py-4 bg-bd-green text-white rounded-full font-black uppercase tracking-widest text-xs transition-all hover:bg-bd-red hover:shadow-[0_20px_40px_rgba(244,42,65,0.3)] active:scale-95 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  গবেষণা শুরু করুন
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
