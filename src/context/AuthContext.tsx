'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  phone: string;
  fullName?: string;
  address?: string;
  area?: string;
  landmark?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'navarang_customer_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { id: parsed.id, phone: parsed.phone } as unknown as User;
        }
      } catch {}
    }
    return null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadProfile = async (userId: string, phone: string) => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
      } else {
        const newProf: UserProfile = { id: userId, phone };
        await supabase.from('profiles').insert([newProf]);
        setProfile(newProf);
      }
    } catch {
      setProfile({ id: userId, phone });
    }
  };

  // Initialize Auth from Supabase
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id, session.user.phone || '');
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id, session.user.phone || '');
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: cleanPhone,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to send OTP' };
      }
    } else {
      // Simulation mode when supabase credentials are still pending
      return { success: true };
    }
  };

  const verifyOtp = async (phone: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: cleanPhone,
          token,
          type: 'sms',
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser(data.user);
          await loadProfile(data.user.id, data.user.phone || cleanPhone);
        }
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'OTP Verification failed' };
      }
    } else {
      // Simulation / Test fallback
      const mockId = 'user_' + cleanPhone.slice(-4);
      const mockProfile: UserProfile = {
        id: mockId,
        phone: cleanPhone,
        fullName: 'Madhuranagar Customer',
      };
      setProfile(mockProfile);
      setUser({ id: mockId, phone: cleanPhone } as unknown as User);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockProfile));
      return { success: true };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;
    const updated = { ...profile, ...data };
    setProfile(updated);

    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('profiles').upsert([updated]);
    } else {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user || profile),
        isAuthModalOpen,
        setIsAuthModalOpen,
        sendOtp,
        verifyOtp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
