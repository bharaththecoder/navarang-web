'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Phone, ShieldCheck, ArrowRight, Check, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    const res = await sendOtp(clean);
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setSuccessMsg(`OTP sent to +91 ${clean}`);
    } else {
      setError(res.error || 'Failed to send OTP. Please retry.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError('');
    setLoading(true);

    const res = await verifyOtp(phone, otp);
    setLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setStep('phone');
      setPhone('');
      setOtp('');
    } else {
      setError(res.error || 'Invalid OTP code. Please check and retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FDFCFB] rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7C1818]/10 text-[#7C1818] mb-1">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
            {step === 'phone' ? 'Customer Sign In' : 'Enter Verification Code'}
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {step === 'phone'
              ? 'Enter your phone number to track orders and save your delivery address.'
              : `Enter the 6-digit code sent to +91 ${phone}`}
          </p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
        {successMsg && step === 'otp' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* Step 1: Phone Input Form */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-stone-500 border-r border-stone-200 pr-2.5">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  autoFocus
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-bold text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-[#7C1818]/20 focus:border-[#7C1818] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3.5 rounded-xl bg-[#7C1818] hover:bg-[#661212] disabled:opacity-50 text-white font-heading font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Get One-Time Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full text-center tracking-widest text-xl font-black py-3 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C1818]/20 focus:border-[#7C1818] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-xl bg-[#7C1818] hover:bg-[#661212] disabled:opacity-50 text-white font-heading font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify & Proceed</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setError('');
              }}
              className="w-full text-xs text-stone-500 hover:text-stone-800 font-medium py-1"
            >
              Change phone number
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-center gap-2 text-[11px] text-stone-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted and verified directly via Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
