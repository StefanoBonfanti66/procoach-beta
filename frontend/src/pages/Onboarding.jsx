import { useState, useEffect } from 'react'
import { Activity, Calendar, Settings, User, RefreshCcw, Target, Trophy, HeartPulse, ChevronLeft, ChevronRight, Mail, Lock, UserCircle, Thermometer, Clock, Waves, Bike, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

function Onboarding() {
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        weight: '',
        height: '',
        experience_level: 'New',
        primary_objective: 'Race',
        race_distance: 'Olympic',
        race_date: '',
        race_time_goal: '',
        hr_rest: '60',
        hr_max: '190',
        ftp: '200',
        vo2_max_run: '',
        vo2_max_cycle: '',
        css: '',
        running_threshold: '',
        hr_max_cycle: '',
        hr_max_swim: '',
        lactate_threshold_hr: '',
        gender: '',
        birthdate: '',
        availability: {
            Mon: 60, Tue: 60, Wed: 60, Thu: 60, Fri: 60, Sat: 120, Sun: 180
        },
        habits: {
            day_preferences: {
                Mon: { swim: 0, bike: 0, run: 0 },
                Tue: { swim: 0, bike: 0, run: 0 },
                Wed: { swim: 0, bike: 0, run: 0 },
                Thu: { swim: 0, bike: 0, run: 0 },
                Fri: { swim: 0, bike: 0, run: 0 },
                Sat: { swim: 0, bike: 0, run: 0 },
                Sun: { swim: 0, bike: 0, run: 0 }
            }
        },
        pool_length: '25'
    })

    useEffect(() => {
        const loadInitialData = async () => {
            const savedEmail = localStorage.getItem('athlete_email')
            if (savedEmail) {
                try {
                    const response = await fetch(`/api/user/profile/${savedEmail}`)
                    if (response.ok) {
                        const data = await response.json()
                        setFormData(prev => ({
                            ...prev,
                            ...data,
                            age: data.age?.toString() || '',
                            weight: data.weight?.toString() || '',
                            height: data.height?.toString() || '',
                            ftp: data.ftp?.toString() || '200',
                            hr_max: data.hr_max?.toString() || '190',
                            hr_rest: data.hr_rest?.toString() || '60',
                            vo2_max_run: data.vo2_max_run?.toString() || '',
                            vo2_max_cycle: data.vo2_max_cycle?.toString() || '',
                            css: data.css?.toString() || '',
                            running_threshold: data.running_threshold?.toString() || '',
                            hr_max_cycle: data.hr_max_cycle?.toString() || '',
                            hr_max_swim: data.hr_max_swim?.toString() || '',
                            lactate_threshold_hr: data.lactate_threshold_hr?.toString() || '',
                            pool_length: data.pool_length?.toString() || '25',
                            gender: data.gender || '',
                            birthdate: data.birthdate || '',
                            password: data.password || '', // Store the stored password for syncs
                            availability: (data.availability && Object.keys(data.availability).length > 0)
                                ? data.availability
                                : prev.availability,
                            habits: data.habits || prev.habits
                        }))
                    }
                } catch (error) {
                    console.error('Failed to load initial profile:', error)
                }
            }
        }
        loadInitialData()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAvailabilityChange = (day, value) => {
        setFormData(prev => ({
            ...prev,
            availability: { ...prev.availability, [day]: parseInt(value) || 0 }
        }))
    }

    const toggleDayPreference = (day, sport) => {
        setFormData(prev => {
            const currentDur = prev.habits?.day_preferences?.[day]?.[sport] || 0;
            const newDur = currentDur > 0 ? 0 : 60; // Toggle between 0 and default 60

            const currentDayPrefs = prev.habits?.day_preferences?.[day] || {};
            const updatedDayPrefs = { ...currentDayPrefs, [sport]: newDur };

            // Recalculate total minutes
            const totalMinutes = Object.values(updatedDayPrefs).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

            return {
                ...prev,
                availability: {
                    ...prev.availability,
                    [day]: totalMinutes > 0 ? totalMinutes : (newDur > 0 ? newDur : prev.availability[day])
                },
                habits: {
                    ...(prev.habits || {}),
                    day_preferences: {
                        ...(prev.habits?.day_preferences || {}),
                        [day]: {
                            ...(prev.habits?.day_preferences?.[day] || {}),
                            [sport]: newDur
                        }
                    }
                }
            };
        });
    }

    const handleSportDurationChange = (day, sport, value) => {
        const val = parseInt(value) || 0;
        setFormData(prev => {
            const currentDayPrefs = prev.habits?.day_preferences?.[day] || {};
            const updatedDayPrefs = { ...currentDayPrefs, [sport]: val };

            // Calculate new total minutes for this day
            const totalMinutes = Object.values(updatedDayPrefs).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

            // If the user is setting specific sport durations, we should respect that sum as the availability
            // But we should ensure we don't accidentally reduce it if they just want to cap it. 
            // Actually, if they are granularly planning, the sum is the truth.

            return {
                ...prev,
                availability: {
                    ...prev.availability,
                    [day]: totalMinutes > 0 ? totalMinutes : prev.availability[day]
                },
                habits: {
                    ...(prev.habits || {}),
                    day_preferences: {
                        ...(prev.habits?.day_preferences || {}),
                        [day]: updatedDayPrefs
                    }
                }
            };
        });
    }

    const handleGarminSync = async () => {
        // Use either the local state password or the one we just loaded
        const syncEmail = formData.email || localStorage.getItem('athlete_email');
        const syncPassword = formData.password;

        if (!syncEmail || !syncPassword) {
            alert('Credenziali Garmin non trovate. Per favore effettua nuovamente il login.');
            return
        }

        setIsSyncing(true)
        try {
            const response = await fetch('/api/user/sync-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: syncEmail, password: syncPassword })
            })

            if (response.ok) {
                const data = await response.json()
                setFormData(prev => ({
                    ...prev,
                    hr_max: data.metrics.hr_max || prev.hr_max,
                    hr_rest: data.metrics.hr_rest || prev.hr_rest,
                    vo2_max_run: data.metrics.vo2_max_run || prev.vo2_max_run,
                    vo2_max_cycle: data.metrics.vo2_max_cycle || prev.vo2_max_cycle,
                    ftp: data.metrics.ftp || prev.ftp,
                    running_threshold: data.metrics.running_threshold || prev.running_threshold,
                    hr_max_cycle: data.metrics.hr_max_cycle || prev.hr_max_cycle,
                    hr_max_swim: data.metrics.hr_max_swim || prev.hr_max_swim,
                    lactate_threshold_hr: data.metrics.lactate_threshold_hr || prev.lactate_threshold_hr,
                    css: data.metrics.css || prev.css,
                    gender: data.metrics.gender || prev.gender,
                    birthdate: data.metrics.birthdate || prev.birthdate,
                    weight: data.metrics.weight || prev.weight,
                    height: data.metrics.height || prev.height
                }))
                alert('Dati sincronizzati con successo!')
            } else {
                alert('Sincronizzazione fallita. Controlla le tue credenziali.')
            }
        } catch (error) {
            console.error('Sync error:', error)
            alert('Errore di rete durante la sincronizzazione')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                age: parseInt(formData.age) || 30,
                weight: parseFloat(formData.weight) || 70,
                height: parseFloat(formData.height) || 175,
                hr_rest: parseInt(formData.hr_rest) || 60,
                hr_max: parseInt(formData.hr_max) || 190,
                ftp: parseInt(formData.ftp) || 200,
                vo2_max_run: formData.vo2_max_run ? parseFloat(formData.vo2_max_run) : null,
                vo2_max_cycle: formData.vo2_max_cycle ? parseFloat(formData.vo2_max_cycle) : null,
                css: formData.css || null,
                running_threshold: formData.running_threshold || null
            }

            console.log('Sending profile payload:', payload)
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (response.ok) {
                localStorage.setItem('athlete_email', payload.email)
                navigate('/your-plan')
            } else {
                alert('Errore nel salvataggio del profilo')
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Errore di rete')
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] text-[#e1e1e1] selection:bg-blue-500/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-extrabold font-outfit mb-4 text-white">Pronto per la sfida?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Configura il tuo profilo da atleta professionista e lascia che l'intelligenza artificiale pianifichi il tuo successo.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Objectives */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="text-blue-500" size={20} />
                                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-300">Obiettivo Principale</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: 'Race', label: 'In Gara', icon: Trophy, desc: 'Programma mirato alla tua prossima gara obiettivo.' },
                                    { id: 'Performance', label: 'Push Hard', icon: HeartPulse, desc: 'Incremento massimo di FTP e VO2 Max.' },
                                    { id: 'Fitness', label: 'Forma Fisica', icon: Activity, desc: 'Benessere generale e salute cardiovascolare.' }
                                ].map((obj) => (
                                    <div
                                        key={obj.id}
                                        onClick={() => setFormData(prev => ({ ...prev, primary_objective: obj.id }))}
                                        className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all cursor-pointer group ${formData.primary_objective === obj.id
                                            ? 'border-blue-500 bg-blue-500/5'
                                            : 'border-white/5 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {formData.primary_objective === obj.id && (
                                            <div className="absolute top-3 right-3 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center p-0.5 shadow-glow-blue">
                                                <div className="w-full h-full bg-white rounded-full" />
                                            </div>
                                        )}
                                        <obj.icon className={`mb-4 transition-transform group-hover:scale-110 ${formData.primary_objective === obj.id ? 'text-blue-500' : 'text-gray-500'}`} size={32} />
                                        <div className="font-bold text-xl mb-1 text-white">{obj.label}</div>
                                        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{obj.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {formData.primary_objective === 'Race' && (
                            <section className="glass-card p-8 animate-in zoom-in-95 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-blue-400 uppercase tracking-widest">Distanza Gara</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Sprint', 'Olympic', '70.3', 'Full'].map(dist => (
                                                <button
                                                    key={dist}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, race_distance: dist }))}
                                                    className={`py-3 rounded-xl font-bold border transition-all ${formData.race_distance === dist
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                        : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'
                                                        }`}
                                                >
                                                    {dist}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-blue-400 uppercase tracking-widest">Data del Grande Giorno</label>
                                        <input
                                            type="date"
                                            name="race_date"
                                            value={formData.race_date}
                                            onChange={handleInputChange}
                                            className="glass-input w-full py-4 text-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <label className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 block">
                                        🎯 Tempo Obiettivo Gara (opzionale)
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            name="race_time_goal"
                                            value={formData.race_time_goal}
                                            onChange={handleInputChange}
                                            className="glass-input w-full py-4 text-lg font-mono text-center"
                                            placeholder={
                                                formData.race_distance === 'Sprint' ? 'es. 01:15:00 (1h 15min)' :
                                                    formData.race_distance === 'Olympic' ? 'es. 02:30:00 (2h 30min)' :
                                                        formData.race_distance === '70.3' ? 'es. 05:30:00 (5h 30min)' :
                                                            'es. 12:00:00 (12h)'
                                            }
                                        />
                                        <p className="text-[10px] text-gray-500 italic text-center">
                                            Formato: HH:MM:SS - Il sistema calcolerà automaticamente i pacing target per ogni disciplina
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Physical Profile */}
                        <section className="glass-card p-8 space-y-8">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                                <User size={20} className="text-blue-500" />
                                <h3 className="text-xl font-bold font-outfit text-white">Profilo Atleta</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="glass-input w-full" placeholder="es. Mario Rossi" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Livello Esperienza</label>
                                    <select name="experience_level" value={formData.experience_level} onChange={handleInputChange} className="glass-input w-full appearance-none">
                                        <option>New</option>
                                        <option>Progressing</option>
                                        <option>Veteran</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Età</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="glass-input w-full" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Peso (kg)</label>
                                    <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleInputChange} className="glass-input w-full" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Altezza (cm)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="glass-input w-full" placeholder="es. 175" required />
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-blue-400">Metriche Prestazionali</h4>
                                    <button
                                        type="button"
                                        onClick={handleGarminSync}
                                        disabled={isSyncing}
                                        className="btn-glass flex items-center gap-2 group"
                                    >
                                        <RefreshCcw size={16} className={`${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{isSyncing ? 'Sincronizzazione...' : 'Sincronizza Garmin'}</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">HR Riposo (bpm)</label>
                                        <input type="number" name="hr_rest" value={formData.hr_rest} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="60" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">HR Max (bpm)</label>
                                        <input type="number" name="hr_max" value={formData.hr_max} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="190" />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={14} /> Nuoto
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">CSS (MM:SS per 100m)</label>
                                            <input type="text" name="css" value={formData.css} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="2:15" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Vasca (m)</label>
                                            <div className="flex gap-2">
                                                {[25, 50].map(len => (
                                                    <button
                                                        key={len}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, pool_length: len.toString() }))}
                                                        className={`flex-1 py-1 rounded-xl border transition-all text-xs font-bold ${formData.pool_length === len.toString() ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                                    >
                                                        {len}m
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <Target size={14} /> Ciclismo
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">FTP (Watts)</label>
                                            <input type="number" name="ftp" value={formData.ftp} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="200" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">VO2 Max Cycling</label>
                                            <input type="number" name="vo2_max_cycle" value={formData.vo2_max_cycle} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h5 className="text-[11px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                        <HeartPulse size={14} /> Corsa
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">VO2 Max Run</label>
                                            <input type="number" name="vo2_max_run" value={formData.vo2_max_run} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="45" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Soglia (min/km)</label>
                                            <input type="text" name="running_threshold" value={formData.running_threshold} onChange={handleInputChange} className="glass-input w-full bg-black/20" placeholder="5:08" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Availability & Feasibility */}
                        <section className="glass-card p-8 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Clock size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-outfit text-white leading-none">Pianificazione Settimanale</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Definisci quando e quanto puoi spingere</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Volume Totale</div>
                                    <div className="text-2xl font-black text-white italic">
                                        {(Object.values(formData.availability).reduce((a, b) => a + b, 0) / 60).toFixed(1)}
                                        <span className="text-sm text-blue-500 ml-1 underline underline-offset-4 decoration-2">ore/settimana</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                    const isRest = formData.availability[day] === 0;
                                    return (
                                        <div key={day} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${isRest ? 'bg-black/20 border-white/5 opacity-60' : 'bg-white/5 border-blue-500/30 shadow-lg shadow-blue-900/10'
                                            }`}>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</span>

                                            <button
                                                type="button"
                                                onClick={() => handleAvailabilityChange(day, isRest ? 60 : 0)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRest ? 'bg-white/5 text-gray-600' : 'bg-blue-600 text-white'
                                                    }`}
                                            >
                                                {isRest ? <Clock size={16} /> : <Activity size={16} />}
                                            </button>

                                            <div className="relative w-full">
                                                <input
                                                    type="number"
                                                    value={formData.availability[day]}
                                                    disabled={isRest}
                                                    onChange={(e) => handleAvailabilityChange(day, e.target.value)}
                                                    className={`w-full bg-black/40 border-0 rounded-lg text-center py-2 text-sm font-bold font-mono outline-none transition-all ${isRest ? 'text-gray-700' : 'text-white focus:ring-1 focus:ring-blue-500/50'
                                                        }`}
                                                />
                                                {!isRest && <span className="absolute -bottom-4 left-0 w-full text-center text-[8px] text-gray-500 uppercase font-bold tracking-tighter">Minuti</span>}
                                            </div>

                                            {/* Sport Preferences & Durations */}
                                            {!isRest && (
                                                <div className="mt-4 space-y-3 w-full">
                                                    {[
                                                        { id: 'swim', icon: Waves, color: 'blue' },
                                                        { id: 'bike', icon: Bike, color: 'emerald' },
                                                        { id: 'run', icon: Timer, color: 'orange' }
                                                    ].map(sport => {
                                                        const duration = formData.habits?.day_preferences?.[day]?.[sport.id] || 0;
                                                        const isSelected = duration > 0;
                                                        return (
                                                            <div key={sport.id} className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleDayPreference(day, sport.id)}
                                                                        className={`p-1.5 rounded-lg border transition-all ${isSelected
                                                                            ? `bg-${sport.color}-600 border-${sport.color}-400 text-white`
                                                                            : 'bg-white/5 border-white/10 text-gray-600 hover:text-gray-400'
                                                                            }`}
                                                                    >
                                                                        <sport.icon size={12} />
                                                                    </button>
                                                                    {isSelected && (
                                                                        <input
                                                                            type="number"
                                                                            value={duration}
                                                                            onChange={(e) => handleSportDurationChange(day, sport.id, e.target.value)}
                                                                            className="w-full bg-black/20 border-white/5 rounded px-1 py-0.5 text-[10px] font-mono text-white focus:outline-none"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Feasibility Feedback Panel */}
                            {(() => {
                                const totalHours = Object.values(formData.availability).reduce((a, b) => a + b, 0) / 60;
                                let status = "optimal"; // "optimal", "warning", "critical"
                                let message = "";
                                let motivation = "";

                                if (formData.race_distance === 'Full') {
                                    if (totalHours < 12) { status = "critical"; message = "Tempo insufficiente per un Ironman."; motivation = "Un Full richiede almeno 12-15 ore per finire in sicurezza. Prova ad aumentare i weekend."; }
                                    else { message = "Volume eccellente per l'Ironman!"; motivation = "Stai dedicando il tempo giusto per costruire la base di cui hai bisogno."; }
                                } else if (formData.race_distance === '70.3') {
                                    if (totalHours < 8) { status = "warning"; message = "Al limite per un Mezzo Ironman."; motivation = "Potresti finire la gara, ma con 2 ore in più a settimana ti divertiresti molto di più!"; }
                                    else { message = "Perfetto per un 70.3!"; motivation = "Con questo volume possiamo inserire sessioni di qualità e lunghi efficaci."; }
                                } else if (formData.race_distance === 'Olympic') {
                                    if (totalHours < 5) { status = "warning"; message = "Volume minimo per un Olimpico."; motivation = "Poche ore ma buone? Cercheremo di massimizzare l'intensità delle sessioni."; }
                                    else { message = "Ottimo bilanciamento."; motivation = "Hai abbastanza tempo per coprire tutte e tre le discipline con la giusta tecnica."; }
                                } else {
                                    message = "Piano Sprint pronto all'azione!"; motivation = "Durerà poco, ma sarà intenso. Preparati a spingere!";
                                }

                                const styles = {
                                    optimal: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", color: "text-emerald-400", label: "Feasible" },
                                    warning: { border: "border-orange-500/20", bg: "bg-orange-500/5", color: "text-orange-400", label: "Warning" },
                                    critical: { border: "border-red-500/20", bg: "bg-red-500/5", color: "text-red-400", label: "Risk" }
                                };
                                const s = styles[status];

                                return (
                                    <div className={`mt-8 p-6 rounded-[28px] border-2 ${s.border} ${s.bg} flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4`}>
                                        <div className={`w-14 h-14 rounded-2xl ${s.color.replace('text', 'bg').replace('400', '10')} flex items-center justify-center shrink-0`}>
                                            <Trophy size={28} className={s.color} />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${s.color.replace('text', 'bg').replace('400', '500')} text-black`}>{s.label}</span>
                                                <h4 className={`text-lg font-bold ${s.color}`}>{message}</h4>
                                            </div>
                                            <p className="text-sm text-gray-400 leading-relaxed italic">"{motivation}"</p>
                                        </div>
                                        <div className="hidden md:block w-px h-12 bg-white/5 mx-4" />
                                        <div className="text-center md:text-right">
                                            <div className="text-[10px] text-gray-500 uppercase font-black">Score Fattibilità</div>
                                            <div className={`text-2xl font-black italic ${s.color}`}>
                                                {status === "optimal" ? "95/100" : (status === "warning" ? "65/100" : "30/100")}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </section>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsSyncing(true);
                                    await handleSubmit(new Event('submit'));
                                    setIsSyncing(false);
                                    alert('Profilo salvato con successo!');
                                }}
                                disabled={isSyncing}
                                className="flex-1 btn-glass h-20 text-sm font-bold uppercase tracking-widest border-white/10 hover:bg-white/5"
                            >
                                {isSyncing ? 'Salvataggio...' : 'Salva Solo Dati'}
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] btn-primary text-xl font-outfit uppercase tracking-widest h-20"
                            >
                                Salva & Genera Programma
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <footer className="mt-20 py-10 border-t border-white/5 text-center text-gray-600 text-xs tracking-widest uppercase">
                Pro Coach &copy; 2025 • Engineered for Excellence
            </footer>
        </div>
    )
}

export default Onboarding
