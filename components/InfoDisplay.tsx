
import React, { useState, useRef, useEffect } from 'react';
import { SearchResult } from '../types';

interface InfoDisplayProps {
  result: SearchResult;
  isStreaming?: boolean;
  onReset: () => void;
  query?: string;
}

const InfoDisplay: React.FC<InfoDisplayProps> = ({ result, isStreaming, onReset, query }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && !isStreaming) {
      setShouldShowToggle(contentRef.current.scrollHeight > 600);
    }
  }, [result.text, isStreaming]);

  const formatText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" aria-hidden="true" />;

      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={i} className="text-2xl md:text-4xl font-black text-bd-green mb-4 mt-1 font-noto border-b border-bd-red pb-2 inline-block">
            {trimmed.replace('#', '').trim()}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl md:text-2xl font-black text-bd-green mt-6 mb-3 font-noto flex items-center gap-2">
            <span className="w-1 h-6 bg-bd-red rounded-full"></span>
            {trimmed.replace('##', '').trim()}
          </h2>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-2 mb-2 ml-1" role="listitem">
            <span className="text-bd-red mt-1 text-xs">✦</span>
            <p className="text-sm md:text-base themed-text font-medium">{renderInlineStyles(trimmed.substring(2))}</p>
          </div>
        );
      }
      return <p key={i} className="text-sm md:text-lg themed-text leading-relaxed font-medium mb-3 font-noto opacity-90">{renderInlineStyles(trimmed)}</p>;
    });
  };

  const renderInlineStyles = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-bd-red font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col gap-4 animate-reveal-stagger">
      <article className="themed-card rounded-[25px] md:rounded-[40px] p-5 md:p-10 shadow-lg border relative overflow-hidden">
        {isStreaming && (
          <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-bd-green/5 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-bd-red rounded-full animate-ping"></div>
            <span className="text-[8px] font-black text-bd-green uppercase tracking-[0.1em]">তথ্য আসছে...</span>
          </div>
        )}

        <div ref={contentRef} style={{ maxHeight: isExpanded || isStreaming ? 'none' : '400px', transition: 'max-height 0.6s ease' }} className="relative overflow-hidden">
          {formatText(result.text)}
          {!isExpanded && shouldShowToggle && !isStreaming && (
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 dark:from-[#121212] dark:via-[#121212]/90 to-transparent pointer-events-none"></div>
          )}
        </div>

        {!isStreaming && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col items-center gap-4">
            {shouldShowToggle && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="flex flex-col items-center gap-1 text-bd-green">
                <span className="text-[8px] font-black uppercase">{isExpanded ? 'সংক্ষেপ' : 'বিস্তারিত'}</span>
                <div className={`w-8 h-8 rounded-full border border-current flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-bd-green text-white' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
              </button>
            )}
            <button onClick={onReset} className="px-8 py-2.5 bg-bd-green text-white rounded-full font-black uppercase text-[10px] hover:bg-bd-red transition-all">নতুন অনুসন্ধান</button>
          </div>
        )}
      </article>
    </div>
  );
};

export default InfoDisplay;
