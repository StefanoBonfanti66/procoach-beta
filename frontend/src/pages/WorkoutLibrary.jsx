import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Play, Trash2, Clock, Activity, Zap, HeartPulse, Target, Plus, ChevronRight, RefreshCcw, Footprints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkoutChart from '../components/WorkoutChart';

const WorkoutLibrary = () => {
    const navigate = useNavigate();
    const [savedWorkouts, setSavedWorkouts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [syncingId, setSyncingId] = useState(null);

    useEffect(() => {
        const library = JSON.parse(localStorage.getItem('procoach_workout_library') || '[]');
        setSavedWorkouts(library);
    }, []);

    const deleteWorkout = (id) => {
        const newLibrary = savedWorkouts.filter(w => w.id !== id);
        localStorage.setItem('procoach_workout_library', JSON.stringify(newLibrary));
        setSavedWorkouts(newLibrary);
    };

    const handleSyncToGarmin = async (workout) => {
        const email = localStorage.getItem('athlete_email');
        if (!email) {
            alert("Errore: email non trovata. Effettua nuovamente l'accesso.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const date = window.prompt("Per quale giorno vuoi programmare l'allenamento? (YYYY-MM-DD)", today);

        if (!date) return;

        setSyncingId(workout.id);
        try {
            const response = await fetch('/api/user/sync-single-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, workout, date })
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert(`Workout "${workout.activity}" sincronizzato con successo per il giorno ${date}!`);
            } else {
                alert(`Errore nella sincronizzazione: ${data.detail || 'Errore sconosciuto'}`);
            }
        } catch (error) {
            console.error("Sync error:", error);
            alert("Errore di connessione al server.");
        } finally {
            setSyncingId(null);
        }
    };

    const filteredWorkouts = savedWorkouts.filter(w => {
        const matchesSearch = w.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || w.activity.includes(filterType);
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-[#0a0c10] pb-12 font-sans text-[#e1e1e1]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8">
                {/* Header Section */}
                <header className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 bg-[#0a0c10]/50 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <BookOpen size={120} className="text-blue-500" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                Archivio Personale
                            </span>
                            <span className="text-gray-400 text-sm font-medium">{savedWorkouts.length} Allenamenti Salvati</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">La tua Libreria</h2>
                        <p className="text-gray-400 mt-2 max-w-xl">
                            Conserva e riutilizza i tuoi allenamenti preferiti. Personalizzali e sincronizzali con Garmin quando sei pronto.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Cerca allenamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="All">Tutte le attività</option>
                            <option value="Run">Corsa</option>
                            <option value="Bike">Bici</option>
                            <option value="Swim">Nuoto</option>
                        </select>
                    </div>
                </header>

                {/* Grid Section */}
                {filteredWorkouts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkouts.map((workout) => {
                            const isSwim = workout.activity.match(/Swim|Nuoto/i);
                            const isBike = workout.activity.match(/Ride|Bike|Bici|Cycling/i);
                            const isRun = workout.activity.match(/Run|Corsa/i);

                            return (
                                <div key={workout.id} className="glass-card group hover:border-white/20 transition-all duration-300 flex flex-col bg-[#0a0c10]/40 overflow-hidden border border-white/5">
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-gray-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                                                {isSwim && <Activity size={22} />}
                                                {isBike && <Target size={22} />}
                                                {isRun && <Footprints size={22} />}
                                                {!isSwim && !isBike && !isRun && <Zap size={22} />}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => deleteWorkout(workout.id)}
                                                    className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                                                    title="Elimina"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                            {workout.activity}
                                        </h3>

                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
                                                <Clock size={12} />
                                                {workout.duration} min
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border 
                                                ${workout.intensity === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                    workout.intensity === 'Moderate' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                        'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                                                {workout.intensity}
                                            </span>
                                        </div>

                                        {/* Chart Preview */}
                                        <div className="mb-4 opacity-80 group-hover:opacity-100 transition-all">
                                            <WorkoutChart steps={workout.steps} size="small" />
                                        </div>

                                        <div className="space-y-1.5">
                                            {workout.steps?.slice(0, 3).map((step, sIdx) => (
                                                <div key={sIdx} className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className={`w-1 h-1 rounded-full ${step.repeat_count ? 'bg-emerald-400' :
                                                        step.type === 'WARMUP' ? 'bg-blue-500' :
                                                            step.type === 'COOLDOWN' ? 'bg-blue-300' :
                                                                'bg-emerald-500'}`}
                                                    />
                                                    <span className="truncate">
                                                        {(() => {
                                                            if (step.repeat_count) {
                                                                const getLabel = (s) => {
                                                                    if (s.distance_m) return `${s.distance_m}m`;
                                                                    if (s.duration_min < 1 && s.duration_min > 0) return `${Math.round(s.duration_min * 60)}s`;
                                                                    return `${s.duration_min}′`;
                                                                };
                                                                return `${step.repeat_count}x [${step.steps?.map(s => getLabel(s)).join("+")}]`;
                                                            }
                                                            return step.distance_m ? `${step.description} (${step.distance_m}m)` : step.description;
                                                        })()}
                                                    </span>
                                                </div>
                                            ))}
                                            {workout.steps?.length > 3 && (
                                                <div className="text-[10px] text-gray-600 font-medium pl-3">
                                                    + altri {workout.steps.length - 3} passaggi
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-white/5 bg-white/5 group-hover:bg-blue-600/5 transition-all">
                                        <button
                                            onClick={() => handleSyncToGarmin(workout)}
                                            disabled={syncingId !== null}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/40 transition-all"
                                        >
                                            {syncingId === workout.id ? (
                                                <RefreshCcw size={14} className="animate-spin" />
                                            ) : (
                                                <Play size={14} fill="currentColor" />
                                            )}
                                            {syncingId === workout.id ? 'Sincronizzazione...' : 'Sincronizza con Garmin'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card p-16 text-center border-dashed border-white/10 bg-transparent flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-gray-600 border border-white/5">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Libreria Vuota</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Non hai ancora salvato alcun allenamento. Vai al tuo piano e clicca sull'icona segnalibro per aggiungere allenamenti qui.
                        </p>
                        <button
                            onClick={() => navigate('/your-plan')}
                            className="btn-primary flex items-center gap-2"
                        >
                            Torna al tuo piano <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutLibrary;
