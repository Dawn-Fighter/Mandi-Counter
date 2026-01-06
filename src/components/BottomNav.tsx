import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus, History, BarChart2, User } from 'lucide-react';
import clsx from 'clsx';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/add', label: 'Add', icon: Plus },
        { path: '/history', label: 'History', icon: History },
        { path: '/stats', label: 'Stats', icon: BarChart2 },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <motion.div
                className="flex items-center gap-2 p-2 mx-4 rounded-[2rem] pointer-events-auto bg-card/85 backdrop-blur-md shadow-xl ring-1 ring-white/20 dark:ring-white/5 will-change-transform"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }} // Snappier entry
            >
                {navItems.map((item) => {
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={clsx(
                                "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-transform duration-200 active:scale-95", // Less scale change
                                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            style={{ WebkitTapHighlightColor: 'transparent' }} // Remove Android tap highlight
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-primary rounded-full shadow-md shadow-primary/20 will-change-transform" // Reduced shadow
                                    transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }} // Faster
                                />
                            )}
                            <Icon className={clsx("relative z-10 w-6 h-6", isActive && "stroke-[2.5px]")} />
                            {isActive && (
                                <span className="text-[10px] font-medium mt-0.5 relative z-10">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
}
