'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '@/types';
import { generateUpiDeepLink, generateWhatsAppOrderUrl } from '@/lib/store';
import { CheckCircle2, Copy, Smartphone, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: (utr?: string) => void;
}

export default function PaymentModal({
  order,
  isOpen,
  onClose,
  onPaymentConfirmed,
}: PaymentModalProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [step, setStep] = useState<'pay' | 'success'>('pay');

  if (!isOpen) return null;

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'navarang@upi';
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'Navarang Mutton and Chicken';
  const ownerWhatsApp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '919876543210';

  const upiDeepLink = generateUpiDeepLink({
    upiId,
    payeeName,
    amount: order.totalAmount,
    orderId: order.id,
    notes: `Navarang Order #${order.id}`,
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmDone = () => {
    onPaymentConfirmed(utrInput.trim());
    setStep('success');
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.6 },
    });
  };

  const whatsAppOrderUrl = generateWhatsAppOrderUrl(
    {
      ...order,
      upiRefNumber: utrInput || order.upiRefNumber,
      paymentStatus: 'Paid via UPI',
    },
    ownerWhatsApp
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCFB] border-t sm:border border-stone-200 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-stone-900 flex flex-col max-h-[94vh] pb-safe animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1E1E] to-[#A32222] p-4 sm:p-5 text-white text-center">
          <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full inline-block">
            Order #{order.id}
          </span>
          <h2 className="font-heading font-black text-lg sm:text-2xl mt-1.5">
            {step === 'pay' ? 'Direct UPI Payment' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            {step === 'pay'
              ? 'Zero Convenience Fee • Direct Shopkeeper Transfer'
              : 'Our butcher in Madhuranagar is preparing your fresh cuts.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5">
          {step === 'pay' ? (
            <>
              {/* Total Amount Box */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 text-center shadow-xs">
                <span className="text-xs font-heading font-bold text-stone-500 uppercase tracking-wider">
                  Total Payable Amount
                </span>
                <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-0.5">
                  ₹{order.totalAmount}
                </div>
                <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Direct to Store • Exact Amount Prefilled
                </p>
              </div>

              {/* Mobile UPI Direct App Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#8B1E1E]" />
                  <span>On Mobile? Tap to Open App Directly:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 font-heading font-bold text-xs shadow-2xs transition active:scale-95"
                  >
                    Google Pay
                  </a>
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 text-purple-900 font-heading font-bold text-xs transition active:scale-95"
                  >
                    PhonePe
                  </a>
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-sky-50 hover:bg-sky-100/70 border border-sky-200 text-sky-900 font-heading font-bold text-xs transition active:scale-95"
                  >
                    Paytm UPI
                  </a>
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-900 font-heading font-bold text-xs transition active:scale-95"
                  >
                    BHIM / Any UPI
                  </a>
                </div>
              </div>

              {/* Desktop Dynamic QR Box */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 flex flex-col items-center text-center space-y-3 shadow-xs">
                <span className="text-xs font-heading font-bold text-stone-700 uppercase tracking-wider">
                  Or Scan QR Code with Any App:
                </span>
                <div className="p-2.5 sm:p-3 bg-white rounded-xl shadow-xs border border-stone-200 inline-block">
                  <QRCodeSVG
                    value={upiDeepLink}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                {/* Copy Strip */}
                <div className="flex items-center gap-2 bg-[#F9F7F4] px-3 py-1.5 rounded-xl border border-stone-200 text-xs shadow-2xs">
                  <span className="text-stone-500 font-medium">UPI ID:</span>
                  <span className="font-mono font-bold text-stone-900">{upiId}</span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer active:scale-95"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Enter UTR / Confirm Payment */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="text-xs font-heading font-bold text-stone-700">
                  Paid? Enter 12-digit UPI Ref / UTR No. (Optional):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder="e.g. 423456789012"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-stone-900 focus:outline-none focus:border-[#8B1E1E] shadow-2xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleConfirmDone}
                  className="w-full py-3.5 px-4 rounded-xl font-heading font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Completed Payment</span>
                </button>
              </div>
            </>
          ) : (
            /* Order Placed Success View */
            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-heading font-black text-xl text-stone-900">
                  Order #{order.id} Confirmed!
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  Delivering fresh meat to <strong>{order.customerName}</strong> in {order.area}.
                </p>
              </div>

              {/* WhatsApp Notification Card */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-left space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-800 font-heading font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Send Order Slip to Store WhatsApp</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Send your order details directly to the butcher&apos;s WhatsApp for priority cutting:
                </p>
                <a
                  href={whatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs shadow-md transition"
                >
                  Send Order via WhatsApp
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-heading font-bold cursor-pointer transition"
              >
                Back to Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
