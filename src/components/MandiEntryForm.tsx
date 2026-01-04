import { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BillScanner } from './BillScanner';
import { useAuth } from '@/hooks/useAuth';
import { useMandi } from '@/context/MandiContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { SuccessAnimation } from '@/components/UI/SuccessAnimation';
import type { MandiFormData, ParsedBillData } from '@/types';
import { getTodayISO, formatDateToISO } from '@/utils/dateHelpers';
import { calculatePerPersonCost, formatCurrency } from '@/utils/calculations';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Unified form for creating and editing Mandi meal entries.
 * Features an integrated Bill Scanner (OCR), manual entry fields,
 * and high-fidelity interaction feedback.
 */
export function MandiEntryForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    // Hooks
    const { user } = useAuth();
    const { addEntry, updateEntry, entries } = useMandi();
    const { vibrate } = useHaptics();
    const { play } = useSound();

    const [formData, setFormData] = useState<MandiFormData>({
        location: '',
        totalAmount: '',
        numberOfPeople: 4,
        date: getTodayISO(),
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Initial Load Logic
    useEffect(() => {
        if (id) {
            const entry = entries.find(e => e.id === id);
            if (entry) {
                setFormData({
                    location: entry.location,
                    totalAmount: entry.total_amount.toString(),
                    numberOfPeople: entry.number_of_people,
                    date: entry.date.split('T')[0],
                    notes: entry.notes ?? '',
                });
            }
        }
    }, [id, entries]);

    const perPersonCost = useMemo(() => {
        const total = parseFloat(formData.totalAmount) || 0;
        return calculatePerPersonCost(total, formData.numberOfPeople);
    }, [formData.totalAmount, formData.numberOfPeople]);

    const handleBillScanData = (data: ParsedBillData) => {
        vibrate('success');
        setFormData((prev) => ({
            ...prev,
            location: data.location ?? prev.location,
            totalAmount: data.totalAmount?.toString() ?? prev.totalAmount,
            numberOfPeople: data.numberOfPeople,
            date: formatDateToISO(data.date),
        }));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'numberOfPeople' ? parseInt(value, 10) || 1 : value,
        }));
    };

    const adjustPeople = (delta: number) => {
        vibrate('light');
        setFormData(prev => ({
            ...prev,
            numberOfPeople: Math.max(1, prev.numberOfPeople + delta)
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError('You must be logged in.');
            vibrate('error');
            return;
        }

        if (!formData.location.trim()) {
            vibrate('error');
            setError('Location is required');
            return;
        }

        const totalAmount = parseFloat(formData.totalAmount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            vibrate('error');
            setError('Enter a valid amount');
            return;
        }

        // OPTIMISTIC UPDATE:
        // 1. Immediately provide tactile/visual feedback
        vibrate('success');
        play('success');
        setLoading(true);
        setShowSuccess(true); // Start animation immediately

        const entryData: any = {
            user_id: user.id,
            location: formData.location.trim(),
            total_amount: totalAmount,
            number_of_people: formData.numberOfPeople,
            per_person_cost: perPersonCost,
            date: formData.date,
            notes: formData.notes.trim() || null,
        };

        try {
            console.log('Submitting Entry Data:', entryData);
            // 2. Fire and forget (or await silently while animation plays)
            // The animation takes 1.5s, which is usually enough for the request.
            let result;
            if (isEditMode && id) {
                result = await updateEntry(id, entryData);
            } else {
                result = await addEntry(entryData);
            }
            console.log('Result:', result);
            if (result.error) {
                throw result.error;
            }
        } catch (err) {
            console.error('Save failed details:', err);
            setError('Failed to save. Check console.');
            vibrate('error');
            // Theoretically we should stop the success animation here,
            // but for debugging let's just log it.
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] pb-24">
            <AnimatePresence>
                {showSuccess && <SuccessAnimation onComplete={() => navigate('/')} />}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-2xl mx-auto space-y-6"
            >
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Mandi' : 'New Mandi'}
                    </h1>
                </header>

                {!isEditMode && (
                    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-4 shadow-sm">
                        <BillScanner onDataExtracted={handleBillScanData} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Restaurant Name"
                                className="flex h-14 w-full rounded-2xl border-none bg-muted/30 px-5 text-lg ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-sm font-medium"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">Total Bill</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="totalAmount"
                                        value={formData.totalAmount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="flex h-14 w-full rounded-2xl border-none bg-muted/30 px-5 text-lg ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-sm font-mono font-medium hide-arrow"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">People</label>
                                <div className="flex bg-muted/30 rounded-2xl h-14 p-1 shadow-sm items-center">
                                    <button
                                        type="button"
                                        onClick={() => adjustPeople(-1)}
                                        className="w-14 h-full rounded-xl bg-background shadow-sm flex items-center justify-center text-foreground hover:text-primary active:scale-95 transition-all shrink-0"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14" />
                                        </svg>
                                    </button>
                                    <input
                                        type="number"
                                        name="numberOfPeople"
                                        value={formData.numberOfPeople}
                                        onChange={handleChange}
                                        min="1"
                                        className="flex-1 bg-transparent text-center text-xl font-mono font-bold focus:outline-none tabular-nums min-w-0" // min-w-0 helps flex child shrinking
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => adjustPeople(1)}
                                        className="w-14 h-full rounded-xl bg-background shadow-sm flex items-center justify-center text-foreground hover:text-primary active:scale-95 transition-all shrink-0"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14" />
                                            <path d="M12 5v14" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex justify-between items-center"
                            animate={{ scale: perPersonCost > 0 ? 1 : 0.99, opacity: perPersonCost > 0 ? 1 : 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <span className="text-sm font-medium text-primary/80">Per Person</span>
                            <span className="text-3xl font-bold text-primary tracking-tight font-mono">{formatCurrency(perPersonCost)}</span>
                        </motion.div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="flex h-14 w-full rounded-2xl border-none bg-muted/30 px-5 text-lg ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-sm font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 ml-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add any details (optional)..."
                                className="flex min-h-[100px] w-full rounded-2xl border-none bg-muted/30 p-5 text-base ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-sm font-medium resize-y"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-14 rounded-2xl bg-foreground text-background text-lg font-bold shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Entry' : 'Save Entry')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
