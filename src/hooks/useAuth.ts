import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

/**
 * Authentication state representing the current user and loading status.
 */
interface AuthState {
    user: User | null;
    loading: boolean;
}

/**
 * Authentication actions available for the application.
 */
interface AuthActions {
    /** Register a new user with email and password. */
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    /** Sign in an existing user with email and password. */
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    /** Sign out the current user. */
    signOut: () => Promise<{ error: Error | null }>;
    /** Trigger a password reset email for the given address. */
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

/**
 * Hook to manage authentication state and actions via Supabase.
 * Automatically handles session persistence and auth state change subscriptions.
 */
export function useAuth(): AuthState & AuthActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            const { error } = await supabase.auth.signOut();
            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    }, []);

    return {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
    };
}
