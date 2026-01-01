# 🏊‍♂️ Triathlon Coach & Garmin Sync

Benvenuto nel progetto **Triathlon Coach**, un'applicazione completa per la generazione di piani di allenamento personalizzati per il triathlon e la sincronizzazione automatica con il tuo calendario **Garmin Connect**.

## 🚀 Funzionalità Principali

-   **Piani di Allenamento AI-Driven**: Generazione di tabelle basate su frequenza cardiaca (HR), Critical Swim Speed (CSS), potenza (FTP) e soglia del passo.
-   **Workout Dinamici (Game Feel)**: Pattern avanzati come Piramidi, Scale, Fartlek e Over-Under per evitare la noia e massimizzare lo stimolo fisiologico.
-   **Motivational Coaching**: Note personalizzate e mini-sfide integrate in ogni seduta per un coinvolgimento totale dell'atleta.
-   **Integrazione Garmin Connect**: Sincronizzazione con un clic di tutti gli allenamenti della settimana direttamente sul tuo orologio.
-   **Metriche in Tempo Reale & Reactive Coach**: Download automatico di VO2Max e parametri di salute per aggiustare il carico in base al recupero.
-   **Configurazione Personalizzata**: Impostazione della lunghezza della vasca (25m/50m) e dei giorni di disponibilità.

---

## 🛠 Tech Stack

-   **Backend**: Python 3.10+, FastAPI, SQLAlchemy (SQLite), GarminConnect API.
-   **Frontend**: React, Vite, TailwindCSS, Lucide Icons.
-   **Database**: SQLite per una gestione leggera e locale dei profili atleta.

---

## 📦 Installazione

### 1. Requisiti
-   Python 3.10 o superiore.
-   Node.js (LTS version).

### 2. Configurazione Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Su Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 3. Configurazione Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Manuale d'Uso

### 1. Configurazione Iniziale (Onboarding)
Al primo accesso, inserisci le tue credenziali Garmin Connect e i tuoi dati fisiologici:
-   **FTP**: Per le zone di potenza nel ciclismo.
-   **CSS (min/100m)**: Per i ritmi di nuoto.
-   **Running Threshold**: Per i ritmi di corsa.
-   **Disponibilità**: Indica quanto tempo hai per allenarti ogni giorno della settimana.

### 2. Generazione del Piano
Dalla Dashboard, clicca su "Genera Piano". L'algoritmo creerà una settimana bilanciata con:
-   **Lunedì/Giovedì**: Sessioni di base o recupero.
-   **Mercoledì/Venerdì**: Intervalli e lavori di qualità (Soglia).
-   **Sabato/Domenica**: Uscite lunghe (Long rides/runs).

### 3. Sincronizzazione Garmin
-   Clicca sul tasto **"Sync Calendar"** o sull'icona della nuvola accanto a un singolo allenamento.
-   L'allenamento apparirà istantaneamente sul calendario di **Garmin Connect** e verrà scaricato dal tuo orologio alla prossima sincronizzazione.

---

## ❓ FAQ (Domande Frequenti)

### Perché alcuni allenamenti (es. Mercoledì/Venerdì) non compaiono su Garmin?
Gli allenamenti con intervalli (ripetizioni) sono i più complessi. Assicurati che il tuo orologio supporti gli allenamenti personalizzati. Se il problema persiste, il sistema ha un log interno (`sync_error.log`) che aiuta a identificare campi non supportati.

### Come cambio la lunghezza della vasca?
Puoi farlo dalla sezione "Profilo" nell'Onboarding. Il sistema supporta 25m e 50m. Ricordati che Garmin richiede una lunghezza della piscina valida per gli allenamenti di nuoto.

### Posso usare il sistema senza un account Garmin?
Sì, puoi generare il piano per visualizzarlo sulla dashboard, ma non potrai inviarlo all'orologio o scaricare automaticamente le tue metriche (VO2Max, etc.).

### Cosa sono i blocchi "RepeatGroupDTO"?
È la struttura tecnica che usiamo per inviare le serie (es. 10x100m) a Garmin. Abbiamo ottimizzato questo formato per essere compatibile con i modelli più recenti di orologi Garmin (Fenix, Forerunner, etc.).

---

## 🛠 Debug e Sviluppo

Se riscontri errori durante la sincronizzazione, controlla questi file nella cartella `backend/`:
-   `sync_payload_debug.log`: Contiene l'esatto messaggio JSON inviato a Garmin.
-   `sync_error.log`: Contiene il dettaglio degli errori ricevuti dal server.

---

*Sviluppato con ❤️ per atleti di Triathlon.*
