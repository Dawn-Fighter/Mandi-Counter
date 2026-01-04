import { motion } from 'framer-motion';

/**
 * A full-screen success animation overlay with an animated checkmark.
 * Automatically triggers the onComplete callback after a short delay.
 */
export function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => onComplete?.(), 1500)} // Auto-dismiss
        >
            <div className="relative">
                <motion.div
                    className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-2xl"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <svg
                        className="w-16 h-16 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <motion.path
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.div>
                <motion.div
                    className="absolute -inset-4 rounded-full border border-emerald-500/20"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: 1, delay: 0.3 }}
                />
            </div>
        </motion.div>
    );
}
