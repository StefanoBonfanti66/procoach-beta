import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Activity, AlertCircle, RefreshCcw, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // ALWAYS attempt a Garmin Sync first to validate credentials and get fresh data
            const syncResponse = await fetch('/api/user/sync-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (syncResponse.ok) {
                const syncData = await syncResponse.json();

                // Now save/update the profile with these fresh metrics
                const profileUpdateResponse = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        ...syncData.metrics
                    })
                });

                if (profileUpdateResponse.ok) {
                    localStorage.setItem('athlete_email', email);

                    // Check if we need to show onboarding (first time) or go to dashboard
                    const checkResponse = await fetch(`/api/user/profile/${email}`);
                    const userData = await checkResponse.json();

                    if (userData.name && userData.primary_objective) {
                        navigate('/your-plan');
                    } else {
                        navigate('/onboarding');
                    }
                } else {
                    throw new Error('Errore durante l\'aggiornamento del profilo.');
                }
            } else {
                let errMsg = 'Credenziali Garmin non valide';
                try {
                    const errData = await syncResponse.json();
                    if (errData.detail) errMsg = errData.detail;
                    if (errData.warning) errMsg = errData.warning;
                } catch (e) {
                    // response wasn't json
                }
                throw new Error(errMsg);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Errore di connessione al server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[150px] rounded-full" />

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-2xl shadow-blue-600/20">
                        <Activity className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">
                        PRO<span className="text-blue-500">COACH</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Accesso via Garmin Connect</p>
                </div>

                <div className="glass-card p-8 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Garmin Connect</label>
                            <div className="flex items-center gap-3">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input flex-1 py-4"
                                    placeholder="atleta@esempio.it"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="flex items-center gap-3">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500">
                                    <Lock size={18} />
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="glass-input w-full py-4 pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCcw size={20} className="animate-spin" />
                                    Verifica Account...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Entra nel Team
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-xs leading-relaxed">
                            Utilizziamo le tue credenziali Garmin esclusivamente per sincronizzare il tuo profilo fisiologico e il calendario allenamenti.
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                    PROCOACH &copy; 2025 • ADVANCED ATHLETE INTELLIGENCE
                </p>
            </div>
        </div>
    );
};

export default Login;
