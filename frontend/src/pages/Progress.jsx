import React, { useState, useMemo, useEffect } from 'react';
import {
    TrendingUp,
    Activity,
    Calendar,
    Target,
    Zap,
    ChevronUp,
    Monitor,
    Flame,
    Award,
    Clock,
    ArrowUpRight,
    Filter,
    Download,
    Info,
    RefreshCw,
    MessageSquare,
    CheckCircle2,
    Footprints,
    Bike,
    Waves,
    Trophy
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    Legend,
    LineChart,
    Line,
    ComposedChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#12141c]/95 border border-white/10 p-4 rounded-xl backdrop-blur-md shadow-2xl">
                <p className="text-gray-400 text-xs mb-2 font-bold uppercase tracking-wider">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-gray-300 text-sm capitalize">{entry.name}:</span>
                            </span>
                            <span className="text-white font-mono font-bold">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const Progress = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30D');
    const [challenges, setChallenges] = useState([]);
    const [performanceHistory, setPerformanceHistory] = useState([]);
    const [healthStats, setHealthStats] = useState(null);
    const [complianceAnalysis, setComplianceAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        const email = localStorage.getItem('athlete_email');
        if (!email) {
            setError("Email atleta non trovata. Effettua il login.");
            setIsLoading(false);
            return;
        }
        try {
            // Fetch Training Load Stats
            const response = await fetch(`/api/user/training-stats/${email}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }

            // Fetch Health Metrics (Recovery)
            const healthRes = await fetch(`/api/user/health-metrics/${email}`);
            if (healthRes.ok) {
                const healthData = await healthRes.json();
                setHealthStats(healthData);
            }

            // Fetch Challenges & Performance
            const chalRes = await fetch(`/api/user/challenges/${email}`);
            if (chalRes.ok) {
                const chalData = await chalRes.json();
                setChallenges(chalData);
            }

            const perfRes = await fetch(`/api/user/performance-history/${email}`);
            if (perfRes.ok) {
                const perfData = await perfRes.json();
                setPerformanceHistory(perfData);
            }

            // Fetch Compliance/Coach Feedback
            const planRaw = localStorage.getItem('training_plan');
            const plan = planRaw ? JSON.parse(planRaw) : [];

            const compRes = await fetch('/api/user/analyze-compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, plan })
            });
            if (compRes.ok) {
                const compData = await compRes.json();
                setComplianceAnalysis(compData.analysis);
            } else {
                const errorData = await compRes.json().catch(() => ({}));
                if (compRes.status === 401) {
                    setError("Errore login Garmin: controlla le tue credenziali nel profilo.");
                } else {
                    setError(errorData.detail || "Errore sincronizzazione attività.");
                }
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            setError("Errore durante il recupero dei dati. Controlla la connessione.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Dynamic Recovery Insight
    const recoveryInsight = useMemo(() => {
        if (!healthStats) return "Sincronizzando i dati di recupero...";

        const sleep = healthStats.sleep_hours || 0;
        const score = healthStats.sleep_score; // Mantieni null se è null
        const bb = healthStats.body_battery || 50;
        const tsb = stats?.current?.form || 0;

        let message = "";
        let advice = "";

        if (sleep === 0 && score === null) {
            return "Dati di recupero non ancora disponibili per oggi. Sincronizza il tuo Garmin.";
        }

        // 1. Sleep Analysis
        if (sleep > 0 && sleep < 6) {
            message = `Sonno insufficiente (${sleep}h). Il sistema nervoso centrale non ha recuperato a sufficienza.`;
            advice = "Oggi evita lavori di alta intensità.";
        } else if (score !== null && score < 60) {
            message = "Qualità del sonno migliorabile rispetto alla durata.";
            advice = "Monitora l'HRV: se è basso, trasforma la sessione in scarico.";
        } else if (score !== null && score >= 60) {
            message = "Recupero notturno ottimale.";
            advice = tsb >= 0 ? "Ottimo giorno per un lavoro di qualità." : "Il tuo corpo è pronto, ma il carico cronico è alto.";
        } else {
            message = "Dati del sonno in fase di analisi.";
            advice = "Basati sul tuo Body Battery per l'allenamento di oggi.";
        }

        // 2. Body Battery & Stress overrides
        if (bb < 30) {
            advice = "Livelli di energia (Body Battery) critici. Priorità assoluta al riposo o sessione rigenerativa brevissima.";
        }

        return `"${message} ${advice}"`;
    }, [healthStats, stats]);

    // Process data for charts
    const loadData = useMemo(() => stats?.history || [], [stats]);

    const volumeData = useMemo(() => {
        if (!stats?.history) return [];
        // Map the last 7 days for the volume chart
        return stats.history.slice(-7).map(d => ({
            name: d.day,
            swim: d.swim,
            bike: d.bike,
            run: d.run
        }));
    }, [stats]);

    const complianceData = [
        { category: 'Soglia', planned: 100, actual: 95 },
        { category: 'Base', planned: 100, actual: 110 },
        { category: 'Recupero', planned: 100, actual: 80 },
        { category: 'VO2 Max', planned: 100, actual: 100 },
    ];

    return (
        <div className="min-h-screen bg-[#0a0c10] pb-20 font-sans text-[#e1e1e1]">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <TrendingUp size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Analisi Performance</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight italic">
                            PROGRESS
                            <span className="text-blue-500">.</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex">
                            {['1W', '2W', '1M', '3M'].map((range) => (
                                <button
                                    key={range}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === '2W' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                            <Download size={18} />
                        </button>
                    </div>
                </header>

                {/* Global Stats Cards */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative">
                    {isLoading && (
                        <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/10 flex items-center justify-center rounded-[40px]">
                            <RefreshCw className="text-blue-500 animate-spin" size={32} />
                        </div>
                    )}
                    {[
                        { label: 'Fitness (CTL)', value: stats?.current?.fitness || '0', trend: 'Auto-Sync', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Fatigue (ATL)', value: stats?.current?.fatigue || '0', trend: 'Real-time', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        { label: 'Form (TSB)', value: stats?.current?.form || '0', trend: (stats?.current?.form || 0) > 0 ? 'Fresh' : 'Stressed', icon: Zap, color: (stats?.current?.form || 0) < -20 ? 'text-red-400' : 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Sleep Score', value: healthStats?.sleep_score || '---', trend: 'Last Night', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 relative group overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={22} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black font-mono text-gray-500 bg-black/20 px-2 py-1 rounded-lg">
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
                            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </section>

                {/* Charts Grid */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                        <Info size={18} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Load Chart */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-white/5 min-h-[450px]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        Training Load Balance
                                        <Info size={14} className="text-gray-600" />
                                    </h3>
                                    <p className="text-gray-500 text-xs">Gestione del carico e prevenzione infortuni</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fitness</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fatigue</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Form</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={loadData}>
                                        <defs>
                                            <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />

                                        <Area type="monotone" dataKey="fatigue" name="Fatigue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFatigue)" />
                                        <Area type="monotone" dataKey="fitness" name="Fitness" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorFitness)" />
                                        <Line type="stepAfter" dataKey="form" name="Form" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Volume Chart */}
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    Distribuzione Volume Settimanale
                                    <Calendar size={14} className="text-gray-600" />
                                </h3>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={volumeData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="swim" name="Nuoto" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                        <Bar dataKey="bike" name="Bici" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                        <Bar dataKey="run" name="Corsa" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Side Panels */}
                    <div className="space-y-8">
                        {/* Compliance Panel */}
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-[#12141c]/40">
                            <h3 className="text-lg font-bold text-white mb-6">Compliance Obiettivi</h3>
                            <div className="space-y-6">
                                {complianceData.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{item.category}</span>
                                            <span className="text-xs font-black text-white">{item.actual}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${item.actual >= 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                                    item.actual > 80 ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`}
                                                style={{ width: `${Math.min(item.actual, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">Overall Consistency</p>
                                    <p className="text-2xl font-black text-white italic mt-1">92.4%</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Challenges & Gamification Section */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-[#12141c]/40">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Trophy size={18} className="text-amber-400" />
                                Missions & Trophies
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                    {challenges.filter(c => c.status === 'completed').length} Earned
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {challenges.length > 0 ? challenges.map((ch) => (
                                <div key={ch.id} className={`p-5 rounded-3xl border transition-all duration-300 ${ch.status === 'completed' ? 'bg-amber-400/5 border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.05)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ch.status === 'completed' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-500'}`}>
                                            {ch.status === 'completed' ? <Award size={20} /> : <Target size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-white leading-none">{ch.title}</h4>
                                                <span className="text-[10px] font-black text-amber-400 uppercase">+{ch.xp} XP</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1 font-medium">{ch.description}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="text-white">{Math.min(100, Math.round((ch.current_value / ch.target_value) * 100))}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${ch.status === 'completed' ? 'bg-amber-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'}`}
                                                style={{ width: `${Math.min(100, (ch.current_value / ch.target_value) * 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-600 font-mono text-right mt-1">
                                            {ch.current_value.toFixed(1)} / {ch.target_value} {ch.metric?.includes('session') ? 'SES' : 'KM/UNIT'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Analisi Obiettivi IA in corso...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Future Load Predictor */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-[#12141c] to-[#0a0c10]">
                        <div className="flex items-center gap-3 mb-6">
                            <Monitor className="text-blue-500" size={24} />
                            <h3 className="text-lg font-bold text-white leading-tight">Predictive Insight</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Basandoti sul piano attuale, raggiungerai il picco di forma (Fitness {Math.round((stats?.current?.fitness || 0) * 1.1)}) tra <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">12 giorni</span>.
                            Il rischio di overtraining è attualmente <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Molto Basso</span>.
                        </p>
                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10">
                            Vedi Report IA
                        </button>
                    </div>
                </div>
            </div>

            {/* Execution & Coach Technical Feedback Section (Full Width) */}
            <section className="mt-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white italic flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-500" size={28} />
                            ANALISI ESECUZIONE ALLENAMENTI
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Feedback tecnico dettagliato per ogni attività registrata su Garmin</p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10 disabled:opacity-50 group"
                    >
                        <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        {isLoading ? 'Sincronizzazione...' : 'Sincronizza'}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {complianceAnalysis?.all_activities_feedback?.map((activity, idx) => {
                        const actType = (activity.type || "").toLowerCase();
                        const actName = activity.name || "Attività senza nome";

                        return (
                            <div key={idx} className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left: Activity Summary */}
                                    <div className="md:w-64 shrink-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-xl ${actType.includes('run') ? 'bg-orange-500/10 text-orange-400' :
                                                actType.includes('cycl') || actType.includes('bike') ? 'bg-emerald-500/10 text-emerald-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {actType.includes('run') ? <Footprints size={20} /> :
                                                    actType.includes('cycl') || actType.includes('bike') ? <Bike size={20} /> :
                                                        <Waves size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold leading-none">{actName}</h4>
                                                <span className="text-[10px] text-gray-500 font-mono uppercase">{activity.date}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-black/20 p-2 rounded-lg">
                                                <p className="text-[8px] text-gray-500 uppercase font-bold">Durata</p>
                                                <p className="text-sm font-mono text-white">{Math.round(activity.duration || 0)}′</p>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded-lg">
                                                <p className="text-[8px] text-gray-500 uppercase font-bold">HR Avg</p>
                                                <p className="text-sm font-mono text-white">{Math.round(activity.avg_hr) || '--'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Coach Technical Opinion */}
                                    <div className="flex-1 border-l border-white/5 md:pl-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare size={14} className="text-blue-400" />
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Feedback Tecnico Coach</span>
                                            {activity.is_extra && (
                                                <span className="ml-auto text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                                    Fuori Programma
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-300 italic leading-relaxed font-medium">
                                            "{activity.opinion}"
                                        </p>

                                        {activity.avg_power > 0 && (
                                            <div className="mt-4 flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-md border border-emerald-400/10">
                                                    <Zap size={10} />
                                                    POTENZA MEDIA: {Math.round(activity.avg_power)}W
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && !complianceAnalysis && (
                        <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                            <RefreshCw className="mx-auto text-gray-600 mb-4 animate-spin" size={32} />
                            <p className="text-gray-400 font-medium">Sincronizzazione attività da Garmin...</p>
                        </div>
                    )}

                    {!isLoading && (!complianceAnalysis?.all_activities_feedback || complianceAnalysis.all_activities_feedback.length === 0) && !error && (
                        <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                            <Calendar className="mx-auto text-gray-400 mb-4 opacity-20" size={32} />
                            <p className="text-gray-400 font-medium">Nessuna attività registrata negli ultimi 30 giorni.</p>
                            <p className="text-gray-600 text-xs mt-1">Le tue attività Garmin appariranno qui automaticamente.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Progress;
