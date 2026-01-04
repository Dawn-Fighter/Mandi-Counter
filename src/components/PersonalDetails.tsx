import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Personal Details management page.
 * Allows users to update their profile information (name, gender, email) and password.
 * Integrates directly with Supabase profiles table and auth service.
 */
export function PersonalDetails() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Form State
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data
    useEffect(() => {
        if (user) {
            setEmail(user.email || '');

            // Fetch profile data
            const fetchProfile = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, gender')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setFullName(data.full_name || '');
                    setGender(data.gender || '');
                } else if (user.user_metadata) {
                    // Fallback to metadata
                    setFullName(user.user_metadata.full_name || '');
                    setGender(user.user_metadata.gender || '');
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // 1. Update Profile (Name & Gender)
            const updates = {
                id: user?.id,
                full_name: fullName,
                gender: gender,
                updated_at: new Date(),
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (profileError) throw profileError;

            // Also update auth metadata for redundancy/speed
            await supabase.auth.updateUser({
                data: { full_name: fullName, gender: gender }
            });

            // 2. Update Email (if changed)
            if (email !== user?.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email });
                if (emailError) throw emailError;
                setSuccessMessage('Profile updated. Please check your new email for a verification link.');
                return; // Stop here as email change usually requires re-login/verification
            }

            // 3. Update Password (if provided)
            if (password) {
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                const { error: passwordError } = await supabase.auth.updateUser({ password });
                if (passwordError) throw passwordError;
            }

            setSuccessMessage('Profile details updated successfully!');
            setPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

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
                    Personal Details
                </h1>
            </div>

            <GlassCard className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-xl flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="flex h-11 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="flex h-11 w-full rounded-xl border-none bg-muted/50 px-4 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-11 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="john@example.com"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50 space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">Change Password</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="flex h-11 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            placeholder="Min 6 characters"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="flex h-11 w-full rounded-xl border-none bg-muted/50 px-4 pl-11 text-sm ring-1 ring-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            placeholder="Confirm new password"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
