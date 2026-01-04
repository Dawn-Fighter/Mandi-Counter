import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { useTheme } from '@/context/ThemeContext';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * User preferences management page.
 * Allows users to toggle between Light, Dark, and System theme modes.
 */
export function Preferences() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
    ] as const;

    return (
        <div className="relative min-h-[calc(100vh-4rem)] pb-24 space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/profile', { replace: true })}
                    className="p-2 -ml-2 rounded-full hover:bg-muted/50 active:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Preferences
                </h1>
            </div>

            <GlassCard className="p-6 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Appearance</h2>
                    <p className="text-sm text-muted-foreground -mt-3">
                        Customize how Mandi Counter looks on your device.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = theme === t.id;

                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={clsx(
                                        "relative flex items-center justify-between sm:justify-center gap-4 p-4 rounded-xl border transition-all duration-200 outline-none",
                                        isActive
                                            ? "bg-primary/10 border-primary/50 text-primary shadow-sm"
                                            : "bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{t.label}</span>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="active-theme"
                                            className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
