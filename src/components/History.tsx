import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntries } from '@/hooks/useEntries';
import { EntryCard } from './EntryCard';
import { GlassCard } from './UI/GlassCard';
import clsx from 'clsx';

/**
 * Historical entries view.
 * Allows users to browse, search, and filter all past meal entries.
 */
export function History() {
    const { entries, loading, deleteEntry } = useEntries();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

    const [isReady, setIsReady] = useState(entries.length > 0);

    useEffect(() => {
        if (entries.length > 0) {
            setIsReady(true);
            return;
        }
        const timer = setTimeout(() => setIsReady(true), 350);
        return () => clearTimeout(timer);
    }, [entries.length]);

    const filteredEntries = useMemo(() => {
        let result = entries;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (entry) =>
                    entry.location.toLowerCase().includes(term) ||
                    entry.notes?.toLowerCase().includes(term)
            );
        }
        if (dateFilter !== 'all') {
            const now = new Date();
            const startDate = new Date();
            switch (dateFilter) {
                case 'week': startDate.setDate(now.getDate() - 7); break;
                case 'month': startDate.setMonth(now.getMonth() - 1); break;
                case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
            }
            result = result.filter((entry) => new Date(entry.date) >= startDate);
        }
        return result;
    }, [entries, searchTerm, dateFilter]);

    const handleEdit = (id: string) => navigate(`/edit/${id}`);
    const handleDelete = async (id: string) => await deleteEntry(id);

    return (
        <div className="relative min-h-screen pb-32 text-foreground overflow-x-hidden">

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        History
                    </h1>
                </header>

                <div className="space-y-4">
                    <GlassCard className="flex items-center px-4 py-3">
                        <span className="text-lg mr-2 opacity-50">🔍</span>
                        <input
                            type="text"
                            placeholder="Search locations or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-foreground placeholder-muted-foreground"
                        />
                    </GlassCard>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {(['all', 'week', 'month', 'year'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setDateFilter(filter)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                                    dateFilter === filter
                                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                                        : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                )}
                            >
                                {filter === 'all' ? 'All Time' : `Past ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                            </button>
                        ))}
                    </div>
                </div>

                {!isReady ? (
                    <div className="space-y-3 opacity-60 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-muted/20 rounded-2xl" />
                        ))}
                    </div>
                ) : loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <span className="text-4xl mb-4 opacity-50">🔍</span>
                        <p>No entries found</p>
                    </div>
                ) : (
                    <motion.div
                        className="space-y-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredEntries.map((entry) => (
                                <motion.div
                                    key={entry.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <EntryCard
                                        entry={entry}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
