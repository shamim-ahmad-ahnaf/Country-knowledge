
import React, { useState, useEffect, useRef } from 'react';
import { BANGLADESH_FACTS } from '../constants';

interface DidYouKnowProps {
  onSelect: (query: string) => void;
}

const DidYouKnow: React.FC<DidYouKnowProps> = ({ onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (isAutoPlaying) {
      resetTimeout();
      timeoutRef.current = setTimeout(
        () => setCurrentIndex((prevIndex) => (prevIndex + 1) % BANGLADESH_FACTS.length),
        8000
      );
    }
    return () => resetTimeout();
  }, [currentIndex, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const nextSlide = () => goToSlide((currentIndex + 1) % BANGLADESH_FACTS.length);
  const prevSlide = () => goToSlide((currentIndex - 1 + BANGLADESH_FACTS.length) % BANGLADESH_FACTS.length);

  return (
    <section className="w-full py-16 px-6 overflow-hidden" aria-labelledby="did-you-know-heading">
      <h2 id="did-you-know-heading" className="sr-only">বাংলাদেশ সম্পর্কে কিছু তথ্য</h2>
      <div className="max-w-5xl mx-auto relative group">
        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 dark:bg-gray-800/40 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700 flex items-center justify-center text-bd-green hover:bg-bd-green hover:text-white transition-all hover:scale-110 active:scale-95 focus:ring-4 focus:ring-bd-green/30 outline-none"
          aria-label="পূর্ববর্তী তথ্য দেখুন"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          onClick={nextSlide}
          className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 dark:bg-gray-800/40 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700 flex items-center justify-center text-bd-green hover:bg-bd-green hover:text-white transition-all hover:scale-110 active:scale-95 focus:ring-4 focus:ring-bd-green/30 outline-none"
          aria-label="পরবর্তী তথ্য দেখুন"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slider Container */}
        <div className="themed-card relative overflow-hidden rounded-[50px] border-2 border-bd-green/10 shadow-2xl transition-all hover:border-bd-green/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-bd-green/5 rounded-bl-[200px] pointer-events-none" aria-hidden="true"></div>
          
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            aria-live="polite"
          >
            {BANGLADESH_FACTS.map((fact, idx) => (
              <div 
                key={fact.id} 
                className="w-full shrink-0 p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 md:gap-16"
                aria-hidden={currentIndex !== idx}
              >
                <div className="shrink-0">
                  <div className="w-24 h-24 bg-bd-green/10 dark:bg-bd-green/20 rounded-[35%] flex items-center justify-center text-6xl shadow-inner animate-float" aria-hidden="true">
                    {fact.icon}
                  </div>
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-bd-red font-black text-xs uppercase tracking-[0.5em] mb-6">আপনি কি জানতেন?</h3>
                  <p className="text-2xl md:text-3xl font-black themed-text font-noto leading-snug mb-8">
                    {fact.fact}
                  </p>
                  <button 
                    onClick={() => onSelect(fact.query)}
                    disabled={currentIndex !== idx}
                    className="inline-flex items-center gap-4 px-8 py-3 bg-bd-green/5 hover:bg-bd-green hover:text-white text-bd-green rounded-full font-black uppercase text-xs tracking-widest transition-all group/btn outline-none focus:ring-4 focus:ring-bd-green/30"
                  >
                    বিস্তারিত জানুন 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10" role="tablist">
            {BANGLADESH_FACTS.map((_, i) => (
              <button 
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-500 outline-none focus:ring-2 focus:ring-bd-green ${currentIndex === i ? 'w-10 bg-bd-green' : 'w-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-bd-green/40'}`}
                aria-label={`${i + 1} নম্বর তথ্য দেখুন`}
                aria-selected={currentIndex === i}
                role="tab"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DidYouKnow;
