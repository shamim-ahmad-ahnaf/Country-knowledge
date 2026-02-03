
import React from 'react';
import { EMERGENCY_HOTLINES } from '../constants';

const EmergencyServices: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {EMERGENCY_HOTLINES.map((service, idx) => (
        <div 
          key={service.number}
          className="themed-card group p-8 rounded-[40px] border border-transparent hover:border-bd-red/20 hover:shadow-2xl transition-all flex flex-col items-center text-center gap-6 relative overflow-hidden"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className={`w-20 h-20 ${service.color} rounded-3xl flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 transition-transform text-white`}>
            {service.icon}
          </div>
          
          <div>
            <div className="text-4xl font-black text-bd-red mb-2 tracking-tighter">
              {service.number}
            </div>
            <h4 className="text-xl font-black text-bd-green dark:text-bd-green font-noto mb-3">
              {service.title}
            </h4>
            <p className="themed-text-muted text-sm font-medium leading-relaxed">
              {service.description}
            </p>
          </div>
          
          <a 
            href={`tel:${service.number}`}
            className="mt-4 w-full py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-bd-red group-hover:bg-bd-red group-hover:text-white transition-all shadow-sm active:scale-95 inline-block"
            aria-label={`${service.title} নম্বরে সরাসরি কল করুন`}
          >
            সরাসরি ডায়াল করুন
          </a>
        </div>
      ))}
    </div>
  );
};

export default EmergencyServices;
