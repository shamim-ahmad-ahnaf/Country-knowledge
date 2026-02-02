
import React, { useState, useEffect, useRef } from 'react';
import { 
  HISTORICAL_ERAS, 
  EXPLORE_CATEGORIES,
  EMERGENCY_NUMBERS,
  FAQ_DATA,
  FEATURED_SPOTS,
  TOURIST_LANDMARKS,
  ISLAMIC_HERITAGE,
  ISLAMIC_ARCHITECTURE
} from './constants';
import { streamBangladeshInfo } from './services/geminiService';
import { AppStatus, SearchResult } from './types';
import HistoryCard from './components/HistoryCard';
import InfoDisplay from './components/InfoDisplay';
import DidYouKnow from './components/DidYouKnow';

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
  
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setStreamingText('');
    setResult(null);
    setIsMenuOpen(false);

    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    try {
      await streamBangladeshInfo(
        q, 
        (chunk) => setStreamingText(chunk),
        (finalResult) => {
          setResult(finalResult);
          setStatus(AppStatus.SUCCESS);
        }
      );
    } catch (err: any) {
      setError('তথ্য সংগ্রহে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।');
      setStatus(AppStatus.ERROR);
    }
  };

  const resetAll = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setStreamingText('');
    setQuery('');
    setIsMenuOpen(false);
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
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <nav className={`fixed top-0 w-full z-[300] transition-all duration-500 ${scrolled ? 'glass py-3 shadow-xl border-b border-bd-green/10' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center relative z-[320]">
          <button onClick={resetAll} className="flex items-center gap-4 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg transition-all group-hover:bg-bd-red group-hover:-rotate-12">🇧🇩</div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xl md:text-2xl font-black leading-tight font-noto text-bd-green dark:text-bd-green">দেশজ্ঞান</span>
              <span className="text-bd-red text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase">Digital Encyclopedia</span>
            </div>
          </button>
          
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden xl:block">
              <ul className="flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] themed-text-muted">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => scrollToSection(item.id)} 
                      className="hover:text-bd-green transition-colors pb-1 border-b-2 border-transparent hover:border-bd-green"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <button onClick={toggleDarkMode} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-lg text-lg md:text-xl hover:scale-110 transition-transform">
              {isDarkMode ? '🌞' : '🌙'}
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden w-10 h-10 md:w-12 md:h-12 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-bd-green text-white shadow-lg transition-all active:scale-95"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className={`w-6 h-0.5 bg-current transition-all transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-current transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`w-6 h-0.5 bg-current transition-all transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      <div 
        className={`fixed inset-0 z-[250] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[400px] bg-white dark:bg-[#0a0a0a] shadow-[ -10px_0_40px_rgba(0,0,0,0.3) ] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col pt-32 pb-12 px-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="relative z-10 flex flex-col gap-8">
            {navItems.map((item, i) => (
              <button 
                key={i}
                onClick={() => scrollToSection(item.id)}
                className={`text-3xl md:text-4xl font-black text-bd-green dark:text-bd-green font-noto hover:text-bd-red transition-all duration-300 text-left transform ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {item.label}
              </button>
            ))}
            <div className={`h-1 w-24 bg-bd-red/40 my-4 transition-all duration-700 delay-500 ${isMenuOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}></div>
            <button onClick={resetAll} className={`text-lg font-black uppercase tracking-[0.3em] themed-text-muted hover:text-bd-green transition-all duration-500 delay-600 text-left ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>শুরুতে যান</button>
          </div>
        </div>
      </div>

      <main id="main-content">
        <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
          <div className="hero-pattern absolute inset-0 z-0 opacity-40 dark:opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#080808]"></div>
          
          <div className="container mx-auto px-6 text-center z-10">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-bd-green/10 text-bd-green text-xs font-black uppercase tracking-[0.3em] animate-pulse">বাংলার হাজার বছরের তথ্য ভাণ্ডার</div>
            <h1 className="text-7xl md:text-8xl lg:text-[135px] font-black text-bd-green dark:text-bd-green mb-8 leading-[1.1] md:leading-[1] font-noto tracking-tighter drop-shadow-sm">
              শেকড়ের <span className="text-bd-red italic">সন্ধানে</span> <br /> 
              <span className="gradient-text">দেশজ্ঞানের ময়দানে</span>
            </h1>
            <p className="text-lg md:text-3xl themed-text-muted mb-12 md:mb-20 max-w-5xl mx-auto font-medium leading-relaxed font-noto">ইতিহাস, ঐতিহ্য, পর্যটন থেকে শুরু করে ডিজিটাল বাংলাদেশ — <br className="hidden md:block"/> সবকিছুই এখন আপনার হাতের মুঠোয়।</p>
            
            <div className="max-w-5xl mx-auto relative group">
              <div className="absolute inset-0 bg-bd-green/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
              <div className="relative themed-card p-2 md:p-4 rounded-[30px] md:rounded-[60px] shadow-[0_40px_120px_-20px_rgba(0,106,78,0.25)] dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-row items-stretch border-2 border-bd-green/20 group-hover:border-bd-green/40 transition-all duration-500 backdrop-blur-3xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bd-green via-bd-red to-bd-green opacity-30"></div>
                  <div className="flex-grow flex items-center px-4 md:px-6 py-2">
                    <span className="text-xl md:text-2xl mr-2 md:mr-4 opacity-40">🔍</span>
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="যেমন: সুন্দরবন..."
                      className="flex-grow bg-transparent outline-none text-base md:text-3xl font-bold themed-text font-noto placeholder:opacity-30 min-w-0"
                    />
                  </div>
                  <button onClick={() => handleSearch()} className="bg-bd-green text-white px-5 md:px-20 py-3 md:py-6 rounded-[20px] md:rounded-[50px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] hover:bg-bd-red hover:shadow-[0_0_40px_rgba(244,42,65,0.4)] transition-all duration-500 shadow-xl text-sm md:text-2xl flex items-center justify-center gap-2 md:gap-5 active:scale-95 group/btn shrink-0">
                    <span>খুঁজুন</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-8 md:w-8 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
              </div>
            </div>
          </div>
        </section>

        <div ref={resultsRef} className="scroll-mt-40">
          {(status !== AppStatus.IDLE || streamingText) && (
            <section className="py-24 bg-gray-50/50 dark:bg-gray-900/10">
              <div className="container mx-auto px-6 max-w-5xl">
                {error && <div className="p-8 bg-red-50 text-red-600 rounded-[30px] mb-12 font-bold border-2 border-red-100 flex items-center gap-4"><span className="text-3xl">⚠️</span> {error}</div>}
                <InfoDisplay result={result || { text: streamingText, sources: [] }} isStreaming={status === AppStatus.LOADING} onReset={resetAll} query={query} />
              </div>
            </section>
          )}
        </div>

        <DidYouKnow onSelect={handleSearch} />
        
        <section id="tourist-spots" className="py-20 md:py-32 bg-white dark:bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8">
              <div className="text-left">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">ঐতিহাসিক পর্যটন</h2>
                <h3 className="text-3xl md:text-7xl font-black text-bd-green font-noto leading-tight">সেরা পর্যটন কেন্দ্রসমূহ</h3>
              </div>
              <p className="themed-text-muted text-lg md:text-xl max-w-md font-medium leading-relaxed">বাংলার ইতিহাস ও ঐতিহ্যের সাক্ষী হয়ে দাঁড়িয়ে থাকা সেরা পর্যটন কেন্দ্রগুলোর বিস্তারিত জেনে নিন।</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
               {TOURIST_LANDMARKS.map((spot) => (
                 <button key={spot.id} onClick={() => handleSearch(spot.query)} className="group flex flex-col themed-card rounded-[40px] md:rounded-[60px] border-2 shadow-lg hover:shadow-2xl transition-all overflow-hidden h-full text-left">
                    <div className="w-full aspect-[4/3] overflow-hidden relative">
                       <img src={spot.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={spot.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-8 md:p-10 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-bd-red font-black text-[11px] uppercase tracking-widest mb-4 block">{spot.subtitle}</span>
                        <h4 className="text-2xl md:text-3xl font-black text-bd-green font-noto mb-4 md:mb-5">{spot.title}</h4>
                        <p className="themed-text-muted text-base md:text-lg font-medium leading-relaxed mb-6 md:mb-8">{spot.description}</p>
                      </div>
                      <span className="text-bd-green font-black uppercase text-[10px] tracking-widest flex items-center gap-3 self-start mt-auto">ইতিহাস দেখুন<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        </section>

        <section id="history" className="py-20 md:py-32 bg-gray-50 dark:bg-black/40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">ঐতিহাসিক টাইমলাইন</h2>
                <h3 className="text-3xl md:text-6xl font-black text-bd-green font-noto leading-tight">বাংলার হাজার বছরের পথচলা</h3>
              </div>
              <p className="themed-text-muted text-lg font-medium md:max-w-sm">প্রাচীন জনপদ থেকে স্বাধীন সার্বভৌম বাংলাদেশ — আমাদের ইতিহাসের প্রতিটি অধ্যায় বীরত্ব ও ত্যাগের মহিমায় উজ্জ্বল।</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {HISTORICAL_ERAS.map((era) => (<HistoryCard key={era.id} era={era} onSelect={handleSearch} />))}
            </div>
          </div>
        </section>

        <section id="directory" className="py-20 md:py-32 bg-gray-50 dark:bg-black/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">নলেজ ডিরেক্টরি</h2>
            <h3 className="text-2xl md:text-7xl font-black text-bd-green font-noto mb-12 md:mb-24 leading-tight">বাংলার অফুরন্ত জ্ঞানভাণ্ডারে <br className="hidden lg:block" /> <span className="text-bd-red italic">ঐতিহ্যের</span> প্রামাণ্য ডিজিটাল সংকলন</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {EXPLORE_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => handleSearch(cat.query)} className="themed-card group p-8 md:p-12 rounded-[40px] md:rounded-[50px] border border-transparent hover:border-bd-green/20 hover:shadow-2xl transition-all text-left flex flex-col items-start gap-8 md:gap-10 cursor-pointer relative overflow-hidden">
                  <div className={`w-14 h-14 md:w-16 md:h-16 ${cat.color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-xl group-hover:scale-110 transition-all text-white`}>{cat.icon}</div>
                  <div className="relative z-10"><h4 className="text-xl md:text-2xl font-black text-bd-green font-noto mb-2 md:mb-3 group-hover:text-bd-red transition-colors">{cat.title}</h4><p className="themed-text-muted text-xs md:text-sm leading-relaxed font-medium">{cat.description}</p></div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-[#050505] border-t-2 border-gray-100 dark:border-gray-900 pt-20 md:pt-32 pb-16">
        <div className="container mx-auto px-6 text-center md:text-left">
           <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16 mb-16 md:mb-24">
              <div className="max-w-md mx-auto md:mx-0">
                <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl">🇧🇩</div>
                  <span className="text-3xl md:text-4xl font-black text-bd-green font-noto">দেশজ্ঞান</span>
                </div>
                <p className="themed-text-muted text-base md:text-lg leading-relaxed font-medium">শেকড়ের সন্ধানে এক অনন্য ডিজিটাল প্ল্যাটফর্ম। হাজার বছরের বাংলার ইতিহাস ও ঐতিহ্যের বিশ্বস্ত সংরক্ষক।</p>
              </div>
           </div>
           <div className="pt-12 md:pt-16 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <p className="text-[8px] md:text-[10px] font-black themed-text-muted uppercase tracking-[0.3em] md:tracking-[0.5em]">&copy; {new Date().getFullYear()} DESHGYAN ENCYCLOPEDIA. BUILT WITH AI PRIDE.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
