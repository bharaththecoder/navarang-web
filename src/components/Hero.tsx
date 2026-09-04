'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, ArrowDown } from 'lucide-react';

export default function Hero() {
  const mapsUrl = process.env.NEXT_PUBLIC_STORE_MAPS_URL || 'https://maps.app.goo.gl/wQcHaHhJqnEyT1ff7';

  return (
    <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Visual Fresh Meat Platter */}
        <div className="lg:col-span-5 relative order-2 lg:order-1 flex justify-center">
          <div className="relative w-full max-w-[400px] aspect-square rounded-full p-4 sm:p-5 bg-gradient-to-tr from-stone-200/60 via-[#F9F7F2] to-white border border-stone-200/90 shadow-culinary flex items-center justify-center group">
            
            <div className="relative w-full h-full rounded-full overflow-hidden border border-stone-200/80 shadow-inner bg-stone-100">
              <Image
                src="/fresh-mutton.jpg"
                alt="Fresh tender mutton at Navarang"
                fill
                priority
                sizes="(max-width: 768px) 300px, 400px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Clean Headline & Value Proposition */}
        <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
          
          <div className="space-y-3">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#7C1818]">
              Madhuranagar • Vijayawada
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-5xl text-[#1F1A17] tracking-tight leading-[1.14]">
              Tender Goat Mutton &amp; Farm-Fresh Chicken.
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
              Cut live on order with traditional butchery precision. Never frozen or pre-packed. Choose your preferred cut and weight, washed cleanly, wrapped securely, and delivered to your doorstep in 30–45 minutes.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <a
              href="#catalog"
              className="px-6 py-3.5 rounded-full bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
            >
              <span>Explore Today&apos;s Fresh Cuts</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-full bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-heading font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#7C1818]" />
              <span>Madhuranagar Counter</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
