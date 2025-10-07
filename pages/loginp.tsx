import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// The main, improved Police Login Page component
export default function PoliceLoginPage() {
    const { login } = useAuth(); // We only need the login function here
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            // ✅ FIX: On successful login, explicitly redirect to the police dashboard.
            router.push('/police'); 
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            setLoading(false); // Stop loading on error
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4 font-sans">
            <div className="absolute inset-0 bg-grid-slate-700/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom_1px_center"></div>
            
            <div className="relative w-full max-w-md p-8 space-y-8 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 shadow-2xl shadow-red-500/10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">
                        Rescue<span className="text-red-500">Connect</span>
                    </h1>
                    <p className="mt-2 text-slate-400">Police Control Access</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-slate-700 bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-slate-700 bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="mt-2 text-center text-sm text-red-400 font-medium">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-800 transition-all duration-300 ease-in-out disabled:bg-slate-500"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}