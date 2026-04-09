import React, { useState } from 'react';
import { I18N, PROFILE_IMAGE, FALLBACK_IMAGE } from '../constants';
import { ViewState } from '../App';
import { Phone, Send, Globe, ShieldCheck, Clock, MapPin, CheckCircle2, Star } from 'lucide-react';

interface AboutProps {
    lang: 'en' | 'am';
    onNavigate: (view: ViewState) => void;
}

const About: React.FC<AboutProps> = ({ lang, onNavigate }) => {
  const t = I18N[lang];
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col relative overflow-hidden animate-in fade-in duration-1000">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[var(--primary)] opacity-5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-600 opacity-5 blur-[120px] rounded-full"></div>
      </div>

      {/* Profile Section - Meet Abel */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-[var(--bg-body)] to-[var(--bg-card)] border-b border-[var(--border)] relative z-10">
          <div className="max-w-[1120px] mx-auto px-[5%]">
              <div className="card bg-gradient-to-br from-slate-900 to-[var(--bg-card)] border-white/5 p-0 overflow-hidden rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-0">
                  <div className="w-full md:w-[38%] relative bg-slate-900 min-h-[280px] md:min-h-[360px] p-2 md:p-3">
                      <img 
                        src={imgError ? FALLBACK_IMAGE : PROFILE_IMAGE} 
                        alt="Abel - Founder & Lead Technician" 
                        className="w-full h-full object-contain object-top -translate-y-2 md:-translate-y-4"
                        onError={() => setImgError(true)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20 hidden md:block"></div>
                  </div>
                  
                  <div className="w-full md:w-[62%] p-5 md:p-8 flex flex-col justify-center">
                      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                          <span className="inline-flex items-center gap-2 text-amber-500 font-bold tracking-[0.16em] uppercase text-[10px] whitespace-nowrap">
                              <span className="w-6 h-px bg-amber-500/50"></span>
                              Excellence in Craftsmanship
                          </span>
                          <h2 className="text-xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter leading-none whitespace-nowrap">
                            Abel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Getachew</span>
                          </h2>
                          <h3 className="text-[11px] md:text-xs font-bold text-indigo-400 tracking-wide whitespace-nowrap pb-0.5">
                            Founder & Lead Technician
                          </h3>
                      </div>
                      
                      <div className="text-[var(--text-muted)] text-xs md:text-sm mb-5 leading-relaxed font-light space-y-2 max-w-xl">
                        <p>
                          With years of experience in mobile electronics, Abel has built a trusted name in Dessie through integrity, precision, and consistent quality. Every repair is carried out using reliable parts and accurate diagnostics to ensure lasting performance.
                        </p>
                        <p>
                          A phone is never just a device — it’s your connection to work, family, and everyday life. That’s why each repair is handled with care and attention, restoring not only your device, but your confidence as well.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                          <div className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors items-center">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-inner">
                                <ShieldCheck size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-[var(--text-main)] text-sm">Premium Parts</h4>
                                  <p className="text-[var(--text-muted)] text-xs md:text-sm">Only A+ Grade components.</p>
                              </div>
                          </div>
                          <div className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors items-center">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                                <Clock size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-[var(--text-main)] text-sm">Express Turnaround</h4>
                                  <p className="text-[var(--text-muted)] text-xs md:text-sm">Fastest mobile service.</p>
                              </div>
                          </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                         <button onClick={() => onNavigate('repair')} className="btn btn-primary px-5 py-2.5 text-[11px] md:text-xs shadow-xl shadow-indigo-500/20">Book My Repair</button>
                         <a href="https://tiktok.com/@babi_abel_19" target="_blank" rel="noopener noreferrer" className="btn btn-outline px-5 py-2.5 text-[11px] md:text-xs border-white/10">Follow on TikTok</a>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Direct Support Section */}
      <section className="py-16 px-[5%] max-w-[1180px] mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-main)] mb-4 tracking-tight">Direct Support</h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto text-sm md:text-base">Skip the line. Message Abel directly for urgent tech support.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Phone Card */}
              <div className="card group p-7 flex flex-col items-center text-center hover:border-indigo-500 transition-all bg-white/[0.02] backdrop-blur-xl">
                  <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-[var(--primary)] mb-5 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-inner">
                      <Phone size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Direct Call</h3>
                  <div className="space-y-2">
                    <a href="tel:0921275611" className="block text-lg font-black text-[var(--text-main)] hover:text-[var(--primary)] transition-colors">0921 27 56 11</a>
                    <a href="tel:0910531611" className="block text-lg font-black text-[var(--text-main)] hover:text-[var(--primary)] transition-colors">0910 53 16 11</a>
                  </div>
              </div>

              {/* Telegram Card */}
              <a href="https://t.me/abel_ab19" target="_blank" rel="noopener noreferrer" className="card group p-7 flex flex-col items-center text-center hover:border-sky-500 transition-all bg-white/[0.02] backdrop-blur-xl">
                  <div className="w-16 h-16 rounded-[2rem] bg-sky-500/10 flex items-center justify-center text-sky-500 mb-5 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 group-hover:-rotate-6 shadow-inner">
                      <Send size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Telegram Chat</h3>
                  <p className="text-sky-500 font-black text-lg tracking-tight">@abel_ab19</p>
              </a>

              {/* TikTok Card */}
              <a href="https://tiktok.com/@babi_abel_19" target="_blank" rel="noopener noreferrer" className="card group p-7 flex flex-col items-center text-center hover:border-pink-500 transition-all bg-white/[0.02] backdrop-blur-xl">
                  <div className="w-16 h-16 rounded-[2rem] bg-pink-500/10 flex items-center justify-center text-pink-500 mb-5 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-inner">
                       <svg 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        width="28" 
                        height="28"
                        className="text-current"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">TikTok Daily</h3>
                  <p className="text-pink-500 font-black text-lg tracking-tight">@babi_abel_19</p>
              </a>
          </div>
      </section>

      {/* Location Section */}
      <section className="py-16 text-center max-w-[1180px] mx-auto px-[5%] border-t border-[var(--border)] relative z-10">
          <div className="relative group overflow-hidden p-10 md:p-12 rounded-[3rem] border border-white/5 bg-gradient-to-br from-slate-900 to-[var(--bg-body)]">
              <div className="absolute top-0 right-0 p-6 text-[var(--primary)] opacity-5"><MapPin size={180} /></div>
              <h3 className="text-2xl md:text-3xl font-black text-[var(--text-main)] mb-4">Our Flagship Store</h3>
              <p className="text-[var(--text-muted)] text-sm md:text-base mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                Visit our state-of-the-art repair facility in the heart of <span className="text-white font-bold">Dessie, Ethiopia</span>. 
              </p>
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-full font-black text-sm md:text-base shadow-2xl hover:bg-white/10 transition-all">
                  <Globe size={22} className="text-indigo-400" /> Dessie Hub
              </div>
          </div>
      </section>
    </div>
  );
};

export default About;
