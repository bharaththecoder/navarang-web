'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, ArrowDown } from 'lucide-react';

export default function Hero() {
  const mapsUrl = process.env.NEXT_PUBLIC_STORE_MAPS_URL || 'https://maps.app.goo.gl/wQcHaHhJqnEyT1ff7';

  return (
    <section className="relative pt-4 sm:pt-10 pb-8 sm:pb-14 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
        
        {/* Visual Fresh Meat Platter */}
        <div className="lg:col-span-5 relative order-2 lg:order-1 flex justify-center">
          <div className="relative w-52 h-52 sm:w-72 sm:h-72 lg:w-[380px] lg:h-[380px] rounded-full p-3 sm:p-5 bg-gradient-to-tr from-stone-200/70 via-[#F9F7F2] to-white border border-stone-200/90 shadow-culinary flex items-center justify-center group">
            
            <div className="relative w-full h-full rounded-full overflow-hidden border border-stone-200/80 shadow-inner bg-stone-100">
              <Image
                src="/fresh-mutton.jpg"
                alt="Fresh tender mutton at Navarang"
                fill
                priority
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 380px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Subtle floating badge on the platter */}
            <div className="absolute -bottom-2 sm:bottom-2 px-3 py-1 rounded-full bg-[#1F1A17]/90 text-white text-[10px] sm:text-xs font-heading font-black backdrop-blur-md border border-stone-700 shadow-md">
              100% Tender Goat &amp; Farm Chicken
            </div>
          </div>
        </div>

        {/* Right Column: Clean Headline & Value Proposition */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left order-1 lg:order-2">
          
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#7C1818] bg-[#7C1818]/10 px-2.5 py-1 rounded-full">
              <span>Madhuranagar • Vijayawada</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-[#1F1A17] tracking-tight leading-[1.15]">
              Tender Goat Mutton &amp; Farm-Fresh Chicken.
            </h1>
            <p className="text-xs sm:text-base text-stone-600 max-w-xl leading-relaxed">
              Cut live on order with traditional butchery precision. Never frozen or pre-packed. Choose your preferred cut and weight, washed cleanly, wrapped securely, and delivered to your doorstep in 30–45 minutes.
            </p>
          </div>

          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
            <a
              href="#catalog"
              className="px-6 py-3.5 rounded-full bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Explore Today&apos;s Fresh Cuts</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-full bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-heading font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-98"
            >
              <MapPin className="w-4 h-4 text-[#7C1818]" />
              <span>Madhuranagar Counter</span>
            </a>
          </div>

          {/* Quick Mobile Features Pill Strip
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-stone-600">
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
              ⚡ 30–45 Min Express
            </span>
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
              ✅ 100% Halal
            </span>
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
              💧 Cleaned on Order
            </span>
          </div> */}

        </div>

      </div>
    </section>
  );
}
