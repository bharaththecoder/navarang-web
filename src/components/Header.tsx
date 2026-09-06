'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Menu, 
  X, 
  User as UserIcon,
  ChevronDown,
  Package
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import MyOrdersModal from './MyOrdersModal';

const emptySubscribe = () => () => {};

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile, isAuthenticated, setIsAuthModalOpen, signOut } = useAuth();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE || '+91 7013512259';
  const mapsUrl = process.env.NEXT_PUBLIC_STORE_MAPS_URL || 'https://maps.app.goo.gl/wQcHaHhJqnEyT1ff7';

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-3 sm:pt-4.5 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all">
      {/* Floating Island Capsule Navbar - Increased Size & Prominence */}
      <div className="max-w-7xl mx-auto glass-capsule rounded-full shadow-culinary px-4 sm:px-7 py-2.5 sm:py-3.5 pointer-events-auto flex items-center justify-between gap-2.5 sm:gap-5">
        
        {/* Brand Mark */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#7C1818] text-[#FAF8F5] flex items-center justify-center font-heading font-black text-lg sm:text-2xl shadow-xs group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-black text-lg sm:text-2xl tracking-tight text-[#1F1A17] leading-none">
                Navarang
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C1818]/10 text-[#7C1818] uppercase tracking-wider">
                100% Halal
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium leading-tight mt-0.5 hidden sm:block">
              Mutton &amp; Chicken • Madhuranagar
            </p>
          </div>
        </Link>

        {/* Center Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('catalog')}
            className="px-4 py-2.5 rounded-full text-stone-800 hover:text-[#7C1818] hover:bg-stone-100/70 text-sm font-heading font-bold tracking-wide transition-all cursor-pointer"
          >
            All Cuts
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chicken-section')}
            className="px-4 py-2.5 rounded-full text-stone-700 hover:text-[#7C1818] hover:bg-stone-100/70 text-sm font-heading font-bold tracking-wide transition-all cursor-pointer"
          >
            Farm Chicken
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('mutton-section')}
            className="px-4 py-2.5 rounded-full text-stone-700 hover:text-[#7C1818] hover:bg-stone-100/70 text-sm font-heading font-bold tracking-wide transition-all cursor-pointer"
          >
            Tender Mutton
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:text-[#7C1818] hover:border-stone-400 text-xs font-semibold flex items-center gap-1.5 transition-all ml-1 bg-white/50"
          >
            <MapPin className="w-4 h-4 text-[#7C1818]" />
            <span>Store Location</span>
          </a>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          
          {/* Direct Phone Link (Desktop XL) */}
          <a
            href={`tel:${ownerPhone}`}
            className="hidden xl:flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-stone-700 hover:bg-stone-100/80 transition border border-stone-200/80 bg-white/40"
          >
            <Phone className="w-4 h-4 text-[#7C1818]" />
            <span>{ownerPhone}</span>
          </a>

          {/* User Auth Profile State */}
          {mounted && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-stone-100/90 hover:bg-stone-200/90 text-xs font-heading font-bold text-stone-900 border border-stone-200 transition cursor-pointer"
                aria-label="User profile options"
              >
                {profile?.avatarUrl ? (
                  <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-stone-300 shrink-0">
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.fullName || 'User'}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#7C1818] text-white flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0">
                    {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="max-w-[70px] sm:max-w-[120px] truncate">
                  {profile?.firstName || profile?.fullName?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FAF8F5] rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3.5 bg-[#FDFCFB] border-b border-stone-200/70">
                    <div className="flex items-center gap-3">
                      {profile?.avatarUrl ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-stone-300 shrink-0">
                          <Image
                            src={profile.avatarUrl}
                            alt={profile.fullName || 'User'}
                            fill
                            sizes="36px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#7C1818] text-white flex items-center justify-center text-xs font-black shrink-0">
                          {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-bold text-stone-900 text-sm truncate">
                          {profile?.fullName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {profile?.email || profile?.phone || user?.email || user?.phone || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsOrdersModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-2xl text-stone-800 hover:bg-stone-100 font-heading font-bold flex items-center gap-3 cursor-pointer transition text-xs"
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <span>My Meat Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 font-semibold flex items-center gap-3 cursor-pointer transition text-xs"
                    >
                      <span className="w-7 text-center text-red-500 font-bold text-base">→</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-heading font-bold text-stone-700 hover:text-stone-950 border border-stone-200/90 hover:border-stone-400 bg-white/70 transition cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Shopping Basket Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#7C1818] hover:bg-[#641212] text-white font-heading font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            aria-label="Open Shopping Basket"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-200" />
            <span className="hidden sm:inline">Basket</span>
            {mounted && itemCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] sm:min-w-[22px] h-5 sm:h-5.5 px-1.5 rounded-full bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-black">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-stone-900" /> : <Menu className="w-5 h-5 text-stone-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Professional Bottom Sheet Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm pointer-events-auto md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden pointer-events-auto animate-in slide-in-from-bottom duration-300 ease-out max-h-[90vh] overflow-y-auto">
            <div className="bg-[#FAF8F5] rounded-t-[32px] border-t border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4">
              
              {/* Grab Handle */}
              <div className="w-12 h-1.5 bg-stone-300/80 rounded-full mx-auto -mt-1 mb-2" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#7C1818] text-white flex items-center justify-center text-xs font-heading font-black">
                    N
                  </div>
                  <span className="font-heading font-black text-sm text-stone-900">
                    Navarang Meat Store
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-heading font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Halal Verified</span>
                </div>
              </div>

              {/* Meat Selection Grid Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection('chicken-section');
                  }}
                  className="p-3.5 text-left rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-[#7C1818]/40 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-lg">
                      🍗
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 group-hover:text-[#7C1818] transition">View →</span>
                  </div>
                  <div className="font-heading font-black text-sm text-stone-900 leading-snug">
                    Farm Chicken
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    Broiler, Liver &amp; Gizzard
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection('mutton-section');
                  }}
                  className="p-3.5 text-left rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-[#7C1818]/40 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg">
                      🥩
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 group-hover:text-[#7C1818] transition">View →</span>
                  </div>
                  <div className="font-heading font-black text-sm text-stone-900 leading-snug">
                    Tender Mutton
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    Daily Fresh Goat &amp; Paya
                  </div>
                </button>
              </div>

              {/* Action List Section */}
              <div className="space-y-2 pt-1">
                {/* Catalog Shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection('catalog');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 font-heading font-bold text-xs transition cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🔪</span>
                    <span>Explore All Cuts &amp; Custom Slices</span>
                  </span>
                  <span className="text-stone-400 text-xs">→</span>
                </button>

                {/* Authentication / My Orders State */}
                {mounted && isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsOrdersModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 font-heading font-bold text-xs transition cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <span>Track My Meat Orders</span>
                      </span>
                      <span className="text-stone-400 text-xs">→</span>
                    </button>
                    
                    <div className="flex items-center justify-between px-2 pt-1">
                      <span className="text-xs text-stone-500 font-medium truncate">
                        Signed in as <strong className="text-stone-800">{profile?.firstName || 'Customer'}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                        className="text-xs font-heading font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#1F1A17] hover:bg-black text-white font-heading font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm active:scale-98"
                  >
                    <UserIcon className="w-4 h-4 text-amber-300" />
                    <span>Sign In with Google</span>
                  </button>
                )}

                {/* Call Store Button */}
                <a
                  href={`tel:${ownerPhone}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#7C1818] hover:bg-[#641212] text-white font-heading font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm active:scale-98"
                >
                  <Phone className="w-4 h-4 text-amber-200" />
                  <span>Call Store: {ownerPhone}</span>
                </a>

                {/* Store Directions Button */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 font-heading font-semibold text-xs flex items-center justify-center gap-2 transition hover:bg-stone-50"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#7C1818]" />
                  <span>Get Directions • Madhuranagar Counter</span>
                </a>
              </div>

              {/* Close Sheet Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-heading font-bold text-stone-500 hover:text-stone-800 cursor-pointer transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </>
      )}

      {/* Customer Orders Tracking Modal */}
      <MyOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        customerPhone={profile?.phone || user?.phone || ''}
        customerEmail={profile?.email || user?.email || ''}
        customerName={profile?.fullName || ''}
      />
    </header>
  );
}
