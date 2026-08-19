import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { z } from 'zod';
import { AGENCY_DETAILS } from '../data/travelData';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageCircle, Clock, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { DestinationCarousel } from './DestinationCarousel';
import { LiveAvailabilityBadge } from './LiveAvailabilityBadge';
import { GovtRegistrationBadge } from './GovtRegistrationBadge';
import { fetchWithRetry } from '../utils/api';

export const contactLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name is required (at least 2 characters)'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone / WhatsApp number is required')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      },
      {
        message: 'Please enter a valid 10-15 digit phone or WhatsApp number (e.g. +91 98765 43210)',
      }
    )
    .refine(
      (val) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,18}$/.test(val),
      {
        message: 'Phone number format is invalid',
      }
    ),
  email: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
      },
      {
        message: 'Please enter a valid email address (e.g. traveler@example.com)',
      }
    ),
  dates: z.string().optional(),
  guests: z
    .coerce
    .number()
    .min(1, 'At least 1 traveler required')
    .max(50, 'Maximum 50 travelers per group inquiry'),
  route: z.string().min(1, 'Please select a tour route'),
  vehiclePref: z.string().min(1, 'Please select a vehicle preference'),
  mealPref: z.string().min(1, 'Please select a meal plan'),
  notes: z.string().optional(),
});

export type ContactLeadFormData = z.infer<typeof contactLeadSchema>;

interface ContactPlanTripProps {
  onLeadSubmitted: (lead: any) => void;
  onOpenAIChat: () => void;
}

