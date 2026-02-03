
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [panPos, setPanPos] = useState({ x: 50, y: 50 });
  const contentRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const zoomInRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && !isStreaming) {
      setShouldShowToggle(contentRef.current.scrollHeight > 900);
    }
  }, [result.text, isStreaming]);

  // Accessibility: Focus Trap and Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isLightboxOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLightboxOpen) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPanPos({ x, y });
  };

  const formatText = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-6" aria-hidden="true" />;

      // Header 1 (Main Title)
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={i} className="text-4xl md:text-6xl font-black text-bd-green mb-12 mt-4 font-noto tracking-tighter leading-tight border-b-4 border-bd-red pb-6 inline-block">
            {trimmed.replace('#', '').trim()}
          </h1>
        );
      }

      // Header 2 (Section Title)
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={i} className="text-3xl md:text-4xl font-black text-bd-green mt-16 mb-8 font-noto flex items-center gap-4">
            <span className="w-2 h-10 bg-bd-red rounded-full" aria-hidden="true"></span>
            {trimmed.replace('##', '').trim()}
          </h2>
        );
      }

      // Header 3 (Sub-section)
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={i} className="text-2xl md:text-3xl font-bold text-bd-green/80 mt-10 mb-6 font-noto italic">
            {trimmed.replace('###', '').trim()}
          </h3>
        );
      }

      // List Items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-4 mb-5 ml-2 md:ml-6 group animate-in slide-in-from-left duration-500" role="listitem">
            <div className="w-6 h-6 rounded-full bg-bd-green/10 flex items-center justify-center shrink-0 mt-1.5 group-hover:bg-bd-red group-hover:text-white transition-colors" aria-hidden="true">
              <span className="text-xs">✦</span>
            </div>
            <p className="text-lg md:text-xl themed-text font-medium leading-relaxed">
              {renderInlineStyles(trimmed.substring(2))}
            </p>
          </div>
        );
      }

      // Regular Paragraph
      return (
        <p key={i} className="text-lg md:text-2xl themed-text leading-[1.8] md:leading-[2] font-medium mb-8 font-noto opacity-90 transition-all hover:opacity-100">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });
  };

  const renderInlineStyles = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-bd-red font-black px-1 rounded-sm bg-bd-red/5">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Only show the visual header if we are streaming OR if we actually have an image.
  // This prevents an empty "shimmer" box from remaining after a text-only load is complete.
  const showVisualHeader = isStreaming || !!result.imageUrl;

  return (
    <div 
      className="flex flex-col gap-12 animate-reveal-stagger" 
      aria-busy={isStreaming}
    >
      {/* --- Lightbox --- */}
      {isLightboxOpen && result.imageUrl && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="চিত্র জুম ভিউ"
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center cursor-zoom-out animate-in fade-in duration-500 overflow-hidden"
          onClick={() => setIsLightboxOpen(false)}
          onMouseMove={handleMouseMove}
        >
          <div className="absolute top-10 right-10 z-[1010]">
            <button 
              ref={closeBtnRef}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 focus:ring-4 focus:ring-white/50 outline-none"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="জুম ভিউ বন্ধ করুন"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="w-screen h-screen flex items-center justify-center">
            <img 
              src={result.imageUrl} 
              alt={`${query || 'Bangladesh'} এর জুম করা ছবি`}
              className="max-w-none w-screen h-screen object-contain transition-transform duration-500 ease-out"
              style={{ 
                transformOrigin: `${panPos.x}% ${panPos.y}%`,
                transform: 'scale(2.5)' 
              }}
            />
          </div>
        </div>
      )}

      {/* --- Visual Header (Visible during streaming or if image exists) --- */}
      {showVisualHeader && (
        <div className="relative w-full aspect-[21/9] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-4 border-white dark:border-gray-800">
          {result.imageUrl ? (
            <div 
              ref={zoomInRef}
              role="button"
              tabIndex={0}
              className="w-full h-full cursor-zoom-in group outline-none focus:ring-inset focus:ring-8 focus:ring-bd-green/30"
              onClick={() => setIsLightboxOpen(true)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsLightboxOpen(true)}
              aria-label={`${query || 'Bangladesh'} এর ছবি বড় করে দেখুন`}
            >
              <img 
                src={result.imageUrl} 
                className="w-full h-full object-cover dark:opacity-70 transition-transform duration-[2s] group-hover:scale-110" 
                alt={query || 'Bangladesh Info'} 
              />
            </div>
          ) : (
            <div className="w-full h-full shimmer-box animate-shimmer flex items-center justify-center" aria-label="তথ্য লোড হচ্ছে">
               <div className="flex flex-col items-center gap-4 opacity-20">
                 <div className="w-16 h-16 border-4 border-bd-green border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-xs font-black uppercase tracking-widest">তথ্য সংগ্রহ করা হচ্ছে...</span>
               </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          {query && !isStreaming && result.imageUrl && (
            <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16 text-white pointer-events-none">
               <span className="text-xs font-black uppercase tracking-[0.4em] text-bd-red mb-2 block">এনসাইক্লোপিডিয়া অনুসন্ধান</span>
               <h2 className="text-4xl md:text-7xl font-black font-noto tracking-tighter">{query}</h2>
            </div>
          )}
        </div>
      )}

      {/* --- Main Content Section --- */}
      <article 
        className="themed-card rounded-[50px] md:rounded-[80px] p-8 md:p-24 shadow-2xl border relative overflow-hidden"
        aria-live="polite"
      >
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-bd-green/5 rounded-bl-full -z-10" aria-hidden="true"></div>
        
        {isStreaming && (
          <div className="flex items-center gap-4 mb-16 px-6 py-3 bg-bd-green/10 rounded-full w-fit animate-pulse" role="status">
            <div className="w-3 h-3 bg-bd-red rounded-full animate-ping"></div>
            <span className="text-[10px] md:text-xs font-black text-bd-green uppercase tracking-[0.2em]">তথ্য বিন্যাস করা হচ্ছে...</span>
          </div>
        )}

        <div 
          ref={contentRef}
          style={{ 
            maxHeight: isExpanded || isStreaming ? 'none' : '900px',
            transition: 'max-height 1s ease-in-out'
          }}
          className="relative overflow-hidden"
        >
          {formatText(result.text)}
          
          {/* Content Fade Overlay */}
          {!isExpanded && shouldShowToggle && !isStreaming && (
            <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-white via-white/80 dark:from-[#121212] dark:via-[#121212]/90 to-transparent pointer-events-none"></div>
          )}
        </div>

        {/* --- Toggle & Footer --- */}
        {!isStreaming && (
          <div className="mt-16 pt-16 border-t-2 border-gray-100 dark:border-gray-900 flex flex-col items-center gap-12">
            {shouldShowToggle && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="group flex flex-col items-center gap-4 text-bd-green hover:text-bd-red transition-all focus:ring-4 focus:ring-bd-green/20 rounded-2xl p-4 outline-none"
              >
                <span className="text-xs font-black uppercase tracking-[0.3em]">{isExpanded ? 'সংক্ষেপ করুন' : 'সম্পূর্ণ তথ্য দেখুন'}</span>
                <div className={`w-14 h-14 rounded-full border-2 border-current flex items-center justify-center transition-transform duration-700 ${isExpanded ? 'rotate-180 bg-bd-green text-white' : ''}`} aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
            )}

            <button 
              onClick={onReset}
              className="px-16 py-6 bg-bd-green text-white rounded-full font-black uppercase tracking-widest hover:bg-bd-red transition-all shadow-xl hover:shadow-[0_20px_60px_rgba(244,42,65,0.3)] active:scale-95 outline-none focus:ring-4 focus:ring-bd-red/30"
            >
              নতুন অনুসন্ধান করুন
            </button>

            {/* --- Source References --- */}
            {result.sources.length > 0 && (
              <div className="w-full mt-12" aria-label="তথ্যসূত্র">
                <h4 className="text-center text-[10px] font-black uppercase tracking-[0.6em] themed-text-muted mb-10">গবেষণার তথ্যসূত্র ও সহায়ক লিঙ্ক</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      role="listitem"
                      className="flex items-center gap-6 p-8 rounded-[35px] bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-bd-green hover:bg-bd-green hover:text-white transition-all group focus:ring-4 focus:ring-bd-green/30 outline-none"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-bd-green font-black shadow-sm group-hover:bg-white" aria-hidden="true">{idx + 1}</div>
                      <span className="font-bold text-sm md:text-base line-clamp-1">{source.title}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
};

export default InfoDisplay;
