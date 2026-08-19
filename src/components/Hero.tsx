import React, { useState } from 'react';
import { ShieldCheck, Compass, Sparkles, ArrowRight, CheckCircle2, MessageCircle, Car, CloudSun, MapPin } from 'lucide-react';
import { AGENCY_DETAILS } from '../data/travelData';

interface HeroProps {
  onOpenAIChat: () => void;
  onOpenAIPlanner: () => void;
  onSelectTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAIChat, onOpenAIPlanner, onSelectTab }) => {
  const [quickCalcRoute, setQuickCalcRoute] = useState('5N/6D Sikkim & Darjeeling');
  const [quickCalcVehicle, setQuickCalcVehicle] = useState('Toyota Innova Crysta');
  const [quickCalcDays, setQuickCalcDays] = useState('6');
  const [quickCalcGuests, setQuickCalcGuests] = useState('4');
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    let perDayVehicle = 4500;
    if (quickCalcVehicle === 'Mahindra Xylo') perDayVehicle = 4000;
    if (quickCalcVehicle === 'Swift Dzire') perDayVehicle = 3200;

    const days = Number(quickCalcDays) || 5;
    const guests = Number(quickCalcGuests) || 2;
    const totalEst = (perDayVehicle * days) + (days * guests * 2200) + 1500;
    setCalculatedCost(Math.round(totalEst / guests));
  };

  const whatsappLink = `https://wa.me/${AGENCY_DETAILS.whatsappNumber}?text=${encodeURIComponent(
    'Namaste! I want to consult your Gangtok team regarding a customized Sikkim itinerary.'
  )}`;

  return (
    <section className="bg-[#060B18] text-[#F8FAFC] border-b border-slate-800/80 py-10 lg:py-16 relative overflow-hidden">
      {/* Subtle Cyan Radiant Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Signature Typography & Modern UI Cards matching Screenshot */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Screenshot Header Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                <span>A Better Way</span>
                <span className="block italic font-light bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  to Explore.
                </span>
              </h1>
              
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal pt-1">
                Curated luxury journeys across Sikkim, Bhutan, and the Silk Route.
              </p>
            </div>

            {/* Featured Tour Card (Screenshot matched "The Silk Route Odyssey") */}
            <div 
              onClick={() => {
                onSelectTab('packages');
                onOpenAIChat();
              }}
              className="group cursor-pointer relative rounded-2xl overflow-hidden border border-slate-800/90 bg-[#0A1128] hover:border-cyan-500/50 shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                <img
                  src="/src/assets/images/sikkim_hero_banner_1785680563996.jpg"
                  alt="The Silk Route Odyssey"
                  loading="eager"
                  // @ts-ignore
                  fetchPriority="high"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060B18] via-[#060B18]/60 to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-200 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80">
                    FEATURED
                  </span>
                </div>

                {/* Tour Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    The Silk Route Odyssey
                  </h2>
                  <p className="text-cyan-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5 pt-0.5">
                    <span>Gangtok & Zuluk</span>
                    <span className="text-slate-500">•</span>
                    <span>7 Days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Two Grid Cards: Weather & AI Planner (Exact Screenshot UI) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* Left Card: WEATHER */}
              <div 
                onClick={() => {
                  const weatherEl = document.getElementById('sikkim-weather-widget');
                  if (weatherEl) weatherEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#0A1128]/95 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-lg group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-cyan-400 tracking-[0.2em] uppercase">
                      WEATHER
                    </span>
                    <CloudSun className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-300" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    14°c
                  </div>
                </div>
                <div className="text-slate-400 text-xs sm:text-sm mt-1">
                  Sunny, Gangtok
                </div>
              </div>

              {/* Right Card: AI PLANNER */}
              <div 
                onClick={onOpenAIPlanner}
                className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-400 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-xl shadow-cyan-950/40 hover:shadow-cyan-500/20 hover:scale-[1.02] group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-cyan-100/90 tracking-[0.2em] uppercase">
                      AI PLANNER
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white leading-tight mt-2 max-w-[140px]">
                    Build Your Dream Trip
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Trust Highlights */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Army Permit Clearances</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Toyota Innova Crysta Fleet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Pure Veg & Jain Meals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Direct Gangtok Local Team</span>
              </div>
            </div>

          </div>

          {/* Right Column: Trip Cost Estimator & Direct WhatsApp Quote */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Govt Registration Trust Badge */}
            <div className="flex items-center justify-between bg-[#0A1128] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 shadow-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-cyan-300">Govt. Registered Agency</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Gangtok, Sikkim</span>
            </div>

            {/* Compact Trip Cost Estimator */}
            <div className="bg-[#0A1128]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-cyan-400" />
                  <span>Trip Cost Estimator</span>
                </h3>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Official Rates
                </span>
              </div>

              <form onSubmit={handleCalculate} className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-300 text-[11px] mb-1">Route / Circuit</label>
                  <select
                    value={quickCalcRoute}
                    onChange={(e) => setQuickCalcRoute(e.target.value)}
                    className="w-full bg-[#060B18] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="5N/6D Sikkim & Darjeeling">5N/6D Sikkim & Darjeeling</option>
                    <option value="North Sikkim Zero Point">North Sikkim (Lachung & Zero Point)</option>
                    <option value="The Silk Route Odyssey">The Silk Route Odyssey (7 Days)</option>
                    <option value="Pelling & West Sikkim">Pelling Glass Skywalk & West Sikkim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] mb-1">Vehicle</label>
                  <select
                    value={quickCalcVehicle}
                    onChange={(e) => setQuickCalcVehicle(e.target.value)}
                    className="w-full bg-[#060B18] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Toyota Innova Crysta">Innova Crysta</option>
                    <option value="Mahindra Xylo">Mahindra Xylo / Scorpio</option>
                    <option value="Swift Dzire">Swift Dzire / Sedan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] mb-1">Travelers</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={quickCalcGuests}
                    onChange={(e) => setQuickCalcGuests(e.target.value)}
                    className="w-full bg-[#060B18] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="col-span-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 btn-luxury-cyan text-xs font-bold rounded-xl"
                  >
                    Calculate Estimated Rate
                  </button>
                </div>
              </form>

              {calculatedCost !== null && (
                <div className="pt-3 text-center border-t border-slate-800 bg-[#060B18]/60 p-3 rounded-xl">
                  <p className="text-[11px] text-slate-400">Estimated Total Rate Per Person:</p>
                  <p className="text-2xl font-black text-cyan-400">₹{(calculatedCost || 0).toLocaleString('en-IN')}</p>
                  <button
                    onClick={onOpenAIChat}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 underline mt-1.5 font-medium inline-block"
                  >
                    Customize with AI Assistant →
                  </button>
                </div>
              )}
            </div>

            {/* Direct Instant Action Buttons */}
            <div className="flex items-center gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>WhatsApp Quote</span>
              </a>

              <button
                onClick={() => onSelectTab('packages')}
                className="flex-1 btn-luxury-outline text-xs !py-3"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore Packages</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

