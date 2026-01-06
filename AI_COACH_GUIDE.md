# 🤖 Guida AI Coach - ProCoach

## 📋 Panoramica

L'**AI Coach** è un assistente virtuale intelligente integrato in ProCoach che ti aiuta a:
- 📊 Analizzare le tue performance e metriche Garmin
- 📝 Modificare e adattare il tuo piano di allenamento
- 🥗 Ricevere consigli nutrizionali personalizzati
- 🧠 Ottenere supporto mentale e motivazionale
- 🔧 Migliorare tecnica e tattica di gara

---

## ⚙️ Configurazione

### 1. Ottieni una API Key di OpenAI

1. Vai su [platform.openai.com](https://platform.openai.com)
2. Crea un account o effettua il login
3. Vai su **API Keys** nel menu
4. Clicca su **Create new secret key**
5. Copia la chiave (inizia con `sk-...`)

### 2. Configura il Backend

1. Vai nella cartella `backend`
2. Crea un file `.env` (se non esiste già)
3. Aggiungi la tua API key:

```env
OPENAI_API_KEY=sk-tua-chiave-qui
```

4. Riavvia il backend:
```bash
# Ferma il processo corrente (Ctrl+C)
# Riavvia
python main.py
```

### 3. Verifica la Configurazione

Apri la chat AI Coach nell'app. Se vedi il messaggio:
- ✅ **"Ciao! 👋 Sono il tuo coach AI..."** → Tutto OK!
- ❌ **"AI Coach non configurato..."** → Controlla l'API key

---

## 💬 Come Usare l'AI Coach

### Accesso alla Chat

1. Apri ProCoach
2. Clicca su **"AI Coach"** nella barra di navigazione
3. Inizia a chattare!

### Esempi di Domande

#### 📊 Analisi Performance
```
"Come sto andando questa settimana?"
"Analizza le mie metriche recenti"
"Il mio HRV è basso, cosa significa?"
"Dovrei riposare oggi?"
```

#### 📝 Modifica Allenamenti
```
"Modifica l'allenamento di domani, sono molto stanco"
"Posso fare un allenamento più leggero oggi?"
"Sposta la sessione lunga a sabato invece di domenica"
"Riduci l'intensità dell'allenamento di giovedì"
```

#### 🥗 Nutrizione
```
"Cosa mangio prima della gara?"
"Consigli per il recupero post-allenamento"
"Quanti carboidrati servono per un lungo?"
"Strategia di idratazione per una Olympic"
```

#### 🧠 Supporto Mentale
```
"Sono nervoso per la gara, aiutami"
"Come gestire l'ansia pre-gara?"
"Ho saltato un allenamento, mi sento in colpa"
"Motivami per l'allenamento di oggi"
```

#### 🔧 Tecnica e Tattica
```
"Come migliorare la mia tecnica di nuoto?"
"Strategia di pacing per una 70.3"
"Consigli per le transizioni veloci"
"Come gestire le salite in bici?"
```

---

## 🎯 Funzionalità Avanzate

### Contesto Automatico

L'AI Coach ha accesso automatico a:
- ✅ Il tuo profilo completo (età, peso, obiettivi, ecc.)
- ✅ Metriche Garmin in tempo reale (HRV, sonno, stress, Body Battery)
- ✅ Attività recenti (ultimi 7 giorni)
- ✅ Piano di allenamento corrente
- ✅ Cronologia conversazioni

**Non devi ripetere le informazioni!** L'AI sa già chi sei e come stai.

### Azioni Strutturate

Quando chiedi di modificare un allenamento, l'AI:
1. Ti spiega la modifica in linguaggio naturale
2. Genera un JSON strutturato per applicare la modifica (feature futura)

Esempio:
```
Tu: "Riduci l'allenamento di domani a 45 minuti"

AI: "Perfetto! Ho ridotto la sessione di domani da 60 a 45 minuti, 
mantenendo l'intensità moderata. Questo ti darà più tempo per 
recuperare. 💪"

{
  "action": "modify_workout",
  "date": "2026-01-06",
  "workout_type": "run",
  "changes": {
    "duration": 45,
    "intensity": "moderate",
    "description": "Ridotta durata per recupero"
  }
}
```

---

## 💡 Best Practices

### ✅ Fai Questo
- Sii specifico nelle domande
- Fornisci contesto quando necessario
- Chiedi spiegazioni se non capisci
- Usa la chat regolarmente per feedback continuo

### ❌ Evita Questo
- Domande troppo generiche ("Come va?")
- Aspettarsi diagnosi mediche (l'AI non è un dottore!)
- Ignorare i consigli di sicurezza
- Fare troppe richieste in pochi secondi (rate limit)

---

## 🔒 Privacy e Sicurezza

- 🔐 Le conversazioni sono salvate nel database locale
- 🔐 I dati Garmin non vengono inviati a OpenAI (solo metriche aggregate)
- 🔐 L'API key è privata e non deve essere condivisa
- 🔐 Puoi cancellare la cronologia chat in qualsiasi momento

---

## 🐛 Risoluzione Problemi

### Errore: "AI Coach non configurato"
**Soluzione:** Aggiungi `OPENAI_API_KEY` al file `.env` nel backend

### Errore: "Errore di autenticazione OpenAI"
**Soluzione:** Verifica che l'API key sia corretta e valida

### Errore: "Troppi messaggi in poco tempo"
**Soluzione:** Aspetta 10-20 secondi tra un messaggio e l'altro

### L'AI non vede le mie metriche Garmin
**Soluzione:** 
1. Verifica di aver fatto login con Garmin
2. Controlla che le credenziali siano salvate
3. Prova a sincronizzare manualmente dalla dashboard

---

## 💰 Costi

L'AI Coach usa **GPT-4o-mini**, il modello più economico di OpenAI:
- 💵 ~$0.15 per 1 milione di token input
- 💵 ~$0.60 per 1 milione di token output
- 💵 Una conversazione tipica costa **meno di $0.01**

**Stima mensile:** Con 100 messaggi/mese → ~$1-2/mese

---

## 🚀 Prossimi Sviluppi

- [ ] Applicazione automatica modifiche allenamenti
- [ ] Analisi trend a lungo termine
- [ ] Suggerimenti proattivi basati su metriche
- [ ] Integrazione con calendario per reminder
- [ ] Modalità vocale
- [ ] Report settimanali automatici

---

## 📞 Supporto

Hai domande o problemi? Chiedi direttamente all'AI Coach! 😊

Oppure consulta la sezione **Help Center** nell'app.

---

**Buon allenamento con il tuo coach virtuale! 🏊‍♂️🚴‍♂️🏃‍♂️**
