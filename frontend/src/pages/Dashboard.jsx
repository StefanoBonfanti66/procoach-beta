import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare, Bell, User, Calendar, RefreshCw, ChevronLeft, ChevronRight, Activity, Zap, Trophy, Clock, HeartPulse, RefreshCcw, Target, ChevronUp, ChevronDown, Copy, Trash2, Layers, Bookmark, Waves, Bike, Timer, Coffee, Flame, Footprints, Bot, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkoutChart from '../components/WorkoutChart';

const Dashboard = () => {
    const navigate = useNavigate();
    const [fullPlan, setFullPlan] = useState(null);
    const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
    const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [completedActivities, setCompletedActivities] = useState([]);
    const [isFetchingActivities, setIsFetchingActivities] = useState(false);
    const [complianceAnalysis, setComplianceAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const loadUserAndPlan = async () => {
            const email = localStorage.getItem('athlete_email');
            if (email) {
                setUserEmail(email);
                console.log("Fetching plan for:", email);
                try {
                    // 1. Try to fetch existing plan first
                    const existingRes = await fetch(`/api/user/training-plan/${email}`);
                    if (existingRes.ok) {
                        const existingData = await existingRes.json();
                        if (existingData && existingData.weeks) {
                            console.log("Existing plan recovered from DB");
                            setFullPlan(existingData.weeks);
                            analyzeCompliance(email, existingData.weeks);
                            fetchRecentActivities(email);
                            return; // Stop here if plan exists
                        }
                    }

                    // 2. If no plan exists, generate a new one
                    console.log("No plan found, generating new one...");
                    const response = await fetch('/api/user/generate-plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                        cache: 'no-store'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setFullPlan(data.plan);
                        analyzeCompliance(email, data.plan);
                    } else {
                        console.error("Plan Generation Failed");
                    }

                    fetchRecentActivities(email);
                } catch (e) {
                    console.error("Network Error:", e);
                }
            } else {
                navigate('/onboarding');
            }
        };
        loadUserAndPlan();
    }, [navigate]);

    const fetchRecentActivities = async (email) => {
        if (!email) return;
        setIsFetchingActivities(true);
        try {
            const res = await fetch(`/api/user/recent-activities/${email}`);
            if (res.ok) {
                const data = await res.json();
                setCompletedActivities(data || []);
            }
        } catch (e) {
            console.error("Error fetching activities:", e);
        } finally {
            setIsFetchingActivities(false);
        }
    };

    const analyzeCompliance = async (email, plan) => {
        if (!email || !plan) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/user/analyze-compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, plan })
            });
            if (res.ok) {
                const data = await res.json();
                setComplianceAnalysis(data.analysis);
            }
        } catch (e) {
            console.error("Error analyzing compliance:", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePushToGarmin = async () => {
        const currentWeek = fullPlan ? fullPlan[currentWeekIdx] : null;
        console.log("DEBUG: handlePushToGarmin called", { userEmail, currentWeek });
        if (!userEmail || !currentWeek) {
            console.warn("DEBUG: Missing email or week data", { userEmail, currentWeek });
            return;
        }

        setIsSyncingCalendar(true);
        try {
            const response = await fetch('/api/user/sync-calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    week_data: currentWeek
                })
            });

            if (response.ok) {
                const data = await response.json();
                const count = data.results ? data.results.length : 0;
                alert(`Sincronizzazione completata! ${count} allenamenti inviati a Garmin.`);
            } else {
                alert('Errore durante la sincronizzazione con Garmin.');
            }
        } catch (error) {
            console.error('Push error:', error);
            alert('Errore di rete.');
        } finally {
            setIsSyncingCalendar(false);
        }
    };

    const handleRegenerate = async () => {
        if (!userEmail) return;
        setFullPlan(null); // Show loader
        try {
            const response = await fetch('/api/user/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, force_refresh: true }),
            });
            if (response.ok) {
                const data = await response.json();
                setFullPlan(data.plan);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const calculateTotalWorkoutDuration = (sList) => {
        const helper = (list) => (list || []).reduce((acc, s) => {
            if (s.steps && s.steps.length > 0) {
                return acc + (helper(s.steps) * (s.repeat_count || 1));
            }
            if (s.duration_min) return acc + s.duration_min;
            if (s.distance_m) {
                const pace = s.pace_ms || 1.0;
                return acc + (s.distance_m / pace / 60);
            }
            return acc;
        }, 0);
        return Math.round(helper(sList));
    };

    const handleSaveWorkout = (weekIdx, day, updatedData) => {
        const newPlan = [...fullPlan];
        newPlan[weekIdx].days[day] = updatedData;
        setFullPlan(newPlan);
        setEditingWorkout(null);
    };

    const handleSaveToLibrary = (workout) => {
        const library = JSON.parse(localStorage.getItem('procoach_workout_library') || '[]');
        // Check if already exists (simple check by description/activity/steps)
        const workoutToSave = {
            ...workout,
            id: Date.now(),
            savedAt: new Date().toISOString()
        };
        library.push(workoutToSave);
        localStorage.setItem('procoach_workout_library', JSON.stringify(library));
        alert("Allenamento salvato nella libreria!");
    };

    const currentWeek = (fullPlan && fullPlan.length > 0) ? fullPlan[currentWeekIdx] : null;

    if (!fullPlan) {
        return (
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCcw className="animate-spin text-blue-500 mx-auto mb-4" size={40} />
                    <p className="text-white font-bold text-xl">Caricamento Programma...</p>
                </div>
            </div>
        );
    }

    if (fullPlan.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <div className="text-center max-w-md p-8 glass-card">
                    <Calendar className="text-gray-500 mx-auto mb-4" size={40} />
                    <p className="text-white font-bold text-xl">Nessun piano trovato</p>
                    <p className="text-gray-400 mt-2 mb-6">Non abbiamo ancora generato un programma per te. Torna all'onboarding per configurare i tuoi obiettivi.</p>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="btn-primary px-8 py-3 w-full"
                    >
                        Configura Obiettivi
                    </button>
                </div>
            </div>
        );
    }

    if (!currentWeek) {
        return (
            <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
                <p className="text-white">Errore nel caricamento della settimana selezionata.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] pb-12 font-sans text-[#e1e1e1]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8">
                {/* Header Context */}
                <section className="glass-card p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 bg-[#0a0c10]/50 rounded-2xl">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                {currentWeek?.phase || 'Season'}
                            </span>
                            <span className="text-gray-400 text-sm font-medium">Stagione 2025</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Road to Glory</h2>
                    </div>

                    <div className="flex-1 w-full md:w-auto">
                        <div className="bg-blue-600/10 hover:bg-blue-600/20 transition-colors cursor-pointer rounded-xl p-4 border border-blue-500/20 group">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wide">Come ti senti oggi?</h3>
                                <Activity size={18} className="text-blue-500" />
                            </div>
                            <p className="text-blue-200/60 text-sm group-hover:text-blue-200">Clicca per registrare il tuo stato di forma</p>
                        </div>
                    </div>

                    <div className="text-right text-gray-500 text-sm font-medium flex-1">
                        <div className="flex items-center justify-end gap-2">
                            <Clock size={14} />
                            <span>Ultimo aggiornamento:</span>
                        </div>
                        <div className="text-gray-300 font-mono mt-1">Oggi</div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Weekly Summary */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" />
                                Sintesi Settimanale
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-32">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Volume Totale</span>
                                    <div>
                                        <div className="text-4xl font-extrabold text-white">
                                            {Object.values(currentWeek.days).reduce((acc, d) => acc + (d.duration || 0), 0) / 60 < 1
                                                ? `${Object.values(currentWeek.days).reduce((acc, d) => acc + (d.duration || 0), 0)} min`
                                                : `${(Object.values(currentWeek.days).reduce((acc, d) => acc + (d.duration || 0), 0) / 60).toFixed(1)}h`
                                            }
                                        </div>
                                        <div className="text-xs font-bold text-blue-400/80 mt-1 uppercase tracking-widest">
                                            {Object.values(currentWeek.days).reduce((acc, d) => acc + (d.distance_km || 0), 0).toFixed(1)} km Totali
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-32">
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Intensità Media</span>
                                    <div className="text-xl font-bold text-emerald-400">Moderata / Costruttiva</div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-500/30 transition-colors cursor-pointer" onClick={handlePushToGarmin}>
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-wider relative z-10">Sincronizzazione</span>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`p-2 rounded-lg ${isSyncingCalendar ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            <RefreshCcw size={24} className={isSyncingCalendar ? 'animate-spin' : ''} />
                                        </div>
                                        <span className="text-sm font-bold text-white leading-tight">
                                            {isSyncingCalendar ? 'Sync in corso...' : 'Invia a Garmin'}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Reactive Coach Note & Compliance Analysis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {currentWeek.coach_note && (
                                    <div className="p-5 bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 rounded-[28px] flex items-start gap-5 animate-in slide-in-from-top-4 duration-700">
                                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20 shrink-0">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Reactive Coach Advice</h4>
                                            <p className="text-blue-100/90 text-[13px] leading-relaxed italic font-medium">"{currentWeek.coach_note}"</p>
                                        </div>
                                    </div>
                                )}

                                {complianceAnalysis && (
                                    <div className="p-5 bg-gradient-to-r from-emerald-600/10 to-transparent border border-emerald-500/20 rounded-[28px] flex items-start gap-5">
                                        <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-600/20 shrink-0">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Compliance Coach</h4>
                                                <span className="text-white font-mono font-bold text-xs">{complianceAnalysis.overall_compliance}%</span>
                                            </div>
                                            <p className="text-emerald-100/90 text-[12px] leading-relaxed italic font-medium">"{complianceAnalysis.coach_feedback}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Program Navigation (LOCKED TO WEEK 1 as requested) */}
                        <div className="flex flex-col gap-4 mb-4">
                            {/* Proactive Alert Banner */}
                            {currentWeek.proactive_modification && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 animate-in slide-in-from-top-4">
                                    <div className="p-2 bg-red-500 rounded-xl text-white shadow-lg shadow-red-500/20 shrink-0">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-red-400 text-sm font-black uppercase tracking-widest mb-1">
                                            Intervento Proattivo Antigravity
                                        </h4>
                                        <p className="text-red-100/80 text-sm leading-relaxed font-medium">
                                            {currentWeek.coach_note}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-emerald-500" />
                                    Settimana Corrente ({currentWeek.start_date})
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const email = localStorage.getItem('athlete_email');
                                            if (email) {
                                                fetchRecentActivities(email);
                                                analyzeCompliance(email, fullPlan);
                                            }
                                        }}
                                        disabled={isFetchingActivities || isAnalyzing}
                                        className="p-2 bg-blue-600/10 rounded-xl hover:bg-blue-600/20 text-blue-400 transition-all border border-blue-500/10 flex items-center gap-2 text-xs font-bold"
                                        title="Aggiorna Dati e Ricalcola Piano"
                                    >
                                        <RefreshCw size={14} className={isFetchingActivities || isAnalyzing ? 'animate-spin' : ''} />
                                        RICALCOLA
                                    </button>

                                    {/* Future weeks allow navigation but show Locked State */}
                                    <div className="flex items-center bg-white/5 rounded-xl border border-white/5 px-3 py-2 gap-2 text-xs font-medium text-gray-500">
                                        <span>Prossime settimane</span>
                                        <div className="flex items-center gap-1 text-gray-600 uppercase font-black tracking-wider text-[10px] border border-gray-700 rounded px-1.5 bg-black/20">
                                            Auto-Generating <Loader2 size={10} className="animate-spin" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Schedule */}
                        <div className="space-y-4">
                            {Object.entries(currentWeek.days).map(([day, workout]) => {
                                const activityName = (workout.activity || "").toLowerCase();
                                const isSwim = workout.sport_type === 'swim' || activityName.includes('swim') || activityName.includes('nuoto');
                                const isBike = workout.sport_type === 'bike' || activityName.includes('cycling') || activityName.includes('ride') || activityName.includes('bici');
                                const isRun = workout.sport_type === 'run' || activityName.includes('run') || activityName.includes('corsa');
                                const isRest = workout.activity === 'Rest' || activityName.includes('rest') || activityName.includes('riposo');

                                // Calculate match at the start
                                const days_map = { "Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6 };
                                const day_offset = days_map[day];
                                const start_date = new Date(currentWeek.start_date);
                                start_date.setDate(start_date.getDate() + day_offset);
                                const date_iso = start_date.toISOString().split('T')[0];
                                const match = complianceAnalysis?.matches.find(m => m.date === date_iso);

                                return (
                                    <div key={day} className={`relative overflow-hidden rounded-2xl border bg-[#0a0c10]/40 p-4 transition-all hover:border-white/20 group
                                        ${isRest ? 'border-white/5 opacity-50' : 'border-white/10 hover:bg-white/5'}
                                    `}>
                                        {match && match.executed_name && (
                                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.5)]" />
                                        )}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                                            {!isRest && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSaveToLibrary(workout);
                                                    }}
                                                    className="p-1.5 bg-white/5 hover:bg-blue-600/20 rounded-lg text-gray-400 hover:text-blue-400 transition-all"
                                                    title="Salva in Libreria"
                                                >
                                                    <Bookmark size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingWorkout({ weekIdx: currentWeekIdx, day, data: JSON.parse(JSON.stringify(workout)) });
                                                }}
                                                className="p-1.5 bg-white/5 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-all"
                                                title="Modifica"
                                            >
                                                <Settings size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="w-16 flex flex-col items-center justify-center border-r border-white/5 pr-6">
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{day}</span>
                                            </div>

                                            <div className="p-3 rounded-xl bg-white/5 text-gray-400">
                                                {isRest ? (
                                                    <Coffee size={20} className="text-amber-200/50" />
                                                ) : isSwim ? (
                                                    <Waves size={20} className="text-blue-400" />
                                                ) : isBike ? (
                                                    <Bike size={20} className="text-emerald-400" />
                                                ) : isRun ? (
                                                    <Footprints size={20} className="text-orange-400" />
                                                ) : (
                                                    <Activity size={20} />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className={`text-base font-bold ${isRest ? 'text-gray-500' : 'text-white'}`}>
                                                        {workout.activity === 'Rest' ? 'Rest Day' : workout.activity}
                                                    </h4>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border 
                                                        ${workout.intensity === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                            workout.intensity === 'Moderate' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                                'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                                                        {workout.intensity}
                                                    </span>
                                                </div>

                                                {/* Workout Chart */}
                                                {workout.steps && workout.steps.length > 0 && (
                                                    <div className="mt-3 mb-2">
                                                        <WorkoutChart steps={workout.steps} size="small" />
                                                    </div>
                                                )}

                                                <div className="space-y-1 mt-2">
                                                    {workout.steps && workout.steps.length > 0 ? (
                                                        workout.steps.map((step, sIdx) => {
                                                            const formatTarget = (s, isSwimActivity) => {
                                                                if (s.pace_ms && s.pace_ms > 0) {
                                                                    if (isSwimActivity) {
                                                                        // Swimming: pace per 100m
                                                                        const sec100 = 100 / s.pace_ms;
                                                                        const m = Math.floor(sec100 / 60);
                                                                        const sc = Math.floor(sec100 % 60);
                                                                        return ` @ ${m}:${sc.toString().padStart(2, '0')}/100m`;
                                                                    } else {
                                                                        // Running: pace per km
                                                                        const secKm = 1000 / s.pace_ms;
                                                                        const m = Math.floor(secKm / 60);
                                                                        const sc = Math.floor(secKm % 60);
                                                                        return ` @ ${m}:${sc.toString().padStart(2, '0')}/km`;
                                                                    }
                                                                }
                                                                if (s.power_watts) return ` @ ${s.power_watts}W`;
                                                                return "";
                                                            };
                                                            const isRepeat = !!step.repeat_count;
                                                            const getStepLabel = (s) => {
                                                                if (s.distance_m) return `${s.distance_m}m`;
                                                                if (s.duration_min < 1 && s.duration_min > 0) return `${Math.round(s.duration_min * 60)}s`;
                                                                return `${s.duration_min}′`;
                                                            };
                                                            const displayDesc = isRepeat
                                                                ? (step.description || `${step.repeat_count}x [${step.steps?.map(s => getStepLabel(s)).join(" + ")}]`)
                                                                : step.description;

                                                            // Calculate totals
                                                            let totalDist = 0;
                                                            let totalTime = 0;
                                                            if (isRepeat) {
                                                                totalDist = (step.steps?.reduce((acc, s) => acc + (s.distance_m || 0), 0) || 0) * step.repeat_count;
                                                                totalTime = (step.steps?.reduce((acc, s) => acc + (s.duration_min || 0), 0) || 0) * step.repeat_count;
                                                            } else {
                                                                totalDist = step.distance_m || 0;
                                                                totalTime = step.duration_min || 0;
                                                            }

                                                            const isDistanceBased = totalDist > 0;
                                                            const displayValue = isDistanceBased ? totalDist : totalTime;
                                                            const unit = isDistanceBased ? "m" : "′";

                                                            const hasFormatting = displayDesc && (displayDesc.includes('@') || displayDesc.includes('('));

                                                            return (
                                                                <div key={sIdx} className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isRepeat ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' :
                                                                        step.type === 'WARMUP' ? 'bg-blue-500' :
                                                                            step.type === 'COOLDOWN' ? 'bg-blue-300' :
                                                                                'bg-emerald-500'
                                                                        }`} />
                                                                    <span className="truncate">
                                                                        {displayDesc}
                                                                        {!hasFormatting && (
                                                                            <>
                                                                                <span className="text-gray-400 ml-1">
                                                                                    ({displayValue}{unit}{isRepeat && totalTime > 0 && totalDist > 0 ? ` + ${totalTime}′` : ""})
                                                                                </span>
                                                                                {!isRepeat && <span className="text-gray-400 font-mono ml-1">{formatTarget(step, isSwim)}</span>}
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-sm text-gray-400">
                                                            {isRest ? 'Recupero attivo e stretching.' : 'Allenamento strutturato.'}
                                                        </p>
                                                    )}
                                                </div>

                                                {workout.note && (
                                                    <div className="mt-3 bg-blue-600/5 border-l-2 border-blue-500/30 px-3 py-1.5 rounded-r-lg">
                                                        <p className="text-[11px] text-blue-300/80 italic font-medium leading-relaxed">
                                                            "{workout.note}"
                                                        </p>
                                                    </div>
                                                )}

                                                {match?.coach_opinion && (
                                                    <div className="mt-3 bg-emerald-600/5 border-l-2 border-emerald-500/30 px-3 py-1.5 rounded-r-lg flex items-start gap-2">
                                                        <MessageSquare size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Insights del Coach</span>
                                                            <p className="text-[11px] text-emerald-100/80 italic font-medium leading-relaxed">
                                                                "{match.coach_opinion}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right pl-6 border-l border-white/5 space-y-1">
                                                {workout.duration > 0 && (
                                                    <div className="text-xl font-mono font-bold text-white leading-none">
                                                        {workout.duration}<span className="text-[10px] text-gray-500 ml-1 uppercase">min</span>
                                                    </div>
                                                )}
                                                {workout.distance_km > 0 && (
                                                    <div className="text-sm font-mono font-bold text-blue-400/80 leading-none">
                                                        {workout.distance_km.toFixed(1)}<span className="text-[9px] text-gray-500 ml-1 uppercase tracking-tight">km</span>
                                                    </div>
                                                )}

                                                {match && match.executed_name && (
                                                    <div className="flex flex-col items-end gap-2 mt-2">
                                                        <div className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter inline-block">
                                                            Eseguito: {match.executed_duration}′
                                                        </div>
                                                        {(match.avg_hr || match.calories || match.avg_power) && (
                                                            <div className="flex flex-wrap justify-end gap-2 text-[8px] font-bold text-gray-500 uppercase tracking-tighter max-w-[120px]">
                                                                {match.avg_hr && <span className="flex items-center gap-0.5"><HeartPulse size={8} /> {Math.round(match.avg_hr)}</span>}
                                                                {match.avg_power && <span className="flex items-center gap-0.5"><Zap size={8} title="Avg Power" /> {Math.round(match.avg_power)}W</span>}
                                                                {match.calories && <span className="flex items-center gap-0.5"><Flame size={8} /> {Math.round(match.calories)}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Next Goal */}
                        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-black relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy size={64} className="text-blue-500" />
                            </div>
                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Prossimo Obiettivo</h4>
                            <div className="text-2xl font-bold text-white mb-1">Olympic Race</div>
                            <div className="text-sm text-gray-400">15 Giugno 2026</div>
                        </div>

                        {/* Actions */}
                        <div className="glass-card rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
                            <div className="p-4 border-b border-white/5 font-bold text-gray-400 text-xs uppercase tracking-wider">
                                Accesso Rapido
                            </div>
                            <div className="divide-y divide-white/5">
                                <button
                                    onClick={handleRegenerate}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <RefreshCw size={18} className="text-gray-500 group-hover:text-white" />
                                        <span className="text-gray-400 font-medium group-hover:text-white text-sm">Rigenera Piano</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/onboarding')}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <User size={18} className="text-gray-500 group-hover:text-white" />
                                        <span className="text-gray-400 font-medium group-hover:text-white text-sm">Profilo Atleta</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Bot size={18} className="text-gray-500 group-hover:text-white" />
                                        <span className="text-gray-400 font-medium group-hover:text-white text-sm">AI Coach</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EDIT MODAL */}
                {editingWorkout && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-xl font-bold text-white">Modifica Allenamento</h3>
                                <button onClick={() => setEditingWorkout(null)} className="text-gray-400 hover:text-white">
                                    <Settings size={24} className="rotate-45" /> {/* Using Settings as X for now or import X */}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Calculation Helper */}

                                {/* Workout Visual Profile */}
                                <div className="bg-black/40 rounded-xl p-2 border border-white/5">
                                    <WorkoutChart steps={editingWorkout.data.steps} size="large" />
                                </div>

                                {/* Main Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attività</label>
                                        <input
                                            type="text"
                                            value={editingWorkout.data.activity}
                                            onChange={(e) => setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, activity: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Durata (min)</label>
                                        <input
                                            type="number"
                                            value={editingWorkout.data.duration}
                                            readOnly
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-gray-500 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Steps Editor */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Fasi dell'allenamento</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => {
                                                    const newSteps = [...(editingWorkout.data.steps || [])];
                                                    newSteps.push({ description: "Nuova Fase", duration_min: 10, type: "INTERVAL" });
                                                    setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: newSteps, duration: calculateTotalWorkoutDuration(newSteps) } });
                                                }}
                                                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                                            >
                                                <Zap size={12} /> + Fase
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reps = parseInt(window.prompt("Numero di ripetizioni (es. 4):", "4")) || 4;
                                                    const newSteps = [...(editingWorkout.data.steps || [])];
                                                    newSteps.push({
                                                        repeat_count: reps,
                                                        steps: [
                                                            { description: "Fase Lavoro", duration_min: 5, type: "INTERVAL" },
                                                            { description: "Recupero", duration_min: 2, type: "RECOVERY" }
                                                        ]
                                                    });
                                                    setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: newSteps, duration: calculateTotalWorkoutDuration(newSteps) } });
                                                }}
                                                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                                            >
                                                <Layers size={12} /> + Serie Ripetuta
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {editingWorkout.data.steps?.map((item, idx) => {
                                            const isSwim = editingWorkout.data.activity.match(/Swim|Nuoto/i);
                                            const isBike = editingWorkout.data.activity.match(/Ride|Bike|Bici|Cycling/i);
                                            const isRunSwim = editingWorkout.data.activity.match(/Run|Corsa|Swim|Nuoto/i);

                                            const getPaceString = (ms, swim) => {
                                                if (!ms) return "";
                                                const distance = swim ? 100 : 1000;
                                                const sec = distance / ms;
                                                return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
                                            };

                                            const handleStepChange = (sIdx, field, val, subIdx = null) => {
                                                const newSteps = JSON.parse(JSON.stringify(editingWorkout.data.steps));
                                                if (subIdx !== null) {
                                                    newSteps[sIdx].steps[subIdx][field] = val;
                                                } else {
                                                    newSteps[sIdx][field] = val;
                                                }
                                                setEditingWorkout({
                                                    ...editingWorkout,
                                                    data: { ...editingWorkout.data, steps: newSteps, duration: calculateTotalWorkoutDuration(newSteps) }
                                                });
                                            };

                                            const renderStepFields = (step, sIdx, subIdx = null) => {
                                                const isMain = subIdx === null;
                                                return (
                                                    <div key={subIdx !== null ? `${sIdx}-${subIdx}` : sIdx} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                        <div className="flex gap-2 items-center mb-2">
                                                            <select
                                                                value={step.type}
                                                                onChange={(e) => handleStepChange(sIdx, 'type', e.target.value, subIdx)}
                                                                className="bg-black/20 text-xs text-white p-2 rounded border border-white/10 outline-none w-24"
                                                            >
                                                                <option value="WARMUP">Warmup</option>
                                                                <option value="INTERVAL">Work</option>
                                                                <option value="COOLDOWN">Cool</option>
                                                                <option value="RECOVERY">Rest</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                value={step.description}
                                                                onChange={(e) => handleStepChange(sIdx, 'description', e.target.value, subIdx)}
                                                                className="flex-1 bg-transparent text-sm text-white outline-none border-b border-white/10 py-1"
                                                                placeholder="Descrizione"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={step.duration_min}
                                                                onChange={(e) => handleStepChange(sIdx, 'duration_min', parseInt(e.target.value) || 0, subIdx)}
                                                                className="w-16 bg-transparent text-sm text-right text-white outline-none border-b border-white/10 py-1"
                                                            />
                                                            <span className="text-xs text-gray-500">min</span>

                                                            {isMain && (
                                                                <div className="flex gap-1 ml-2">
                                                                    <button onClick={() => {
                                                                        if (idx === 0) return;
                                                                        const nSteps = [...editingWorkout.data.steps];
                                                                        [nSteps[idx - 1], nSteps[idx]] = [nSteps[idx], nSteps[idx - 1]];
                                                                        setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps } });
                                                                    }} className="p-1 hover:text-blue-400 text-gray-600 disabled:opacity-30" disabled={idx === 0}><ChevronUp size={14} /></button>
                                                                    <button onClick={() => {
                                                                        if (idx === editingWorkout.data.steps.length - 1) return;
                                                                        const nSteps = [...editingWorkout.data.steps];
                                                                        [nSteps[idx + 1], nSteps[idx]] = [nSteps[idx], nSteps[idx + 1]];
                                                                        setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps } });
                                                                    }} className="p-1 hover:text-blue-400 text-gray-600 disabled:opacity-30" disabled={idx === editingWorkout.data.steps.length - 1}><ChevronDown size={14} /></button>
                                                                    <button onClick={() => {
                                                                        const nSteps = [...editingWorkout.data.steps];
                                                                        nSteps.splice(idx + 1, 0, JSON.parse(JSON.stringify(nSteps[idx])));
                                                                        setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps, duration: calculateTotal(nSteps) } });
                                                                    }} className="p-1 hover:text-emerald-400 text-gray-600"><Copy size={13} /></button>
                                                                    <button onClick={() => {
                                                                        const nSteps = editingWorkout.data.steps.filter((_, i) => i !== idx);
                                                                        setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps, duration: calculateTotal(nSteps) } });
                                                                    }} className="p-1 hover:text-red-400 text-gray-600"><Trash2 size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-4 pl-2 opacity-80">
                                                            {isRunSwim && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Passo</span>
                                                                    <input type="text" placeholder="MM:SS" defaultValue={getPaceString(step.pace_ms, isSwim)}
                                                                        onBlur={(e) => {
                                                                            const val = e.target.value;
                                                                            if (val.includes(':')) {
                                                                                const [m, s] = val.split(':').map(Number);
                                                                                const totalSec = (m * 60) + s;
                                                                                if (totalSec > 0) handleStepChange(sIdx, 'pace_ms', (isSwim ? 100 : 1000) / totalSec, subIdx);
                                                                            }
                                                                        }}
                                                                        className="bg-black/20 text-xs text-blue-400 p-1 rounded border border-white/5 outline-none w-16 text-center font-mono"
                                                                    />
                                                                </div>
                                                            )}
                                                            {isBike && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Watt</span>
                                                                    <input type="number" value={step.power_watts || ''} onChange={(e) => handleStepChange(sIdx, 'power_watts', parseInt(e.target.value) || undefined, subIdx)} className="bg-black/20 text-xs text-emerald-400 p-1 rounded border border-white/5 outline-none w-16 text-center font-mono" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            };

                                            if (item.repeat_count > 1) {
                                                return (
                                                    <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <Layers size={16} className="text-emerald-500" />
                                                                <span className="text-xs font-bold text-emerald-500 uppercase">Serie Ripetuta (x</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.repeat_count}
                                                                    onChange={(e) => handleStepChange(idx, 'repeat_count', parseInt(e.target.value) || 1)}
                                                                    className="w-12 bg-emerald-500/20 text-white text-xs font-bold p-1 rounded border border-emerald-500/30 text-center outline-none"
                                                                />
                                                                <span className="text-xs font-bold text-emerald-500 uppercase">)</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => {
                                                                    if (idx === 0) return;
                                                                    const nSteps = [...editingWorkout.data.steps];
                                                                    [nSteps[idx - 1], nSteps[idx]] = [nSteps[idx], nSteps[idx - 1]];
                                                                    setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps } });
                                                                }} className="p-1 hover:text-blue-400 text-gray-600 disabled:opacity-30" disabled={idx === 0}><ChevronUp size={14} /></button>
                                                                <button onClick={() => {
                                                                    if (idx === editingWorkout.data.steps.length - 1) return;
                                                                    const nSteps = [...editingWorkout.data.steps];
                                                                    [nSteps[idx + 1], nSteps[idx]] = [nSteps[idx], nSteps[idx + 1]];
                                                                    setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps } });
                                                                }} className="p-1 hover:text-blue-400 text-gray-600 disabled:opacity-30" disabled={idx === editingWorkout.data.steps.length - 1}><ChevronDown size={14} /></button>
                                                                <button onClick={() => {
                                                                    const nSteps = editingWorkout.data.steps.filter((_, i) => i !== idx);
                                                                    setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps, duration: calculateTotalWorkoutDuration(nSteps) } });
                                                                }} className="p-1 hover:text-red-400 text-gray-600"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="pl-4 border-l-2 border-emerald-500/20 space-y-2">
                                                            {item.steps.map((subStep, subIdx) => renderStepFields(subStep, idx, subIdx))}
                                                            <button
                                                                onClick={() => {
                                                                    const nSteps = JSON.parse(JSON.stringify(editingWorkout.data.steps));
                                                                    nSteps[idx].steps.push({ description: "Nuova Fase Set", duration_min: 5, type: "INTERVAL" });
                                                                    setEditingWorkout({ ...editingWorkout, data: { ...editingWorkout.data, steps: nSteps, duration: calculateTotalWorkoutDuration(nSteps) } });
                                                                }}
                                                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase mt-2 flex items-center gap-1"
                                                            >
                                                                <Zap size={10} /> + Fase al Set
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return renderStepFields(item, idx);
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => handleSaveToLibrary(editingWorkout.data)}
                                    className="flex-1 py-3 rounded-xl font-bold text-blue-400 hover:bg-blue-600/10 transition-colors border border-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    <Bookmark size={18} /> Salva in Libreria
                                </button>
                                <button
                                    onClick={() => setEditingWorkout(null)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={() => handleSaveWorkout(editingWorkout.weekIdx, editingWorkout.day, editingWorkout.data)}
                                    className="flex-[1.5] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Salva Modifiche
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
