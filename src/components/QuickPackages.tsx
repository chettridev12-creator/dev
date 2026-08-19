import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TOUR_PACKAGES, STANDARD_5N6D_PKG, LUXURY_5N6D_PKG, AGENCY_DETAILS } from '../data/travelData';
import { TourPackage } from '../types';
import { GoogleReviewCarousel } from './GoogleReviewCarousel';
import { RouteMapVisualization } from './RouteMapVisualization';
import {
  Calendar,
  MapPin,
  Star,
  ShieldCheck,
  Check,
  ArrowRight,
  X,
  PhoneCall,
  Utensils,
  Compass,
  FileText,
  Sparkles,
  Crown,
  ChevronDown,
  Wand2,
  Building2,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Coffee,
  CheckCircle2,
  Download,
  Share2,
  Zap,
  Heart,
} from 'lucide-react';
import { useWishlist } from '../utils/wishlistContext';

interface QuickPackagesProps {
  packages?: TourPackage[];
  onSelectPackage: (pkg: TourPackage) => void;
  onOpenAIChatWithPackage: (pkgTitle: string) => void;
  onOpenPhotoEditor?: (imageUrl?: string, title?: string) => void;
  onQuickBookPackage?: (pkgTitle: string) => void;
  showAllByDefault?: boolean;
}

// Helper function to derive or construct milestone tags for an itinerary day
function getDayMilestones(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const milestones: string[] = [];

  if (text.includes('pickup') || text.includes('njp') || text.includes('ixb') || text.includes('airport')) {
    milestones.push('NJP / IXB Airport Pickup');
  }
  if (text.includes('teesta')) {
    milestones.push('Teesta River Highway Drive');
  }
  if (text.includes('gangtok') && (text.includes('mg marg') || text.includes('check-in'))) {
    milestones.push('Gangtok Check-in & MG Marg Stroll');
  }
  if (text.includes('tsomgo')) {
    milestones.push('Tsomgo Lake (12,400 ft)');
  }
  if (text.includes('baba')) {
    milestones.push('Baba Harbhajan Singh Mandir');
  }
  if (text.includes('nathula')) {
    milestones.push('Nathula Pass Indo-China Border');
  }
  if (text.includes('tiger hill') || text.includes('sunrise')) {
    milestones.push('Tiger Hill Kanchenjunga Sunrise');
  }
  if (text.includes('tea garden') || text.includes('happy valley') || text.includes('temi')) {
    milestones.push('Organic Tea Estate Walk & Tasting');
  }
  if (text.includes('darjeeling') && text.includes('batasia')) {
    milestones.push('Batasia Loop & Ghoom Monastery');
  }
  if (text.includes('lachung') || text.includes('seven sisters')) {
    milestones.push('Seven Sisters Waterfalls & Lachung Drive');
  }
  if (text.includes('yumthang')) {
    milestones.push('Yumthang Valley of Flowers (11,800 ft)');
  }
  if (text.includes('zero point')) {
    milestones.push('Snowbound Zero Point (15,300 ft)');
  }
  if (text.includes('skywalk') || text.includes('pelling')) {
    milestones.push('Pelling Glass Skywalk & Chenrezig Statue');
  }
  if (text.includes('ravangla') || text.includes('buddha')) {
    milestones.push('Ravangla Buddha Park (130ft Golden Statue)');
  }
  if (text.includes('taktsang') || text.includes('tiger\'s nest')) {
    milestones.push('Taktsang Monastery (Tiger\'s Nest) Hike');
  }
  if (text.includes('thimphu') || text.includes('punakha')) {
    milestones.push('Punakha Suspension Bridge & Dzong Tour');
  }
  if (text.includes('departure') || text.includes('drop')) {
    milestones.push('Departure Transfer & Farewell');
  }

  // Fallback if none matched
  if (milestones.length === 0) {
    const parts = title.split(' via ').concat(title.split(' to ')).concat(title.split('&'));
    parts.forEach(p => {
      const cleaned = p.trim();
      if (cleaned.length > 3 && milestones.length < 3) {
        milestones.push(cleaned);
      }
    });
  }

  if (milestones.length === 0) {
    milestones.push('Sightseeing & Scenic Transfers');
  }

  return Array.from(new Set(milestones)).slice(0, 4);
}

