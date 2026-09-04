import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, MessageSquare, Clock } from 'lucide-react';

export default function Footer() {
  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE || '+91 7989493162';
  const ownerWhatsApp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '917989493162';
  const mapsUrl = process.env.NEXT_PUBLIC_STORE_MAPS_URL || 'https://maps.app.goo.gl/wQcHaHhJqnEyT1ff7';

  return (
    <footer className="bg-[#1A1816] text-stone-400 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">

          {/* Shop Story */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7C1818] flex items-center justify-center text-[#FAF8F5] font-heading font-black text-xl shadow-xs">
                N
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tight">
                NAVARANG
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Madhuranagar&apos;s trusted fresh meat center in Vijayawada. Supplying 100% Halal tender goat mutton, fresh farm chicken, and special liver &amp; paya cuts, freshly slaughtered and cleaned on order.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-heading font-bold px-2.5 py-1 rounded-full bg-[#7C1818]/40 text-amber-200 border border-[#7C1818]/60">
                100% Halal Certified
              </span>
              <span className="text-[10px] font-heading font-bold px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                Daily Morning Slaughter
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              Fresh Meat Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#catalog" className="hover:text-white transition">Tender Goat Mutton</a></li>
              <li><a href="#catalog" className="hover:text-white transition">Farm Fresh Broiler Chicken</a></li>
              <li><a href="#catalog" className="hover:text-white transition">Mutton Liver & Paya </a></li>
              <li><a href="#catalog" className="hover:text-white transition">Fresh Chicken Liver</a></li>
            </ul>
          </div>

          {/* Location & Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              Store &amp; Counter
            </h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-start gap-2 text-stone-300">
                <MapPin className="w-4 h-4 text-[#7C1818] shrink-0 mt-0.5" />
                <span>Madhuranagar, Vijayawada, Andhra Pradesh - 520011</span>
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                <span>Google Maps Directions</span>
              </a>
              <div className="flex items-center gap-2 text-stone-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>6:30 AM – 9:00 PM (All 7 Days)</span>
              </div>
            </div>
          </div>

          {/* Direct Support & Orders */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              Direct Counter Support
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`tel:${ownerPhone}`}
                className="flex items-center gap-2 text-stone-200 hover:text-white font-medium transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#7C1818]" />
                <span>Call: {ownerPhone}</span>
              </a>
              <a
                href={`https://wa.me/${ownerWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-200 hover:text-white font-medium transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct WhatsApp Order</span>
              </a>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-block text-[11px] font-semibold text-stone-500 hover:text-stone-300 underline"
                >
                  Butcher Admin Login
                </Link>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Navarang Mutton &amp; Chicken Center. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Halal Verified</span>
            <span>•</span>
            <span>Vijayawada Doorstep Delivery</span>
            <span>•</span>
            <span>Direct UPI Payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
