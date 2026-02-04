
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface AdminDashboardProps {
  onClose: () => void;
  searchHistory: string[];
}

type TabType = 'overview' | 'activity' | 'content' | 'users' | 'branding' | 'api' | 'security' | 'feedback' | 'logs';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, searchHistory }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Default Password
  const ADMIN_PASSWORD = 'দেশজ্ঞান২০২৫'; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।');
      setPassword('');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
        <div className="relative w-full max-w-md p-8 md:p-12 bg-[#0a0a0a] border border-white/10 rounded-[50px] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-bd-green/10 rounded-[35%] flex items-center justify-center mb-8 border border-bd-green/20 shadow-[0_0_50px_rgba(0,106,78,0.2)]">
              <span className="text-4xl">🇧🇩</span>
            </div>
            <h2 className="text-3xl font-black text-white font-noto mb-2">সিস্টেম গেটওয়ে</h2>
            <p className="text-[10px] text-bd-green font-black uppercase tracking-[0.3em]">DESHGYAN SECURE ADMIN ACCESS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <input 
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="সিক্রেট পাসকোড দিন"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-center text-2xl tracking-[0.5em] focus:border-bd-green focus:ring-4 focus:ring-bd-green/10 outline-none transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-sm"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-xs font-bold text-red-500 animate-shake">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-bd-green text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-bd-green/20 hover:bg-bd-red transition-all active:scale-95"
            >
              ড্যাশবোর্ড আনলক করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sidebarItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'ওভারভিউ', icon: '📊' },
    { id: 'activity', label: 'সার্চ ইনসাইটস', icon: '🕒' },
    { id: 'content', label: 'কন্টেন্ট স্টুডিও', icon: '📝' },
    { id: 'users', label: 'টিম মেম্বার্স', icon: '👥' },
    { id: 'branding', label: 'অ্যাপ সেটিংস', icon: '🎨' },
    { id: 'api', label: 'এপিআই গেটওয়ে', icon: '⚡' },
    { id: 'security', label: 'নিরাপত্তা অডিট', icon: '🛡️' },
    { id: 'feedback', label: 'ফিডব্যাক', icon: '⭐' },
    { id: 'logs', label: 'সিস্টেম এরর', icon: '🛠️' },
  ];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-full md:h-[90vh] bg-[#080808] border border-white/10 md:rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
        
        {/* Save Notification */}
        {showNotification && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[700] bg-bd-green text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase text-xs tracking-widest animate-in slide-in-from-top-10">
            ✓ সেটিংস সফলভাবে সেভ করা হয়েছে
          </div>
        )}

        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-8 shrink-0">
          <div className="flex items-center gap-4 mb-12">
            <Logo size="sm" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-white font-noto">দেশজ্ঞান</span>
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">v2.1.0 Enterprise</span>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 md:shrink ${activeTab === item.id ? 'bg-bd-green text-white shadow-lg shadow-bd-green/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <span className="text-xl grayscale group-hover:grayscale-0">{item.icon}</span>
                <span className="font-noto text-xs">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden md:block">
            <button 
              onClick={onClose}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-bd-red hover:bg-bd-red hover:text-white transition-all"
            >
              লগ আউট করুন
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 className="text-2xl font-black text-white font-noto">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">সার্ভার টাইম (GMT+6)</span>
                <span className="text-xs text-white font-mono">24-03-2024 15:42:01</span>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">✕</button>
            </div>
          </header>

          {/* Scrollable Viewport */}
          <div className="flex-grow overflow-y-auto p-8 md:p-12">
            
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'মোট অনুসন্ধান', value: searchHistory.length + 4280, icon: '🔥', trend: '+18%', color: 'text-blue-500' },
                    { label: 'আজকের ইউনিক ভিজিটর', value: '৮৪০', icon: '👤', trend: '+5%', color: 'text-emerald-500' },
                    { label: 'এপিআই খরচ (টোকেন)', value: '২.৪M', icon: '💎', trend: '৯২%', color: 'text-purple-500' },
                    { label: 'সার্ভার রেসপন্স', value: '০.৮২ সে.', icon: '⚡', trend: '-০.১ সে.', color: 'text-bd-red' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-[35px] border border-white/5 hover:border-bd-green/30 transition-all">
                      <div className="text-3xl mb-6">{stat.icon}</div>
                      <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                      <div className="flex items-baseline justify-between">
                        <p className="text-3xl font-black text-white font-noto">{stat.value}</p>
                        <span className={`text-[10px] font-black ${stat.color}`}>{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 bg-white/5 p-10 rounded-[45px] border border-white/5">
                    <h3 className="text-lg font-black text-white font-noto mb-8 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-bd-green animate-pulse"></span>
                      লাইভ ট্রাফিক ও টোকেন ইউসেজ
                    </h3>
                    <div className="h-64 flex items-end gap-2">
                       {Array.from({ length: 24 }).map((_, i) => (
                         <div key={i} className="flex-grow bg-bd-green/10 rounded-t-lg relative group">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-bd-green rounded-t-lg transition-all duration-700" 
                              style={{ height: `${Math.random() * 80 + 20}%` }}
                            ></div>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-10 rounded-[45px] border border-white/5 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-black text-white font-noto mb-8">সিস্টেম রিসোর্স</h3>
                    <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                           <circle cx="96" cy="96" r="80" stroke="#006A4E" strokeWidth="12" strokeDasharray="502" strokeDashoffset="120" strokeLinecap="round" fill="none" />
                        </svg>
                        <div className="absolute flex flex-col">
                           <span className="text-3xl font-black text-white font-mono">৭৬%</span>
                           <span className="text-[8px] text-gray-500 uppercase font-black">Memory used</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-noto px-4">সার্ভার লোড বর্তমানে স্থিতিশীল অবস্থায় আছে।</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                       <h3 className="text-lg font-black text-white font-noto mb-6">জনপ্রিয় সার্চ টপিকস</h3>
                       <div className="space-y-4">
                          {[
                            { name: 'সুন্দরবন ম্যাপ', count: 1240 },
                            { name: 'ভাষা আন্দোলন ১৯৫২', count: 980 },
                            { name: 'বঙ্গবন্ধু স্যাটেলাইট', count: 750 },
                            { name: 'ঢাকা মেট্রোরেল', count: 620 },
                            { name: 'মসলিন কাপড়ের ইতিহাস', count: 430 },
                          ].map((topic, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl">
                               <div className="flex items-center gap-4">
                                  <span className="text-bd-green font-black">#{i+1}</span>
                                  <span className="text-white font-bold font-noto">{topic.name}</span>
                               </div>
                               <span className="text-[10px] text-gray-500 font-black">{topic.count} বার</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                       <h3 className="text-lg font-black text-white font-noto mb-6">ব্যর্থ সার্চ কুয়েরি (No Result)</h3>
                       <div className="space-y-4">
                          {[
                            { name: 'আজকের বাজার দর', count: 42 },
                            { name: 'বাসের টিকেট বুকিং', count: 28 },
                            { name: 'পাসপোর্ট স্ট্যাটাস', count: 15 },
                          ].map((topic, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                               <span className="text-white font-bold font-noto">{topic.name}</span>
                               <span className="text-[10px] text-red-500 font-black">{topic.count} বার</span>
                            </div>
                          ))}
                          <p className="text-[10px] text-gray-500 text-center italic mt-4">এই বিষয়গুলো এনসাইক্লোপিডিয়ার আওতাভুক্ত করার পরিকল্পনা করুন।</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white/5 rounded-[45px] border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                       <h3 className="text-lg font-black text-white font-noto">সম্পূর্ণ সার্চ হিস্ট্রি</h3>
                       <button className="px-6 py-2 bg-bd-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bd-red transition-all">Download CSV</button>
                    </div>
                    <div className="divide-y divide-white/5">
                       {searchHistory.map((query, i) => (
                          <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-6">
                                <span className="text-[10px] text-gray-600 font-mono">ID: #{9280 + i}</span>
                                <span className="text-white font-bold font-noto">{query}</span>
                             </div>
                             <span className="text-[10px] text-gray-500 font-black uppercase">Success • 2.1s</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-10">
                 <div className="bg-white/5 p-10 rounded-[45px] border border-white/5">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-xl font-black text-white font-noto">"আপনি কি জানতেন?" ম্যানেজমেন্ট</h3>
                       <button className="px-6 py-3 bg-bd-green text-white rounded-2xl text-[10px] font-black uppercase">+ নতুন ফ্যাক্ট</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {[
                         "মসলিন কাপড় এতটাই সূক্ষ্ম ছিল যে একটি আস্ত শাড়ি একটি আংটির ভেতর দিয়ে পার করা যেত।",
                         "সুন্দরবন পৃথিবীর বৃহত্তম একক ম্যানগ্রোভ বন এবং রয়েল বেঙ্গল টাইগারের প্রধান আবাসস্থল।",
                         "কক্সবাজার সমুদ্র সৈকত পৃথিবীর দীর্ঘতম প্রাকৃতিক বালুকাময় সমুদ্র সৈকত।"
                       ].map((fact, i) => (
                         <div key={i} className="p-6 bg-black/40 rounded-[30px] border border-white/5 relative group">
                            <p className="text-gray-300 font-noto text-sm mb-4 leading-relaxed">{fact}</p>
                            <div className="flex gap-2">
                               <button className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-white">এডিট</button>
                               <button className="px-4 py-2 bg-red-500/10 rounded-xl text-[8px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white">ডিলিট</button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white/5 p-10 rounded-[45px] border border-white/5">
                    <h3 className="text-xl font-black text-white font-noto mb-10">FAQ বা সাধারণ জিজ্ঞাসা</h3>
                    <div className="space-y-4">
                       {[
                         "বাংলাদেশের স্বাধীনতার ঘোষণা কবে দেওয়া হয়?",
                         "সুন্দরবন বাংলাদেশের কোন জেলাগুলোতে অবস্থিত?",
                         "বাংলাদেশের জাতীয় প্রতীকগুলো কী কী?"
                       ].map((q, i) => (
                         <div key={i} className="p-6 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center">
                            <span className="text-white font-bold font-noto">{q}</span>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">✎</button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-500/10 p-8 rounded-[40px] border border-emerald-500/20 text-center">
                       <p className="text-emerald-500 text-[10px] font-black uppercase mb-2">Security Status</p>
                       <h4 className="text-2xl font-black text-white font-noto">সুরক্ষিত</h4>
                    </div>
                    <div className="bg-amber-500/10 p-8 rounded-[40px] border border-amber-500/20 text-center">
                       <p className="text-amber-500 text-[10px] font-black uppercase mb-2">Login Attempts</p>
                       <h4 className="text-2xl font-black text-white font-noto">২৪ (আজ)</h4>
                    </div>
                    <div className="bg-bd-red/10 p-8 rounded-[40px] border border-bd-red/20 text-center">
                       <p className="text-bd-red text-[10px] font-black uppercase mb-2">Blocked IPs</p>
                       <h4 className="text-2xl font-black text-white font-noto">০৩</h4>
                    </div>
                 </div>

                 <div className="bg-black border border-white/10 rounded-[45px] overflow-hidden">
                    <div className="p-8 border-b border-white/10 bg-white/5">
                       <h3 className="text-lg font-black text-white font-noto">ড্যাশবোর্ড লগইন অডিট</h3>
                    </div>
                    <div className="divide-y divide-white/5 font-mono text-[10px]">
                       {[
                         { time: '2024-03-24 15:42:01', event: 'ADMIN LOGIN SUCCESS', ip: '192.168.1.4', status: 'text-emerald-500' },
                         { time: '2024-03-24 14:12:55', event: 'INVALID PASSWORD ATTEMPT', ip: '202.4.11.23', status: 'text-bd-red' },
                         { time: '2024-03-24 12:05:10', event: 'ADMIN LOGOUT', ip: '192.168.1.4', status: 'text-gray-500' },
                         { time: '2024-03-24 09:30:22', event: 'ADMIN LOGIN SUCCESS', ip: '192.168.1.4', status: 'text-emerald-500' },
                       ].map((log, i) => (
                         <div key={i} className="p-4 grid grid-cols-4 gap-4 hover:bg-white/5">
                            <span className="text-gray-500">{log.time}</span>
                            <span className={`font-black ${log.status}`}>{log.event}</span>
                            <span className="text-gray-400">IP: {log.ip}</span>
                            <span className="text-right text-gray-600">Dhaka, Bangladesh</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* Other tabs remain similar but improved... */}
            {activeTab === 'branding' && (
              <div className="max-w-3xl space-y-12">
                <div className="bg-white/5 p-10 rounded-[45px] border border-white/5 space-y-10">
                  <div className="flex items-center justify-between p-6 bg-bd-green/5 border border-bd-green/10 rounded-3xl">
                     <div>
                        <h4 className="text-white font-bold font-noto">অ্যানাউন্সমেন্ট বার (Notice Bar)</h4>
                        <p className="text-[10px] text-gray-500">ওয়েবসাইটের একদম উপরে একটি জরুরি মেসেজ দেখান।</p>
                     </div>
                     <div className="w-14 h-8 bg-bd-green rounded-full p-1 cursor-pointer flex justify-end">
                        <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">ব্যানার টেক্সট</label>
                    <input type="text" defaultValue="দেশজ্ঞানের নতুন সংস্করণে আপনাকে স্বাগতম! এখন আরও দ্রুত এবং নিখুঁত তথ্য।" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white font-noto focus:border-bd-green outline-none" />
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-5 bg-bd-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-bd-green/20 hover:bg-bd-red transition-all flex items-center justify-center gap-3"
                  >
                    {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'সেটিংস আপডেট করুন'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="bg-black border border-white/10 rounded-[35px] overflow-hidden font-mono text-[10px]">
                <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                   <span className="text-gray-400 font-bold uppercase tracking-widest">System Console</span>
                   <button className="text-bd-red hover:text-white transition-colors">Clear Console</button>
                </div>
                <div className="p-6 space-y-3 h-[400px] overflow-y-auto">
                   <p className="text-gray-500">[2024-03-24 14:22:11] INFO: System initialized successfully.</p>
                   <p className="text-emerald-500">[2024-03-24 14:22:15] DEBUG: Gemini API handshake completed.</p>
                   <p className="text-gray-500">[2024-03-24 14:23:01] INFO: Cache cleared (142 objects).</p>
                   <p className="text-amber-500">[2024-03-24 14:25:44] WARN: High latency detected from upstream servers.</p>
                   <p className="text-red-500">[2024-03-24 14:28:19] ERROR: Timeout during grounding search for "সুন্দরবন". Retrying...</p>
                   <p className="text-emerald-500">[2024-03-24 14:28:22] INFO: Request #9283 resolved in 2.4s.</p>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { user: 'সাদিকুর', text: 'অসাধারণ ওয়েবসাইট! তথ্যগুলো অনেক নিখুঁত।', rating: 5, date: '১০ মিনিট আগে' },
                  { user: 'মালিহা', text: 'ইতিহাসের সালগুলো কিছু ক্ষেত্রে একটু চেক করলে ভালো হয়।', rating: 4, date: '১ ঘণ্টা আগে' },
                  { user: 'জুবায়ের', text: 'সার্চ রেজাল্ট আসতে মাঝে মাঝে সময় নেয়।', rating: 3, date: '২ দিন আগে' },
                ].map((f, i) => (
                  <div key={i} className="bg-white/5 p-8 rounded-[40px] border border-white/5 relative">
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex flex-col">
                          <span className="text-white font-black font-noto">{f.user}</span>
                          <span className="text-[8px] text-gray-500 uppercase">{f.date}</span>
                       </div>
                       <div className="flex text-gold text-xs">
                        {Array.from({ length: 5 }).map((_, idx) => <span key={idx} className={idx < f.rating ? 'opacity-100' : 'opacity-20'}>★</span>)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-noto mb-6 italic leading-relaxed">"{f.text}"</p>
                    <div className="flex gap-2">
                       <button className="flex-grow py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-bd-green hover:bg-bd-green hover:text-white transition-all">রিপ্লাই দিন</button>
                       <button className="px-4 py-3 bg-white/5 rounded-xl text-gray-500 hover:text-white">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white font-noto">টিম মেম্বার্স ম্যানেজমেন্ট</h3>
                  <button className="px-8 py-3 bg-bd-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">+ নতুন মেম্বার</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'অ্যাডমিন ইউজার', role: 'Owner', email: 'admin@deshgyan.com', active: true },
                    { name: 'হাসিবুর রহমান', role: 'Editor', email: 'hasib@deshgyan.com', active: true },
                    { name: 'তানভীর আহমেদ', role: 'Moderator', email: 'tanvir@deshgyan.com', active: false },
                  ].map((user, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-bd-green/20 mb-6 flex items-center justify-center text-2xl font-black text-white border-2 border-bd-green/30">
                        {user.name.charAt(0)}
                      </div>
                      <h4 className="text-white font-black font-noto text-lg mb-1">{user.name}</h4>
                      <p className="text-[10px] text-bd-green font-black uppercase tracking-widest mb-4">{user.role}</p>
                      <p className="text-xs text-gray-500 mb-8">{user.email}</p>
                      <div className="w-full flex gap-3">
                        <button className="flex-grow py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all">এডিট</button>
                        <button className="py-3 px-4 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="max-w-3xl space-y-10">
                <div className="bg-white/5 p-10 rounded-[45px] border border-white/5 space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-black font-noto">Gemini-3 Flash Preview</h4>
                    <span className="px-4 py-1.5 bg-bd-green/10 text-bd-green text-[10px] font-black rounded-full uppercase">Active</span>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">API Key Status</label>
                    <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center">
                       <span className="text-white font-mono text-xs">••••••••••••••••••••••••••••••</span>
                       <span className="text-emerald-500 text-[10px] font-black uppercase">Verified</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Temperature</p>
                        <p className="text-white font-black text-xl">০.১</p>
                     </div>
                     <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Max Tokens</p>
                        <p className="text-white font-black text-xl">৮১৯২</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
