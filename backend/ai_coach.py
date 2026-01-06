import os
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from datetime import datetime, timedelta
import json

class AICoach:
    def __init__(self):
        self.provider = None
        self.client = None
        
        # Priority 1: OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and OpenAI:
            self.provider = "openai"
            self.client = OpenAI(api_key=openai_key)
            print("AI Coach initialized with OpenAI.")
        
        # Priority 2: Google Gemini (if OpenAI missing)
        if not self.provider:
            google_key = os.getenv("GOOGLE_API_KEY")
            if google_key and genai:
                self.provider = "google"
                genai.configure(api_key=google_key)
                self.client = genai.GenerativeModel('gemini-flash-latest')
                print("AI Coach initialized with Google Gemini.")
                
        if not self.provider:
            print("WARNING: No valid API Key found (OPENAI_API_KEY or GOOGLE_API_KEY). AI Coach will not work.")

    def get_system_prompt(self, user_profile, recent_stats=None, training_plan=None):
        """Build context-aware system prompt with enhanced capabilities"""
        
        # Calcola giorni alla gara se disponibile
        days_to_race = "Non specificata"
        if user_profile.get('race_date'):
            try:
                race_date = datetime.fromisoformat(user_profile['race_date'])
                days_to_race = (race_date - datetime.now()).days
                if days_to_race > 0:
                    days_to_race = f"{days_to_race} giorni"
                elif days_to_race == 0:
                    days_to_race = "OGGI!"
                else:
                    days_to_race = f"Passata da {abs(days_to_race)} giorni"
            except:
                pass
        
        prompt = f"""Sei ProCoach AI, un coach virtuale di triathlon esperto, certificato e altamente motivante.
Hai anni di esperienza nell'allenamento di triatleti di tutti i livelli.

═══════════════════════════════════════════════════════════
📊 PROFILO ATLETA
═══════════════════════════════════════════════════════════
• Nome: {user_profile.get('name', 'Atleta')}
• Età: {user_profile.get('age')} anni
• Livello: {user_profile.get('experience_level', 'New')}
• Peso: {user_profile.get('weight', 'N/D')} kg
• Altezza: {user_profile.get('height', 'N/D')} cm

🎯 OBIETTIVI
• Obiettivo primario: {user_profile.get('primary_objective', 'Race')}
• Distanza gara: {user_profile.get('race_distance', 'Olympic')}
• Data gara: {user_profile.get('race_date', 'Non specificata')} ({days_to_race})
• Tempo obiettivo: {user_profile.get('race_time_goal', 'Non specificato')}

💪 METRICHE FISIOLOGICHE
• FC Max: {user_profile.get('hr_max', 'N/D')} bpm
• FC Riposo: {user_profile.get('hr_rest', 'N/D')} bpm
• FTP (Ciclismo): {user_profile.get('ftp', 'N/D')} W
• CSS (Nuoto): {user_profile.get('css', 'N/D')}
• Soglia Corsa: {user_profile.get('running_threshold', 'N/D')}
"""
        
        # Aggiungi statistiche recenti se disponibili
        if recent_stats:
            prompt += f"""
═══════════════════════════════════════════════════════════
📈 METRICHE GARMIN RECENTI (ultimi 7 giorni)
═══════════════════════════════════════════════════════════
"""
            if 'health_metrics' in recent_stats:
                hm = recent_stats['health_metrics']
                prompt += f"""
💤 Sonno: {hm.get('sleep_score', 'N/D')}/100 (Qualità: {hm.get('sleep_quality', 'N/D')})
❤️ HRV: {hm.get('hrv', 'N/D')} ms
🔋 Body Battery: {hm.get('body_battery', 'N/D')}/100
😌 Stress: {hm.get('stress_level', 'N/D')}/100
"""
            
            if 'recent_activities' in recent_stats and recent_stats['recent_activities']:
                prompt += f"\n🏃 Attività recenti (Ultimi 7 giorni): {len(recent_stats['recent_activities'])} allenamenti\n"
                # Sort by date descending just in case
                sorted_acts = sorted(recent_stats['recent_activities'], key=lambda x: x.get('startTimeLocal', ''), reverse=True)
                
                for act in sorted_acts[:10]:
                    date_str = act.get('start_time', 'N/D')
                    name = act.get('name', 'N/D')
                    dist_km = act.get('distance_km', 0)
                    dur_min = act.get('duration_min', 0)
                    avg_hr = act.get('avg_hr', 'N/D')
                    
                    # Power Detail
                    pwr_str = f"{act.get('avg_power', 'N/D')}W"
                    if act.get('norm_power'): pwr_str += f" (NP: {act.get('norm_power')}W)"
                    
                    # Metrics Dump
                    metrics = []
                    if act.get('pss'): metrics.append(f"TSS: {act.get('pss')}")
                    if act.get('if'): metrics.append(f"IF: {act.get('if')}")
                    if act.get('avg_cadence'): metrics.append(f"Cad: {act.get('avg_cadence')}")
                    if act.get('avg_run_cadence'): metrics.append(f"Run Cad: {act.get('avg_run_cadence')}")
                    if act.get('avg_swolf'): metrics.append(f"Swolf: {act.get('avg_swolf')}")
                    
                    prompt += f"  • [{date_str}] {name} | {dist_km}km in {dur_min}min | HR: {avg_hr}bpm | Pwr: {pwr_str} | {' '.join(metrics)}\n"
        
        # Aggiungi piano di allenamento se disponibile
        if training_plan:
            prompt += f"""
═══════════════════════════════════════════════════════════
📅 PIANO DI ALLENAMENTO CORRENTE
═══════════════════════════════════════════════════════════
Settimane totali: {len(training_plan.get('weeks', []))}
Prossimi allenamenti:
"""
            # Mostra i prossimi 3 allenamenti
            today = datetime.now().date()
            upcoming = []
            for week in training_plan.get('weeks', []):
                for day, workout in week.get('days', {}).items():
                    if workout.get('activity') != 'Rest':
                        # Calcola la data approssimativa
                        upcoming.append(f"  • {workout.get('activity')} - {workout.get('duration', 60)}min")
            
            for workout in upcoming[:3]:
                prompt += workout + "\n"
        
        prompt += f"""
═══════════════════════════════════════════════════════════
🎯 LE TUE CAPACITÀ
═══════════════════════════════════════════════════════════
1. 📊 ANALISI PERFORMANCE
   - Analizzare metriche Garmin (HRV, sonno, stress, Body Battery)
   - Valutare progressi e trend
   - Identificare sovrallenamento o necessità di recupero
   - Dare feedback su allenamenti completati

2. 📝 MODIFICA ALLENAMENTI
   - Adattare intensità e durata
   - Spostare sessioni in base a recupero
   - Suggerire allenamenti alternativi
   - Bilanciare carico di lavoro

3. 🥗 NUTRIZIONE
   - Consigli pre-allenamento (timing e macros)
   - Nutrizione durante allenamenti lunghi
   - Recupero post-workout
   - Strategia nutrizionale per la gara
   - Idratazione personalizzata

4. 🧠 SUPPORTO MENTALE
   - Motivazione personalizzata
   - Gestione ansia pre-gara
   - Strategie di mental training
   - Celebrare successi e gestire battute d'arresto

5. 🔧 TECNICA E TATTICA
   - Consigli su tecnica nuoto/bici/corsa
   - Strategie di pacing
   - Gestione transizioni
   - Preparazione specifica gara

═══════════════════════════════════════════════════════════
💬 STILE COMUNICAZIONE
═══════════════════════════════════════════════════════════
• Professionale ma caloroso e amichevole
• Diretto, pratico e orientato all'azione
• Usa emoji per rendere più vivace: 🏊‍♂️🚴‍♂️🏃‍♂️💪🎯🔥
• Risposte concise (100-200 parole) salvo analisi dettagliate
• Personalizza in base al livello dell'atleta
• Sii onesto: se servono dati che non hai, chiedili
• Celebra i successi, supporta nelle difficoltà

═══════════════════════════════════════════════════════════
⚙️ AZIONI STRUTTURATE
═══════════════════════════════════════════════════════════
Quando l'atleta chiede di MODIFICARE un allenamento, rispondi con:
1. Una spiegazione umana della modifica
2. Un JSON strutturato alla fine del messaggio:

{{
  "action": "modify_workout",
  "date": "YYYY-MM-DD",
  "workout_type": "swim/bike/run",
  "changes": {{
    "duration": 60,
    "intensity": "moderate",
    "description": "Descrizione modifiche",
    "steps": [
       {{ "type": "WARMUP", "duration_min": 10, "description": "Warmup", "target": {{"type": "pace", "val": "6:00"}} }},
       {{ 
          "type": "INTERVAL", "repeat_count": 3,
          "steps": [
             {{ "type": "RUN", "duration_min": 5, "description": "Lavoro Z4", "target": {{"type": "pace", "val": "4:15"}} }},
             {{ "type": "RECOVERY", "duration_min": 3, "description": "Recupero" }}
          ]
       }},
       {{ "type": "COOLDOWN", "duration_min": 5, "description": "Cool down" }}
    ]
  }}
}}

IMPORTANTE SUI PASSI ("steps"):
- Devi SEMPRE scomporre l'allenamento in passi strutturati.
- Usa "repeat_count" per le ripetizioni.
- ⛔ VIETATO scrivere il testo solo in descrizione.
- ✅ OBBLIGATORIO definire "target" per TUTTE le fasi (Warmup, Lavoro, Recupero, Cooldown) se applicabile.
- ⚠️ ATTENZIONE AI RECUPERI: Se il recupero ha una velocità specifica (es. "recupero a 7.5 km/h"), DEVI inserirlo nel target JSON e nella descrizione dello step. Non lasciarlo vuoto!
- FORMATI TARGET:
  - Corsa/Nuoto (Passo): "target": {{"type": "pace", "val": "5:30"}} (min/km o min/100m)
  - Bici (Potenza): "target": {{"type": "power", "val": "200"}} (watt)
  - Cardio (HR): "target": {{"type": "hr", "val": "150"}} (bpm)
- Esempio Nuoto: 4x100m passo 1:45 -> {{"type": "INTERVAL", "distance_m": 100, "target": {{"type": "pace", "val": "1:45"}}, "repeat_count": 4}}


Quando l'atleta chiede ANALISI PERFORMANCE, fornisci:
- Valutazione metriche chiave
- Trend positivi/negativi
- Raccomandazioni specifiche
- Prossimi passi

═══════════════════════════════════════════════════════════
Ricorda: Sei qui per aiutare {user_profile.get('name', "l'atleta")} a raggiungere il suo obiettivo.
Sii il coach che vorresti avere! 💪
═══════════════════════════════════════════════════════════
"""
        
        return prompt
    
    def chat(self, user_message, conversation_history, user_profile, recent_stats=None, training_plan=None):
        """
        Main chat method with enhanced context
        Returns: (response_text, metadata_dict)
        """
        if not self.provider:
             return "⚠️ AI Coach non configurato. Aggiungi OPENAI_API_KEY o GOOGLE_API_KEY al file .env del backend.", {"error": "API key missing"}

        try:
            system_prompt = self.get_system_prompt(user_profile, recent_stats, training_plan)
            assistant_message = ""
            
            if self.provider == "openai":
                # Build messages for API
                messages = [{"role": "system", "content": system_prompt}]
                
                # Add history
                for msg in conversation_history[-10:]:
                    messages.append({"role": msg['role'], "content": msg['content']})
                messages.append({"role": "user", "content": user_message})
                
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=800
                )
                assistant_message = response.choices[0].message.content

            elif self.provider == "google":
                # Gemini Chat history format: [{'role': 'user'/'model', 'parts': ['text']}]
                chat_history = []
                # Add context as first system-like instruction
                # Gemini doesn't have system role in chat, so we prepend context to history.
                # Actually, 1.5 Pro supports system_instruction, but let's be safe and put it in model init or first msg
                
                # Re-init model with system prompt if possible, but keeping it simple:
                # We will send a chat session.
                
                # Convert our history to Gemini format
                # user -> user, assistant -> model
                for msg in conversation_history[-10:]:
                    role = "user" if msg['role'] == "user" else "model"
                    chat_history.append({"role": role, "parts": [msg['content']]})
                
                # Start chat session
                chat = self.client.start_chat(history=chat_history)
                
                # Send message with system prompt prepended (for context)
                # Or use system_instruction if available in library version.
                # Let's try prepending context to the current message if it's the first time or use system_instruction
                
                full_message = f"{system_prompt}\n\nUSER QUESTION: {user_message}"
                response = chat.send_message(full_message)
                assistant_message = response.text
            
            # Check if response contains structured action
            metadata = {}
            if '"action"' in assistant_message or "'action'" in assistant_message:
                try:
                    # Extract JSON from response (could be anywhere in the message)
                    json_start = assistant_message.find("{")
                    json_end = assistant_message.rfind("}") + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = assistant_message[json_start:json_end]
                        action_data = json.loads(json_str)
                        if 'action' in action_data:
                            metadata['action'] = action_data
                            print(f"AI Coach detected action: {action_data.get('action')}")
                except Exception as e:
                    print(f"Failed to parse action JSON: {e}")
            
            return assistant_message, metadata
            
        except Exception as e:
            print(f"AI Coach Error ({self.provider}): {e}")
            import traceback
            traceback.print_exc()
            
            error_msg = "Mi dispiace, ho avuto un problema tecnico. 🔧"
            if "api_key" in str(e).lower():
                error_msg = f"⚠️ Errore di autenticazione {self.provider}. Verifica la tua API key."
            elif "rate_limit" in str(e).lower() or "429" in str(e):
                error_msg = "⏳ Troppi messaggi. Riprova tra poco."
            
            return error_msg, {"error": str(e)}
