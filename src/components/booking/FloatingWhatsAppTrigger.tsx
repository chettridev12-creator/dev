import React from 'react';
import { MessageCircle, Sparkles, Phone, ShieldCheck } from 'lucide-react';

interface FloatingWhatsAppTriggerProps {
  onClick: () => void;
  unreadCount?: number;
}

export const FloatingWhatsAppTrigger: React.FC<FloatingWhatsAppTriggerProps> = ({
  onClick,
  unreadCount = 1,
}) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group">
      {/* Tooltip / Prompt bubble on desktop hover */}
      <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0">
        <div className="bg-[#0A1128]/95 border border-cyan-500/40 text-slate-100 px-3 py-1.5 rounded-2xl shadow-2xl text-xs space-y-0.5 backdrop-blur-md">
          <p className="font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Instant Trip Cost & Booking</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Govt. Regd. Gangtok Desk (Avg reply &lt; 2 mins)
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open WhatsApp Tour Booking & AI Concierge"
        className="relative p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 font-black shadow-2xl shadow-emerald-500/40 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border border-emerald-300/40"
      >
        {/* Pulsing radar aura rings */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
        <span className="absolute -inset-2 rounded-full bg-emerald-500/10 pointer-events-none" />

        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950" />

        <span className="hidden sm:inline font-bold text-xs sm:text-sm tracking-wide pr-1">
          WhatsApp Booking
        </span>

        {/* Live Active Online Green Dot */}
        <span className="absolute top-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border-2 border-slate-900" />
        </span>
      </button>
    </div>
  );
};