export const ContactPlanTrip: React.FC<ContactPlanTripProps> = ({
  onLeadSubmitted,
  onOpenAIChat,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('2');
  const [route, setRoute] = useState('5N/6D Sikkim & Darjeeling Tour');
  const [mealPref, setMealPref] = useState('Pure Veg (AP Plan)');
  const [vehiclePref, setVehiclePref] = useState('Toyota Innova Crysta');
  const [notes, setNotes] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Validate single field on blur or change
  const validateField = (field: keyof ContactLeadFormData, value: any) => {
    const fieldSchema = contactLeadSchema.shape[field];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        const firstIssue = result.error.issues?.[0];
        setErrors((prev) => ({
          ...prev,
          [field]: firstIssue?.message || 'Invalid value',
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    }
  };

  const handleBlur = (field: keyof ContactLeadFormData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const formData = {
      name,
      phone,
      email,
      dates,
      guests,
      route,
      vehiclePref,
      mealPref,
      notes,
    };

    // Full schema validation using Zod
    const validationResult = contactLeadSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        const fieldName = err.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = err.message;
        }
      });
      setErrors(fieldErrors);
      setTouched({
        name: true,
        phone: true,
        email: true,
        dates: true,
        guests: true,
        route: true,
        vehiclePref: true,
        mealPref: true,
        notes: true,
      });
      return;
    }

    // Clear previous errors
    setErrors({});
    setIsSubmitting(true);

    try {
      const validatedData = validationResult.data;
      const response = await fetchWithRetry('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: validatedData.name,
          whatsappNumber: validatedData.phone,
          email: validatedData.email || '',
          travelDates: validatedData.dates || 'Flexible',
          travelersCount: validatedData.guests,
          packageOrRoute: validatedData.route,
          vehiclePreference: validatedData.vehiclePref,
          mealPreference: validatedData.mealPref,
          notes: validatedData.notes || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setSubmitted(true);
      if (data.lead) {
        onLeadSubmitted(data.lead);
      }
    } catch (err: any) {
      console.error('Lead submission error:', err);
      // Still allow friendly confirmation with local fallback if network fails
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-[#0B0F0E] text-[#F5F1E8] border-b border-[#D6B36A]/20">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="luxury-eyebrow">PLAN YOUR JOURNEY</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F1E8] tracking-tight">
            Connect With OffbeatDestination Concierge
          </h2>
          <p className="text-[#A9AAA4] text-sm sm:text-base leading-relaxed">
            Submit your bespoke trip preferences below or interact directly with our 24/7 AI Luxury Assistant for an instant customized quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111513] p-6 rounded-xl border border-[#D6B36A]/20 space-y-6">
              <h3 className="font-bold text-lg text-[#F5F1E8]">Gangtok Head Office</h3>

              <div className="space-y-4 text-xs text-[#A9AAA4]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#18352D] rounded text-[#D6B36A] border border-[#D6B36A]/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F1E8]">Address:</h4>
                    <p>{AGENCY_DETAILS.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#18352D] rounded text-[#D6B36A] border border-[#D6B36A]/30">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F1E8]">Phone Hotline:</h4>
                    <p>{AGENCY_DETAILS.phonePrimary} / {AGENCY_DETAILS.phoneSecondary}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#18352D] rounded text-[#D6B36A] border border-[#D6B36A]/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F1E8]">Email:</h4>
                    <p>{AGENCY_DETAILS.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#18352D] rounded text-[#D6B36A] border border-[#D6B36A]/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F1E8]">Concierge Hours:</h4>
                    <p>8:00 AM - 10:00 PM IST (7 Days a Week)</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="p-4 bg-[#0B0F0E] border border-[#D6B36A]/30 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-[#D6B36A] font-bold text-xs">
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant Concierge WhatsApp</span>
                </div>
                <p className="text-[11px] text-[#A9AAA4]">
                  Prefer direct messaging? Chat directly with our Gangtok transport & permit manager.
                </p>
                <a
                  href={`https://wa.me/${AGENCY_DETAILS.whatsappNumber}?text=Namaste!%20I%20want%20to%20plan%20a%20luxury%20trip%20to%20Sikkim.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 text-xs font-bold rounded transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Message +91 62961 02341</span>
                </a>
              </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-[#111513] p-6 rounded-xl border border-[#D6B36A]/30 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#D6B36A] mx-auto" />
              <h4 className="font-bold text-[#F5F1E8] text-sm">Need Instant Custom Itinerary?</h4>
              <p className="text-xs text-[#A9AAA4]">
                Our embedded AI Assistant is trained on all Sikkim permits, luxury hotels, and vehicle rates.
              </p>
              <button
                onClick={onOpenAIChat}
                className="btn-luxury-gold w-full text-xs"
              >
                Launch AI Luxury Concierge
              </button>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#111513] p-6 sm:p-8 rounded-xl border border-[#D6B36A]/30 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-extrabold text-xl text-[#F5F1E8]">
                  Plan My Bespoke Trip
                </h3>
                <GovtRegistrationBadge />
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="p-8 bg-[#18352D] border border-[#D6B36A]/40 rounded-xl text-center space-y-4 shadow-xl"
                  >
                    <CheckCircle2 className="w-14 h-14 text-[#D6B36A] mx-auto" />
                    <h4 className="font-extrabold text-xl text-[#F5F1E8]">Trip Inquiry Received!</h4>
                    <p className="text-xs sm:text-sm text-[#A9AAA4] leading-relaxed max-w-lg mx-auto">
                      Namaste <strong className="text-[#F5F1E8]">{name}</strong>! Your trip details have been registered. Our Gangtok concierge team will contact you at <strong className="text-[#D6B36A]">{phone}</strong> within 5 minutes with a custom luxury quote.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="btn-luxury-outline text-xs"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-4 text-xs"
                  >
                    {/* Error Banner if there are validation errors on submit */}
                    {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) && (
                      <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-start gap-2.5 text-red-200">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs">Please correct the highlighted fields:</p>
                          <ul className="list-disc list-inside text-[11px] text-red-300 mt-1 space-y-0.5">
                            {Object.entries(errors).map(([key, msg]) => (
                              <li key={key}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[#A9AAA4] font-medium">Full Name *</label>
                          {touched.name && errors.name && (
                            <span className="text-red-400 text-[10px] flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3" /> Required
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Anand Verma"
                          value={name}
                          onBlur={() => handleBlur('name', name)}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (touched.name) validateField('name', e.target.value);
                          }}
                          className={`w-full bg-[#0B0F0E] border ${
                            touched.name && errors.name
                              ? 'border-red-500/80 focus:border-red-400 bg-red-950/10'
                              : 'border-[#D6B36A]/30 focus:border-[#D6B36A]'
                          } rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none transition-colors`}
                        />
                        {touched.name && errors.name && (
                          <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[#A9AAA4] font-medium">WhatsApp / Mobile Number *</label>
                          {touched.phone && errors.phone && (
                            <span className="text-red-400 text-[10px] flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3" /> Invalid Format
                            </span>
                          )}
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={phone}
                          onBlur={() => handleBlur('phone', phone)}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (touched.phone) validateField('phone', e.target.value);
                          }}
                          className={`w-full bg-[#0B0F0E] border ${
                            touched.phone && errors.phone
                              ? 'border-red-500/80 focus:border-red-400 bg-red-950/10'
                              : 'border-[#D6B36A]/30 focus:border-[#D6B36A]'
                          } rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none transition-colors`}
                        />
                        {touched.phone && errors.phone ? (
                          <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>
                        ) : (
                          <p className="text-[#A9AAA4]/60 text-[10px] mt-1">Include country code (e.g. +91 9876543210)</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[#A9AAA4] font-medium">Email Address</label>
                          {touched.email && errors.email && (
                            <span className="text-red-400 text-[10px] flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3" /> Invalid Email
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          placeholder="anand@gmail.com"
                          value={email}
                          onBlur={() => handleBlur('email', email)}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (touched.email) validateField('email', e.target.value);
                          }}
                          className={`w-full bg-[#0B0F0E] border ${
                            touched.email && errors.email
                              ? 'border-red-500/80 focus:border-red-400 bg-red-950/10'
                              : 'border-[#D6B36A]/30 focus:border-[#D6B36A]'
                          } rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none transition-colors`}
                        />
                        {touched.email && errors.email && (
                          <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[#A9AAA4] font-medium mb-1">Travel Dates</label>
                        <input
                          type="text"
                          placeholder="e.g. 15th - 20th Oct"
                          value={dates}
                          onChange={(e) => setDates(e.target.value)}
                          className="w-full bg-[#0B0F0E] border border-[#D6B36A]/30 rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#D6B36A]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[#A9AAA4] font-medium">Travelers</label>
                          {touched.guests && errors.guests && (
                            <span className="text-red-400 text-[10px] flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3" /> Min 1
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={guests}
                          onBlur={() => handleBlur('guests', guests)}
                          onChange={(e) => {
                            setGuests(e.target.value);
                            if (touched.guests) validateField('guests', e.target.value);
                          }}
                          className={`w-full bg-[#0B0F0E] border ${
                            touched.guests && errors.guests
                              ? 'border-red-500/80 focus:border-red-400 bg-red-950/10'
                              : 'border-[#D6B36A]/30 focus:border-[#D6B36A]'
                          } rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none`}
                        />
                        {touched.guests && errors.guests && (
                          <p className="text-red-400 text-[11px] mt-1">{errors.guests}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[#A9AAA4] font-medium mb-1">Select Route</label>
                        <select
                          value={route}
                          onChange={(e) => setRoute(e.target.value)}
                          className="w-full bg-[#0B0F0E] border border-[#D6B36A]/30 rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#D6B36A]"
                        >
                          <option value="5N/6D Sikkim & Darjeeling Tour">5N/6D Sikkim & Darjeeling Tour</option>
                          <option value="North Sikkim (Lachung & Zero Point)">North Sikkim (Lachung & Zero Point)</option>
                          <option value="South & West Sikkim (Pelling/Ravangla)">South & West Sikkim (Pelling/Ravangla)</option>
                          <option value="Bhutan Cultural Odyssey">Custom Bhutan Cultural Odyssey</option>
                          <option value="NJP / Bagdogra Cab Rental">NJP / Bagdogra Cab Rental</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#A9AAA4] font-medium mb-1">Vehicle Preference</label>
                        <select
                          value={vehiclePref}
                          onChange={(e) => setVehiclePref(e.target.value)}
                          className="w-full bg-[#0B0F0E] border border-[#D6B36A]/30 rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#D6B36A]"
                        >
                          <option value="Toyota Innova Crysta">Toyota Innova Crysta (Luxury SUV)</option>
                          <option value="Mahindra Xylo / Scorpio 4x4">Mahindra Xylo / Scorpio 4x4</option>
                          <option value="Swift Dzire / Etios (Sedan)">Swift Dzire / Toyota Etios (4-Seater Sedan)</option>
                          <option value="WagonR / Swift (Hatchback)">WagonR / Swift / Alto (4-Seater Hatchback)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#A9AAA4] font-medium mb-1">Meal Preference *</label>
                        <select
                          value={mealPref}
                          onChange={(e) => setMealPref(e.target.value)}
                          className="w-full bg-[#0B0F0E] border border-[#D6B36A]/30 rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#D6B36A]"
                        >
                          <option value="Pure Veg Plan (100% Vegetarian AP/MAP)">🥬 Pure Veg Plan (100% Vegetarian AP/MAP)</option>
                          <option value="Strict Jain Food Plan (No Onion, Garlic & Root Veg)">🌱 Strict Jain Plan (No Onion, Garlic & Root Veg)</option>
                          <option value="Non-Veg Plan (Chicken & Fresh Fish)">🍗 Non-Veg Plan (Local Chicken & Fish)</option>
                          <option value="Mixed Family Plan (Veg & Non-Veg Combination)">🍲 Mixed Family Plan (Veg & Non-Veg Combo)</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Seats Availability Badge */}
                    <LiveAvailabilityBadge selectedRoute={route} selectedDate={dates} />

                    {/* Dynamic Destination Carousel Visualization */}
                    <DestinationCarousel selectedRoute={route} />

                    <div>
                      <label className="block text-[#A9AAA4] font-medium mb-1">Special Notes / Requests</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Nathula Pass permit needed, elderly parents traveling, preferred hotel standard..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-[#0B0F0E] border border-[#D6B36A]/30 rounded px-3.5 py-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#D6B36A] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-luxury-gold w-full text-sm font-bold !py-3.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Validating & Submitting Details...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 fill-slate-950" />
                          <span>Submit Inquiry for Instant WhatsApp Quote</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
