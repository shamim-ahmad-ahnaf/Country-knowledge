
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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setStreamingText('');
    setResult(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'glass py-3 shadow-xl border-b border-bd-green/10' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={resetAll} className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg transition-all group-hover:bg-bd-red group-hover:-rotate-12">🇧🇩</div>
            <div className="flex flex-col items-start text-left">
              <span className="text-2xl font-black text-bd-green dark:text-bd-green leading-tight font-noto">দেশজ্ঞান</span>
              <span className="text-bd-red text-[10px] font-black tracking-[0.4em] uppercase">Digital Encyclopedia</span>
            </div>
          </button>
          
          <div className="flex items-center gap-6">
            <nav className="hidden xl:block">
              <ul className="flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] themed-text-muted">
                {['ইতিহাস', 'ভৌগোলিক', 'পর্যটন কেন্দ্র', 'স্থাপত্য', 'ডিরেক্টরি'].map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => {
                        const sections = ['history', 'geo', 'tourist-spots', 'islamic-architecture', 'directory'];
                        document.getElementById(sections[i])?.scrollIntoView({behavior:'smooth', block: 'start'});
                      }} 
                      className="hover:text-bd-green transition-colors pb-1 border-b-2 border-transparent hover:border-bd-green"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <button onClick={toggleDarkMode} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-lg text-xl hover:scale-110 transition-transform">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* Modern Hero Section */}
        <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
          <div className="hero-pattern absolute inset-0 z-0 opacity-40 dark:opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#080808]"></div>
          
          <div className="container mx-auto px-6 text-center z-10">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-bd-green/10 text-bd-green text-xs font-black uppercase tracking-[0.3em] animate-pulse">
              বাংলার হাজার বছরের তথ্য ভাণ্ডার
            </div>
            <h1 className="text-6xl md:text-[110px] font-black text-bd-green dark:text-bd-green mb-8 leading-[1] font-noto tracking-tighter">
              শেকড়ের <span className="text-bd-red italic">সন্ধানে</span> <br /> 
              <span className="gradient-text">দেশজ্ঞান</span>
            </h1>
            <p className="text-xl md:text-3xl themed-text-muted mb-16 max-w-4xl mx-auto font-medium leading-relaxed font-noto">
              ইতিহাস, ঐতিহ্য, পর্যটন থেকে শুরু করে ডিজিটাল বাংলাদেশ — <br className="hidden md:block"/> সবকিছুই এখন আপনার হাতের মুঠোয়।
            </p>
            
            <div className="max-w-4xl mx-auto relative group">
              <div className="relative glass p-3 rounded-[40px] shadow-[0_30px_100px_rgba(0,106,78,0.2)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row items-stretch border-2 border-bd-green/20">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="যেমন: সুন্দরবনের ইতিহাস বা বায়তুল মোকাররমের বিস্তারিত..."
                    className="flex-grow pl-10 pr-6 py-6 bg-transparent outline-none text-2xl font-bold themed-text font-noto"
                  />
                  <button onClick={() => handleSearch()} className="bg-bd-green text-white px-14 py-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-bd-red transition-all shadow-xl text-xl flex items-center justify-center gap-4">
                    <span>খুঁজুন</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
              </div>
            </div>
          </div>
        </section>

        {/* AI Results Result Area */}
        <div ref={resultsRef} className="scroll-mt-40">
          {(status !== AppStatus.IDLE || streamingText) && (
            <section className="py-24 bg-gray-50/50 dark:bg-gray-900/10">
              <div className="container mx-auto px-6 max-w-5xl">
                {error && <div className="p-8 bg-red-50 text-red-600 rounded-[30px] mb-12 font-bold border-2 border-red-100 flex items-center gap-4">
                  <span className="text-3xl">⚠️</span> {error}
                </div>}
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

        {/* Did You Know? Rotating Section */}
        <DidYouKnow onSelect={handleSearch} />

        {/* Top Tourist Attractions Section */}
        <section id="tourist-spots" className="py-32 bg-white dark:bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="text-left">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">ঐতিহাসিক পর্যটন</h2>
                <h3 className="text-5xl md:text-7xl font-black text-bd-green font-noto leading-tight">সেরা পর্যটন কেন্দ্রসমূহ</h3>
              </div>
              <p className="themed-text-muted text-xl max-w-md font-medium leading-relaxed">বাংলার ইতিহাস ও ঐতিহ্যের সাক্ষী হয়ে দাঁড়িয়ে থাকা সেরা পর্যটন কেন্দ্রগুলোর বিস্তারিত জেনে নিন।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {TOURIST_LANDMARKS.map((spot) => (
                 <button 
                    key={spot.id}
                    onClick={() => handleSearch(spot.query)}
                    className="group flex flex-col themed-card rounded-[60px] border-2 shadow-lg hover:shadow-2xl transition-all overflow-hidden h-full text-left"
                 >
                    <div className="w-full aspect-[4/3] overflow-hidden relative">
                       <img src={spot.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={spot.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-10 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-bd-red font-black text-[11px] uppercase tracking-widest mb-4 block">{spot.subtitle}</span>
                        <h4 className="text-3xl font-black text-bd-green font-noto mb-5">{spot.title}</h4>
                        <p className="themed-text-muted text-lg font-medium leading-relaxed mb-8">{spot.description}</p>
                      </div>
                      <span className="text-bd-green font-black uppercase text-[10px] tracking-widest flex items-center gap-3 self-start mt-auto">
                        ইতিহাস দেখুন
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </span>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        </section>

        {/* Restore Original Grid History Section */}
        <section id="history" className="py-32 bg-gray-50 dark:bg-black/40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">ঐতিহাসিক টাইমলাইন</h2>
                <h3 className="text-5xl md:text-6xl font-black text-bd-green font-noto leading-tight">বাংলার হাজার বছরের পথচলা</h3>
              </div>
              <p className="themed-text-muted text-lg font-medium md:max-w-sm">প্রাচীন জনপদ থেকে স্বাধীন সার্বভৌম বাংলাদেশ — আমাদের ইতিহাসের প্রতিটি অধ্যায় বীরত্ব ও ত্যাগের মহিমায় উজ্জ্বল।</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {HISTORICAL_ERAS.map((era) => (
                <HistoryCard key={era.id} era={era} onSelect={handleSearch} />
              ))}
            </div>
          </div>
        </section>

        {/* Dedicated: Featured Section (Geography) */}
        <section id="geo" className="py-32 bg-white dark:bg-gray-900/20 overflow-hidden">
          <div className="container mx-auto px-6">
             <div className="text-center mb-24">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">প্রকৃতি ও ভূগোল</h2>
                <h3 className="text-5xl md:text-[80px] font-black text-bd-green font-noto leading-none">সবুজ শ্যামল বাংলাদেশ</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {FEATURED_SPOTS.map((spot) => (
                  <button 
                    key={spot.id}
                    onClick={() => handleSearch(spot.query)}
                    className="relative group h-[500px] rounded-[50px] overflow-hidden shadow-2xl transition-all hover:-translate-y-4 text-left bg-gray-100 dark:bg-gray-800"
                  >
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-shimmer shimmer-box opacity-30"></div>
                    <img 
                      src={spot.image} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 relative z-10" 
                      alt={`Image of ${spot.title} in Bangladesh`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20"></div>
                    <div className="absolute bottom-0 left-0 p-10 z-30">
                      <span className="text-bd-red font-black text-[11px] uppercase tracking-[0.3em] mb-3 block">{spot.subtitle}</span>
                      <h4 className="text-3xl font-black text-white font-noto mb-3">{spot.title}</h4>
                      <p className="text-white/80 text-sm leading-relaxed max-w-[280px]">{spot.description}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </section>

        {/* Emergency Dashboard - UPDATED & IMPROVED */}
        <section id="emergency" className="py-24 bg-bd-red relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-16">
              <div className="text-white max-w-2xl text-center xl:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  <span className="text-xs font-black uppercase tracking-widest">২৪/৭ সেবা প্রদান</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black font-noto mb-8 leading-tight">জরুরি তথ্য কেন্দ্র</h2>
                <p className="text-white/90 text-xl md:text-2xl font-medium mb-12 leading-relaxed">
                  যেকোনো বিপদে বা সহায়তার প্রয়োজনে এই নম্বরগুলো সর্বদা আপনার পাশে আছে। <br className="hidden md:block" />
                  দেশের প্রতিটি সুনাগরিকের জন্য এই রাষ্ট্রীয় সেবাগুলো সম্পূর্ণ উন্মুক্ত।
                </p>
                <button 
                  onClick={() => handleSearch("বাংলাদেশের সকল গুরুত্বপূর্ণ সরকারি হেল্পলাইন ও জরুরি সেবা নম্বরসমূহ সম্পর্কে বিস্তারিত গাইড দাও")} 
                  className="bg-white text-bd-red px-14 py-6 rounded-[30px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 flex items-center gap-4 mx-auto xl:mx-0"
                >
                  সবগুলো সেবা দেখুন
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full xl:w-auto">
                {EMERGENCY_NUMBERS.map((num, i) => (
                  <div 
                    key={i} 
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-2xl p-10 rounded-[50px] border border-white/20 text-white transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl flex flex-col items-center text-center min-w-[260px]"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                       </svg>
                    </div>
                    <h4 className="text-base font-bold mb-3 opacity-90 tracking-wide">{num.title}</h4>
                    <p className="text-6xl font-black mb-4 tracking-tighter drop-shadow-lg group-hover:scale-105 transition-transform">{num.number}</p>
                    <p className="text-[10px] font-black bg-black/20 px-5 py-2 rounded-full uppercase tracking-widest">{num.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Islamic Heritage Section */}
        <section id="islamic-heritage" className="py-32 bg-gray-50 dark:bg-black/40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-24">
              <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">ধর্ম ও সমাজ</h2>
              <h3 className="text-5xl md:text-7xl font-black text-bd-green font-noto mb-6">ইসলামিক ঐতিহ্য ও সংস্কৃতি</h3>
              <p className="themed-text-muted text-xl max-w-3xl font-medium leading-relaxed">হাজার বছরের সুফি সাধনা, আরব্য ক্যালিগ্রাফি আর উৎসবের আমেজে ঘেরা বাংলার ইসলামিক ঐতিহ্যের এক প্রামাণ্য চিত্র।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {ISLAMIC_HERITAGE.map((topic) => (
                 <button 
                  key={topic.id}
                  onClick={() => handleSearch(topic.query)}
                  className="flex flex-col themed-card rounded-[40px] overflow-hidden shadow-xl border-2 hover:border-bd-green/20 group transition-all h-full"
                 >
                    <div className="w-full h-64 overflow-hidden relative">
                       <img src={topic.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={topic.title} />
                       <div className="absolute inset-0 bg-bd-green/10 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="p-10 flex flex-col justify-between flex-grow text-left">
                       <div>
                          <span className="text-bd-red font-black text-xs uppercase tracking-widest mb-4 block">{topic.subtitle}</span>
                          <h4 className="text-3xl font-black text-bd-green font-noto mb-6">{topic.title}</h4>
                          <p className="themed-text-muted text-lg font-medium mb-8 leading-relaxed line-clamp-3">{topic.description}</p>
                       </div>
                       <span className="text-bd-green font-black uppercase text-[10px] tracking-widest flex items-center gap-3 self-start mt-auto">
                          বিস্তারিত জানুন
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                       </span>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        </section>

        {/* Islamic Architecture Section */}
        <section id="islamic-architecture" className="py-32 bg-white dark:bg-[#080808]">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="text-left">
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">স্থাপত্য ও নিদশর্ন</h2>
                <h3 className="text-5xl md:text-6xl font-black text-bd-green font-noto leading-tight">আইকনিক মসজিদ ও স্থাপনা</h3>
              </div>
              <button 
                onClick={() => handleSearch("বাংলাদেশের উল্লেখযোগ্য ঐতিহাসিক মসজিদসমূহের তালিকা ও ইতিহাস")}
                className="bg-bd-green text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                সবগুলো দেখুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {ISLAMIC_ARCHITECTURE.map((spot) => (
                 <button 
                    key={spot.id}
                    onClick={() => handleSearch(spot.query)}
                    className="group flex flex-col p-8 themed-card rounded-[50px] border-2 shadow-lg hover:shadow-2xl transition-all h-full text-center"
                 >
                    <div className="w-full aspect-[4/3] rounded-[40px] overflow-hidden mb-10 shadow-inner">
                       <img src={spot.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={spot.title} />
                    </div>
                    <div className="flex-grow">
                      <span className="text-bd-red font-black text-[10px] uppercase tracking-widest mb-3 block">{spot.subtitle}</span>
                      <h4 className="text-2xl font-black text-bd-green font-noto mb-4">{spot.title}</h4>
                      <p className="themed-text-muted text-sm font-medium leading-relaxed">{spot.description}</p>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        </section>

        {/* Full Directory Hub */}
        <section id="directory" className="py-32 bg-gray-50 dark:bg-black/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">নলেজ ডিরেক্টরি</h2>
            <h3 className="text-5xl md:text-7xl font-black text-bd-green font-noto mb-24 leading-tight">
              বাংলার অফুরন্ত জ্ঞানভাণ্ডারে <br className="hidden lg:block" /> 
              <span className="text-bd-red italic">ঐতিহ্যের</span> প্রামাণ্য ডিজিটাল সংকলন
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {EXPLORE_CATEGORIES.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => handleSearch(cat.query)}
                  className="themed-card group p-12 rounded-[50px] border border-transparent hover:border-bd-green/20 hover:shadow-[0_30px_60px_rgba(0,106,78,0.1)] transition-all text-left flex flex-col items-start gap-10 cursor-pointer relative overflow-hidden"
                >
                  <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all text-white`}>
                    {cat.icon}
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black text-bd-green font-noto mb-3 group-hover:text-bd-red transition-colors">{cat.title}</h4>
                    <p className="themed-text-muted text-sm leading-relaxed font-medium">{cat.description}</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                    <span className="text-[140px] leading-none">{cat.icon}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ & Contact Section */}
        <section id="faq" className="py-32 bg-white dark:bg-black/40">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div>
                <h2 className="text-sm font-black text-bd-red uppercase tracking-[0.5em] mb-4">প্রশ্নোত্তর</h2>
                <h3 className="text-4xl font-black text-bd-green font-noto mb-12">সাধারণ জিজ্ঞাসা</h3>
                <div className="space-y-6">
                  {FAQ_DATA.map((item, i) => (
                    <details key={i} className="themed-card border-2 p-8 rounded-[30px] cursor-pointer group hover:border-bd-green/20 transition-all">
                      <summary className="text-xl font-bold text-bd-green dark:text-white flex justify-between items-center list-none outline-none">
                        {item.q}
                        <span className="text-bd-red group-open:rotate-180 transition-transform text-2xl">⌄</span>
                      </summary>
                      <p className="mt-8 themed-text-muted leading-relaxed text-lg font-medium border-t pt-6">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              <div id="contact" className="themed-card p-12 md:p-16 rounded-[60px] border-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-bd-green/5 rounded-bl-[100px]"></div>
                <h2 className="text-4xl font-black text-bd-green font-noto mb-8">ফিডব্যাক ও যোগাযোগ</h2>
                <p className="themed-text-muted mb-10 text-lg">আপনার কোনো সুচিন্তিত মতামত বা তথ্য সংশোধনের পরামর্শ থাকলে আমাদের সাথে সরাসরি যোগাযোগ করুন।</p>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('ধন্যবাদ! আপনার বার্তা গ্রহণ করা হয়েছে।'); }}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" placeholder="নাম" required className="p-5 rounded-2xl border-2 bg-transparent themed-text outline-none focus:border-bd-green transition-colors" />
                      <input type="email" placeholder="ইমেইল" required className="p-5 rounded-2xl border-2 bg-transparent themed-text outline-none focus:border-bd-green transition-colors" />
                   </div>
                   <textarea placeholder="আপনার বার্তাটি এখানে লিখুন..." rows={4} required className="w-full p-5 rounded-2xl border-2 bg-transparent themed-text outline-none focus:border-bd-green transition-colors"></textarea>
                   <button type="submit" className="w-full bg-bd-green text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-bd-red shadow-xl transition-all transform hover:-translate-y-1">বার্তা পাঠান</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Luxury Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t-2 border-gray-100 dark:border-gray-900 pt-32 pb-16">
        <div className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
              <div className="max-w-md">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-bd-green rounded-2xl flex items-center justify-center text-white font-black text-2xl">🇧🇩</div>
                  <span className="text-4xl font-black text-bd-green font-noto">দেশজ্ঞান</span>
                </div>
                <p className="themed-text-muted text-lg leading-relaxed font-medium">শেকড়ের সন্ধানে এক অনন্য ডিজিটাল প্ল্যাটফর্ম। হাজার বছরের বাংলার ইতিহাস ও ঐতিহ্যের বিশ্বস্ত সংরক্ষক।</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                 <div>
                    <h5 className="font-black text-bd-green dark:text-bd-green uppercase tracking-widest text-xs mb-8">প্ল্যাটফর্ম</h5>
                    <ul className="space-y-4 themed-text-muted font-bold text-sm">
                       <li><button onClick={() => resetAll()} className="hover:text-bd-red transition-colors">হোম</button></li>
                       <li><a href="#directory" className="hover:text-bd-red transition-colors">ডিরেক্টরি</a></li>
                       <li><a href="#history" className="hover:text-bd-red transition-colors">ইতিহাস</a></li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-black text-bd-green dark:text-bd-green uppercase tracking-widest text-xs mb-8">সহায়তা</h5>
                    <ul className="space-y-4 themed-text-muted font-bold text-sm">
                       <li><a href="#faq" className="hover:text-bd-red transition-colors">FAQ</a></li>
                       <li><a href="#emergency" className="hover:text-bd-red transition-colors">জরুরি তথ্য</a></li>
                       <li><a href="#contact" className="hover:text-bd-red transition-colors">যোগাযোগ</a></li>
                    </ul>
                 </div>
              </div>
           </div>
           
           <div className="pt-16 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-black themed-text-muted uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} DESHGYAN ENCYCLOPEDIA. BUILT WITH AI PRIDE.</p>
              <div className="flex gap-8">
                 <div className="w-8 h-8 rounded-full bg-bd-green flex items-center justify-center text-white text-xs">f</div>
                 <div className="w-8 h-8 rounded-full bg-bd-red flex items-center justify-center text-white text-xs">t</div>
                 <div className="w-8 h-8 rounded-full bg-bd-green flex items-center justify-center text-white text-xs">in</div>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
