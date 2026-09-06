'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Google sign-in failed. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FDFCFB] rounded-t-3xl sm:rounded-3xl border-t sm:border border-stone-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden pb-safe animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto -mt-2 mb-4 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7C1818]/10 text-[#7C1818] mb-1">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
            Customer Sign In
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Sign in with your Google account to auto-fill your Vijayawada address and reorder with ease.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Google 1-Tap Action */}
        <div className="space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-heading font-bold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-3 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#7C1818]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-stone-400">
            100% Free • No passwords • Fast and secure
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-center gap-2 text-[11px] text-stone-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted and verified directly via Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
