'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Menu, 
  X, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile, isAuthenticated, setIsAuthModalOpen, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE || '+91 7989493162';
  const mapsUrl = process.env.NEXT_PUBLIC_STORE_MAPS_URL || 'https://maps.app.goo.gl/wQcHaHhJqnEyT1ff7';

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all">
      {/* Floating Island Capsule Navbar */}
      <div className="max-w-7xl mx-auto glass-capsule rounded-full shadow-culinary px-4 sm:px-6 py-2.5 sm:py-3 pointer-events-auto flex items-center justify-between gap-4">
        
        {/* Brand Mark */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-full bg-[#7C1818] text-[#FAF8F5] flex items-center justify-center font-heading font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-[#1F1A17] leading-none">
                Navarang
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7C1818]/10 text-[#7C1818] uppercase tracking-wider">
                100% Halal
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-medium leading-tight mt-0.5 hidden sm:block">
              Mutton & Chicken • Madhuranagar
            </p>
          </div>
        </Link>

        {/* Center Navigation - Chicken and Mutton links directly scroll to their respective sections */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('catalog')}
            className="px-4 py-2 rounded-full text-stone-800 hover:text-[#7C1818] hover:bg-stone-100/70 text-xs font-heading font-bold tracking-wide transition-all cursor-pointer"
          >
            All Cuts
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chicken-section')}
            className="px-4 py-2 rounded-full text-stone-700 hover:text-[#7C1818] hover:bg-stone-100/70 text-xs font-heading font-bold tracking-wide transition-all cursor-pointer"
          >
            Farm Chicken
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('mutton-section')}
            className="px-4 py-2 rounded-full text-stone-700 hover:text-[#7C1818] hover:bg-stone-100/70 text-xs font-heading font-bold tracking-wide transition-all cursor-pointer"
          >
            Tender Mutton
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:text-[#7C1818] hover:border-stone-400 text-xs font-medium flex items-center gap-1.5 transition-all ml-1"
          >
            <MapPin className="w-3.5 h-3.5 text-[#7C1818]" />
            <span>Store Location</span>
          </a>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Direct Phone Link */}
          <a
            href={`tel:${ownerPhone}`}
            className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-stone-700 hover:bg-stone-100/80 transition border border-stone-200/80"
          >
            <Phone className="w-3.5 h-3.5 text-[#7C1818]" />
            <span>{ownerPhone}</span>
          </a>

          {/* User Auth Profile State */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-100/80 hover:bg-stone-200/80 text-xs font-bold text-stone-800 border border-stone-200 transition cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#7C1818] text-white flex items-center justify-center text-[10px] font-bold">
                  {profile?.fullName ? profile.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate hidden md:inline">
                  {profile?.fullName || profile?.phone || 'Customer'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-stone-100 font-medium text-stone-500 truncate">
                    {profile?.phone || user?.phone}
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-heading font-bold text-stone-700 hover:text-stone-900 border border-stone-200/90 hover:border-stone-400 bg-white/60 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-600" />
              <span>Sign In</span>
            </button>
          )}

          {/* Shopping Basket Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C1818] hover:bg-[#641212] text-white font-heading font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            aria-label="Open Shopping Basket"
          >
            <ShoppingBag className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">Basket</span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-stone-950 text-xs font-black">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-stone-700 hover:bg-stone-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto glass-capsule rounded-3xl shadow-xl p-5 pointer-events-auto space-y-4 animate-in slide-in-from-top-2 duration-200 border border-stone-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-stone-500">
              Fresh Cuts
            </span>
            <span className="text-xs text-[#7C1818] font-bold">100% Halal Verified</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-heading font-bold text-stone-800">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('chicken-section');
              }}
              className="p-3.5 text-center rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 transition"
            >
              Farm Chicken
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('mutton-section');
              }}
              className="p-3.5 text-center rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 transition"
            >
              Tender Mutton
            </button>
          </div>

          <div className="pt-3 border-t border-stone-200/80 flex flex-col items-stretch gap-2.5 text-xs">
            <a
              href={`tel:${ownerPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#7C1818] text-white font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Store: {ownerPhone}</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-full border border-stone-300 text-stone-700 font-medium text-center"
            >
              Store Location (Madhuranagar)
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
