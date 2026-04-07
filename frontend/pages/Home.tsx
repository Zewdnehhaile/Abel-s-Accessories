import React, { useState } from 'react';
import { ViewState } from '../App';
import { I18N, PROFILE_IMAGE, FALLBACK_IMAGE } from '../constants';
import { Smartphone, Zap, Truck, ShieldCheck, Star, ArrowRight } from 'lucide-react';

interface HomeProps {
    onNavigate: (view: ViewState) => void;
    lang: 'en' | 'am';
}

const Home: React.FC<HomeProps> = ({ onNavigate, lang }) => {
  const t = I18N[lang] as any; // Cast to access custom keys easily
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen">
      {/* Decorative Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-5%] left-[15%] w-[45%] h-[45%] bg-[var(--primary)] opacity-[0.07] blur-[120px] rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[15%] right-[-10%] w-[50%] h-[50%] bg-purple-600 opacity-[0.07] blur-[150px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Hero Section */}
      <section className="text-center pt-18 pb-10 md:pt-24 md:pb-14 px-6 max-w-[1180px] mx-auto relative z-10">
        <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-[var(--text-main)] to-[var(--text-muted)]">
              {t.heroTitle}
            </h1>
            <h2 className="text-lg md:text-2xl font-bold mb-6 text-[var(--primary)] tracking-tight">
              {t.heroSubtitle}
            </h2>
        </div>
        
        <div className="opacity-0 animate-fade-in-up animate-delay-200">
            <p className="text-sm md:text-lg text-[var(--text-muted)] mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t.heroDescription}
            </p>
        </div>

        <div className="flex justify-center gap-5 flex-wrap opacity-0 animate-fade-in-up animate-delay-300">
          <button onClick={() => onNavigate('shop')} className="btn btn-primary text-sm md:text-base px-8 py-3.5 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/40">
            {t.shopNow}
          </button>
          <button onClick={() => onNavigate('repair')} className="btn btn-outline text-sm md:text-base px-8 py-3.5 transition-all hover:scale-105 active:scale-95 hover:bg-white/5 border-[var(--border)]">
            {t.repairService}
          </button>
        </div>
      </section>

      {/* Meet Abel Section (Instant Trust) */}
      <section className="max-w-[1180px] mx-auto px-[5%] pt-10 pb-16 relative z-10 w-full">
         <div className="card bg-gradient-to-br from-slate-900 to-[var(--bg-card)] border-white/5 p-0 overflow-hidden rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-0">
            <div className="w-full md:w-2/5 h-[320px] md:h-[460px] relative bg-slate-900">
               <img 
                src={imgError ? FALLBACK_IMAGE : PROFILE_IMAGE}
                alt="Abel - Founder" 
                className="w-full h-full object-cover object-center"
                onError={() => setImgError(true)}
               />
               <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/10 hidden md:block"></div>
            </div>
            <div className="w-full md:w-3/5 p-8 md:p-12">
               <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.28em] mb-4">
                  <Star size={14} fill="currentColor" />
                  Real Expertise in Dessie
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tighter leading-tight max-w-xl">
                  Expert Care by <span className="text-indigo-400">Abel</span> himself.
               </h2>
               <p className="text-sm md:text-base text-[var(--text-muted)] mb-6 max-w-xl font-light leading-relaxed">
                  "I started this shop with one goal: to bring world-class mobile service to my hometown. Every accessory is hand-picked, and every repair is handled with precision."
               </p>
               <button onClick={() => onNavigate('about')} className="flex items-center gap-3 text-white font-semibold text-sm md:text-base group">
                  Learn more about my process <ArrowRight className="group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
         </div>
      </section>

      {/* Main Features Grid */}
      <section className="max-w-[1180px] mx-auto px-[5%] pt-4 pb-16 relative z-20 w-full mt-2 md:mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Certified Pre-Owned */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="card group p-5 text-center flex flex-col items-center animate-float hover:border-[var(--primary)] transition-all duration-500 h-full">
               <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-[var(--primary)] mb-4 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-700 shadow-inner">
                  <Smartphone size={24} />
               </div>
               <h3 className="text-lg font-black mb-2 text-[var(--text-main)] tracking-tight">Certified Pre-Owned</h3>
               <p className="text-[var(--text-muted)] text-sm leading-relaxed">Every device undergoes a 50-point inspection and comes with a solid 90-day warranty.</p>
            </div>
          </div>

          {/* Card 2: Express Repair */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <div className="card group p-5 text-center flex flex-col items-center animate-float hover:border-amber-500 transition-all duration-500 h-full" style={{ animationDelay: '1s' }}>
               <div className="w-14 h-14 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all duration-700 shadow-inner">
                  <Zap size={24} />
               </div>
               <h3 className="text-lg font-black mb-2 text-[var(--text-main)] tracking-tight">Express Repair</h3>
               <p className="text-[var(--text-muted)] text-sm leading-relaxed">Most screen and battery replacements are finished in Dessie while you wait—often under 45 mins.</p>
            </div>
          </div>

          {/* Card 3: Fast Delivery */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="card group p-5 text-center flex flex-col items-center animate-float hover:border-emerald-500 transition-all duration-500 h-full" style={{ animationDelay: '2s' }}>
               <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-700 shadow-inner">
                  <Truck size={24} />
               </div>
               <h3 className="text-lg font-black mb-2 text-[var(--text-main)] tracking-tight">Fast Delivery</h3>
               <p className="text-[var(--text-muted)] text-sm leading-relaxed">Need it today? Order before noon and we’ll deliver anywhere in Dessie — same day.</p>
            </div>
          </div>

          {/* Card 4: Genuine Gear */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '750ms' }}>
            <div className="card group p-5 text-center flex flex-col items-center animate-float hover:border-purple-500 transition-all duration-500 h-full" style={{ animationDelay: '3s' }}>
               <div className="w-14 h-14 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all duration-700 shadow-inner">
                  <ShieldCheck size={24} />
               </div>
               <h3 className="text-lg font-black mb-2 text-[var(--text-main)] tracking-tight">Genuine Gear</h3>
               <p className="text-[var(--text-muted)] text-sm leading-relaxed">No knock-offs. We source 100% original components and premium accessories from global brands.</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
