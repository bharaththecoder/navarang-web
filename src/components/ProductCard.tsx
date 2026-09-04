'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, CutOption } from '@/types';
import { useCart } from '@/context/CartContext';
import { Check, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(product.availableWeights[0]);
  const [selectedCut, setSelectedCut] = useState<CutOption>(product.cuts[0]);
  const [skinPreference, setSkinPreference] = useState<'with-skin' | 'skinless'>('skinless');
  const [isAdded, setIsAdded] = useState(false);

  const unitPricePerKg = product.basePricePerKg + (selectedCut.priceModifier || 0);
  const calculatedPrice = Math.round(unitPricePerKg * selectedWeight.weightKg);

  const handleAdd = () => {
    addToCart(
      product,
      selectedWeight.weightKg,
      selectedWeight.label,
      selectedCut,
      product.hasSkinOption ? skinPreference : undefined
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="bg-[#FAF8F5] rounded-3xl border border-stone-200/90 overflow-hidden shadow-culinary shadow-culinary-hover flex flex-col justify-between group transition-all duration-300">
      
      <div>
        {/* Product Image + Floating Price Pill (From Mockup) */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-104 transition-transform duration-500"
          />

          {/* Floating Price Pill (Top/Bottom corner badge matching mockup) */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#1F1A17]/90 text-white backdrop-blur-md shadow-md">
            <span className="text-xs font-bold text-stone-300 mr-1">₹</span>
            <span className="font-heading font-black text-sm tracking-tight text-white">
              {calculatedPrice}
            </span>
          </div>

          {/* Halal Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 text-[#1F1A17] text-[10px] font-heading font-black border border-stone-200 shadow-xs">
            100% Halal
          </div>

          {product.badge && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#7C1818] text-white text-[10px] font-heading font-bold shadow-xs">
              {product.badge}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Title and Telugu name */}
          <div>
            <h3 className="font-heading font-black text-lg text-[#1F1A17] tracking-tight group-hover:text-[#7C1818] transition-colors">
              {product.name}
            </h3>
            {product.teluguName && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {product.teluguName}
              </p>
            )}
            <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Weight Chips Selector (250g, 500g, 1kg) - Exact Mockup Style */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-heading font-bold text-stone-700">
              <span>Select Weight</span>
              <span className="text-stone-500 text-[11px] font-medium">₹{unitPricePerKg}/kg</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.availableWeights.map((w) => {
                const isSelected = selectedWeight.label === w.label;
                return (
                  <button
                    key={w.label}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Option Toggle (For Chicken cuts) */}
          {product.hasSkinOption && (
            <div className="space-y-1.5">
              <div className="text-xs font-heading font-bold text-stone-700">
                Skin Preference
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSkinPreference('skinless')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-heading font-bold transition cursor-pointer ${
                    skinPreference === 'skinless'
                      ? 'bg-[#7C1818] text-white shadow-xs'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Skinless
                </button>
                <button
                  type="button"
                  onClick={() => setSkinPreference('with-skin')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-heading font-bold transition cursor-pointer ${
                    skinPreference === 'with-skin'
                      ? 'bg-[#7C1818] text-white shadow-xs'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  With Skin
                </button>
              </div>
            </div>
          )}

          {/* Cut Option Selector Pills */}
          <div className="space-y-1.5">
            <div className="text-xs font-heading font-bold text-stone-700">
              Cut Style
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.cuts.map((cut) => {
                const isSelected = selectedCut.id === cut.id;
                return (
                  <button
                    key={cut.id}
                    type="button"
                    onClick={() => setSelectedCut(cut)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {cut.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Card Action Button (Full width deep wine red from mockup) */}
      <div className="p-5 sm:p-6 pt-0">
        <button
          type="button"
          onClick={handleAdd}
          className={`w-full py-3.5 rounded-2xl font-heading font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
            isAdded
              ? 'bg-emerald-700 text-white'
              : 'bg-[#7C1818] hover:bg-[#661212] text-white'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Basket</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              <span>Add to Basket • ₹{calculatedPrice}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
