import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';

/**
 * Login page component.
 * Provides forms for user authentication and password reset requests.
 * Uses Glassmorphism styling and liquid background effects.
 */
export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reset Password State
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const { signIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
                setError(signInError.message);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await resetPassword(email);
            if (error) {
                setError(error.message);
            } else {
                setResetSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <AnimatePresence mode="wait">
                {isResetMode ? (
                    resetSuccess ? (
                        <motion.div
                            key="reset-success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-8 text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <Mail className="w-10 h-10" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
                                    <p className="text-muted-foreground">
                                        We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsResetMode(false);
                                        setResetSuccess(false);
                                    }}
                                    className="w-full h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors"
                                >
                                    Back to Login
                                </button>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reset-form"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={() => setIsResetMode(false)}
                                        className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <h2 className="text-xl font-bold">Reset Password</h2>
                                </div>

                                <p className="text-sm text-muted-foreground -mt-4">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    {error && (
                                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium ml-1">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex h-12 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="you@example.com"
                                                required
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            </GlassCard>
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="p-8 space-y-8">
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                                    Welcome Back
                                </h1>
                                <p className="text-sm text-muted-foreground">Sign in to Mandi Counter</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium ml-1">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex h-12 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="you@example.com"
                                                required
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-medium">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsResetMode(true)}
                                                className="text-xs text-primary hover:underline font-medium"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="flex h-12 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
