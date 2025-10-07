import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct

// A simple Loader component. You can replace this with your own.
const Loader = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    </div>
);

// The main, improved Ambulance Login Page component
export default function AmbulanceLoginPage() {
    const { user, loading, login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This effect handles redirecting the user if they are already logged in
    useEffect(() => {
        if (!loading && user) {
            // In a real app, you might check the user's role here
            // For now, we'll assume any logged-in ambulance user gets redirected to /ambulancedashboard
            router.push('/ambulancedashboard'); 
        }
    }, [user, loading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            // Successful login will trigger the useEffect above to redirect
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            setIsSubmitting(false);
        }
    };

    // While checking auth status or if a user is already logged in, show a loader
    if (loading || (!loading && user)) {
        return <Loader />;
    }

    // If not loading and no user, show the login form
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 p-4 font-sans overflow-hidden">
            {/* Futuristic Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-gray-950"></div>
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="w-full h-full bg-cover bg-center animate-pulse-light" style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)',
                    animation: 'pulse-light 10s infinite alternate'
                }}></div>
                <div className="absolute inset-0 bg-grid-slate-700/[0.08] [mask-image:linear-gradient(to_bottom,transparent,white_50%,transparent)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-slate-800/30 backdrop-blur-xl rounded-xl border border-blue-500/20 shadow-neon-blue shadow-blue-500/10 transition-all duration-500 hover:border-blue-500/40">
                <div className="text-center">
                    <div className="mb-4 flex justify-center">
                        {/* Futuristic Ambulance/Medical Icon */}
                        <svg className="w-16 h-16 text-blue-500 animate-pulse-fade" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.061 1.76l1.242 5.064A2 2 0 008.312 11H18a2 2 0 001.965-2.363l-1.353-5.418A2 2 0 0017.306 3H7.4M4 16h16"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-wide">
                        <span className="text-blue-500 drop-shadow-lg-blue">Rescue</span><span className="text-white">Connect</span>
                    </h1>
                    <p className="mt-3 text-lg text-slate-300 font-light">Ambulance Crew Terminal</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="input-futuristic"
                                placeholder="Secure ID (Email)"
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
                                className="input-futuristic mt-px"
                                placeholder="Authorization Key (Password)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="mt-2 text-center text-sm text-red-400 font-medium animate-shake">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-futuristic"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <LoaderSmall /> Authenticating...
                                </span>
                            ) : (
                                'Access System'
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-slate-500 mt-8">
                    &copy; 2023 RescueConnect Operations. All rights reserved.
                </p>
            </div>
        </div>
    );
}

// Small loader for button
const LoaderSmall = () => (
    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white mr-2"></div>
);

// Add these styles to your global CSS (e.g., globals.css) or a styled-jsx block
// This is critical for the futuristic look
/*
@keyframes pulse-light {
  0% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.15; transform: scale(1.05); }
  100% { opacity: 0.1; transform: scale(1); }
}

@keyframes pulse-fade {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.input-futuristic {
  @apply appearance-none relative block w-full px-4 py-3 border border-slate-700 bg-slate-900/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base transition-all duration-300;
  box-shadow: 0 0 5px rgba(60, 150, 255, 0.2);
}

.input-futuristic:focus {
  box-shadow: 0 0 10px rgba(60, 150, 255, 0.6), inset 0 0 3px rgba(60, 150, 255, 0.4);
}

.input-futuristic:first-child {
  @apply rounded-t-lg;
}
.input-futuristic:last-child {
  @apply rounded-b-lg;
}

.btn-futuristic {
  @apply group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-all duration-300 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed;
  text-shadow: 0 0 5px rgba(255,255,255,0.4);
  box-shadow: 0 0 15px rgba(60, 150, 255, 0.4);
}

.btn-futuristic:hover {
  box-shadow: 0 0 25px rgba(60, 150, 255, 0.7);
}

.drop-shadow-lg-blue {
  filter: drop-shadow(0 0 8px rgba(60, 150, 255, 0.6));
}
*/