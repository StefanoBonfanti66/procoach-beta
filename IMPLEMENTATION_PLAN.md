# 📋 Piano Lavori - Triathlon ProCoach

## 0. Stato Attuale (31 Dicembre 2025)
- **Backend**: Motore di generazione riscritto per supportare pattern dinamici (Ladders, Pyramids, Fartleks).
- **Frontend**: Dashboard aggiornata con visualizzazione note del coach e grafici di intensità reali.
- **Stabilizzazione**: Risolti bug critici su calcolo distanze e sincronizzazione sport preferiti.

---

## 📅 Prossimi Step (Piano Lavori Gennaio 2026)

### 🚀 Fase 1: Affinamento e Robustezza (Domani)
- [ ] **Test End-to-End Garmin Sync**: Verificare che i nuovi pattern complessi (Over-Under, Piramidi) vengano correttamente interpretati dall'API Garmin senza errori di schema.
- [ ] **Miglioramento Nuoto**: Estendere la logica delle "Drills" per includere cataloghi specifici (es. "Focus Bracciata", "Lavoro Gambe") invece di generici Drill.
- [ ] **Gestione Errori UI**: Aggiungere alert più chiari se il backend è offline o se la generazione fallisce per parametri fisici assurdi.

### 🧠 Fase 2: Mental Coaching & "Game Feel"
- [ ] **Livelli Atleta**: Implementare un sistema di "XP" basato sulla compliance degli allenamenti (es. "Hai sbloccato il livello 2: Specialista delle Scale").
- [ ] **Feedback Post-Sync**: Recuperare l'esito dell'allenamento caricato su Garmin e mostrare una conferma "Pronto per domani!".
- [ ] **Race Strategy**: Aggiungere negli allenamenti "Peak" dei suggerimenti specifici sulla gestione del ritmo in base ai dati di soglia.

### 📊 Fase 3: Analytics & Progressi
- [ ] **Trend Settimanali**: Visualizzare graficamente se la soglia (FTP/Run) sta migliorando nelle ultime 4 settimane.
- [ ] **Integrazione Meteo**: (Opzionale) Suggerire variazioni ai workout in base alle previsioni locali per le uscite lunghe.

---

## ✅ Task Completati (Oggi)
1. **[Visual]** Grafici Dashboard basati su intensità reale (m/s e Watt) invece che su blocchi piatti.
2. **[Logic]** Motore a 20+ Pattern Dinamici (Ladders, Pyramids, Fartleks, Surges).
3. **[UX]** Note motivazionali e "Game Feel" aggiunti ai workout.
4. **[Bugfix]** Corretto errore `TypeError` su calcolo distanze e rimosso calcolo ritmi errati (es. 3:49/km su Endurance).
5. **[Sync]** Migliorata la gestione delle preferenze sport: se l'atleta cambia sport, l'intensità (High/Low) viene ora preservata correttamente.