export const QuickPackages: React.FC<QuickPackagesProps> = ({
  packages,
  onSelectPackage,
  onOpenAIChatWithPackage,
  onOpenPhotoEditor,
  onQuickBookPackage,
  showAllByDefault = false,
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDuration, setActiveDuration] = useState<string>('All');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'deluxe' | 'premium' | 'luxury' | 'shared'>('all');
  const [tier5N6D, setTier5N6D] = useState<'standard' | 'luxury'>('standard');
  const [selectedItineraryPkg, setSelectedItineraryPkg] = useState<TourPackage | null>(null);
  const [activeModalTier, setActiveModalTier] = useState<'deluxe' | 'premium' | 'luxury'>('premium');
  const [isViewAll, setIsViewAll] = useState<boolean>(showAllByDefault);

  useEffect(() => {
    if (showAllByDefault) {
      setIsViewAll(true);
      setActiveCategory('All');
      setActiveDuration('All');
      setSelectedTierFilter('all');
    }
  }, [showAllByDefault]);

  // Dedicated Active Package for the Day-by-Day Itinerary Section below
  const [activeItineraryId, setActiveItineraryId] = useState<string>('pkg-5n6d-sikkim-darjeeling');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 4;

  const modalRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Sikkim-Darjeeling', 'North Sikkim', 'Silk Route', 'South-West Sikkim', 'Honeymoon', 'Bhutan'];
  const durationFilters = ['All Durations', '3-5 Days', '6-7 Days', '8-10 Days'];

  const sourcePackages = packages && packages.length > 0 ? packages : TOUR_PACKAGES;

  const deduplicatedPackages = sourcePackages.filter(
    (pkg) => pkg.id !== 'pkg-5n6d-sikkim-darjeeling-luxury'
  );

  const rawPackages = deduplicatedPackages.map((pkg) => {
    if (pkg.id === 'pkg-5n6d-sikkim-darjeeling') {
      return tier5N6D === 'luxury' ? LUXURY_5N6D_PKG : STANDARD_5N6D_PKG;
    }
    return pkg;
  });

  const filteredPackages = rawPackages.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    let matchDuration = true;
    if (activeDuration === '3-5 Days') {
      matchDuration = p.duration.includes('3 Days') || p.duration.includes('4 Days') || p.duration.includes('5 Days') || p.duration.includes('3 Nights') || p.duration.includes('4 Nights');
    } else if (activeDuration === '6-7 Days') {
      matchDuration = p.duration.includes('6 Days') || p.duration.includes('7 Days') || p.duration.includes('5 Nights') || p.duration.includes('6 Nights');
    } else if (activeDuration === '8-10 Days') {
      matchDuration = p.duration.includes('8 Days') || p.duration.includes('9 Days') || p.duration.includes('10 Days') || p.duration.includes('7 Nights') || p.duration.includes('8 Nights') || p.duration.includes('9 Nights');
    }

    let matchTier = true;
    if (selectedTierFilter === 'shared') {
      matchTier = !!p.isSharedTourAvailable;
    }

    return matchCategory && matchDuration && matchTier;
  });

  // Active package for the Day-by-Day section below
  const featuredItineraryPackage =
    rawPackages.find((p) => p.id === activeItineraryId) || rawPackages[0] || STANDARD_5N6D_PKG;

  // Calculate Paginated or All Packages
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE) || 1;
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const displayPackages = isViewAll ? filteredPackages : paginatedPackages;

  // Auto Scroll to top of packages section
  const scrollToPackagesTop = () => {
    const section = document.getElementById('packages-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    scrollToPackagesTop();
  };

  const handleDurationChange = (dur: string) => {
    setActiveDuration(dur === 'All Durations' ? 'All' : dur);
    setCurrentPage(1);
    scrollToPackagesTop();
  };

  const handleTierFilterChange = (tier: 'all' | 'deluxe' | 'premium' | 'luxury' | 'shared') => {
    setSelectedTierFilter(tier);
    setCurrentPage(1);
    scrollToPackagesTop();
  };

  const handleToggleViewAll = () => {
    setIsViewAll(!isViewAll);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      scrollToPackagesTop();
    }
  };

  // Modal Next/Prev Navigation
  const currentModalIndex = selectedItineraryPkg
    ? filteredPackages.findIndex((p) => p.id === selectedItineraryPkg.id)
    : -1;
  const hasPrevModalPkg = currentModalIndex > 0;
  const hasNextModalPkg = currentModalIndex >= 0 && currentModalIndex < filteredPackages.length - 1;

  const handlePrevModalPackage = () => {
    if (hasPrevModalPkg) {
      setSelectedItineraryPkg(filteredPackages[currentModalIndex - 1]);
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    }
  };

  const handleNextModalPackage = () => {
    if (hasNextModalPkg) {
      setSelectedItineraryPkg(filteredPackages[currentModalIndex + 1]);
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    }
  };

  useEffect(() => {
    if (selectedItineraryPkg && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [selectedItineraryPkg]);

  const handleSharedInquiry = (pkgTitle: string, sharedPrice?: number) => {
    const message = `Namaste OffbeatDestination! I want to inquire about booking a seat in a Sharing Tour for ${pkgTitle}${sharedPrice ? ` (₹${sharedPrice}/seat)` : ''}. Please guide me on upcoming available dates and permits.`;
    const waUrl = `https://wa.me/${AGENCY_DETAILS.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="packages-section" className="py-16 bg-[#060B18] text-slate-100 scroll-mt-6 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="editorial-eyebrow">SIGNATURE ITINERARIES & HOTEL CATEGORIES</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Handcrafted Himalayan Tour Packages
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Flawless execution by local Sikkim experts based in Gangtok. Select from 3 customizable hotel categories: Deluxe, Premium 3-Star, and Luxury 4-Star Resorts.
          </p>

          {/* Regulatory Rules Notice */}
          <div className="bg-[#0A1128] border border-cyan-500/30 p-3 rounded-xl text-xs text-slate-200 font-medium flex items-center justify-center gap-2 max-w-2xl mx-auto shadow-sm">
            <span className="font-bold text-cyan-400">⚠️ Official Sikkim Permit Notice:</span>
            <span className="text-slate-300">North Sikkim mandates a 2-Night Lachung Stay. Heavy 4WD SUVs (Scorpio/Innova) required for North Sikkim & Nathula Pass.</span>
          </div>

          {/* Hotel Category / Tier Selector Tabs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleTierFilterChange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedTierFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                  : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:bg-[#0E1738]'
              }`}
            >
              🏨 All Package Tiers
            </button>
            <button
              onClick={() => handleTierFilterChange('deluxe')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedTierFilter === 'deluxe'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                  : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:bg-[#0E1738]'
              }`}
            >
              🏡 Deluxe (Lodges & Cottages)
            </button>
            <button
              onClick={() => handleTierFilterChange('premium')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedTierFilter === 'premium'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                  : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:bg-[#0E1738]'
              }`}
            >
              ⭐ Premium (3-Star Hotels)
            </button>
            <button
              onClick={() => handleTierFilterChange('luxury')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedTierFilter === 'luxury'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold border-cyan-300 shadow-md'
                  : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:bg-[#0E1738]'
              }`}
            >
              ✨ Luxury (4-Star Resorts)
            </button>
            <button
              onClick={() => handleTierFilterChange('shared')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedTierFilter === 'shared'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                  : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:bg-[#0E1738]'
              }`}
            >
              🚌 Shared Tours (Seat Basis)
            </button>
          </div>

          {/* Region Filter Pills & View All Button */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-[#0A1128] text-slate-300 hover:bg-[#0E1738] border border-slate-800'
                }`}
              >
                {cat === 'All' ? 'All Destinations' : cat}
              </button>
            ))}

            <button
              onClick={handleToggleViewAll}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                isViewAll
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 border-cyan-300 shadow-md'
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60 hover:bg-cyan-900/60'
              }`}
            >
              {isViewAll ? `✓ Showing All (${filteredPackages.length}) Packages` : `👁️ View All (${filteredPackages.length}) Packages`}
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {displayPackages.map((pkg) => {
            const deluxePrice = pkg.hotelTiers?.deluxe.price || Math.round(pkg.priceStarting * 0.85);
            const premiumPrice = pkg.hotelTiers?.premium.price || pkg.priceStarting;
            const luxuryPrice = pkg.hotelTiers?.luxury.price || Math.round(pkg.priceStarting * 1.55);

            const isCurrentItinerarySelected = activeItineraryId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`travel-card bg-[#0A1128] rounded-2xl border border-slate-800/90 overflow-hidden flex flex-col justify-between shadow-xl hover:border-cyan-500/50 transition-all duration-300 ${
                  isCurrentItinerarySelected ? 'border-cyan-400 ring-1 ring-cyan-400/40' : ''
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={pkg.heroImage}
                    alt={pkg.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-[#0A1128]/40 to-transparent" />

                  {/* Duration Badge */}
                  <div className="absolute top-3 left-3 bg-[#060B18]/90 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-cyan-500/30">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{pkg.duration}</span>
                  </div>

                  {/* Rating Badge & Wishlist Heart */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(pkg.id, pkg.title);
                      }}
                      className={`p-1.5 rounded-full transition-all shadow-md ${
                        isInWishlist(pkg.id)
                          ? 'bg-rose-600 text-white scale-110'
                          : 'bg-[#060B18]/90 text-slate-300 hover:text-rose-400 hover:bg-[#060B18]'
                      }`}
                      aria-label="Save to wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(pkg.id) ? 'fill-white' : ''}`} />
                    </button>
                    <div className="bg-[#060B18]/90 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-cyan-500/30">
                      <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                      <span>{pkg.rating} ({pkg.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-serif font-bold text-lg text-white drop-shadow-md">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{pkg.location}</span>
                    </p>
                  </div>
                </div>

                {/* Package Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-xs">
                  {/* Tier Pricing Cards */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      3 Accommodation Options:
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-[#060B18] rounded-xl border border-slate-800">
                        <span className="text-[10px] block font-bold text-slate-400">DELUXE</span>
                        <span className="font-bold text-white block">₹{(deluxePrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 bg-cyan-950/70 text-white rounded-xl border border-cyan-500/40">
                        <span className="text-[10px] block font-bold text-cyan-300">PREMIUM 3★</span>
                        <span className="font-bold text-white block">₹{(premiumPrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 bg-[#060B18] rounded-xl border border-slate-800">
                        <span className="text-[10px] block font-bold text-cyan-400">LUXURY 4★</span>
                        <span className="font-bold text-white block">₹{(luxuryPrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shared Tour Option if available */}
                  {pkg.isSharedTourAvailable && (
                    <div className="p-2.5 bg-[#060B18] border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-slate-200">Shared Tour Option Available</span>
                      </div>
                      <button
                        onClick={() => handleSharedInquiry(pkg.title, pkg.sharedPricePerSeat)}
                        className="text-[11px] font-bold text-[#25D366] hover:underline"
                      >
                        ₹{pkg.sharedPricePerSeat?.toLocaleString('en-IN') || 1200}/seat →
                      </button>
                    </div>
                  )}

                  {/* Key Highlights */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Highlights:</h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {pkg.highlights.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Starting From</span>
                      <span className="text-lg font-serif font-bold text-cyan-400">
                        ₹{(premiumPrice || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400"> / person</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActiveItineraryId(pkg.id);
                          const el = document.getElementById('day-by-day-itinerary-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium border transition-colors ${
                          activeItineraryId === pkg.id
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                            : 'bg-[#060B18] text-slate-300 border-slate-800 hover:bg-[#0E1738]'
                        }`}
                      >
                        <span>Day Plan</span>
                      </button>

                      {onQuickBookPackage && (
                        <button
                          onClick={() => onQuickBookPackage(pkg.title)}
                          className="text-[11px] px-2.5 py-1.5 bg-[#060B18] hover:bg-[#0E1738] text-white font-bold rounded-lg border border-cyan-500/40 shadow-sm flex items-center gap-1 transition-all"
                          title="Open Quick Booking Modal with selected itinerary summary"
                        >
                          <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                          <span>Quick Book</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedItineraryPkg(pkg)}
                        className="btn-luxury-cyan text-[11px] !py-1.5 !px-2.5"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls / View All Status */}
        {!isViewAll && totalPages > 1 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0A1128] border border-slate-800 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-400">
              Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPackages.length)}</strong> of <strong>{filteredPackages.length}</strong> packages
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  currentPage === 1
                    ? 'text-slate-600 border border-slate-800 cursor-not-allowed'
                    : 'bg-[#060B18] text-slate-300 border border-slate-700 hover:bg-[#0E1738]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-cyan-500 text-slate-950 font-extrabold'
                      : 'bg-[#060B18] text-slate-300 border border-slate-800 hover:bg-[#0E1738]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  currentPage === totalPages
                    ? 'text-slate-600 border border-slate-800 cursor-not-allowed'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isViewAll && filteredPackages.length > ITEMS_PER_PAGE ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#0A1128] border border-cyan-900/50 rounded-2xl shadow-sm">
            <div className="text-xs text-cyan-300 font-medium">
              ✓ Currently displaying all <strong>{filteredPackages.length}</strong> available tour packages.
            </div>
            <button
              onClick={() => {
                setIsViewAll(false);
                setCurrentPage(1);
                scrollToPackagesTop();
              }}
              className="px-3.5 py-1.5 bg-[#060B18] hover:bg-[#0E1738] border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
            >
              Switch to Paginated View
            </button>
          </div>
        ) : null}

        {/* ========================================================= */}
        {/* STRUCTURED DAY-BY-DAY 'TRIP ITINERARY' SECTION            */}
        {/* EDITORIAL CLEAN LIST LAYOUT WITH KEY MILESTONES           */}
        {/* ========================================================= */}
        <div id="day-by-day-itinerary-section" className="pt-8 scroll-mt-10 space-y-8">
          <div className="bg-[#0A1128] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
            {/* Header with Package Switcher Tabs */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <span className="editorial-eyebrow">DAY-BY-DAY TRIP ITINERARY</span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {featuredItineraryPackage.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 font-sans">
                    Milestone-driven breakdown planned and operated by our local Gangtok travel desk.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-medium">Switch Itinerary:</span>
                  <select
                    value={activeItineraryId}
                    onChange={(e) => setActiveItineraryId(e.target.value)}
                    className="bg-[#060B18] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"
                  >
                    {rawPackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.duration} - {pkg.title.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Package Summary Overview Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#060B18] p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {featuredItineraryPackage.duration}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vehicle Assigned</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    Private Innova Crysta / 4WD
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Permits & Entry</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    {featuredItineraryPackage.permitsRequired ? 'Official Army Clearances Included' : 'Standard Tourist Entry'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Meals Included</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Utensils className="w-3.5 h-3.5 text-cyan-400" />
                    Breakfast & Dinner (AP/MAP)
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Editorial Clean List Layout for Day-by-Day Itinerary */}
            <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-800 space-y-8 my-6">
              {featuredItineraryPackage.itinerary.map((dayItem, index) => {
                const milestones = getDayMilestones(dayItem.title, dayItem.description);

                return (
                  <div key={dayItem.day} className="relative group">
                    {/* Circle Node Marker on Timeline */}
                    <div className="absolute -left-[25px] sm:-left-[41px] top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#060B18] text-cyan-300 border-2 border-cyan-500/50 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      {dayItem.day}
                    </div>

                    {/* Day Content Container */}
                    <div className="bg-[#060B18] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-cyan-500/40 transition-all">
                      {/* Top Bar: Day Badge + Title */}
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-950 bg-cyan-400 px-2 py-0.5 rounded tracking-wide">
                              DAY 0{dayItem.day}
                            </span>
                            <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                              {dayItem.title}
                            </h4>
                          </div>
                        </div>

                        <span className="text-xs text-slate-300 font-medium bg-[#0A1128] px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Full Day Schedule</span>
                        </span>
                      </div>

                      {/* Key Milestones Highlight Row */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                          Key Milestones & Route Highlights:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {milestones.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="inline-flex items-center gap-1 text-xs bg-[#0A1128] text-slate-200 font-medium px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs"
                            >
                              <Flag className="w-3 h-3 text-cyan-400" />
                              <span>{m}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description Narrative */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-1">
                        {dayItem.description}
                      </p>

                      {/* Day Inclusions & Stay Footer */}
                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                            <strong className="text-white">Overnight Stay:</strong> {dayItem.title.includes('Darjeeling') ? 'Darjeeling' : dayItem.title.includes('Lachung') ? 'Lachung' : dayItem.title.includes('Pelling') ? 'Pelling' : 'Gangtok'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5 text-cyan-400" />
                            <strong className="text-white">Meals:</strong> Breakfast & Dinner
                          </span>
                        </div>

                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Driver & Fuel Covered</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-300 font-medium">
                  Need custom adjustments or dates modification?
                </p>
                <p className="text-[11px] text-slate-400">
                  Our local Gangtok coordinator can personalize every halt to match your family's pace.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAIChatWithPackage(featuredItineraryPackage.title)}
                  className="btn-luxury-cyan text-xs !py-2.5 !px-4"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Customize This Day Plan With AI</span>
                </button>

                <a
                  href={`https://wa.me/${AGENCY_DETAILS.whatsappNumber}?text=Namaste!%20I%20want%20to%20book/inquire%20about%20the%20day-by-day%20itinerary%20for%20"${encodeURIComponent(featuredItineraryPackage.title)}".`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxury-outline text-xs !py-2.5 !px-4"
                >
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span>WhatsApp Quote</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day-Wise Itinerary & Hotel Tier Modal */}
      <AnimatePresence>
        {selectedItineraryPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedItineraryPkg(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative bg-[#0A1128] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10 space-y-6 text-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-950 bg-cyan-400 px-2.5 py-0.5 rounded">
                      {selectedItineraryPkg.duration}
                    </span>
                    <span className="text-xs font-bold text-cyan-300 bg-[#060B18] px-2.5 py-0.5 rounded border border-cyan-500/30">
                      Starting ₹{(selectedItineraryPkg.priceStarting || 0).toLocaleString('en-IN')} / person
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white mt-2">
                    {selectedItineraryPkg.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedItineraryPkg.location}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedItineraryPkg(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="p-4 bg-[#060B18] rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Select Hotel Accommodation Category:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveModalTier('deluxe')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeModalTier === 'deluxe'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-[#0A1128] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold block uppercase">Deluxe</span>
                    <span className="text-sm font-bold block">
                      ₹{(selectedItineraryPkg.hotelTiers?.deluxe?.price || (selectedItineraryPkg.priceStarting ? Math.round(selectedItineraryPkg.priceStarting * 0.85) : 0)).toLocaleString('en-IN')}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModalTier('premium')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeModalTier === 'premium'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-[#0A1128] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold block uppercase">Premium 3★</span>
                    <span className="text-sm font-bold block">
                      ₹{(selectedItineraryPkg.hotelTiers?.premium?.price || selectedItineraryPkg.priceStarting || 0).toLocaleString('en-IN')}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModalTier('luxury')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeModalTier === 'luxury'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-[#0A1128] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold block uppercase">Luxury 4★</span>
                    <span className="text-sm font-bold block">
                      ₹{(selectedItineraryPkg.hotelTiers?.luxury?.price || (selectedItineraryPkg.priceStarting ? Math.round(selectedItineraryPkg.priceStarting * 1.55) : 0)).toLocaleString('en-IN')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Interactive Route Journey Map */}
              <div className="space-y-2">
                <RouteMapVisualization selectedRoute={selectedItineraryPkg.title} compactMode={false} />
              </div>

              {/* Day-by-Day List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Detailed Day-by-Day Plan
                </h4>

                <div className="space-y-3">
                  {selectedItineraryPkg.itinerary.map((day) => {
                    const milestones = getDayMilestones(day.title, day.description);

                    return (
                      <div key={day.day} className="p-4 bg-[#060B18] rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-cyan-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded">
                            DAY {day.day}
                          </span>
                          <h5 className="font-serif font-bold text-white text-sm">{day.title}</h5>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {milestones.map((m, idx) => (
                            <span key={idx} className="text-[10px] bg-[#0A1128] text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                              • {m}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                          {day.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedItineraryPkg(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const title = selectedItineraryPkg.title;
                    setSelectedItineraryPkg(null);
                    onOpenAIChatWithPackage(title);
                  }}
                  className="btn-luxury-cyan text-xs !py-2 !px-4"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Get Customized Quote</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
