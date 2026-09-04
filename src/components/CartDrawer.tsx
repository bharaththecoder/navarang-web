'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { VIJAYAWADA_AREAS, Order } from '@/types';
import { saveOrder } from '@/lib/store';
import PaymentModal from './PaymentModal';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    clearCart,
    cartTotal,
    deliveryFee,
    grandTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const { profile, isAuthenticated, setIsAuthModalOpen } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(profile?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone ? profile.phone.replace('+91', '') : '');
  const [area, setArea] = useState(profile?.area || VIJAYAWADA_AREAS[0]);
  const [address, setAddress] = useState(profile?.address || '');
  const [landmark, setLandmark] = useState(profile?.landmark || '');
  const [deliverySlot, setDeliverySlot] = useState<Order['deliverySlot']>('Express (30-45 mins)');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Active Order & Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your delivery street / house address');
      return;
    }

    setErrorMsg('');

    const newOrder: Order = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
      area,
      deliverySlot,
      items,
      itemTotal: cartTotal,
      deliveryFee,
      discount: 0,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' ? 'Pending' : 'Pending at Delivery',
      orderStatus: 'New',
      specialInstructions: specialInstructions.trim(),
    };

    saveOrder(newOrder);
    setActiveOrder(newOrder);
    clearCart();
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      {/* Centered Modal Overlay: Center aligned for clean focus on both desktop and mobile */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsCartOpen(false);
        }}
      >
        <div className="relative w-full max-w-xl my-auto bg-[#FAF8F5] text-[#1F1A17] rounded-3xl sm:rounded-4xl shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200/90 flex items-center justify-between bg-[#FDFCFB] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg sm:text-xl text-stone-900 leading-none">
                  Your Meat Basket &amp; Details
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {items.length} {items.length === 1 ? 'cut selected' : 'cuts selected'} • Express 30–45 min delivery
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Items & Customer Details Form */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-stone-900 text-base">Your basket is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Select farm-fresh chicken or tender goat mutton to begin.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 rounded-full bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Explore Today&apos;s Cuts
                </button>
              </div>
            ) : (
              <>
                {/* Selected Meat Cuts List */}
                <div className="space-y-3">
                  <div className="text-xs font-heading font-bold text-stone-500 uppercase tracking-wider">
                    Selected Cuts
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {items.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs flex gap-3.5 relative items-center"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="text-xs sm:text-sm font-heading font-bold text-stone-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-xs font-bold text-[#7C1818] mt-0.5">
                            {item.cut.name}
                          </p>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {item.skinPreference ? `${item.skinPreference} • ` : ''}
                            <span className="font-bold text-stone-800">Weight: {item.weightLabel}</span>
                          </div>
                          <div className="text-sm font-heading font-black text-stone-900 mt-1">
                            ₹{item.totalPrice}
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="absolute top-3 right-3 text-stone-400 hover:text-red-600 p-1.5 transition cursor-pointer rounded-full hover:bg-stone-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign-In Helper Banner */}
                {!isAuthenticated && (
                  <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div>
                      <span className="font-heading font-bold text-stone-900 block">Sign In for Fast Checkout</span>
                      <span className="text-[11px] text-stone-500">Auto-fill delivery address via Google or Mobile Number</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-[#7C1818] text-white font-heading font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* Delivery Information Form */}
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-stone-200/80">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-stone-900">
                    <Truck className="w-4 h-4 text-[#7C1818]" />
                    <span>Delivery Address in Vijayawada</span>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-heading font-bold text-stone-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Varma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-heading font-bold text-stone-700">Mobile / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-heading font-bold text-stone-700">Select Vijayawada Locality *</label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                    >
                      {VIJAYAWADA_AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-heading font-bold text-stone-700">Door / Apartment &amp; Street Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Door No / Apartment Name, Road No, Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-heading font-bold text-stone-700">Nearby Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Rythu Bazar / Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-heading font-bold text-stone-700">Delivery Slot</label>
                      <select
                        value={deliverySlot}
                        onChange={(e) => setDeliverySlot(e.target.value as Order['deliverySlot'])}
                        className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                      >
                        <option value="Express (30-45 mins)">Express Delivery (30-45 mins)</option>
                        <option value="Morning (7:00 AM - 9:00 AM)">Morning Slot (7:00 AM - 9:00 AM)</option>
                        <option value="Afternoon (11:00 AM - 1:00 PM)">Lunch Slot (11:00 AM - 1:00 PM)</option>
                        <option value="Evening (5:00 PM - 7:30 PM)">Evening Slot (5:00 PM - 7:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-heading font-bold text-stone-700">Payment Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-3 rounded-2xl border text-xs text-left transition cursor-pointer ${
                          paymentMethod === 'UPI'
                            ? 'bg-[#7C1818]/10 border-[#7C1818] text-[#7C1818] font-bold'
                            : 'bg-white border-stone-200 text-stone-700'
                        }`}
                      >
                        <div className="font-heading font-bold">Direct UPI</div>
                        <div className="text-[10px] text-stone-500 font-normal mt-0.5">Google Pay / PhonePe</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3 rounded-2xl border text-xs text-left transition cursor-pointer ${
                          paymentMethod === 'COD'
                            ? 'bg-[#7C1818]/10 border-[#7C1818] text-[#7C1818] font-bold'
                            : 'bg-white border-stone-200 text-stone-700'
                        }`}
                      >
                        <div className="font-heading font-bold">Cash on Delivery</div>
                        <div className="text-[10px] text-stone-500 font-normal mt-0.5">Pay at Doorstep</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-heading font-bold text-stone-700">Butcher Cutting Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Cut medium pieces, wash twice"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs font-medium"
                    />
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Bottom Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3 shrink-0">
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Meat Total</span>
                  <span className="font-bold text-stone-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-emerald-700">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-heading font-black text-stone-900 pt-1.5 border-t border-stone-100">
                  <span>Total Payable</span>
                  <span className="text-[#7C1818] text-xl">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 px-4 rounded-full font-heading font-bold text-sm bg-[#7C1818] hover:bg-[#661212] text-white shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <span>{paymentMethod === 'UPI' ? 'Proceed to Instant UPI Payment' : 'Confirm Cash on Delivery Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Payment Modal */}
      {activeOrder && (
        <PaymentModal
          order={activeOrder}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setIsCartOpen(false);
          }}
          onPaymentConfirmed={(utr) => {
            const updated = {
              ...activeOrder,
              paymentStatus: 'Paid via UPI' as const,
              upiRefNumber: utr,
            };
            saveOrder(updated);
            setActiveOrder(updated);
          }}
        />
      )}
    </>
  );
}
