import { useState, useRef, useEffect } from 'react';
import type { EntryCardProps } from '@/types';
import { formatRelativeTime } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/calculations';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleEdit = () => {
        setIsMenuOpen(false);
        onEdit(entry.id);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);
        // Simple confirmation for now, can be upgraded to custom UI later
        if (window.confirm('Are you sure you want to delete this entry?')) {
            onDelete(entry.id);
        }
    };

    return (
        <motion.div
            layout
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ zIndex: isMenuOpen ? 50 : 0 }} // Fix for dropdown stacking context
            className={clsx(
                "relative bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col gap-2 group",
                isMenuOpen ? "z-50" : "z-0"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-foreground text-lg leading-tight truncate">{entry.location}</h3>
                    <span className="text-xs font-medium text-muted-foreground block mt-1">{formatRelativeTime(entry.date)}</span>
                </div>

                <div className="flex items-start gap-1 pl-2">
                    <span className="text-xl font-bold text-primary whitespace-nowrap">{formatCurrency(entry.total_amount)}</span>

                    {/* Kebab Menu Button */}
                    <div className="relative -mt-1 -mr-2" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 0, originX: 1, originY: 0 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.1 }}
                                    className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                                >
                                    <button
                                        onClick={handleEdit}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 flex items-center gap-2 active:bg-muted"
                                    >
                                        <span>✏️</span> Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 active:bg-destructive/20 border-t border-border/50"
                                    >
                                        <span>🗑️</span> Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/50">
                    <span className="opacity-70">👥</span>
                    <span className="font-semibold">{entry.number_of_people}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/50">
                    <span className="opacity-70">💰</span>
                    <span className="font-semibold">{formatCurrency(entry.per_person_cost)} / person</span>
                </div>
            </div>

            {entry.notes && (
                <div className="text-xs text-muted-foreground/80 italic border-l-2 border-primary/20 pl-3 py-0.5 mt-2 line-clamp-2">
                    {entry.notes}
                </div>
            )}
        </motion.div>
    );
}
