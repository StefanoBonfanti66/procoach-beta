import React, { useState } from 'react';
import {
    BookOpen,
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    Zap,
    Activity,
    Calendar,
    RefreshCw,
    Settings,
    Info,
    Smartphone,
    MessageSquare,
    Trophy,
    Heart,
    Target,
    Dna,
    ShieldCheck,
    Cpu
} from 'lucide-react';

const HelpCenter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);

    const sections = [
        {
            title: "Configurazione & Login",
            icon: <ShieldCheck className="text-blue-400" />,
            description: "Come iniziare il tuo viaggio con ProCoach.",
            items: [
                {
                    id: 'login_garmin',
                    label: "Accesso via Garmin Connect",
                    content: "ProCoach non richiede una nuova registrazione. Utilizziamo le tue credenziali Garmin Connect per creare un'identità sicura. Ogni volta che effettui il login, il sistema valida la tua identità e stabilisce una connessione crittografata con i server Garmin per rinfrescare i tuoi dati."
                },
                {
                    id: 'auto_sync',
                    label: "Sincronizzazione Automatica",
                    content: "Ad ogni login, il sistema esegue una scansione automatica del tuo profilo Garmin. Aggiorneremo istantaneamente valori come Peso, VO2 Max, Battiti a riposo/massimi e soglie registrate dall'orologio. Non devi inserire nulla a mano: se il tuo orologio vede un miglioramento, ProCoach lo recepisce al volo."
                }
            ]
        },
        {
            title: "Analisi Avanzata (Progress)",
            icon: <Cpu className="text-purple-400" />,
            description: "Comprendere le metriche professionali in stile Humango.",
            items: [
                {
                    id: 'ctl_fitness',
                    label: "Fitness (CTL - Chronic Training Load)",
                    content: "Rappresenta il tuo carico storico degli ultimi 42 giorni. È il valore che indica quanto sei 'allenato'. Una linea CTL che sale indica che stai costruendo una base solida."
                },
                {
                    id: 'atl_fatigue',
                    label: "Fatigue (ATL - Acute Training Load)",
                    content: "Rappresenta lo stress accumulato negli ultimi 7 giorni. È normale che salga molto durante le settimane di carico duro. Se sale troppo velocemente, il rischio di infortuni aumenta."
                },
                {
                    id: 'tsb_form',
                    label: "Form (TSB - Training Stress Balance)",
                    content: "È la differenza tra Fitness e Fatigue. Se il valore è positivo (Fresh), sei pronto per una gara. Se è molto negativo (Stressed), significa che sei stanco e hai bisogno di recuperare per supercompensare."
                }
            ]
        },
        {
            title: "Metodologia del Piano",
            icon: <Dna className="text-emerald-400" />,
            description: "La scienza dietro il tuo programma di allenamento.",
            items: [
                {
                    id: 'ai_logic',
                    label: "Logica del Coach AI",
                    content: "Il piano segue una periodizzazione ondulatoria. Alterniamo settimane di Sviluppo (dove il carico aumenta gradualmente) a settimane di Scarico (identificate dall'icona del caffè). Durante lo scarico, il volume diminuisce ma l'intensità resta, permettendo al tuo corpo di adattarsi agli stimoli precedenti."
                },
                {
                    id: 'pool_css',
                    label: "Pacing nel Nuoto (CSS)",
                    content: "Tutti gli allenamenti in piscina sono basati sul tuo Critical Swim Speed (CSS). Il sistema calcola andature specifiche per ogni zona: A1 (Recupero), B1 (Fondo), A2 (Soglia). È fondamentale inserire la lunghezza corretta della vasca (25m o 50m) per avere tempi precisi."
                },
                {
                    id: 'bike_power',
                    label: "Potenza in Bici (Z1-Z7)",
                    content: "Il piano utilizza zone di potenza calcolate sulla tua FTP. Se non hai un misuratore di potenza, il sistema userà i dati di battito cardiaco, ma consigliamo vivamente l'uso dei Watt per una precisione millimetrica degli stimoli anaerobici."
                }
            ]
        },
        {
            title: "Gestione Operativa",
            icon: <Settings className="text-gray-400" />,
            description: "Modifiche, rigenerazione e manualità.",
            items: [
                {
                    id: 'regen_plan',
                    label: "Rigenera Piano vs Genera Programma",
                    content: "Il tasto 'Rigenera Piano' nella Dashboard serve se vuoi cambiare i giorni o la struttura settimanale. Il tasto 'Genera Programma' nella pagina Profilo serve invece quando hai aggiornato i tuoi parametri fisiologici (es. hai una nuova FTP) e vuoi che tutti i target di velocità e watt vengano ricalcolati."
                },
                {
                    id: 'edit_workouts',
                    label: "Modifica Allenamenti",
                    content: "Ogni card allenamento ha un'icona ingranaggio. Da lì puoi modificare singole fasi o ripetute. Il sistema ricalcolerà automaticamente la durata totale e i carichi stimati."
                }
            ]
        }
    ];

    const faqs = [
        {
            q: "Non vedo l'allenamento sul mio orologio Garmin, cosa faccio?",
            a: "Assicurati di aver premuto 'Invia a Garmin' nella Dashboard. Verifica poi sull'app Garmin Connect (sul telefono) che l'allenamento appaia nel calendario. Infine, sincronizza l'orologio con l'app."
        },
        {
            q: "Perché ho così tanto nuoto questa settimana?",
            a: "Il Coach AI bilancia le tue debolezze. Se hai impostato una distanza gara Olympic o superiore e l'AI rileva che hai bisogno di più volume aerobico per sostenere la frazione, aumenterà la frequenza in piscina."
        },
        {
            q: "Posso spostare un allenamento da martedì a mercoledì?",
            a: "Certamente. Puoi usare l'editor per cambiare i dettagli, ma ricorda che la logica di carico/scarico è pensata per evitare giorni duri consecutivi. Prova a mantenere la struttura suggerita se possibile."
        },
        {
            q: "Cosa succede se salto un allenamento?",
            a: "Non preoccuparti. L'algoritmo rileva la compliance reale. Al prossimo login, i dati di Progress mostreranno un calo del Fatigue (ATL) e il piano si adatterà di conseguenza se la tendenza continua."
        }
    ];

    const filteredSections = sections.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.items.length > 0);

    return (
        <div className="min-h-screen bg-[#0a0c10] pb-20 font-sans text-[#e1e1e1] selection:bg-blue-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-purple-600/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 px-6 py-2 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                        <Cpu size={14} className="animate-pulse" /> Knowledge Base v2.0
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase leading-none">
                        Manuale <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400">Atleta.</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                        Tutto quello che devi sapere sulla scienza, la tecnologia e la gestione del tuo piano di allenamento su ProCoach.
                    </p>

                    {/* Enhanced Search Bar */}
                    <div className="w-full max-w-3xl mt-12 relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cerca per parola chiave (es. 'FTP', 'Garmin', 'Scarico')..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-[40px] py-8 pl-18 pr-12 text-xl text-white outline-none focus:border-blue-500/50 shadow-2xl transition-all focus:ring-4 focus:ring-blue-500/5"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Content Areas */}
                    <div className="lg:col-span-8 space-y-16">
                        {filteredSections.map((section, sIdx) => (
                            <div key={sIdx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${sIdx * 100}ms` }}>
                                <div className="space-y-2 border-l-4 border-blue-500 pl-6">
                                    <div className="flex items-center gap-3">
                                        <span className="p-2 bg-white/5 rounded-lg">{section.icon}</span>
                                        <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">{section.title}</h2>
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm">{section.description}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {section.items.map((item, iIdx) => (
                                        <div key={iIdx} className="glass-card p-8 rounded-[32px] border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full" />
                                            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                {item.label}
                                            </h3>
                                            <p className="text-gray-400 text-base leading-relaxed relative z-10">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredSections.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                                <Search size={48} className="mx-auto text-gray-600 mb-6" />
                                <p className="text-xl text-gray-500 italic">"Purtroppo non abbiamo trovato guide per <strong>{searchTerm}</strong>"</p>
                                <button onClick={() => setSearchTerm('')} className="mt-6 text-blue-500 font-bold hover:underline">Mostra tutte le guide</button>
                            </div>
                        )}
                    </div>

                    {/* FAQ & Sidebar */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="glass-card p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-indigo-900/10 to-transparent sticky top-24">
                            <h2 className="text-2xl font-black text-white italic mb-10 flex items-center gap-3">
                                <MessageSquare className="text-blue-500" /> FAQ FREQUENTI
                            </h2>
                            <div className="space-y-2">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="border-b border-white/5 last:border-0 overflow-hidden">
                                        <button
                                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                            className="w-full py-6 flex justify-between items-center text-left gap-4 group"
                                        >
                                            <span className="text-[15px] font-bold text-gray-300 group-hover:text-blue-400 transition-colors leading-snug">
                                                {faq.q}
                                            </span>
                                            <div className={`transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-blue-500' : 'text-gray-600'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </button>
                                        <div className={`transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <p className="text-sm leading-relaxed text-gray-400 border-l-2 border-blue-500/30 pl-4 py-1">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-8 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-600/20 text-center group cursor-pointer hover:scale-[1.02] transition-all">
                                <Heart className="mx-auto text-white mb-4 group-hover:scale-125 transition-transform" fill="white" />
                                <h3 className="text-lg font-black text-white mb-2 uppercase italic tracking-tighter">Supporto Elite</h3>
                                <p className="text-blue-100 text-xs mb-6 font-medium">Hai un dubbio tecnico sulla tua specifica fisiologia?</p>
                                <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 shadow-lg">
                                    Contatta Stefano
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-32 pt-16 border-t border-white/5 container mx-auto px-6 text-center">
                <div className="flex justify-center gap-8 mb-8 text-gray-500">
                    <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-white cursor-pointer transition-colors">AI Ethics</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                </div>
                <p className="text-gray-700 font-bold uppercase tracking-[0.4em] text-[10px]">ProCoach Advanced Intelligence Engine © 2025</p>
            </footer>
        </div>
    );
};

export default HelpCenter;
