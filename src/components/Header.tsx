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
    <header className="sticky top-0 z-40 w-full pt-2.5 sm:pt-4 px-2.5 sm:px-6 lg:px-8 pointer-events-none transition-all">
      {/* Floating Island Capsule Navbar */}
      <div className="max-w-7xl mx-auto glass-capsule rounded-full shadow-culinary px-3 sm:px-6 py-2 sm:py-3 pointer-events-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Mark */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7C1818] text-[#FAF8F5] flex items-center justify-center font-heading font-black text-base sm:text-xl shadow-xs group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-black text-base sm:text-xl tracking-tight text-[#1F1A17] leading-none">
                Navarang
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7C1818]/10 text-[#7C1818] uppercase tracking-wider">
                100% Halal
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-medium leading-tight mt-0.5 hidden sm:block">
              Mutton &amp; Chicken • Madhuranagar
            </p>
          </div>
        </Link>

        {/* Center Navigation - Desktop */}
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
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Direct Phone Link (Desktop XL) */}
          <a
            href={`tel:${ownerPhone}`}
            className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-stone-700 hover:bg-stone-100/80 transition border border-stone-200/80"
          >
            <Phone className="w-3.5 h-3.5 text-[#7C1818]" />
            <span>{ownerPhone}</span>
          </a>

          {/* User Auth Profile State */}
          {mounted && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-stone-200/90 text-xs font-heading font-bold text-stone-900 border border-stone-200 transition cursor-pointer"
                aria-label="User profile options"
              >
                {profile?.avatarUrl ? (
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border border-stone-300 shrink-0">
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.fullName || 'User'}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#7C1818] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0">
                    {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="max-w-[55px] sm:max-w-[110px] truncate">
                  {profile?.firstName || profile?.fullName?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#FAF8F5] rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-3 bg-[#FDFCFB] border-b border-stone-200/70">
                    <div className="flex items-center gap-2.5">
                      {profile?.avatarUrl ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-300 shrink-0">
                          <Image
                            src={profile.avatarUrl}
                            alt={profile.fullName || 'User'}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#7C1818] text-white flex items-center justify-center text-xs font-black shrink-0">
                          {profile?.firstName ? profile.firstName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-bold text-stone-900 truncate">
                          {profile?.fullName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {profile?.email || profile?.phone || user?.email || user?.phone || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsOrdersModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-100/90 font-heading font-bold flex items-center gap-2.5 cursor-pointer transition"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span>My Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium flex items-center gap-2.5 cursor-pointer transition"
                    >
                      <span className="w-6 text-center text-red-500 font-bold">→</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-heading font-bold text-stone-700 hover:text-stone-900 border border-stone-200/90 hover:border-stone-400 bg-white/60 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Shopping Basket Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#7C1818] hover:bg-[#641212] text-white font-heading font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            aria-label="Open Shopping Basket"
          >
            <ShoppingBag className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">Basket</span>
            {mounted && itemCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 rounded-full bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-black">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-full text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-stone-950/40 backdrop-blur-xs pointer-events-auto md:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-40 md:hidden mt-2 max-w-7xl mx-auto glass-capsule rounded-3xl shadow-xl p-4 sm:p-5 pointer-events-auto space-y-3.5 animate-in slide-in-from-top-2 duration-200 border border-stone-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-stone-500">
                Fresh Cuts &amp; Menu
              </span>
              <span className="text-xs text-[#7C1818] font-bold">100% Halal Verified</span>
            </div>

            {/* Quick Meat Links */}
            <div className="grid grid-cols-2 gap-2 text-xs font-heading font-bold text-stone-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('chicken-section');
                }}
                className="p-3 text-center rounded-2xl bg-stone-100/90 hover:bg-stone-200/90 transition flex flex-col items-center gap-1"
              >
                <span className="text-lg">🍗</span>
                <span>Farm Chicken</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('mutton-section');
                }}
                className="p-3 text-center rounded-2xl bg-stone-100/90 hover:bg-stone-200/90 transition flex flex-col items-center gap-1"
              >
                <span className="text-lg">🥩</span>
                <span>Tender Mutton</span>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200/80 flex flex-col items-stretch gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('catalog');
                }}
                className="py-2.5 px-4 rounded-xl bg-white border border-stone-200 text-stone-800 font-bold hover:bg-stone-50 text-center transition"
              >
                Explore All Meat Cuts
              </button>

              {mounted && isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsOrdersModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-stone-200 text-stone-800 font-bold hover:bg-stone-50 cursor-pointer transition"
                  >
                    <Package className="w-3.5 h-3.5 text-[#7C1818]" />
                    <span>My Meat Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="py-2 px-4 rounded-xl text-red-600 hover:bg-red-50 text-center text-xs font-semibold cursor-pointer transition"
                  >
                    Sign Out ({profile?.firstName || 'Account'})
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 cursor-pointer transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sign In with Google</span>
                </button>
              )}

              <a
                href={`tel:${ownerPhone}`}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#7C1818] text-white font-bold hover:bg-[#661212] transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store: {ownerPhone}</span>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 font-medium text-center flex items-center justify-center gap-1.5 transition"
              >
                <MapPin className="w-3 h-3 text-[#7C1818]" />
                <span>Madhuranagar Counter Directions</span>
              </a>
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
