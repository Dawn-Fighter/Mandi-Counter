import { useMemo } from 'react';
import { useMandi } from '@/context/MandiContext';
import type { TimePeriod, PeriodStats, LocationStats } from '@/types';
import { getDateRange } from '@/utils/dateHelpers';
import { calculatePeriodStats, calculateLocationStats } from '@/utils/calculations';

/**
 * Result structure for the useStats hook.
 */
interface UseStatsResult {
    /** Calculated statistics for the selected period (total spent, average, etc.). */
    periodStats: PeriodStats;
    /** Grouped statistics by location. */
    locationStats: LocationStats[];
    /** Loading status of the underlying data. */
    loading: boolean;
    /** Error message if data fetching fails. */
    error: string | null;
}

/**
 * Hook to calculate and provide statistics for a specific time period.
 * Automatically recalculates when entries change or the period is updated.
 * 
 * @param period The time period to calculate stats for ('weekly', 'monthly', 'yearly').
 */
export function useStats(period: TimePeriod): UseStatsResult {
    const { entries, loading, error } = useMandi();

    const filteredEntries = useMemo(() => {
        const { start, end } = getDateRange(period);
        // Normalize dates for accurate comparison
        const startTime = start.getTime();
        const endTime = end.getTime();

        return entries.filter(entry => {
            const entryTime = new Date(entry.date).getTime();
            return entryTime >= startTime && entryTime <= endTime;
        });
    }, [entries, period]);

    const periodStats = useMemo(() => calculatePeriodStats(filteredEntries), [filteredEntries]);
    const locationStats = useMemo(() => calculateLocationStats(filteredEntries), [filteredEntries]);

    return {
        periodStats,
        locationStats,
        loading,
        error,
    };
}

/**
 * Hook to get stats for all periods at once
 */
export function useAllStats() {
    const weekly = useStats('weekly');
    const monthly = useStats('monthly');
    const yearly = useStats('yearly');

    return {
        weekly,
        monthly,
        yearly,
        loading: weekly.loading || monthly.loading || yearly.loading,
    };
}
