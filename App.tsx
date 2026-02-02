
import React, { useState, useEffect, useRef } from 'react';
import { 
  HISTORICAL_ERAS, 
  EXPLORE_CATEGORIES,
  TOURIST_LANDMARKS,
  ISLAMIC_ARCHITECTURE,
  FEATURED_SPOTS,
  BANGLADESH_FACTS
} from './constants';
import { streamBangladeshInfo } from './services/geminiService';
import { AppStatus, SearchResult } from './types';
import HistoryCard from './components/HistoryCard';
import InfoDisplay from './components/InfoDisplay';
import DidYouKnow from './components/DidYouKnow';

/**
 * App Component: The heart of DeshGyan Encyclopedia.
 * This component manages the state for searching, theme toggling, 
 * navigation, and rendering the various sections of the encyclopedia.
 */
const App: React.FC = () => {
  // --- State Management ---
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Theme State: Persists in local storage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  // Ref for auto-scrolling to search results
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Side Effects ---
  
  // Handle Scroll: Changes navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Theme: Updates the HTML class and local storage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle Body Lock: Prevents scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  // --- Event Handlers ---

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  /**
   * Smooth Scroll to specific sections
   * @param id The HTML id of the section
   */
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  /**
   * Main Search Logic: Calls the Gemini API via streamBangladeshInfo
   * @param searchQuery Optional query string (used for direct clicks on cards)
   */
  const handleSearch = async (searchQuery?: string) => {
    const targetQuery = searchQuery || query;
    if (!targetQuery.trim()) return;

    // Reset UI state for new search
    setStatus(AppStatus.LOADING);
    setError(null);
    setStreamingText('তথ্য অনুসন্ধান করা হচ্ছে, দয়া করে অপেক্ষা করুন...');
    setResult(null);
    setIsMenuOpen(false);

    // Immediate scroll to search results container
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    try {
      await streamBangladeshInfo(
        targetQuery, 
        (chunk) => {
          setStreamingText(chunk);
        },
        (finalResult) => {
          setResult(finalResult);
          setStatus(AppStatus.SUCCESS);
        }
      );
    } catch (err: any) {
      console.error("App Search Error:", err);
      setError('দুঃখিত, তথ্য সংগ্রহে একটি সমস্যা হয়েছে। দয়া করে আপনার এপিআই কী অথবা ইন্টারনেট কানেকশন চেক করুন।');
      setStatus(AppStatus.ERROR);
    }
  };

  /**
   * Reset the application to home state
   */
  const resetAll = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setStreamingText('');
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: 'ইতিহাস', id: 'history' },
    { label: 'ভৌগোলিক', id: 'geo' },
    { label: 'পর্যটন কেন্দ্র', id: 'tourist-spots' },
    { label: 'স্থাপত্য', id: 'islamic-architecture' },
    { label: 'ডিরেক্টরি', id: 'directory' }
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-white dark:bg-[#080808]">
      {/* --- Navigation Bar --- */}
      <nav className={`fixed top-0 w-full z-[400] transition-all duration-700 ${scrolled ? 'glass py-3 shadow-2xl border-b border-bd-green/10' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={resetAll} className="flex items-center gap-4 group">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-[0_10px_30px_rgba(0,106,78,0.3)] transition-all group-hover:bg-bd-red group-hover:-rotate-12 group-hover:scale-110">🇧🇩</div>
            <div className="flex flex-col items-start text-left">
              <span className="text-2xl md:text-3xl font-black leading-tight font-noto text-bd-green dark:text-bd-green tracking-tighter">দেশজ্ঞান</span>
              <span className="text-bd-red text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase opacity-70">Heritage Encyclopedia</span>
            </div>
          </button>
          
          <div className="flex items-center gap-4 md:gap-8">
            <nav className="hidden xl:block">
              <ul className="flex gap-12 text-[11px] font-black uppercase tracking-[0.3em] themed-text-muted">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => scrollToSection(item.id)} 
                      className="hover:text-bd-green transition-all pb-1 border-b-2 border-transparent hover:border-bd-green relative group"
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-bd-green transition-all group-hover:w-full"></span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleDarkMode} 
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-xl text-xl md:text-2xl hover:scale-110 active:scale-90 transition-all border border-gray-100 dark:border-gray-700"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-bd-green text-white shadow-xl transition-all active:scale-95"
                aria-label="Toggle Menu"
              >
                <span className={`w-7 h-1 bg-current transition-all rounded-full ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                <span className={`w-7 h-1 bg-current transition-all rounded-full ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`w-7 h-1 bg-current transition-all rounded-full ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu Overlay --- */}
      <div className={`fixed inset-0 z-[350] transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-[450px] bg-white dark:bg-[#0a0a0a] shadow-[ -20px_0_60px_rgba(0,0,0,0.5) ] transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col pt-40 pb-16 px-12`}>
          <div className="flex flex-col gap-10">
            {navItems.map((item, i) => (
              <button 
                key={i} 
                onClick={() => scrollToSection(item.id)} 
                className="text-4xl md:text-5xl font-black text-bd-green dark:text-bd-green font-noto text-left hover:text-bd-red transition-all transform hover:translate-x-4"
              >
                {item.label}
              </button>
            ))}
            <div className="h-px w-full bg-bd-green/10 my-6"></div>
            <button onClick={resetAll} className="text-xl font-bold themed-text-muted text-left hover:text-bd-green">শুরুতে ফিরে যান</button>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] themed-text-muted mb-4">স্বদেশপ্রেম ও জ্ঞান এক সুতোয়</p>
            <div className="w-12 h-12 bg-bd-red rounded-xl flex items-center justify-center text-white text-xl">🇧🇩</div>
          </div>
        </div>
      </div>

      <main id="main-content" className="flex-grow">
        {/* --- Hero Section --- */}
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
          <div className="hero-pattern absolute inset-0 z-0 opacity-40 dark:opacity-20 animate-slow-zoom"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#080808]"></div>
          
          <div className="container mx-auto px-6 text-center z-10 relative">
            <div className="inline-block px-6 py-2 mb-10 rounded-full bg-bd-green/10 text-bd-green text-[10px] md:text-xs font-black uppercase tracking-[0.5em] animate-bounce shadow-sm border border-bd-green/10">বাংলার সর্বশ্রেষ্ঠ ডিজিটাল সংকলন</div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[140px] font-black text-bd-green dark:text-bd-green mb-10 leading-[1] font-noto tracking-tighter">
              শেকড়ের <span className="text-bd-red italic relative inline-block">সন্ধানে <span className="absolute -bottom-2 left-0 w-full h-2 md:h-4 bg-bd-red/20 -rotate-2"></span></span> <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bd-green via-bd-red to-bd-green bg-[length:200%_auto] animate-shimmer">দেশজ্ঞানের ময়দানে</span>
            </h1>
            
            <p className="text-xl md:text-4xl themed-text-muted mb-16 md:mb-24 max-w-6xl mx-auto font-medium leading-relaxed font-noto opacity-80">ইতিহাস, ঐতিহ্য, পর্যটন থেকে শুরু করে ডিজিটাল বাংলাদেশ — <br className="hidden lg:block"/> সবকিছুই এখন আপনার হাতের মুঠোয়।</p>
            
            {/* --- Main Search Bar --- */}
            <div className="max-w-6xl mx-auto relative group">
              <div className="absolute inset-0 bg-bd-green/20 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
              <div className="relative themed-card p-2 md:p-6 rounded-[40px] md:rounded-[80px] shadow-[0_40px_100px_-20px_rgba(0,106,78,0.25)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-row items-stretch border-2 border-bd-green/10 group-hover:border-bd-green/40 transition-all duration-700 backdrop-blur-3xl">
                  <div className="flex-grow flex items-center px-6 md:px-12 py-4">
                    <span className="text-3xl md:text-5xl mr-4 md:mr-8 opacity-40 group-hover:scale-125 transition-transform duration-500">🔍</span>
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="বাংলার কী জানতে চান? যেমন: সুন্দরবন..."
                      className="flex-grow bg-transparent outline-none text-xl md:text-4xl font-bold themed-text font-noto placeholder:opacity-20 min-w-0"
                    />
                  </div>
                  <button onClick={() => handleSearch()} className="bg-bd-green text-white px-8 md:px-24 py-5 md:py-8 rounded-[30px] md:rounded-[60px] font-black uppercase tracking-[0.2em] hover:bg-bd-red hover:shadow-[0_0_60px_rgba(244,42,65,0.4)] transition-all duration-500 shadow-2xl text-lg md:text-3xl flex items-center justify-center gap-6 active:scale-95 group/btn shrink-0">
                    <span>খুঁজুন</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-10 md:w-10 transition-transform group-hover/btn:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
              </div>
            </div>
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 animate-pulse hidden md:flex">
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">আরো দেখুন</span>
            <div className="w-1 h-12 bg-gradient-to-b from-bd-green to-transparent rounded-full"></div>
          </div>
        </section>

        {/* --- Results Section --- */}
        <div ref={resultsRef} className="scroll-mt-40">
          {(status !== AppStatus.IDLE) && (
            <section className="py-24 md:py-40 bg-gray-50/50 dark:bg-black/10 transition-colors">
              <div className="container mx-auto px-6 max-w-6xl">
                {error && (
                  <div className="p-10 md:p-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-[40px] mb-16 font-bold border-2 border-red-100 dark:border-red-900/50 flex flex-col md:flex-row items-center gap-10 text-center md:text-left animate-reveal-stagger">
                    <span className="text-6xl md:text-8xl">⚠️</span> 
                    <div>
                      <h4 className="text-2xl md:text-3xl font-black mb-4 font-noto">দুঃখিত, তথ্য সংগ্রহে ত্রুটি হয়েছে!</h4>
                      <p className="text-lg opacity-80">{error}</p>
                    </div>
                  </div>
                )}
                
                <InfoDisplay 
                  result={result || { text: streamingText, sources: [] }} 
                  isStreaming={status === AppStatus.LOADING} 
                  onReset={resetAll} 
                  query={query} 
                />
              </div>
            </section>
          )}
        </div>

        {/* --- Did You Know (Facts) Section --- */}
        <DidYouKnow onSelect={handleSearch} />
        
        {/* --- Tourist Landmarks Section --- */}
        <section id="tourist-spots" className="py-24 md:py-48 bg-white dark:bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 md:mb-32 gap-12">
              <div className="max-w-3xl">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">বিস্ময়কর বাংলা</h2>
                <h3 className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1]">সেরা ঐতিহাসিক <br/><span className="text-bd-red italic">পর্যটন</span> কেন্দ্রসমূহ</h3>
              </div>
              <p className="themed-text-muted text-xl md:text-2xl max-w-md font-medium leading-relaxed font-noto opacity-70">বাংলার প্রতিটি ইটে মিশে আছে হাজার বছরের ইতিহাস। আমাদের গর্বের প্রত্নতাত্ত্বিক নিদর্শনগুলো আজই ঘুরে দেখুন।</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
               {TOURIST_LANDMARKS.map((spot, idx) => (
                 <button 
                  key={spot.id} 
                  onClick={() => handleSearch(spot.query)} 
                  className="group flex flex-col themed-card rounded-[50px] md:rounded-[70px] border-2 border-bd-green/5 shadow-xl hover:shadow-[0_40px_100px_-20px_rgba(0,106,78,0.2)] dark:hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] transition-all duration-700 overflow-hidden h-full text-left animate-reveal-stagger"
                  style={{ animationDelay: `${idx * 150}ms` }}
                 >
                    <div className="w-full aspect-[4/3] overflow-hidden relative">
                       <img src={spot.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" alt={spot.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-bd-green/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                       <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                         <span className="text-xs font-bold uppercase tracking-widest">{spot.subtitle}</span>
                       </div>
                    </div>
                    <div className="p-10 md:p-14 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-3xl md:text-4xl font-black text-bd-green font-noto mb-6 group-hover:text-bd-red transition-colors">{spot.title}</h4>
                        <p className="themed-text-muted text-lg md:text-xl font-medium leading-relaxed mb-10 opacity-70">{spot.description}</p>
                      </div>
                      <span className="text-bd-green font-black uppercase text-[10px] md:text-[12px] tracking-widest flex items-center gap-4 mt-auto group-hover:gap-8 transition-all">
                        বিস্তারিত ইতিহাস দেখুন 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </span>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        </section>

        {/* --- History Timeline Section --- */}
        <section id="history" className="py-24 md:py-48 bg-gray-50 dark:bg-black/40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 md:mb-32 gap-12">
              <div className="max-w-4xl">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">ইতিহাসের পথচলা</h2>
                <h3 className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1]">বাংলার হাজার বছরের <br/><span className="text-bd-red italic">মহাকাব্য</span></h3>
              </div>
              <p className="themed-text-muted text-xl md:text-2xl font-medium md:max-w-md font-noto opacity-70">প্রাচীন জনপদ থেকে রক্তক্ষয়ী মুক্তিযুদ্ধ — প্রতিটি অধ্যায় আমাদের জাতীয় বীরত্বের এক অনন্য প্রমাণ।</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
              {HISTORICAL_ERAS.map((era, idx) => (
                <HistoryCard 
                  key={era.id} 
                  era={era} 
                  onSelect={handleSearch} 
                  isLoading={status === AppStatus.LOADING}
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- Directory / Categories Section --- */}
        <section id="directory" className="py-24 md:py-48">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-5xl mx-auto mb-24 md:mb-40">
              <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-8">জ্ঞানভাণ্ডার</h2>
              <h3 className="text-4xl md:text-9xl font-black text-bd-green font-noto mb-12 leading-tight tracking-tighter">বাংলার অফুরন্ত <span className="text-bd-red italic">তথ্যমালা</span></h3>
              <p className="themed-text-muted text-xl md:text-3xl font-medium leading-relaxed opacity-60">যেকোনো বিষয়ে গভীর জ্ঞান অর্জনে ক্লিক করুন নিচের ক্যাটাগরিগুলোতে।</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {EXPLORE_CATEGORIES.map((cat, idx) => (
                <button 
                  key={cat.id} 
                  onClick={() => handleSearch(cat.query)} 
                  className="themed-card group p-10 md:p-14 rounded-[50px] md:rounded-[60px] border border-transparent hover:border-bd-green/20 hover:shadow-[0_30px_80px_-20px_rgba(0,106,78,0.15)] transition-all duration-700 text-left flex flex-col items-start gap-10 md:gap-12 relative overflow-hidden animate-reveal-stagger"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${cat.color} rounded-3xl flex items-center justify-center text-3xl md:text-4xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 text-white`}>
                    {cat.icon}
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-2xl md:text-3xl font-black text-bd-green font-noto mb-4 group-hover:text-bd-red transition-colors duration-500">{cat.title}</h4>
                    <p className="themed-text-muted text-sm md:text-base leading-relaxed font-medium opacity-60">{cat.description}</p>
                  </div>
                  {/* Hover background effect */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-bd-green/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer Section --- */}
      <footer className="bg-white dark:bg-[#050505] border-t-2 border-gray-100 dark:border-gray-900 pt-32 md:pt-48 pb-20">
        <div className="container mx-auto px-6">
           <div className="flex flex-col lg:flex-row justify-between items-start gap-24 mb-32">
              <div className="max-w-2xl">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-bd-green rounded-[24px] flex items-center justify-center text-white font-black text-3xl shadow-xl">🇧🇩</div>
                  <span className="text-4xl md:text-5xl font-black text-bd-green font-noto tracking-tighter">দেশজ্ঞান</span>
                </div>
                <p className="themed-text-muted text-xl md:text-2xl leading-relaxed font-medium font-noto opacity-70 mb-10">
                  শেকড়ের সন্ধানে এক অনন্য ডিজিটাল প্ল্যাটফর্ম। হাজার বছরের বাংলার ইতিহাস, ঐতিহ্য ও সংস্কৃতির বিশ্বস্ত সংরক্ষক হিসেবে আমরা কাজ করছি। আমাদের লক্ষ্য পরবর্তী প্রজন্মের কাছে সঠিক ও প্রামাণ্য ইতিহাস পৌঁছে দেওয়া।
                </p>
                <div className="flex gap-6">
                  {['Facebook', 'Twitter', 'YouTube'].map(social => (
                    <button key={social} className="text-[10px] font-black uppercase tracking-widest themed-text-muted hover:text-bd-green transition-colors">{social}</button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
                 <div>
                   <h5 className="text-[11px] font-black text-bd-red uppercase tracking-[0.4em] mb-10">তথ্যকোষ</h5>
                   <ul className="flex flex-col gap-6 text-lg font-bold themed-text-muted font-noto">
                     {navItems.slice(0, 3).map(n => <li key={n.id}><button onClick={() => scrollToSection(n.id)} className="hover:text-bd-green transition-all">{n.label}</button></li>)}
                   </ul>
                 </div>
                 <div>
                   <h5 className="text-[11px] font-black text-bd-red uppercase tracking-[0.4em] mb-10">সহযোগিতা</h5>
                   <ul className="flex flex-col gap-6 text-lg font-bold themed-text-muted font-noto">
                     <li><button className="hover:text-bd-green transition-all">গাইডলাইন</button></li>
                     <li><button className="hover:text-bd-green transition-all">যোগাযোগ</button></li>
                     <li><button className="hover:text-bd-green transition-all">নীতিমালা</button></li>
                   </ul>
                 </div>
              </div>
           </div>
           
           <div className="pt-20 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div className="flex flex-col gap-4">
                <p className="text-[10px] md:text-[12px] font-black themed-text-muted uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} DESHGYAN ENCYCLOPEDIA. ALL RIGHTS RESERVED.</p>
                <p className="text-[8px] themed-text-muted font-black uppercase tracking-[0.3em] opacity-40">নিখুঁত ও প্রামাণ্য তথ্য সংগ্রহে কৃত্রিম বুদ্ধিমত্তা চালিত এক অনন্য প্রয়াস।</p>
              </div>
              <div className="flex items-center gap-10">
                 <button className="text-[10px] font-black uppercase tracking-widest themed-text-muted hover:text-bd-red transition-all">Privacy Policy</button>
                 <button className="text-[10px] font-black uppercase tracking-widest themed-text-muted hover:text-bd-red transition-all">Terms of Service</button>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
