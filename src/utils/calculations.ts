import type { MandiEntry, PeriodStats, LocationStats } from '@/types';

/**
 * Calculate period statistics from entries
 */
export function calculatePeriodStats(entries: MandiEntry[]): PeriodStats {
    if (entries.length === 0) {
        return {
            totalSpent: 0,
            averagePerMeal: 0,
            totalCount: 0,
            averageGroupSize: 0,
        };
    }

    const totalSpent = entries.reduce((sum, entry) => sum + entry.per_person_cost, 0);
    const averagePerMeal = totalSpent / entries.length;
    const totalPeople = entries.reduce((sum, entry) => sum + entry.number_of_people, 0);
    const averageGroupSize = totalPeople / entries.length;

    return {
        totalSpent,
        averagePerMeal,
        totalCount: entries.length,
        averageGroupSize,
    };
}

/**
 * Calculate location-based statistics
 */
export function calculateLocationStats(entries: MandiEntry[]): LocationStats[] {
    if (entries.length === 0) return [];

    const locationMap = new Map<string, { count: number; total: number }>();

    // Aggregate by location
    for (const entry of entries) {
        const existing = locationMap.get(entry.location) ?? { count: 0, total: 0 };
        locationMap.set(entry.location, {
            count: existing.count + 1,
            total: existing.total + entry.per_person_cost,
        });
    }

    const totalSpent = entries.reduce((sum, entry) => sum + entry.per_person_cost, 0);

    // Convert to array and calculate percentages
    const stats: LocationStats[] = Array.from(locationMap.entries())
        .map(([location, data]) => ({
            location,
            visitCount: data.count,
            totalSpent: data.total,
            percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent);

    return stats;
}

/**
 * Format currency with Indian Rupee symbol
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format number with Indian number system
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Calculate per-person cost
 */
export function calculatePerPersonCost(total: number, people: number): number {
    if (people <= 0) return 0;
    return Math.round((total / people) * 100) / 100;
}
