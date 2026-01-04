import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
}

/**
 * A reusable card component with a glassmorphism effect.
 * Features a backdrop blur, subtle borders, and an optional hover scales/shadows.
 */
export function GlassCard({ children, className, onClick, hoverEffect = false }: GlassCardProps) {
    return (
        <motion.div
            onClick={onClick}
            className={clsx(
                'relative overflow-hidden',
                'bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/5',
                'rounded-3xl shadow-sm', /* Updated radius to 3xl for squircle match */
                'transition-all duration-300 ease-out',
                hoverEffect && 'hover:bg-card/80 hover:shadow-md hover:scale-[1.02] cursor-pointer active:scale-[0.98]',
                className
            )}
        >
            {/* Minimal shine effect on top border */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

            {children}
        </motion.div>
    );
}
