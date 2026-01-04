import { useMandi } from '@/context/MandiContext';
import type { MandiEntry, MandiEntryInsert, MandiEntryUpdate } from '@/types';

/**
 * State representation for Mandi entry management.
 */
interface UseEntriesState {
    /** List of all Mandi entries. */
    entries: MandiEntry[];
    /** Loading state for entry operations. */
    loading: boolean;
    /** Error message if an operation fails. */
    error: string | null;
}

/**
 * Actions available for managing Mandi entries.
 */
interface UseEntriesActions {
    /** Refreshes the entries list from the database. */
    fetchEntries: () => Promise<void>;
    /** Adds a new Mandi entry. */
    addEntry: (data: MandiEntryInsert) => Promise<{ data: MandiEntry | null; error: Error | null }>;
    /** Updates an existing Mandi entry by ID. */
    updateEntry: (id: string, data: MandiEntryUpdate) => Promise<{ error: Error | null }>;
    /** Deletes an entry by ID. */
    deleteEntry: (id: string) => Promise<{ error: Error | null }>;
    /** Retrieves a single entry by ID from the current context. */
    getEntry: (id: string) => Promise<MandiEntry | null>;
}

/**
 * Hook to manage Mandi entries. 
 * Bridges the UI to the MandiContext for data operations.
 */
export function useEntries(): UseEntriesState & UseEntriesActions {
    const { entries, loading, error, refresh, addEntry, updateEntry, deleteEntry } = useMandi();

    // getEntry is synchronous if we already have the data in context
    const getEntry = async (id: string) => {
        const found = entries.find(e => e.id === id);
        return found || null;
    };

    return {
        entries,
        loading,
        error,
        fetchEntries: refresh,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntry
    };
}
