import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { MandiEntry, MandiEntryInsert, MandiEntryUpdate } from '@/types';

/**
 * Shape of the Mandi application context.
 */
interface MandiContextType {
    /** Array of all meal entries fetched from the database. */
    entries: MandiEntry[];
    /** Whether the initial data or a major operation is loading. */
    loading: boolean;
    /** Current error message, if any. */
    error: string | null;
    /** Adds a new entry to Supabase and updates the local state immediately (optimistic). */
    addEntry: (data: MandiEntryInsert) => Promise<{ data: MandiEntry | null; error: Error | null }>;
    /** Updates an existing entry in Supabase and the local state. */
    updateEntry: (id: string, data: MandiEntryUpdate) => Promise<{ error: Error | null }>;
    /** Deletes an entry from Supabase and removes it from local state immediately. */
    deleteEntry: (id: string) => Promise<{ error: Error | null }>;
    /** Manually triggers a re-fetch of all entries from the database. */
    refresh: () => Promise<void>;
}

const MandiContext = createContext<MandiContextType | undefined>(undefined);

export function MandiProvider({ children }: { children: React.ReactNode }) {
    const [entries, setEntries] = useState<MandiEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('mandi_entries')
                .select('*')
                .order('date', { ascending: false });

            if (fetchError) throw fetchError;
            setEntries(data as MandiEntry[] ?? []);
        } catch (err) {
            console.error('Error fetching entries:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch entries');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Fetch, Auth Listener & Realtime Subscription
    useEffect(() => {
        // Initial fetch
        fetchEntries();

        // Listen for Auth changes (Login/Logout)
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, _session) => {
            if (event === 'SIGNED_IN') {
                fetchEntries();
            } else if (event === 'SIGNED_OUT') {
                setEntries([]);
            }
        });

        // Realtime subscription for data changes
        const channel = supabase
            .channel('mandi_entries_unified')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'mandi_entries' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setEntries((prev) => [payload.new as MandiEntry, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setEntries((prev) =>
                            prev.map((entry) =>
                                entry.id === (payload.new as MandiEntry).id ? (payload.new as MandiEntry) : entry
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setEntries((prev) =>
                            prev.filter((entry) => entry.id !== (payload.old as MandiEntry).id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            authSubscription.unsubscribe();
        };
    }, [fetchEntries]);

    const addEntry = async (data: MandiEntryInsert) => {
        try {
            const insertData = {
                ...data,
                date: data.date ?? new Date().toISOString(),
            };

            const { data: newEntry, error } = await supabase
                .from('mandi_entries')
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;

            // IMMEDIATE LOCAL UPDATE
            if (newEntry) {
                setEntries((prev) => [newEntry as MandiEntry, ...prev]);
            }

            return { data: newEntry as MandiEntry, error: null };
        } catch (err) {
            return { data: null, error: err instanceof Error ? err : new Error('Add failed') };
        }
    };

    const updateEntry = async (id: string, data: MandiEntryUpdate) => {
        try {
            const updateData = { ...data, updated_at: new Date().toISOString() };
            const { data: updatedEntry, error } = await supabase
                .from('mandi_entries')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // IMMEDIATE LOCAL UPDATE
            if (updatedEntry) {
                setEntries((prev) =>
                    prev.map((entry) =>
                        entry.id === id ? (updatedEntry as MandiEntry) : entry
                    )
                );
            }

            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Update failed') };
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            // IMMEDIATE LOCAL UPDATE
            setEntries(prev => prev.filter(e => e.id !== id));

            const { error } = await supabase.from('mandi_entries').delete().eq('id', id);
            if (error) {
                // Revert if failed (optional, but good practice)
                // For now, let's just throw
                throw error;
            }
            return { error: null };
        } catch (err) {
            // In a real app, we would revert the state here by fetching or undoing
            console.error("Delete failed, state might be out of sync", err);
            return { error: err instanceof Error ? err : new Error('Delete failed') };
        }
    };

    return (
        <MandiContext.Provider value={{ entries, loading, error, addEntry, updateEntry, deleteEntry, refresh: fetchEntries }}>
            {children}
        </MandiContext.Provider>
    );
}

export function useMandi() {
    const context = useContext(MandiContext);
    if (context === undefined) {
        throw new Error('useMandi must be used within a MandiProvider');
    }
    return context;
}
