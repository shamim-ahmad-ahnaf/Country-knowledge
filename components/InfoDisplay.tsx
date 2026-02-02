
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLImageElement>(null);

  // Check if content is long enough to require a toggle
  useEffect(() => {
    if (contentRef.current && !isStreaming) {
      setShouldShowToggle(contentRef.current.scrollHeight > 750);
    }
  }, [result.text, isStreaming]);

  // Handle lightbox escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const openLightbox = () => {
    setIsLightboxOpen(true);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomScale(prev => Math.min(Math.max(1, prev + delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) {
        return <h3 key={i} className="text-3xl font-black text-bd-green mt-14 mb-8 font-noto border-l-8 border-bd-red pl-8">{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('##')) {
        return <h2 key={i} className="text-4xl font-black text-bd-green mt-20 mb-10 font-noto border-b-2 border-bd-green/10 dark:border-bd-green/20 pb-6">{line.replace('##', '').trim()}</h2>;
      }
      if (line.startsWith('#')) {
        return <h1 key={i} className="text-5xl font-black text-bd-green mt-12 mb-16 text-center font-noto bg-gray-50 dark:bg-gray-900 py-10 rounded-[40px]">{line.replace('#', '').trim()}</h1>;
      }
      
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={i} className="ml-10 mb-6 themed-text list-none relative flex items-start gap-4 text-xl font-medium leading-relaxed stream-chunk">
            <span className="text-bd-red text-2xl mt-0.5" aria-hidden="true">✦</span>
            <span>{renderLineWithBold(line.trim().substring(2))}</span>
          </li>
        );
      }

      if (line.trim() === '') return <div key={i} className="h-8" />;

      return <p key={i} className="mb-10 themed-text leading-[2.2] text-xl font-medium font-serif stream-chunk">{renderLineWithBold(line)}</p>;
    });
  };

  const renderLineWithBold = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-bd-green font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <article 
        className="themed-card rounded-[60px] shadow-2xl p-10 md:p-24 border animate-in fade-in slide-in-from-bottom-10 duration-700 relative overflow-hidden"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {/* Image Section */}
        {(isStreaming || result.imageUrl) && (
          <div className="mb-20 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 aspect-video relative group cursor-zoom-in">
            {result.imageUrl ? (
              <button 
                onClick={openLightbox}
                className="w-full h-full block relative"
                aria-label="ছবিটি বড় করে দেখুন"
              >
                <img 
                  src={result.imageUrl} 
                  className="w-full h-full object-cover dark:opacity-80 transition-all duration-700 group-hover:scale-105" 
                  alt={`${query || 'Bangladesh'} এর একটি ঐতিহাসিক দৃশ্য`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full h-full shimmer-box animate-shimmer flex items-center justify-center" role="status" aria-label="চিত্রপট লোড হচ্ছে">
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-black uppercase tracking-widest">চিত্রপট তৈরি হচ্ছে...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isStreaming && (
          <div className="flex items-center gap-4 mb-12 text-bd-green font-black uppercase tracking-widest text-[10px] animate-pulse" role="status">
             <div className="w-2 h-2 bg-bd-red rounded-full animate-ping" aria-hidden="true"></div>
             ঐতিহাসিক তথ্য বিন্যাস করা হচ্ছে...
          </div>
        )}

        {/* Expandable Content Area */}
        <div 
          ref={contentRef}
          style={{ 
            maxHeight: isStreaming ? 'none' : (isExpanded ? 'none' : (shouldShowToggle ? '600px' : 'none')),
            transition: 'max-height 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="prose-museum relative overflow-hidden"
        >
          {formatText(result.text)}
          
          {/* Soft Fade Overlay */}
          {!isExpanded && shouldShowToggle && !isStreaming && (
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white via-white/90 dark:from-[#121212] dark:via-[#121212]/90 to-transparent pointer-events-none" aria-hidden="true" />
          )}
        </div>

        {/* Improved Toggle UI */}
        {shouldShowToggle && !isStreaming && (
          <div className="flex justify-center mt-4 mb-10 relative z-10">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex flex-col items-center gap-3 text-bd-green hover:text-bd-red transition-colors font-black uppercase tracking-[0.2em] text-[10px]"
              aria-expanded={isExpanded}
            >
              <span className="transition-opacity group-hover:opacity-80">
                {isExpanded ? 'সংক্ষেপ করুন (Collapse)' : 'পুরো ইতিহাস পড়ুন (Read Full)'}
              </span>
              <div className={`w-12 h-12 rounded-full border-2 border-current flex items-center justify-center transition-all duration-700 group-hover:scale-110 ${isExpanded ? 'rotate-180 bg-bd-green text-white border-bd-green' : 'bg-transparent'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
            </button>
          </div>
        )}

        {/* Footer / Reset Action */}
        {!isStreaming && result.text && (
          <div className="mt-12 pt-16 border-t-2 border-dashed border-gray-100 dark:border-gray-900 flex flex-col items-center gap-10">
            <button 
              onClick={onReset}
              className="bg-bd-green text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-bd-red transition-all shadow-xl text-lg active:scale-95 focus-visible:outline-bd-green"
            >
              নতুন অনুসন্ধান
            </button>

            {result.sources && result.sources.length > 0 && (
              <div className="w-full mt-10">
                <h4 className="text-center themed-text-muted font-black uppercase tracking-widest text-[10px] mb-12">গবেষণার তথ্যসূত্র</h4>
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="তথ্যসূত্র লিঙ্ক">
                  {result.sources.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-8 bg-gray-50 dark:bg-gray-900 rounded-[30px] hover:bg-bd-green hover:text-white transition-all group border border-transparent hover:border-bd-green focus-visible:outline-bd-green">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-bd-green group-hover:bg-white shadow-sm shrink-0" aria-hidden="true">{idx + 1}</div>
                      <span className="font-black text-sm truncate">{source.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Image Lightbox Portal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center overflow-hidden touch-none"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[1010] p-4"
            aria-label="বন্ধ করুন"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full text-white/80 text-xs font-black uppercase tracking-[0.2em] z-[1010]">
            Scroll to zoom • Drag to pan
          </div>

          <div 
            className={`w-full h-full flex items-center justify-center ${zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onMouseDown={handleMouseDown}
          >
            <img 
              ref={lightboxImgRef}
              src={result.imageUrl} 
              alt="Zoomed View"
              className="max-w-full max-h-full transition-transform duration-200 ease-out select-none pointer-events-none"
              style={{ 
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default InfoDisplay;
