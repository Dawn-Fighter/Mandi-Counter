import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';

/**
 * SignUp page component.
 * Allows new users to register. Includes email verification flow feedback.
 */
export function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError } = await signUp(email, password);
            if (signUpError) {
                setError(signUpError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
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
                {success ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="p-8 text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto"
                            >
                                <Mail className="w-10 h-10" />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
                                <p className="text-muted-foreground">
                                    We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
                                    Please confirm your email to continue.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>Go to Login</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="p-8 space-y-8">
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                                    Create Account
                                </h1>
                                <p className="text-sm text-muted-foreground">Join Mandi Counter today</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                                        <label className="text-sm font-medium ml-1">Password</label>
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

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {loading ? 'Creating...' : 'Sign Up'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
