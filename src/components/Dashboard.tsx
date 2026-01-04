import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useEntries } from '@/hooks/useEntries';
import { useAllStats } from '@/hooks/useStats';
import { EntryCard } from './EntryCard';
import { formatCurrency } from '@/utils/calculations';
import { GlassCard } from './UI/GlassCard';
import { SpendingTrend } from './Charts/SpendingTrend';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

/**
 * Main application dashboard.
 * Displays total monthly spending, a recent spending trend chart, and the 5 most recent entries.
 */
export function Dashboard() {
    const { user } = useAuth();
    const { entries, loading, deleteEntry } = useEntries();
    const { monthly, loading: statsLoading } = useAllStats();
    const navigate = useNavigate();

    const handleEdit = (id: string) => navigate(`/edit/${id}`);
    const handleDelete = (id: string) => deleteEntry(id);

    const recentEntries = entries.slice(0, 5);

    // Prepare chart data (last 30 days usually, but passing all for now to let chart slice)
    const chartData = entries
        .map(e => ({ date: e.date, amount: e.total_amount }))
        .slice(0, 30);

    return (
        <div className="relative min-h-screen pb-32 text-foreground overflow-x-hidden">

            <motion.div
                className="relative z-10 max-w-2xl mx-auto space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header / Hero */}
                <div className="flex justify-between items-start pt-6 px-2">
                    <div className="space-y-1">
                        <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</h1>
                        <div className="text-5xl sm:text-6xl font-bold tracking-tighter text-foreground tabular-nums">
                            {statsLoading ? '...' : formatCurrency(monthly.periodStats.totalSpent)}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                            This Month
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-1 rounded-full hover:bg-muted transition-all active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </button>
                </div>

                {/* Chart Section */}
                <motion.div variants={itemVariants}>
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-foreground tracking-tight">Spending Trend</h2>
                        </div>
                        <div className="h-[200px] w-full">
                            <SpendingTrend data={chartData} />
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
                        {entries.length > 5 && (
                            <button
                                onClick={() => navigate('/history')}
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Show All
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : recentEntries.length === 0 ? (
                        <GlassCard className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
                                🍽️
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">No entries yet</h3>
                                <p className="text-muted-foreground text-sm">Start tracking your Mandi expenses</p>
                            </div>
                            <button
                                onClick={() => navigate('/add')}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 mt-2"
                            >
                                Add First Meal
                            </button>
                        </GlassCard>
                    ) : (
                        <div className="space-y-3 pb-4">
                            {recentEntries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <EntryCard
                                        entry={entry}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
