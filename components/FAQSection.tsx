
import React, { useState } from 'react';
import { FAQ_ITEMS } from '../constants';

const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {FAQ_ITEMS.map((item, idx) => (
        <div 
          key={idx}
          className={`themed-card rounded-[35px] border overflow-hidden transition-all duration-500 ${activeIndex === idx ? 'border-bd-green/30 shadow-xl' : 'hover:border-bd-green/10'}`}
        >
          <button 
            onClick={() => toggleFAQ(idx)}
            className="w-full p-8 md:p-10 flex items-center justify-between text-left group outline-none"
            aria-expanded={activeIndex === idx}
          >
            <div className="flex items-center gap-6">
              <span className="w-10 h-10 rounded-full bg-bd-green/5 text-bd-green flex items-center justify-center font-black text-lg group-hover:bg-bd-green group-hover:text-white transition-all">
                ?
              </span>
              <h4 className="text-lg md:text-2xl font-black text-bd-green dark:text-bd-green font-noto leading-tight group-hover:text-bd-red transition-colors">
                {item.question}
              </h4>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-bd-green transition-transform duration-500 ${activeIndex === idx ? 'rotate-180 bg-bd-green text-white' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div 
            className={`transition-all duration-500 ease-in-out ${activeIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
          >
            <div className="px-8 pb-10 md:px-24 themed-text-muted text-base md:text-xl font-medium leading-relaxed">
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-8"></div>
              {item.answer}
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-bd-green/5 text-bd-green rounded-full">
                  ক্যাটাগরি: {item.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
