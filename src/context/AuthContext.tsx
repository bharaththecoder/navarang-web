'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  phone: string;
  fullName?: string;
  firstName?: string;
  avatarUrl?: string;
  email?: string;
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
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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

  const loadProfile = async (authUser: User) => {
    const userId = authUser.id;
    const meta = authUser.user_metadata || {};
    const googleName = meta.full_name || meta.name || '';
    const googleAvatar = meta.avatar_url || meta.picture || '';
    const googleEmail = authUser.email || meta.email || '';
    const googleFirstName = meta.given_name || (googleName ? googleName.split(' ')[0] : '');

    let currentProfile: UserProfile = {
      id: userId,
      phone: authUser.phone || '',
      fullName: googleName || 'Customer',
      firstName: googleFirstName || (googleName ? googleName.split(' ')[0] : 'Customer'),
      avatarUrl: googleAvatar,
      email: googleEmail,
    };

    if (supabase) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data) {
          currentProfile = {
            ...currentProfile,
            ...data,
            fullName: data.full_name || googleName || currentProfile.fullName,
            firstName: data.full_name ? data.full_name.split(' ')[0] : googleFirstName || 'Customer',
            avatarUrl: googleAvatar || data.avatar_url,
          };
        } else {
          // Upsert initial profile into Supabase
          const payload = {
            id: userId,
            phone: authUser.phone || '',
            full_name: googleName || 'Customer',
          };
          await supabase.from('profiles').insert([payload]);
        }
      } catch {
        // use derived currentProfile
      }
    }

    setProfile(currentProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(currentProfile));
    }
  };

  // Initialize Auth from Supabase
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user);
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user);
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
          await loadProfile(data.user);
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

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Google sign-in failed' };
      }
    } else {
      const mockProfile: UserProfile = {
        id: 'google_user_demo',
        phone: '+91 9876543210',
        fullName: 'Google Customer',
      };
      setProfile(mockProfile);
      setUser({ id: 'google_user_demo' } as unknown as User);
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
        signInWithGoogle,
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
