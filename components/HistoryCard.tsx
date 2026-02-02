
import React from 'react';
import { HistoricalEra } from '../types';

interface HistoryCardProps {
  era: HistoricalEra;
  onSelect: (query: string) => void;
  isLoading?: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ era, onSelect, isLoading }) => {
  return (
    <button 
      className={`text-left group themed-card p-8 rounded-3xl border hover:border-bd-green/30 hover:shadow-[0_20px_50px_rgba(0,106,78,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,106,78,0.2)] transition-all duration-500 cursor-pointer flex flex-col h-full focus-visible:outline-bd-green ${isLoading ? 'ring-2 ring-bd-green' : ''}`}
      onClick={() => onSelect(`${era.title} এর বিস্তারিত ইতিহাস`)}
      aria-label={`${era.title} (${era.period}) সম্পর্কে বিস্তারিত জানুন`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-bd-green group-hover:text-white transition-colors" aria-hidden="true">
          {era.icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-bd-green font-noto leading-tight">{era.title}</h3>
          <p className="text-[10px] font-black text-bd-red uppercase tracking-widest">{era.period}</p>
        </div>
      </div>
      
      <p className="themed-text-muted text-sm leading-relaxed mb-8 flex-grow">
        {era.description}
      </p>
      
      <div className="pt-6 border-t border-gray-50 dark:border-gray-900 flex items-center justify-between w-full">
        <span className="text-xs font-black uppercase tracking-widest text-bd-green group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
          গবেষণা শুরু করুন
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </button>
  );
};

export default HistoryCard;
