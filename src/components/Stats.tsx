import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStats } from '@/hooks/useStats';
import type { TimePeriod } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { InsightCard } from './UI/InsightCard';
import { LocationDistribution } from './Charts/LocationDistribution';

import clsx from 'clsx';


/**
 * Analytics page component.
 * Provides detailed breakdowns of spending by time period and location.
 * Features a high-visibility hero card for total spending and distribution charts.
 */
export function Stats() {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
    const { periodStats, locationStats, loading } = useStats(selectedPeriod);


    const periods: { key: TimePeriod; label: string }[] = [
        { key: 'weekly', label: 'Week' },
        { key: 'monthly', label: 'Month' },
        { key: 'yearly', label: 'Year' },
    ];

    // Format data for chart
    const pieData = locationStats.map(stat => ({
        name: stat.location,
        value: stat.totalSpent
    })).slice(0, 5); // Start with fewer for cleaner UI

    // Placeholder trend data (since useStats doesn't return time series yet, 
    // we would typically fetch this from a hook, but for now we might leave it empty or mock it if needed 
    // for the 'Spending Trend' card. Wait! existing Dashboard had it. Let's see if we can get it or just omit for now)
    // Actually, let's grab the raw data from context? No, strictly stick to props.
    // For this redesign, I'll focus on the layout using available data. 
    // Future: Add 'trendData' to useStats.

    return (
        <div className="relative min-h-screen pb-32 text-foreground overflow-x-hidden">

            {/* Header Section */}
            <div className="px-6 py-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Analytics</h1>
                    <p className="text-muted-foreground font-medium">Overview of your expenses</p>
                </div>

                {/* Segmented Control */}
                <div className="bg-muted p-1.5 rounded-2xl flex w-full md:w-auto min-w-[240px]">
                    {periods.map(({ key, label }) => {
                        const isSelected = selectedPeriod === key;
                        return (
                            <motion.button
                                key={key}
                                type="button"
                                onTap={() => setSelectedPeriod(key)}
                                whileTap={{ scale: 0.95 }}
                                className={clsx(
                                    "flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative touch-manipulation select-none outline-none",
                                    isSelected ? "text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground/70"
                                )}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="period-bg"
                                        className="absolute inset-0 bg-background rounded-xl shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="px-6 pb-20 space-y-6">
                    {/* Hero Card */}
                    <div className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl shadow-blue-500/20 group">
                        {/* Vibrant Mesh Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 opacity-90 transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none mix-blend-overlay" />

                        <div className="relative z-10 text-white">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={selectedPeriod}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                >
                                    <div className="flex items-center gap-2 text-white/70 font-medium mb-2 uppercase tracking-wider text-xs">
                                        <span>Total Spent</span>
                                        <span>•</span>
                                        <span>{periods.find(p => p.key === selectedPeriod)?.label}</span>
                                    </div>
                                    <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter drop-shadow-sm">
                                        {formatCurrency(periodStats.totalSpent)}
                                    </h2>
                                    <div className="mt-4 flex items-center gap-2 text-white/90 font-medium">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                                            {periodStats.totalCount} meals
                                        </span>
                                        <span className="text-sm opacity-80">
                                            ~ {formatCurrency(periodStats.averagePerMeal)} / meal
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Average Group Size */}
                        <InsightCard title="Social" icon="👥" className="min-h-[160px]">
                            <div className="mt-auto">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">
                                        {periodStats.averageGroupSize.toFixed(1)}
                                    </span>
                                    <span className="text-muted-foreground font-medium">people</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Average group size per visiting</p>
                            </div>
                        </InsightCard>

                        {/* Top Location */}
                        {locationStats.length > 0 && (
                            <InsightCard title="Favorite Spot" icon="❤️" className="min-h-[160px] relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />
                                <div className="mt-auto">
                                    <h3 className="text-2xl font-bold text-foreground truncate max-w-full">
                                        {locationStats[0].location}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                        <span>{locationStats[0].visitCount} visits</span>
                                        <span>•</span>
                                        <span>{formatCurrency(locationStats[0].totalSpent)}</span>
                                    </div>
                                </div>
                            </InsightCard>
                        )}
                    </div>

                    {/* Detailed Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Spots List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-lg font-bold text-foreground px-1">Top Locations</h3>
                            <div className="space-y-3">
                                {locationStats.slice(0, 5).map((loc, i) => (
                                    <motion.div
                                        key={loc.location}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-card hover:bg-muted/50 transition-colors border border-border p-4 rounded-2xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                                                i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                    i === 1 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" :
                                                        i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                                                            "bg-muted text-muted-foreground"
                                            )}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-sm sm:text-base">{loc.location}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span>{loc.visitCount} visits</span>
                                                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/50" style={{ width: `${loc.percentage}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-mono font-bold text-foreground">{formatCurrency(loc.totalSpent)}</span>
                                    </motion.div>
                                ))}
                                {locationStats.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                                        No location data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-foreground px-1">Distribution</h3>
                            {locationStats.length > 0 ? (
                                <div className="w-full flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-full md:w-1/2 h-[220px]">
                                        <LocationDistribution data={pieData} />
                                    </div>
                                    {/* Detailed Legend */}
                                    <div className="w-full md:w-1/2 space-y-3">
                                        {pieData.map((entry, index) => {
                                            const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
                                            const percentage = ((entry.value / total) * 100).toFixed(1);
                                            return (
                                                <div key={entry.name} className="flex items-center justify-between text-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="w-3 h-3 rounded-full shadow-sm"
                                                            style={{ backgroundColor: ['#7000FF', '#00C2FF', '#FF0080', '#FFD700', '#00E676', '#FF9100'][index % 6] }}
                                                        />
                                                        <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                                                            {entry.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                                                        <span className="font-mono font-medium text-foreground">{formatCurrency(entry.value)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No data to display</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
