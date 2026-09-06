'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { INITIAL_PRODUCTS } from '@/types';
import { getStoreProducts, subscribeToStoreProducts, fetchProductsFromDb } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, Clock, Truck, Award, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const products = useSyncExternalStore(
    subscribeToStoreProducts,
    getStoreProducts,
    () => INITIAL_PRODUCTS
  );

  // Sync latest products from Supabase on mount and listen to realtime price changes
  React.useEffect(() => {
    fetchProductsFromDb();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('realtime_store_settings_home')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_settings', filter: 'id=eq.products' },
          () => {
            fetchProductsFromDb();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { itemCount, grandTotal, setIsCartOpen } = useCart();

  const chickenProducts = products.filter((p) => p.category === 'chicken');
  const muttonProducts = products.filter((p) => p.category === 'mutton');

  const categoryTabs = [
    { id: 'all', label: 'All Fresh Meat' },
    { id: 'chicken', label: 'Farm Fresh Chicken' },
    { id: 'mutton', label: 'Tender Goat Mutton' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1F1A17] flex flex-col font-sans">
      <Header />
      
      <Hero />

      {/* Trust & Quality Bar */}
      <section className="bg-[#FAF8F5] border-y border-stone-200/80 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            
            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs sm:text-sm text-stone-900 leading-snug">100% Halal Cuts</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Strict hygienic slaughter</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs sm:text-sm text-stone-900 leading-snug">Never Frozen</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Live cut upon order</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs sm:text-sm text-stone-900 leading-snug">30–45 Mins Express</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Direct Vijayawada delivery</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-200/80 text-stone-800 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-xs sm:text-sm text-stone-900 leading-snug">Direct Zero-Fee UPI</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Google Pay, PhonePe, or Cash</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Meat Cuts Showcase Section */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-16 w-full space-y-8 sm:space-y-12">
        
        {/* Section Heading & Streamlined Category Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 border-b border-stone-300/70 pb-5 sm:pb-6">
          <div>
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#7C1818]">
              Daily Fresh Counter
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#1F1A17] mt-1">
              Select Your Meat &amp; Custom Cuts
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Choose your exact weight and custom cut styles directly on each card below
            </p>
          </div>

          {/* Clean "Choose From" Category Switcher with Horizontal Scroll on Mobile */}
          <div className="w-full sm:w-auto flex items-center gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 shadow-2xs overflow-x-auto no-scrollbar touch-pan-x">
            <div className="flex items-center gap-1 pl-2.5 sm:pl-3 pr-1.5 py-1 text-stone-500 font-heading font-bold text-xs uppercase tracking-wider shrink-0">
              <span>Filter</span>
              <span className="text-stone-300">:</span>
            </div>
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-[#7C1818] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Farm Fresh Chicken */}
        {(selectedCategory === 'all' || selectedCategory === 'chicken') && (
          <div id="chicken-section" className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#7C1818]" />
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#1F1A17]">
                  Farm Fresh Chicken
                </h3>
              </div>
              <span className="text-xs font-medium text-stone-500">Live morning slaughter • Cleaned &amp; Washed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {chickenProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Tender Goat Mutton */}
        {(selectedCategory === 'all' || selectedCategory === 'mutton') && (
          <div id="mutton-section" className="space-y-6 pt-6 border-t border-stone-300/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#7C1818]" />
                <h3 className="font-heading font-black text-xl sm:text-2xl text-[#1F1A17]">
                  Tender Goat Mutton
                </h3>
              </div>
              <span className="text-xs font-medium text-stone-500">100% Tender Local Andhra Goat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {muttonProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* The Madhuranagar Standard */}
        <section className="mt-16 bg-[#FAF8F5] rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-culinary">
          <div className="max-w-2xl">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#7C1818]">
              The Madhuranagar Butcher Standard
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-1.5">
              Why Vijayawada Families Trust Navarang
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Meat shouldn&apos;t sit in cold supermarket display cabinets for days. At Navarang, our butchers clean and cut live farm chicken and tender goat mutton immediately upon receiving your order, wash it thoroughly with clean water, wrap it securely in leak-proof food-grade packaging, and deliver straight to your kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <div className="font-heading font-black text-[#7C1818] text-lg">01. Pick Cut &amp; Weight</div>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Whether you need mutton chops for fry or boneless chicken cubes for 65, choose your exact recipe cut style.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <div className="font-heading font-black text-[#7C1818] text-lg">02. Pay via UPI or Cash</div>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Instant zero-fee UPI transfer through Google Pay, PhonePe, or pay cash on delivery at your doorstep.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <div className="font-heading font-black text-[#7C1818] text-lg">03. 30–45 Min Express</div>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Direct doorstep delivery in Madhuranagar, Moghalrajpuram, Benz Circle, and surrounding Vijayawada areas.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Mobile Cart Bar (Zomato/Licious-Grade Ergonomics) */}
      {mounted && itemCount > 0 && (
        <div className="sm:hidden fixed bottom-3 inset-x-3 z-40 bg-[#1F1A17]/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700/80 flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200">
          <div 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-xl bg-[#7C1818] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-sm">🍗</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <div>
              <div className="text-[11px] text-stone-300 font-medium leading-tight">
                {itemCount} {itemCount === 1 ? 'Cut' : 'Cuts'} Selected
              </div>
              <div className="text-base font-heading font-black text-amber-300 leading-tight">
                ₹{grandTotal}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs shadow-md active:scale-95 transition cursor-pointer"
          >
            <span>View Basket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <CartDrawer />
      <Footer />
    </div>
  );
}
