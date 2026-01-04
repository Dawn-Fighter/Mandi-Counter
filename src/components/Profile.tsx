import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from './UI/GlassCard';
import { User, LogOut, Settings, ChevronRight, Mail } from 'lucide-react';

/**
 * User profile overview page.
 * Displays account information and provides navigation to personal details, preferences, and sign out.
 */
export function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen pb-32 space-y-8 overflow-x-hidden">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* User Info Card */}
                <GlassCard className="p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold">{user?.email?.split('@')[0]}</h2>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{user?.email}</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Settings & Actions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Account</h3>

                    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
                        <button
                            onClick={() => navigate('/profile/details')}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Personal Details</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <button
                            onClick={() => navigate('/profile/preferences')}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Preferences</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 transition-colors mt-6"
                    >
                        <div className="p-2 rounded-xl bg-red-500/10">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-bold">Log Out</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
