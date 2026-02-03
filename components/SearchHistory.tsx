
import React from 'react';

interface SearchHistoryProps {
  history: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
  onRemoveItem: (query: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear, onRemoveItem }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-10 md:mt-14 animate-in fade-in slide-in-from-top-2 duration-1000">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bd-green/5 flex items-center justify-center text-bd-green">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] themed-text-muted opacity-60">সাম্প্রতিক অনুসন্ধান</h4>
        </div>
        <button 
          onClick={onClear}
          className="text-[10px] font-black uppercase tracking-widest text-bd-red hover:text-red-700 transition-colors py-1 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          সব মুছুন
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center md:justify-start px-2">
        {history.map((item, idx) => (
          <div 
            key={item + idx}
            className="group flex items-center gap-2 pl-5 pr-3 py-2.5 bg-white/40 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-bd-green/10 hover:border-bd-green/40 hover:shadow-[0_10px_30px_-5px_rgba(0,106,78,0.1)] transition-all duration-300 cursor-pointer active:scale-95 animate-in zoom-in-95 duration-500"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <button 
              onClick={() => onSelect(item)}
              className="text-sm md:text-base font-bold text-bd-green dark:text-bd-green/80 font-noto line-clamp-1"
            >
              {item}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem(item);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] opacity-30 group-hover:opacity-100 hover:bg-bd-red hover:text-white transition-all ml-1"
              aria-label={`Remove ${item} from history`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
