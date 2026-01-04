import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface InsightCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    title?: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: string;
}

/**
 * A specialized card for displaying data insights and statistics.
 * Supports a title, subtitle, icon, and trend indicators (up/down/neutral).
 */
export function InsightCard({
    children,
    className,
    delay = 0,
    title,
    subtitle,
    trend,
    trendValue,
    icon
}: InsightCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: delay,
                type: "spring",
                stiffness: 200,
                damping: 25
            }}
            className={clsx(
                "relative overflow-hidden rounded-3xl border border-white/5 bg-muted/20 backdrop-blur-2xl shadow-sm p-5 flex flex-col",
                className
            )}
        >
            {/* Header if title is present */}
            {(title || icon) && (
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        {title && <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>}
                        {subtitle && <span className="text-xs text-muted-foreground/60">{subtitle}</span>}
                    </div>
                    {icon && <span className="text-xl opacity-70 grayscale contrast-125">{icon}</span>}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 relative z-10">
                {children}
            </div>

            {/* Trend Indicator */}
            {trend && trendValue && (
                <div className={clsx(
                    "absolute bottom-5 right-5 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                    trend === 'up' ? "bg-green-500/10 text-green-500" :
                        trend === 'down' ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                )}>
                    <span>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</span>
                    {trendValue}
                </div>
            )}
        </motion.div>
    );
}
