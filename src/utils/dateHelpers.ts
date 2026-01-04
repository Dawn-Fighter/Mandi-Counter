import type { TimePeriod } from '@/types';

/**
 * Get date range for a given time period
 */
export function getDateRange(period: TimePeriod): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
        case 'weekly':
            // Last 7 days
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;

        case 'monthly':
            // Current month start to end
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth() + 1, 0); // Last day of current month
            end.setHours(23, 59, 59, 999);
            break;

        case 'yearly':
            // Current year start to end
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31);
            end.setHours(23, 59, 59, 999);
            break;
    }

    return { start, end };
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Format date to local display format
 */
export function formatDateDisplay(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayISO(): string {
    return formatDateToISO(new Date());
}

/**
 * Check if a date is within a given range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
    return new Date(dateString);
}
