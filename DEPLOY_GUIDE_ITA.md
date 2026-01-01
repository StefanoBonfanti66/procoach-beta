
# Guida al Deploy (Versione Semplificata)

Dato che hai già un account Netlify e vuoi usare Supabase, ecco il piano più semplice per andare online mantenendo gratuito l'hosting.

## 1. Database: Supabase (Postgres)
1. Vai su [Supabase](https://supabase.com/) e crea un nuovo progetto (es. `pro-coach-beta`).
2. Una volta creato, vai in **Settings** > **Database** > **Connection string** > **URI**.
3. Copia la stringa. Sarà simile a: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. **Non devi creare tabelle manualmente**: ci penserà il backend al primo avvio.

## 2. Backend: Render (Hosting Python Gratuito)
Poiché Netlify ospita solo siti statici (Frontend), dobbiamo ospitare il "cervello" Python altrove. Render è il migliore e gratuito.

1. Vai su [Render](https://render.com/) e crea un account.
2. Clicca **New** > **Web Service**.
3. Collega il tuo repository GitHub.
4. Nelle impostazioni:
   - **Name**: `procoach-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Scorri giù fino a **Advanced** > **Environment Variables** e aggiungi:
   - `DATABASE_URL`: Incolla la stringa copiata da Supabase.
   - `PYTHON_VERSION`: `3.10.0` (opzionale, ma consigliato)
6. Clicca **Create Web Service**.
7. Aspetta che il deploy finisca. Copia l'URL che ti darà (es. `https://procoach-backend.onrender.com`).

**Nota Importante**: Il piano gratuito di Render "addormenta" il server dopo 15 minuti di inattività. Il primo accesso potrebbe richiedere 50-60 secondi.

## 3. Frontend: Netlify
1. Nel tuo progetto locale, apri il file `frontend/netlify.toml`.
2. Modifica la riga sotto `[[redirects]]`:
   
   Da:
   `to = "https://REPLACE_WITH_YOUR_RENDER_BACKEND_URL/users/:splat"`
   
   A (usa il tuo URL di Render):
   `to = "https://procoach-backend.onrender.com/api/user/:splat"` (Nota: assicurati che il percorso combaci. Il tuo backend sembra non avere il prefisso `/api` nel file main.py, ma le chiamate frontend lo usano. Netlify farà da ponte).

   *Correzione*: Il tuo backend attuale risponde direttamente (es. `/user/...`). Il frontend chiama `/api/user/...`.
   Quindi nel `netlify.toml` la regola corretta è:
   
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://<IL-TUO-RENDER-URL>/:splat"
     status = 200
     force = true
   ```
   
3. Pusha le modifiche su GitHub.
4. Vai su Netlify > **Add new site** > **Import an existing project** > GitHub.
5. Seleziona il repo.
6. Impostazioni Build:
   - **Publish directory**: `dist`
   - **Build command**: `npm run build`
   - **Base directory**: `frontend` (IMPORTANTE: perché il tuo frontend è in una sottocartella).
7. Clicca **Deploy**.

## Conclusione
- **Sviluppo Locale**: Continuerà a funzionare con `npm run dev` e `python main.py` usando il database SQLite locale.
- **Beta Test Mobile**: Accederai all'URL di Netlify. Questo parlerà con Render, che salverà i dati su Supabase.
