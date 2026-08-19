import React from 'react';
import { X, Check, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { TourPackage, CabOption } from '../types';

interface ItemComparisonModalProps {
  type: 'packages' | 'cabs';
  packages?: TourPackage[];
  cabs?: CabOption[];
  onClose: () => void;
  onSelectForBooking: (title: string) => void;
}

export const ItemComparisonModal: React.FC<ItemComparisonModalProps> = ({
  type,
  packages = [],
  cabs = [],
  onClose,
  onSelectForBooking,
}) => {
  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#071A2D] text-slate-100 w-full max-w-5xl rounded-2xl border border-amber-500/30 shadow-2xl p-6 relative font-sans my-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-900 border border-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offbeat Side-by-Side Comparison Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
            {type === 'packages' ? 'Compare Sikkim & Darjeeling Tour Packages' : 'Compare Cab & SUV Rental Fleet Options'}
          </h2>
        </div>

        {/* Packages Comparison Table */}
        {type === 'packages' && packages.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-amber-500/20 text-slate-300">
                  <th className="p-3 bg-slate-900/80 w-1/4">Features / Specifications</th>
                  {packages.slice(0, 3).map((pkg) => (
                    <th key={pkg.id} className="p-3 bg-slate-900/50 w-1/4 font-serif font-bold text-amber-200">
                      {pkg.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Starting Price</td>
                  {packages.slice(0, 3).map((pkg) => (
                    <td key={pkg.id} className="p-3 font-bold text-amber-300 text-sm">
                      ₹{pkg.priceStarting.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ person</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Duration</td>
                  {packages.slice(0, 3).map((pkg) => (
                    <td key={pkg.id} className="p-3 text-slate-200">{pkg.duration}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Rating</td>
                  {packages.slice(0, 3).map((pkg) => (
                    <td key={pkg.id} className="p-3 text-slate-200 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{pkg.rating} ({pkg.reviewsCount} reviews)</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Permit Included</td>
                  {packages.slice(0, 3).map((pkg) => (
                    <td key={pkg.id} className="p-3 text-slate-200">
                      {pkg.permitsRequired ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" /> 100% Permit Handled
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Required</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Key Highlights</td>
                  {packages.slice(0, 3).map((pkg) => (
                    <td key={pkg.id} className="p-3 text-slate-300 space-y-1">
                      {pkg.highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-start gap-1 text-[11px]">
                          <span className="text-amber-400">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Action</td>
                  {packages.slice(0, 3).map((pkg) => (
                    <td key={pkg.id} className="p-3">
                      <button
                        onClick={() => {
                          onSelectForBooking(pkg.title);
                          onClose();
                        }}
                        className="btn-luxury text-xs !py-1.5 !px-3 w-full"
                      >
                        Book Package
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Cabs Comparison Table */}
        {type === 'cabs' && cabs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-amber-500/20 text-slate-300">
                  <th className="p-3 bg-slate-900/80 w-1/4">Vehicle Spec</th>
                  {cabs.slice(0, 3).map((cab) => (
                    <th key={cab.id} className="p-3 bg-slate-900/50 w-1/4 font-serif font-bold text-amber-200">
                      {cab.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">NJP / Airport Rate</td>
                  {cabs.slice(0, 3).map((cab) => (
                    <td key={cab.id} className="p-3 font-bold text-amber-300 text-sm">
                      ₹{cab.njpIxbPickupRate.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Seating Capacity</td>
                  {cabs.slice(0, 3).map((cab) => (
                    <td key={cab.id} className="p-3 text-slate-200">{cab.capacity}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Best Suited For</td>
                  {cabs.slice(0, 3).map((cab) => (
                    <td key={cab.id} className="p-3 text-slate-200">{cab.bestFor}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">Action</td>
                  {cabs.slice(0, 3).map((cab) => (
                    <td key={cab.id} className="p-3">
                      <button
                        onClick={() => {
                          onSelectForBooking(`Cab Rental: ${cab.model}`);
                          onClose();
                        }}
                        className="btn-luxury text-xs !py-1.5 !px-3 w-full"
                      >
                        Reserve Vehicle
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
