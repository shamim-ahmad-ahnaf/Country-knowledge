
import React, { useState, useEffect, useRef } from 'react';
import { 
  HISTORICAL_ERAS, 
  EXPLORE_CATEGORIES,
  TOURIST_LANDMARKS,
  ISLAMIC_ARCHITECTURE,
  CULTURAL_FESTIVALS,
  HERITAGE_ELEMENTS,
  ISLAMIC_HISTORY_ELEMENTS,
  ISLAMIC_SCHOLARS_LIST
} from './constants';
import { streamBangladeshInfo } from './services/geminiService';
import { AppStatus, SearchResult } from './types';
import HistoryTimeline from './components/HistoryTimeline';
import InfoDisplay from './components/InfoDisplay';
import DidYouKnow from './components/DidYouKnow';
import SearchHistory from './components/SearchHistory';
import TourismGallery from './components/TourismGallery';
import IslamicArchitectureGallery from './components/IslamicArchitectureGallery';
import FestivalsGallery from './components/FestivalsGallery';
import HeritageGallery from './components/HeritageGallery';
import IslamicHistoryGallery from './components/IslamicHistoryGallery';
import IslamicScholarsGallery from './components/IslamicScholarsGallery';
import EmergencyServices from './components/EmergencyServices';
import FAQSection from './components/FAQSection';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deshgyan_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('deshgyan_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
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

  const addToHistory = (q: string) => {
    if (!q.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== q);
      const newHistory = [q, ...filtered].slice(0, 8);
      return newHistory;
    });
  };

  const handleSearch = async (searchQuery?: string) => {
    if (searchQuery) setQuery(searchQuery);
    
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    addToHistory(finalQuery);
    setStatus(AppStatus.LOADING);
    setError(null);
    setStreamingText('');
    setResult(null);
    setIsMenuOpen(false);

    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    try {
      await streamBangladeshInfo(
        finalQuery, 
        (chunk) => setStreamingText(chunk),
        (finalResult) => {
          setResult(finalResult);
          setStatus(AppStatus.SUCCESS);
        }
      );
    } catch (err: any) {
      // Show the actual error message from the service
      setError(err.message || 'তথ্য সংগ্রহে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।');
      setStatus(AppStatus.ERROR);
    }
  };

  const clearHistory = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত ইতিহাস মুছে ফেলতে চান?')) {
      setSearchHistory([]);
    }
  };
  
  const removeHistoryItem = (item: string) => {
    setSearchHistory(prev => prev.filter(i => i !== item));
  };

  const resetAll = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setStreamingText('');
    setQuery('');
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchInputRef.current?.focus();
  };

  const navItems = [
    { label: 'ডিরেক্টরি', id: 'directory' },
    { label: 'ইতিহাস', id: 'history' },
    { label: 'সংস্কৃতি', id: 'heritage' },
    { label: 'আলেম সমাজ', id: 'islamic-scholars' },
    { label: 'পর্যটন', id: 'tourist-spots' },
    { label: 'স্থাপত্য', id: 'islamic-architecture' },
    { label: 'উৎসব', id: 'cultural-festivals' },
    { label: 'জরুরী সেবা', id: 'emergency' },
    { label: 'প্রশ্ন-উত্তর', id: 'faq' }
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <nav 
        className={`fixed top-0 w-full z-[300] transition-all duration-500 ${scrolled ? 'glass py-3 shadow-xl border-b border-bd-green/10' : 'bg-transparent py-8'}`}
        aria-label="মূল নেভিগেশন"
      >
        <div className="container mx-auto px-6 flex justify-between items-center relative z-[320]">
          <button 
            onClick={resetAll} 
            className="flex items-center gap-4 group focus:ring-4 focus:ring-bd-green/30 rounded-2xl outline-none"
            aria-label="হোম পেজে ফিরে যান এবং অনুসন্ধান রিসেট করুন"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg transition-all group-hover:bg-bd-red group-hover:-rotate-12">🇧🇩</div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xl md:text-2xl font-black leading-tight font-noto text-bd-green dark:text-bd-green">দেশজ্ঞান</span>
              <span className="text-bd-red text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase">Digital Encyclopedia</span>
            </div>
          </button>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden xl:block">
              <ul className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] themed-text-muted">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => scrollToSection(item.id)} 
                      className="hover:text-bd-green transition-colors pb-1 border-b-2 border-transparent hover:border-bd-green focus:text-bd-green focus:border-bd-green outline-none"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={toggleDarkMode} 
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-lg text-lg md:text-xl hover:scale-110 transition-transform focus:ring-4 focus:ring-bd-green/30 outline-none"
              aria-label={isDarkMode ? "লাইট মোডে পরিবর্তন করুন" : "ডার্ক মোডে পরিবর্তন করুন"}
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden w-10 h-10 md:w-12 md:h-12 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-bd-green text-white shadow-lg transition-all active:scale-95 focus:ring-4 focus:ring-bd-green/30 outline-none"
              aria-label={isMenuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className={`w-6 h-0.5 bg-current transition-all transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-current transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`w-6 h-0.5 bg-current transition-all transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        id="mobile-menu"
        className={`fixed inset-0 z-[250] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <nav 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[400px] bg-white dark:bg-[#0a0a0a] shadow-[ -10px_0_40px_rgba(0,0,0,0.3) ] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col pt-32 pb-12 px-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-label="মোবাইল মেনু"
        >
          <div className="relative z-10 flex flex-col gap-8">
            {navItems.map((item, i) => (
              <button 
                key={i}
                onClick={() => scrollToSection(item.id)}
                className={`text-2xl md:text-3xl font-black text-bd-green dark:text-bd-green font-noto hover:text-bd-red transition-all duration-300 text-left transform focus:text-bd-red outline-none ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {item.label}
              </button>
            ))}
            <div className={`h-1 w-24 bg-bd-red/40 my-4 transition-all duration-700 delay-500 ${isMenuOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}></div>
            <button 
              onClick={resetAll} 
              className={`text-lg font-black uppercase tracking-[0.3em] themed-text-muted hover:text-bd-green transition-all duration-500 delay-600 text-left outline-none ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
              শুরুতে যান
            </button>
          </div>
        </nav>
      </div>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
          <div className="hero-pattern absolute inset-0 z-0 opacity-40 dark:opacity-20" aria-hidden="true"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#080808]" aria-hidden="true"></div>
          
          <div className="container mx-auto px-6 text-center z-10">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-bd-green/10 text-bd-green text-xs font-black uppercase tracking-[0.3em] animate-pulse">বাংলার হাজার বছরের তথ্য ভাণ্ডার</div>
            <h1 className="text-7xl md:text-8xl lg:text-[135px] font-black text-bd-green dark:text-bd-green mb-8 leading-[1.1] md:leading-[1] font-noto tracking-tighter drop-shadow-sm">
              শেকড়ের <span className="text-bd-red italic">সন্ধানে</span> <br /> 
              <span className="gradient-text">দেশজ্ঞানের ময়দানে</span>
            </h1>
            <p className="text-lg md:text-3xl themed-text-muted mb-12 md:mb-20 max-w-5xl mx-auto font-medium leading-relaxed font-noto">ইতিহাস, ঐতিহ্য, পর্যটন থেকে শুরু করে ডিজিটাল বাংলাদেশ — <br className="hidden md:block"/> সবকিছুই এখন আপনার হাতের মুঠোয়।</p>
            
            <div className="max-w-5xl mx-auto relative group">
              <div className="absolute inset-0 bg-bd-green/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
              <div className="relative themed-card p-2 md:p-4 rounded-[30px] md:rounded-[60px] shadow-[0_40px_120px_-20px_rgba(0,106,78,0.25)] dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-row items-stretch border-2 border-bd-green/20 group-hover:border-bd-green/40 transition-all duration-500 backdrop-blur-3xl focus-within:ring-4 focus-within:ring-bd-green/20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bd-green via-bd-red to-bd-green opacity-30" aria-hidden="true"></div>
                  <div className="flex-grow flex items-center px-4 md:px-6 py-2">
                    <span className="text-xl md:text-2xl mr-2 md:mr-4 opacity-40" aria-hidden="true">🔍</span>
                    <label htmlFor="main-search" className="sr-only">বাংলাদেশ সম্পর্কে অনুসন্ধান করুন</label>
                    <input 
                      id="main-search"
                      ref={searchInputRef}
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="যেমন: সুন্দরবন..."
                      className="flex-grow bg-transparent outline-none text-base md:text-3xl font-bold themed-text font-noto placeholder:opacity-30 min-w-0"
                    />
                  </div>
                  <button 
                    onClick={() => handleSearch()} 
                    className="bg-bd-green text-white px-5 md:px-20 py-3 md:py-6 rounded-[20px] md:rounded-[50px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] hover:bg-bd-red hover:shadow-[0_0_40px_rgba(244,42,65,0.4)] transition-all duration-500 shadow-xl text-sm md:text-2xl flex items-center justify-center gap-2 md:gap-5 active:scale-95 group/btn shrink-0 outline-none focus:ring-4 focus:ring-bd-red/30"
                  >
                    <span>খুঁজুন</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-8 md:w-8 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
              </div>
              
              <SearchHistory 
                history={searchHistory} 
                onSelect={handleSearch} 
                onClear={clearHistory}
                onRemoveItem={removeHistoryItem}
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <div ref={resultsRef} className="scroll-mt-40" aria-live="polite">
          {(status !== AppStatus.IDLE || streamingText) && (
            <section className="py-24 bg-gray-50/50 dark:bg-gray-900/10" aria-label="অনুসন্ধানের ফলাফল">
              <div className="container mx-auto px-6 max-w-5xl">
                {error && (
                  <div 
                    role="alert" 
                    className="p-8 bg-red-50 text-red-600 rounded-[30px] mb-12 font-bold border-2 border-red-100 flex flex-col items-center gap-4 text-center"
                  >
                    <span className="text-3xl" aria-hidden="true">⚠️</span>
                    <p className="text-lg md:text-xl">{error}</p>
                    <button 
                      onClick={() => handleSearch()} 
                      className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition-colors"
                    >
                      আবার চেষ্টা করুন
                    </button>
                  </div>
                )}
                <InfoDisplay result={result || { text: streamingText, sources: [] }} isStreaming={status === AppStatus.LOADING} onReset={resetAll} query={query} />
              </div>
            </section>
          )}
        </div>

        <DidYouKnow onSelect={handleSearch} />

        {/* NEW: Moved Knowledge Directory Section Up */}
        <section id="directory" className="py-20 md:py-32 bg-white dark:bg-black/20" aria-labelledby="dir-title">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">নলেজ ডিরেক্টরি</h2>
            <h3 id="dir-title" className="text-2xl md:text-7xl font-black text-bd-green font-noto mb-12 md:mb-24 leading-tight">বাংলার অফুরন্ত জ্ঞানভাণ্ডারে <br className="hidden lg:block" /> <span className="text-bd-red italic">ঐতিহ্যের</span> প্রামাণ্য ডিজিটাল সংকলন</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {EXPLORE_CATEGORIES.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => handleSearch(cat.query)} 
                  className="themed-card group p-8 md:p-12 rounded-[40px] md:rounded-[50px] border border-transparent hover:border-bd-green/20 hover:shadow-2xl transition-all text-left flex flex-col items-start gap-8 md:gap-10 cursor-pointer relative overflow-hidden outline-none focus:ring-4 focus:ring-bd-green/20"
                  aria-label={`${cat.title} ক্যাটাগরি অনুসন্ধান করুন`}
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 ${cat.color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-xl group-hover:scale-110 transition-all text-white`} aria-hidden="true">{cat.icon}</div>
                  <div className="relative z-10"><h4 className="text-xl md:text-2xl font-black text-bd-green font-noto mb-2 md:mb-3 group-hover:text-bd-red transition-colors">{cat.title}</h4><p className="themed-text-muted text-xs md:text-sm leading-relaxed font-medium">{cat.description}</p></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="history" className="py-24 md:py-48 bg-gray-50 dark:bg-black/40 overflow-hidden" aria-labelledby="history-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-24 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">মহাকাব্যিক পথচলা</h2>
                <h3 id="history-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">বাংলার হাজার বছরের <br/><span className="text-bd-red italic">ইতিহাস</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70">প্রাচীন জনপদ থেকে স্বাধীন সার্বভৌম বাংলাদেশ — আমাদের ইতিহাসের প্রতিটি অধ্যায় বীরত্ব ও ত্যাগের মহিমায় উজ্জ্বল।</p>
            </div>
            
            <HistoryTimeline 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>

        <section id="heritage" className="py-24 md:py-48 bg-white dark:bg-black/20" aria-labelledby="heritage-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">মন ও মননের প্রতিফলন</h2>
                <h3 id="heritage-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">সংস্কৃতি ও <br/><span className="text-bd-red italic">ঐতিহ্য</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">সাহিত্য, সংগীত, নৃত্য আর লোকজ উপকথায় সমৃদ্ধ এক অনন্য জনপদ — যেখানে জীবনই এক উৎসব।</p>
            </div>
            
            <HeritageGallery 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>

        <section id="islamic-history" className="py-24 md:py-48 bg-gray-50 dark:bg-black/40" aria-labelledby="islamic-history-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">সভ্যতার বিবর্তন</h2>
                <h3 id="islamic-history-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">ইসলামি <br/><span className="text-bd-red italic">ইতিহাস</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">বাংলার মাটিতে ইসলামের আগমন, আধ্যাত্মিক সাধকদের অবদান এবং গৌরবময় সুলতানি ও মুঘল আমলের প্রেক্ষাপট।</p>
            </div>
            
            <IslamicHistoryGallery 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>

        <section id="islamic-scholars" className="py-24 md:py-48 bg-white dark:bg-black/20" aria-labelledby="scholars-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">জ্ঞান ও প্রজ্ঞার বাতিঘর</h2>
                <h3 id="scholars-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">ইসলামি <br/><span className="text-bd-red italic">আলেম সমাজ</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">বাংলাদেশে ইসলামি শিক্ষা ও সমাজ সংস্কারে প্রথিতযশা আলেমদের অসামান্য অবদান ও জীবনকথা।</p>
            </div>
            
            <IslamicScholarsGallery 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>
        
        <section id="tourist-spots" className="py-24 md:py-48 bg-gray-50 dark:bg-black/40" aria-labelledby="tourist-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">প্রাকৃতিক ও ঐতিহাসিক বিস্ময়</h2>
                <h3 id="tourist-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">সেরা পর্যটন <br/><span className="text-bd-red italic">গ্যালারি</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">বাংলার রূপের জাদুতে মুগ্ধ হতে ঘুরে আসুন আমাদের শীর্ষ পর্যটন কেন্দ্রগুলো।</p>
            </div>
            
            <TourismGallery 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>

        <section id="islamic-architecture" className="py-24 md:py-48 bg-white dark:bg-black/20" aria-labelledby="arch-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">মুসলিম ঐতিহ্যের গৌরব</h2>
                <h3 id="arch-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">ইসলামিক <br/><span className="text-bd-red italic">স্থাপত্যশৈলী</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">বাংলার মুসলিম সুলতান ও শাসকদের অমর কীর্তি — অনিন্দ্য সুন্দর মসজিদ ও স্থাপনার গল্প।</p>
            </div>
            
            <IslamicArchitectureGallery 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>

        <section id="cultural-festivals" className="py-24 md:py-48 bg-gray-50 dark:bg-black/40" aria-labelledby="fest-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">বারো মাসে তেরো পার্বণ</h2>
                <h3 id="fest-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">সাংস্কৃতিক <br/><span className="text-bd-red italic">উৎসবসমূহ</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">রঙিন ও বৈচিত্র্যময় উৎসবের মিলনমেলা — বাঙালির প্রাণের উৎসবের ঐতিহ্য।</p>
            </div>
            
            <FestivalsGallery 
              onSelect={handleSearch} 
              isLoading={status === AppStatus.LOADING}
            />
          </div>
        </section>

        <section id="emergency" className="py-24 md:py-48 bg-white dark:bg-black/20" aria-labelledby="emergency-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">এক ক্লিকেই সব সেবা</h2>
                <h3 id="emergency-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">জাতীয় <br/><span className="text-bd-red italic">জরুরী সেবা</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">বিপদে আপদে তাৎক্ষণিক সহায়তার জন্য বাংলাদেশের গুরুত্বপূর্ণ হেল্পলাইনসমূহ।</p>
            </div>
            
            <EmergencyServices />
          </div>
        </section>

        <section id="faq" className="py-24 md:py-48 bg-gray-50 dark:bg-black/40" aria-labelledby="faq-title">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.6em] mb-6">আপনার কৌতুহল মেটাতে</h2>
                <h3 id="faq-title" className="text-4xl md:text-8xl font-black text-bd-green font-noto leading-[1.1] tracking-tighter mb-8">সাধারণ <br/><span className="text-bd-red italic">প্রশ্ন-উত্তর</span></h3>
                <div className="w-24 h-1 bg-bd-red/40 mb-12" aria-hidden="true"></div>
                <p className="themed-text-muted text-xl md:text-2xl font-medium max-w-3xl font-noto opacity-70 text-center">বাংলাদেশ সম্পর্কে সচরাচর জিজ্ঞাসিত প্রশ্ন ও তাদের সঠিক উত্তরসমূহ।</p>
            </div>
            
            <FAQSection />
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-[#050505] border-t-2 border-gray-100 dark:border-gray-900 pt-24 pb-12" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-20">
            {/* Column 1: Brand & Desc */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl">🇧🇩</div>
                <span className="text-3xl md:text-4xl font-black text-bd-green font-noto">দেশজ্ঞান</span>
              </div>
              <p className="themed-text-muted text-base md:text-lg leading-relaxed font-medium mb-8">
                বাংলার হাজার বছরের ইতিহাস, ঐতিহ্য ও অগণিত তথ্যের প্রামাণ্য ডিজিটাল এনসাইক্লোপিডিয়া। শেকড়ের টানে প্রবাসে বা স্বদেশে বাঙালির জন্য এক সমৃদ্ধ তথ্যভাণ্ডার।
              </p>
              <div className="flex items-center gap-4">
                {['fb', 'tw', 'ig', 'yt'].map(social => (
                  <button key={social} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-bd-green hover:bg-bd-red hover:text-white transition-all transform hover:scale-110" aria-label={social}>
                    <span className="text-xs font-black uppercase">{social}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Explore */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-bd-red font-black text-xs uppercase tracking-[0.4em] mb-10">গবেষণা বিভাগ</h4>
              <ul className="flex flex-col gap-4 text-base font-bold themed-text-muted">
                {['ইতিহাস ও পথচলা', 'সাংস্কৃতিক ঐতিহ্য', 'পর্যটন ও বিস্ময়', 'ইসলামিক জ্ঞানকোষ', 'ডিজিটাল বাংলাদেশ'].map(link => (
                  <li key={link}><button className="hover:text-bd-green transition-colors">{link}</button></li>
                ))}
              </ul>
            </div>

            {/* Column 3: Important Links */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-bd-red font-black text-xs uppercase tracking-[0.4em] mb-10">নাগরিক সেবা</h4>
              <ul className="flex flex-col gap-4 text-base font-bold themed-text-muted">
                {['জরুরী সেবা কেন্দ্র', 'সচরাচর প্রশ্নসমূহ', 'নাগরিক ফিডব্যাক', 'ব্যবহার বিধি', 'গোপনীয়তা নীতি'].map(link => (
                  <li key={link}><button className="hover:text-bd-green transition-colors">{link}</button></li>
                ))}
              </ul>
            </div>

            {/* Column 4: Newsletter/Connect */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-bd-red font-black text-xs uppercase tracking-[0.4em] mb-10">সংযুক্ত থাকুন</h4>
              <p className="themed-text-muted text-sm font-medium mb-6">নতুন কোনো তথ্য সংযোজিত হলে সবার আগে জানতে সাবস্ক্রাইব করুন।</p>
              <div className="w-full relative group">
                 <input 
                  type="email" 
                  placeholder="আপনার ইমেইল..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-6 pr-16 outline-none focus:border-bd-green transition-all font-medium text-sm"
                 />
                 <button className="absolute right-2 top-2 bottom-2 px-4 bg-bd-green text-white rounded-xl shadow-lg hover:bg-bd-red transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </button>
              </div>
              <div className="mt-8 flex items-center gap-3 themed-text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-bd-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-xs font-bold">ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-[10px] font-black themed-text-muted uppercase tracking-[0.5em]">
                &copy; {new Date().getFullYear()} DESHGYAN ENCYCLOPEDIA.
              </p>
              <div className="h-1 w-1 bg-bd-red rounded-full hidden md:block"></div>
              <p className="text-[10px] font-black text-bd-green uppercase tracking-[0.3em]">
                প্রযুক্তিগত সহযোগিতায় জেমিনি এআই
              </p>
            </div>
            <div className="flex items-center gap-6">
               <span className="text-[10px] font-black themed-text-muted uppercase tracking-[0.4em] italic">বাংলার ঐতিহ্য আমাদের গর্ব</span>
               <div className="w-8 h-8 bg-bd-red/10 rounded-lg flex items-center justify-center text-bd-red text-sm">❤️</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
