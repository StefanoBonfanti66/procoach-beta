import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User as UserIcon, Loader2, Calendar, Activity, Check, X, ArrowRight, RefreshCcw } from 'lucide-react'

function Chat() {
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const messagesEndRef = useRef(null)
    const email = localStorage.getItem('athlete_email')

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        loadChatHistory()
    }, [])

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`/api/chat/history/${email}`)
            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages || [])
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return

        const userMessage = inputMessage.trim()
        setInputMessage('')

        // Add user message to UI immediately
        const newUserMsg = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, newUserMsg])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    message: userMessage
                })
            })

            if (response.ok) {
                const data = await response.json()
                const assistantMsg = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: data.timestamp,
                    metadata: data.metadata
                }
                setMessages(prev => [...prev, assistantMsg])
            } else {
                throw new Error('Failed to get response')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMsg = {
                role: 'assistant',
                content: 'Mi dispiace, ho avuto un problema. Riprova tra poco. 🔧',
                timestamp: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const quickActions = [
        "📊 Analizza le mie metriche recenti",
        "🥗 Cosa mangio prima dell'allenamento di domani?",
        "💪 Motivami per l'allenamento di oggi",
        "📝 L'allenamento di domani è troppo intenso, modificalo",
        "🎯 Consigli per la mia prossima gara",
        "😴 Il mio sonno è stato pessimo, cosa faccio?"
    ]

    if (isLoadingHistory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white">ProCoach AI</h1>
                            <p className="text-xs text-gray-400">Il tuo coach virtuale sempre disponibile</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Reset Button */}
                        <button
                            onClick={() => {
                                if (confirm("Vuoi cancellare la cronologia della chat per iniziare una nuova sessione?")) {
                                    setMessages([]);
                                    fetch(`/api/chat/history/${email}`, { method: 'DELETE' }).catch(console.error);
                                }
                            }}
                            className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                            title="Nuova Chat / Reset"
                        >
                            <RefreshCcw size={18} />
                        </button>

                        {/* Status Badge */}
                        <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400 font-medium">Connesso a Garmin</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Messages Container */}
            < div className="flex-1 overflow-y-auto p-4 pb-32" >
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <Bot className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                            <h2 className="text-xl font-bold text-white mb-2">Ciao! 👋</h2>
                            <p className="text-gray-400 mb-6">Sono il tuo coach AI. Chiedimi qualsiasi cosa!</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                {quickActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInputMessage(action)}
                                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-all"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                                    : 'bg-white/10 backdrop-blur-xl border border-white/10 text-gray-100'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {/* Action Card */}
                                {msg.metadata && msg.metadata.action && (
                                    <div className="mt-4 bg-black/20 rounded-xl overflow-hidden border border-white/10">
                                        <div className="bg-white/5 p-3 border-b border-white/5 flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                                <Activity size={14} className="text-blue-400" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                                                {msg.metadata.action.action === 'modify_workout' ? 'Proposta Modifica' : 'Azione Suggerita'}
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {msg.metadata.action.date && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Calendar size={12} />
                                                    <span>{msg.metadata.action.date}</span>
                                                </div>
                                            )}

                                            {msg.metadata.action.changes && (
                                                <div className="bg-white/5 rounded-lg p-3 space-y-2">
                                                    {msg.metadata.action.changes.description && (
                                                        <div className="text-sm font-medium text-white">
                                                            "{msg.metadata.action.changes.description}"
                                                        </div>
                                                    )}
                                                    <div className="flex gap-4 text-xs text-gray-400">
                                                        {msg.metadata.action.changes.duration && (
                                                            <div className='flex items-center gap-1'>
                                                                <span className="uppercase font-bold text-gray-500">Durata:</span>
                                                                <span className="text-white">{msg.metadata.action.changes.duration} min</span>
                                                            </div>
                                                        )}
                                                        {msg.metadata.action.changes.intensity && (
                                                            <div className='flex items-center gap-1'>
                                                                <span className="uppercase font-bold text-gray-500">Intensità:</span>
                                                                <span className="text-white capitalize">{msg.metadata.action.changes.intensity}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={async () => {
                                                        const btn = document.getElementById(`apply-btn-${idx}`);
                                                        if (btn) btn.disabled = true;

                                                        try {
                                                            const response = await fetch('/api/user/sync-single-workout', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    email: localStorage.getItem('athlete_email'),
                                                                    date: msg.metadata.action.date,
                                                                    workout: {
                                                                        activity: msg.metadata.action.changes.description,
                                                                        description: msg.metadata.action.changes.description,
                                                                        duration: msg.metadata.action.changes.duration,
                                                                        sport_type: msg.metadata.action.workout_type,
                                                                        steps: msg.metadata.action.changes.steps || [] // Pass the structured steps!
                                                                    }
                                                                })
                                                            });

                                                            if (response.ok) {
                                                                alert('✅ Allenamento inviato al calendario Garmin!');
                                                            } else {
                                                                alert('❌ Errore durante la sincronizzazione.');
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                            alert('Errore di connessione.');
                                                        } finally {
                                                            if (btn) btn.disabled = false;
                                                        }
                                                    }}
                                                    id={`apply-btn-${idx}`}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check size={12} /> Applica
                                                </button>
                                                <button className="px-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs opacity-50 mt-2">
                                    {new Date(msg.timestamp).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0">
                                    <UserIcon className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div >

            {/* Input Area */}
            < div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl border-t border-white/10 p-4" >
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Scrivi un messaggio al tuo coach..."
                            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows="1"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default Chat
