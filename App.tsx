
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
import Logo from './components/Logo';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
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
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    
    // Check for admin param in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }

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
    if (isMenuOpen || isAdminOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, isAdminOpen]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 60;
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
        className={`fixed top-0 w-full z-[300] transition-all duration-300 ${scrolled ? 'glass py-1.5 shadow-xl border-b border-bd-green/10' : 'bg-transparent py-3'}`}
        aria-label="মূল নেভিগেশন"
      >
        <div className="container mx-auto px-6 flex justify-between items-center relative z-[320]">
          <button 
            onClick={resetAll} 
            className="flex items-center gap-2 group outline-none"
          >
            <Logo size="sm" />
            <div className="flex flex-col items-start text-left">
              <span className="text-xl md:text-2xl font-black leading-none font-noto text-bd-green group-hover:text-bd-red transition-colors">দেশজ্ঞান</span>
              <span className="text-bd-red dark:text-bd-red/80 text-[6px] md:text-[8px] font-black tracking-[0.2em] uppercase opacity-70">Heritage Encyclopedia</span>
            </div>
          </button>
          
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden xl:block">
              <ul className="flex gap-5 text-[10px] font-black uppercase tracking-[0.1em] themed-text-muted">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => scrollToSection(item.id)} 
                      className="hover:text-bd-green transition-colors pb-0.5 border-b-2 border-transparent hover:border-bd-green outline-none"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <button onClick={toggleDarkMode} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm text-sm md:text-base hover:scale-110 transition-transform focus:ring-4 focus:ring-bd-green/20 outline-none">
              {isDarkMode ? '🌞' : '🌙'}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden w-8 h-8 md:w-10 md:h-10 flex flex-col items-center justify-center gap-1 rounded-xl bg-bd-green text-white shadow-sm focus:ring-4 focus:ring-bd-green/20 outline-none">
              <span className={`w-4 h-0.5 bg-current transition-all transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-4 h-0.5 bg-current transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`w-4 h-0.5 bg-current transition-all transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Dashboard Trigger - Double Click Footer for Admin */}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} searchHistory={searchHistory} />}

      {/* Mobile Menu */}
      <div id="mobile-menu" className={`fixed inset-0 z-[400] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <nav className={`absolute top-0 right-0 h-full w-[80%] max-w-[340px] bg-white dark:bg-[#0a0a0a] transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-xl font-black font-noto text-bd-green">দেশজ্ঞান</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-bd-red"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto px-6 py-4 flex flex-col gap-2">
            {navItems.map((item, i) => (
              <button key={i} onClick={() => scrollToSection(item.id)} className="text-lg font-black text-bd-green dark:text-bd-green font-noto py-2 border-b border-gray-50 dark:border-white/5 text-left outline-none">
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <button onClick={resetAll} className="w-full py-3 bg-bd-green text-white rounded-lg font-black uppercase text-[10px] outline-none">শুরুতে ফিরে যান</button>
          </div>
        </nav>
      </div>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen md:min-h-[70vh] flex flex-col items-center justify-center pt-20 md:pt-32 pb-8 md:pb-12 overflow-hidden">
          <div className="hero-pattern absolute inset-0 z-0 opacity-40 dark:opacity-10" aria-hidden="true"></div>
          <div className="container mx-auto px-6 text-center z-10 flex flex-col items-center justify-center h-full">
            <div className="inline-block px-3 py-0.5 mb-4 md:mb-6 rounded-full bg-bd-green/10 text-bd-green text-[9px] font-black uppercase tracking-[0.2em] animate-reveal-stagger">বাংলার হাজার বছরের তথ্য ভাণ্ডার</div>
            <h1 className="text-5xl md:text-9xl lg:text-[100px] font-black leading-[1.2] md:leading-[1.1] font-noto tracking-tighter mb-4 md:mb-3 animate-reveal-stagger">
              <span className="text-bd-green">শেকড়ের</span> <span className="text-bd-red italic">সন্ধানে</span> <br /> 
              <span className="text-bd-green">দেশজ্ঞানের</span> <span className="text-bd-red">ময়দানে</span>
            </h1>
            <p className="text-sm md:text-xl themed-text-muted mb-6 md:mb-12 max-w-3xl mx-auto font-medium font-noto opacity-70 animate-reveal-stagger">ইতিহাস, ঐতিহ্য ও সংস্কৃতি — সবকিছুই এখন আপনার হাতের মুঠোয়।</p>
            <div className="w-full max-w-4xl mx-auto relative group animate-reveal-stagger">
              <div className="relative themed-card p-1.5 md:p-2.5 rounded-[20px] md:rounded-[35px] shadow-2xl flex flex-row items-stretch border border-bd-green/20 focus-within:ring-4 focus-within:ring-bd-green/10 transition-all">
                  <div className="flex-grow flex items-center px-4 py-2">
                    <span className="text-lg opacity-30 mr-2">🔍</span>
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="যেমন: সুন্দরবন..."
                      className="flex-grow bg-transparent outline-none text-base md:text-2xl font-bold themed-text font-noto placeholder:opacity-20 min-w-0"
                    />
                  </div>
                  <button onClick={() => handleSearch()} className="bg-bd-green text-white px-5 md:px-10 py-2.5 md:py-3.5 rounded-[15px] md:rounded-[28px] font-black uppercase text-xs md:text-lg hover:bg-bd-red transition-all shadow-md active:scale-95 shrink-0 outline-none">খুঁজুন</button>
              </div>
              <SearchHistory history={searchHistory} onSelect={handleSearch} onClear={clearHistory} onRemoveItem={removeHistoryItem} />
            </div>
            
            <div className="md:hidden mt-10 md:mt-auto pt-4 pb-4 animate-bounce opacity-30">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-bd-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
               </svg>
            </div>
          </div>
        </section>

        {/* Results */}
        <div ref={resultsRef} className="scroll-mt-20" aria-live="polite">
          {(status !== AppStatus.IDLE || streamingText) && (
            <section className="py-8 bg-gray-50/20 dark:bg-gray-900/5">
              <div className="container mx-auto px-6 max-w-4xl">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-6 font-bold text-center border border-red-100">{error}</div>}
                <InfoDisplay result={result || { text: streamingText, sources: [] }} isStreaming={status === AppStatus.LOADING} onReset={resetAll} query={query} />
              </div>
            </section>
          )}
        </div>

        <DidYouKnow onSelect={handleSearch} />

        {/* Knowledge Directory */}
        <section id="directory" className="py-10 md:py-16 bg-white dark:bg-black/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">নলেজ ডিরেক্টরি</h2>
            <h3 className="text-3xl md:text-7xl font-black font-noto mb-8 md:mb-12 leading-[1.2]">
              <span className="text-bd-green">ঐতিহ্যের প্রামাণ্য</span> <br />
              <span className="text-bd-red italic">ডিজিটাল</span> <span className="text-bd-green">সংকলন</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {EXPLORE_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => handleSearch(cat.query)} className="themed-card group p-5 rounded-[25px] border border-transparent hover:border-bd-green/20 hover:shadow-xl transition-all text-left flex flex-col gap-4 outline-none focus:ring-4 focus:ring-bd-green/10">
                  <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center text-xl shadow-md text-white group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                  <div><h4 className="text-base font-black text-bd-green font-noto mb-1 group-hover:text-bd-red transition-colors">{cat.title}</h4><p className="themed-text-muted text-[10px] opacity-60 line-clamp-2">{cat.description}</p></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* History */}
        <section id="history" className="py-12 md:py-20 bg-gray-50 dark:bg-black/20 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">মহাকাব্যিক পথচলা</h2>
                <h3 className="text-3xl md:text-7xl font-black font-noto leading-[1.2] mb-4">
                  <span className="text-bd-green">বাংলার হাজার বছরের</span> <br />
                  <span className="text-bd-red italic">ইতিহাস ও সংগ্রাম</span>
                </h3>
                <div className="w-16 h-1 bg-bd-red/30 mb-6"></div>
                <p className="themed-text-muted text-base md:text-xl font-medium max-w-2xl font-noto opacity-70">প্রাচীন জনপদ থেকে স্বাধীন সার্বভৌম বাংলাদেশ।</p>
            </div>
            <HistoryTimeline onSelect={handleSearch} isLoading={status === AppStatus.LOADING} />
          </div>
        </section>

        {/* Heritage */}
        <section id="heritage" className="py-12 md:py-20 bg-white dark:bg-black/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">মন ও মননের প্রতিফলন</h2>
                <h3 className="text-3xl md:text-7xl font-black font-noto leading-[1.2]">
                  <span className="text-bd-green">সংস্কৃতি ও</span> <br />
                  <span className="text-bd-red italic">বাংলার</span> <span className="text-bd-green">ঐতিহ্য</span>
                </h3>
            </div>
            <HeritageGallery onSelect={handleSearch} isLoading={status === AppStatus.LOADING} />
          </div>
        </section>

        {/* Scholars */}
        <section id="islamic-scholars" className="py-12 md:py-20 bg-gray-50 dark:bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">জ্ঞান ও প্রজ্ঞার বাতিঘর</h2>
                <h3 className="text-3xl md:text-7xl font-black font-noto leading-[1.2] mb-4">
                  <span className="text-bd-green">ইসলামি আলেম</span> <br />
                  <span className="text-bd-red italic">সমাজ ও মণীষী</span>
                </h3>
            </div>
            <IslamicScholarsGallery onSelect={handleSearch} isLoading={status === AppStatus.LOADING} />
          </div>
        </section>

        {/* Tourism */}
        <section id="tourist-spots" className="py-12 md:py-20 bg-white dark:bg-black/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">প্রাকৃতিক বিস্ময়</h2>
                <h3 className="text-3xl md:text-7xl font-black font-noto leading-[1.2] mb-4">
                  <span className="text-bd-red italic">সেরা</span> <span className="text-bd-green">পর্যটন</span> <br />
                  <span className="text-bd-green">গ্যালারি ও স্পট</span>
                </h3>
            </div>
            <TourismGallery onSelect={handleSearch} isLoading={status === AppStatus.LOADING} />
          </div>
        </section>

        {/* Emergency */}
        <section id="emergency" className="py-12 md:py-20 bg-gray-50 dark:bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">এক ক্লিকেই সব সেবা</h2>
                <h3 className="text-3xl md:text-7xl font-black font-noto leading-[1.2] mb-4">
                   <span className="text-bd-green">জাতীয় জরুরি</span> <br />
                   <span className="text-bd-red italic">সেবা ও হটলাইন</span>
                </h3>
            </div>
            <EmergencyServices />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-12 md:py-20 bg-white dark:bg-black/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                <h2 className="text-[12px] font-black text-bd-red uppercase tracking-[0.4em] mb-2">আপনার কৌতুহল মেটাতে</h2>
                <h3 className="text-3xl md:text-7xl font-black font-noto leading-[1.2] mb-4">
                   <span className="text-bd-green">সাধারণ জিজ্ঞাসা</span> <br />
                   <span className="text-bd-red italic">ও সঠিক উত্তর</span>
                </h3>
            </div>
            <FAQSection />
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-white/5 pt-12 pb-8" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 lg:col-span-1">
              <button 
                onDoubleClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-2 mb-4 group outline-none"
              >
                <Logo size="sm" />
                <span className="text-2xl font-black text-bd-green font-noto group-hover:text-bd-red transition-colors">দেশজ্ঞান</span>
              </button>
              <p className="themed-text-muted text-xs leading-relaxed opacity-70 mb-6">বাংলার সমৃদ্ধ ডিজিটাল এনসাইক্লোপিডিয়া। শেকড়ের টানে বাঙালির তথ্যভাণ্ডার। আপনার জ্ঞান তৃষ্ণা মেটাতে আমরা সদাপ্রস্তুত।</p>
              <div className="flex gap-4">
                {['Facebook', 'Twitter', 'YouTube'].map(social => (
                  <button key={social} className="w-8 h-8 rounded-lg bg-bd-green/5 flex items-center justify-center text-[10px] font-black text-bd-green hover:bg-bd-green hover:text-white transition-all outline-none" title={social}>{social[0]}</button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-bd-red font-black text-xs uppercase tracking-[0.3em] mb-6">গবেষণা ও তথ্য</h4>
              <ul className="flex flex-col gap-3 text-xs font-bold themed-text-muted opacity-80">
                <li><button onClick={() => scrollToSection('history')} className="hover:text-bd-green transition-colors outline-none text-left">হাজার বছরের ইতিহাস</button></li>
                <li><button onClick={() => scrollToSection('heritage')} className="hover:text-bd-green transition-colors outline-none text-left">সাংস্কৃতিক ঐতিহ্য</button></li>
                <li><button onClick={() => scrollToSection('directory')} className="hover:text-bd-green transition-colors outline-none text-left">তথ্য ডিরেক্টরি</button></li>
                <li><button onClick={() => scrollToSection('tourist-spots')} className="hover:text-bd-green transition-colors outline-none text-left">পর্যটন কেন্দ্র</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-bd-red font-black text-xs uppercase tracking-[0.3em] mb-6">নাগরিক সেবা</h4>
              <ul className="flex flex-col gap-3 text-xs font-bold themed-text-muted opacity-80">
                <li><button onClick={() => scrollToSection('emergency')} className="hover:text-bd-green transition-colors outline-none text-left">জরুরী হটলাইন</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-bd-green transition-colors outline-none text-left">সাধারণ জিজ্ঞাসা</button></li>
                <li><button className="hover:text-bd-green transition-colors outline-none text-left">ব্যবহারের শর্তাবলী</button></li>
                <li><button className="hover:text-bd-green transition-colors outline-none text-left">গোপনীয়তা নীতি</button></li>
              </ul>
            </div>

            <div className="flex flex-col items-start">
               <h4 className="text-bd-red font-black text-xs uppercase tracking-[0.3em] mb-6">সংযুক্ত থাকুন</h4>
               <p className="text-[10px] themed-text-muted mb-4 opacity-60">নতুন আপডেটের জন্য আমাদের নিউজলেটার সাবস্ক্রাইব করুন।</p>
               <div className="flex gap-2 w-full mb-6">
                 <input type="email" placeholder="আপনার ইমেইল..." className="bg-gray-50 dark:bg-gray-900 border border-bd-green/10 rounded-xl p-3 text-xs w-full outline-none focus:border-bd-green transition-all" />
                 <button className="bg-bd-green text-white px-4 rounded-xl text-xs hover:bg-bd-red transition-all shadow-md active:scale-95">✓</button>
               </div>
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex items-center gap-2 text-bd-green font-black uppercase text-[10px] tracking-widest hover:text-bd-red transition-colors group">
                 উপরে ফিরে যান
                 <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center group-hover:-translate-y-1 transition-transform">↑</span>
               </button>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-black themed-text-muted uppercase tracking-[0.2em]">© {new Date().getFullYear()} DESHGYAN ENCYCLOPEDIA. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black themed-text-muted uppercase tracking-[0.1em] italic">বাংলার ঐতিহ্য আমাদের গর্ব ❤️</span>
              <div className="w-1.5 h-1.5 rounded-full bg-bd-red animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
