
import json
import logging
from typing import Dict, Any, List
import datetime

class CoachLogic:
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        
    def generate_training_plan_prompt(self, user_profile: Dict[str, Any]) -> str:
        """
        Constructs the detailed prompt for the AI Coach based on the user profile.
        """
        name = user_profile.get("name", "Athlete")
        age = user_profile.get("age")
        gender = user_profile.get("gender", "Unknown")
        exp_level = user_profile.get("experience_level", "Beginner")
        primary_obj = user_profile.get("primary_objective", "Fitness")
        race_dist = user_profile.get("race_distance", "Sprint")
        race_date = user_profile.get("race_date", "TBD")
        goal_time = user_profile.get("race_time_goal", "Completion")
        availability = user_profile.get("availability", {})
        ftp = user_profile.get("ftp")
        css = user_profile.get("css")
        run_thresh = user_profile.get("running_threshold")
        hr_max = user_profile.get("hr_max")
        
        # BRIDGE: Extract insights from AI Coach if available
        ai_insights = user_profile.get("ai_insights", "")
        
        prompt = f"""
SEI UN COACH DI TRIATHLON DI LIVELLO AVANZATO.
Il tuo compito è creare un piano di allenamento strutturato per:

PROFILO ATLETA
- Nome: {name}
- Età: {age}, Sesso: {gender}
- Livello Esperienza: {exp_level}
- Obiettivo Principale: {primary_obj}
- Distanza Gara: {race_dist}
- Data Gara: {race_date}
- Obiettivo Tempo: {goal_time}

DATI FISIOLOGICI ATTUALI
- FTP (Ciclismo): {ftp} W
- CSS (Nuoto): {css} sec/100m
- Soglia Corsa: {run_thresh} min/km
- FC Max: {hr_max} bpm

DIRETTIVE REATTIVE DALL'AI COACH (IMPORTANTE):
{ai_insights if ai_insights else "Nessuna direttiva specifica. Segui i principi standard di programmazione."}

DISPONIBILITÀ ORARIA (Minuti per giorno)
- Lun: {availability.get('Mon', 0)} min
- Mar: {availability.get('Tue', 0)} min
- Mer: {availability.get('Wed', 0)} min
- Gio: {availability.get('Thu', 0)} min
- Ven: {availability.get('Fri', 0)} min
- Sab: {availability.get('Sat', 0)} min
- Dom: {availability.get('Sun', 0)} min

PREFERENZE DISCIPLINE (Durate in minuti se specificate, altrimenti 0)
- Lun: {user_profile.get('habits', {}).get('day_preferences', {}).get('Mon', {})}
- Mar: {user_profile.get('habits', {}).get('day_preferences', {}).get('Tue', {})}
- Mer: {user_profile.get('habits', {}).get('day_preferences', {}).get('Wed', {})}
- Gio: {user_profile.get('habits', {}).get('day_preferences', {}).get('Thu', {})}
- Ven: {user_profile.get('habits', {}).get('day_preferences', {}).get('Fri', {})}
- Sab: {user_profile.get('habits', {}).get('day_preferences', {}).get('Sat', {})}
- Dom: {user_profile.get('habits', {}).get('day_preferences', {}).get('Sun', {})}

PRINCIPI DI PROGRAMMAZIONE DA RISPETTARE:
1. Periodizzazione: Base -> Build -> Peak -> Taper.
2. Distribuzione intensità 80/20 (80% facile, 20% moderato/alto).
3. Cicli di carico 3+1 (3 settimane carico, 1 scarico).
4. Specificità: inserire brick (bici+corsa) nelle fasi Build/Peak.
5. Forza: almeno 1 sessione a settimana se il tempo lo consente.

FORMATO OUTPUT RICHIESTO (STRETTAMENTE JSON):
Restituisci ESCLUSIVAMENTE un oggetto JSON valido che rispetti questo schema esatto. 
Non aggiungere testo introduttivo o conclusivo fuori dal JSON.

{{
  "overview": {{
    "total_weeks": <int>,
    "phases": [
      {{"name": "Base", "weeks": [1,2,3...], "focus": "..."}}
    ]
  }},
  "weeks": [
    {{
      "week_number": 1,
      "phase": "Base",
      "focus": "...",
      "days": [
        {{
          "day": "Mon",
          "activity": "swim | bike | run | rest | strength",
          "duration": <int_minutes>,
          "intensity": "Low | Moderate | High",
          "steps": [
             {{
               "description": "Riscaldamento 10 min",
               "duration_min": 10,
               "type": "WARMUP"
             }},
             {{
               "description": "Lavoro centrale...",
               "duration_min": 40,
               "type": "INTERVAL"
             }}
          ]
        }}
        ... (tutti i 7 giorni)
      ]
    }}
    ... (tutte le settimane fino alla gara)
  ]
}}

IMPORTANTE: 
- Assicurati che "duration" sia la somma dei "duration_min" degli step.
- Gli "steps" devono essere dettagliati per essere eseguiti da un computer (Garmin).
- Se l'attività è "Rest", "duration" deve essere 0 e "steps" vuoto.
- Genera un piano completo da OGGI fino alla DATA GARA ({race_date}).
"""
        return prompt

    def mock_generate_plan(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a sophisticated, rule-based training plan scaled by race distance 
        and strictly honoring personal physiological metrics.
        """
        race_dist = user_profile.get("race_distance", "Olympic")
        availability = user_profile.get("availability", {})
        
        # Volume Multipliers by Race Distance
        dist_multipliers = {
            "Sprint": 0.7,
            "Olympic": 1.0,
            "70.3": 1.5,
            "Ironman": 2.2
        }
        vol_mult = dist_multipliers.get(race_dist, 1.0)
        
        weeks = 12
        plan_weeks = []
        phases = ["BASE"] * 4 + ["BUILD"] * 4 + ["PEAK"] * 2 + ["RACE"] * 1 + ["RECOVERY"] * 1
        
        # --- REACTIVE ENGINE ---
        health = user_profile.get("health_metrics")
        readiness_mod = 1.0
        reactive_note = ""
        
        if health:
            sleep_score = health.get("sleep_score")
            hrv = health.get("hrv")
            rhr = health.get("rhr")
            
            # 1. Sleep Impact
            if sleep_score and sleep_score < 60:
                readiness_mod *= 0.85
                reactive_note += f"⚠️ Sonno scarso ({sleep_score}). Carico ridotto del 15%. "
            elif sleep_score and sleep_score > 85:
                readiness_mod *= 1.05
                reactive_note += f"🔥 Ottimo riposo ({sleep_score}). Sei pronto a spingere! "
            
            # 2. HRV Impact (suppressed HRV)
            if hrv and hrv < 40:
                readiness_mod *= 0.9
                reactive_note += "📉 HRV sotto la media. Ridotta intensità di picco. "
            
            # 3. RHR Impact
            if rhr and rhr > 65:
                readiness_mod *= 0.95
                reactive_note += "💓 FC a riposo elevata. Sessioni abbreviate. "
        
        # 4. Recent Activities Impact
        recent_acts = user_profile.get("recent_activities", [])
        if recent_acts:
            total_dur_last_7 = sum(act.get('duration_min', 0) for act in recent_acts)
            if total_dur_last_7 > 480: # Over 8 hours
                 readiness_mod *= 0.90
                 reactive_note += "🏋️ Carico molto elevato nell'ultima settimana. Riduzione precauzionale del volume. "
            elif total_dur_last_7 < 60: # Under 1 hour
                 reactive_note += "🐢 Poco attivo recentemente. Iniziamo con cautela. "

        if reactive_note:
            print(f"REACTIVE COACH ACTIVE: {reactive_note}")

        # Physiological Metrics
        ftp = float(user_profile.get("ftp") or 200)
        
        # Pacing Run (m/s)
        try:
            m, s = map(int, str(user_profile.get("running_threshold", "5:00")).split(":"))
            run_thresh_ms = 1000.0 / (m * 60 + s)
        except:
            run_thresh_ms = 3.33 # 5:00/km

        # Pacing Swim (m/s)
        try:
            m, s = map(int, str(user_profile.get("css", "2:00")).split(":"))
            css_ms = 100.0 / (m * 60 + s)
        except:
            css_ms = 0.83 # 2:00/100m

        def get_workout_for_day(day, phase, week_num):
            # Apply readiness modifier to first few sessions (Week 1)
            final_mod = readiness_mod if week_num == 1 else 1.0
            day_avail = int(availability.get(day, 60) * final_mod)
            
            if day_avail == 0:
                return {"activity": "Rest", "duration": 0, "intensity": "Rest", "steps": []}

            # Check sport preferences (habits)
            habits = user_profile.get("habits", {})
            day_prefs = habits.get("day_preferences", {}).get(day, {})
            # Preferred sports are those with duration > 0
            preferred_sports = [s for s, d in day_prefs.items() if d > 0]
            
            # Basic logic for session type selection
            session_map_a = {
                "Mon": ("run", "Moderate", "TEMPO"),
                "Tue": ("swim", "Low", "DRILLS"),
                "Wed": ("bike", "High", "INTERVALS"),
                "Thu": ("run", "Low", "BASE"),
                "Fri": ("swim", "High", "SOGLIA"),
                "Sat": ("bike", "Low", "LONG"),
                "Sun": ("run", "Moderate", "LONG")
            }
            session_map_b = {
                "Mon": ("swim", "High", "INTERVALS"),
                "Tue": ("run", "High", "INTERVALS"),
                "Wed": ("rest", "Rest", ""),
                "Thu": ("bike", "Moderate", "TEMPO"),
                "Fri": ("run", "Low", "BASE"),
                "Sat": ("run", "Moderate", "LONG"),
                "Sun": ("bike", "Low", "LONG")
            }
            
            # Determine session type and base attributes
            base_map = session_map_a if week_num % 2 != 0 else session_map_b
            act_type, intensity, subtype = base_map.get(day)
            
            # --- SPORT PREFERENCE OVERWRITE ---
            if preferred_sports:
                if act_type not in preferred_sports:
                    act_type = preferred_sports[0]
                    # Map the original subtype intent to the new sport
                    # If it was an interval day, keep intervals. If long, keep long.
                    if subtype not in ["INTERVALS", "LONG", "TEMPO", "SOGLIA", "DRILLS", "BASE"]:
                        subtype = "BASE"
                    # Intensity is preserved from the original day intent
                    if act_type == "swim" and subtype == "LONG":
                        subtype = "BASE" # Swim long usually just base or drills
            
            # Creative Naming Logic
            name_map = {
                "TEMPO": {"swim": "Swim Tempo Rhythm", "bike": "Steady State Power", "run": "Tempo Run"},
                "DRILLS": {"swim": "Swim Tech & Drills", "bike": "High Cadence Skill", "run": "Run Form Drills"},
                "INTERVALS": {"swim": "Swim Power Intervals", "bike": "FTP Builder", "run": "Threshold Repeats"},
                "BASE": {"swim": "Easy Aerobic Swim", "bike": "Aero Endurance", "run": "Foundation Run"},
                "SOGLIA": {"swim": "Swim Threshold Set", "bike": "Sweet Spot Grinder", "run": "Lactate Threshold"},
                "LONG": {"swim": "Endurance Ladder", "bike": "Iron Ride", "run": "Endurance Miles"},
                "VO2MAX": {"swim": "Explosive Blast", "bike": "VO2 Max Boost", "run": "Speed Killers"}
            }
            
            # Overwrite for BUILD/PEAK phases with VO2 Max sessions
            if phase in ["BUILD", "PEAK"] and day in ["Wed", "Tue"]:
                if subtype == "INTERVALS":
                    subtype = "VO2MAX"
                    intensity = "High"

            activity_display = name_map.get(subtype, {}).get(act_type, act_type.capitalize())
            if phase == "RECOVERY": activity_display = f"Easy {act_type.capitalize()}"

            if act_type == "rest":
                 return {"activity": "Rest Day", "duration": 0, "intensity": "Rest", "steps": []}

            intensity_map = {
                "BASE": 1.0,
                "BUILD": 1.10,
                "PEAK": 1.15,
                "RACE": 1.10,
                "RECOVERY": 0.85
            }
            
            # Subtype intensity factor
            subtype_mult = 1.0
            if subtype == "VO2MAX": subtype_mult = 1.20 # 120% of threshold
            elif subtype == "SOGLIA": subtype_mult = 1.05 # 105% of threshold
            elif subtype == "TEMPO": subtype_mult = 0.95 
            elif subtype == "INTERVALS": subtype_mult = 1.02 # Slightly above threshold for builder
            elif subtype == "LONG": subtype_mult = 0.80
            
            phase_i_mult = intensity_map.get(phase, 1.0) * subtype_mult
            
            # --- REACTIVE MODIFIER (Reactive Coach) ---
            # If mod < 1.0 (tired), we reduce intensity for Week 1. 
            # If mod > 1.0 (fresh), we keep planned intensity (safety).
            if final_mod < 1.0:
                phase_i_mult *= final_mod

            # Base Durations
            base_durs = {"run": 45, "bike": 60, "swim": 45}
            if subtype == "LONG": 
                base_durs = {"run": 90, "bike": 150}
            elif subtype == "VO2MAX":
                base_durs = {"run": 40, "bike": 50, "swim": 40} # Harder but shorter

            # Target duration (Default vs User Preference)
            pref_dur = day_prefs.get(act_type, 0)
            if pref_dur > 0:
                target_dur = pref_dur
            else:
                target_dur = int(base_durs.get(act_type, 60) * vol_mult)
                # Phase adjustments for duration (Only for defaults)
                if phase == "BUILD": target_dur = int(target_dur * 1.2)
                elif phase == "PEAK": target_dur = int(target_dur * 1.1)
                elif phase == "RECOVERY": target_dur = int(target_dur * 0.7)
            
            # Clip by availability
            duration = min(target_dur, day_avail)
            if duration < 20 and day_avail >= 20: duration = 20

            # Step Generation
            steps = []
            
            # --- ADVANCED PATTERN GENERATION SYSTEM ---
            steps = []
            motivational_note = ""

            # Helper for motivational messages
            messages = [
                "Oggi lavoriamo sulla variabilità: il corpo odia la routine, la mente la ama. Sorprendi entrambi!",
                "Mini-Sfida: l'ultima ripetizione deve essere la più fluida, non la più sofferta.",
                "Focus: senti il ritmo, non guardare solo l'orologio. Trova il tuo 'flow'.",
                "Questo workout serve a costruire resilienza mentale: la gara si vince negli ultimi chilometri.",
                "Game Feel: immagina ogni blocco come un livello di un videogioco. Livella il tuo fitness!",
                "Punta alla tecnica: nel nuoto e nella corsa, l'efficienza batte la forza bruta.",
                "Recupero: se oggi ti senti svuotato, riduci l'intensità del 10% ma finisci il volume.",
                "Idratazione: simula oggi la strategia che userai in gara. Ogni sorso conta.",
                "Cadenza: mantieni un ritmo agile. La gamba pesante in bici si paga nella corsa.",
                "Disciplina: il vero atleta si vede quando piove o quando è stanco. Sii quel tipo di atleta."
            ]
            days_idx_map = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}
            d_idx = days_idx_map.get(day, 0)
            motivational_note = messages[(week_num + d_idx) % len(messages)]

            # Core Pattern selection based on subtype and week_num
            pattern_idx = week_num % 3 # Basic rotation

            wu_dur = int(duration * 0.2)
            cd_dur = int(duration * 0.15)
            main_dur = duration - wu_dur - cd_dur

            def get_power_zone(mult):
                if mult < 0.56: return "Z1"
                if mult < 0.76: return "Z2"
                if mult < 0.91: return "Z3"
                if mult < 1.06: return "Z4"
                if mult < 1.21: return "Z5"
                return "Z6+"

            # Warmup (common)
            p_wu = 0.55 if act_type == "bike" else 0.65
            wu_step = {"description": f"Riscaldamento {wu_dur}′", "duration_min": wu_dur, "type": "WARMUP"}
            if act_type == "run": wu_step["pace_ms"] = run_thresh_ms * p_wu
            elif act_type == "bike": wu_step["power_watts"] = int(ftp * p_wu); wu_step["description"] += f" @ {int(ftp*p_wu)}W"
            elif act_type == "swim": 
                wu_m = (wu_dur * 60 * css_ms // 50) * 50
                wu_step = {"description": f"Riscaldamento {int(wu_m)}m", "distance_m": wu_m, "type": "WARMUP", "pace_ms": css_ms * 0.8}
            steps.append(wu_step)

            # --- MAIN PART PATTERNS ---
            if subtype in ["INTERVALS", "VO2MAX", "SOGLIA"]:
                if pattern_idx == 0: # CLASSIC REPEATS
                    reps = 6 if subtype == "VO2MAX" else 4
                    if act_type == "swim":
                        rep_dist = 100
                        reps = main_dur // 2
                        rep_steps = [
                            {"description": f"Serie {rep_dist}m", "distance_m": rep_dist, "type": "INTERVAL", "pace_ms": css_ms * phase_i_mult},
                            {"description": "Recupero 20s", "duration_min": 0.33, "type": "RECOVERY"}
                        ]
                    else:
                        w_time = main_dur // reps - 1
                        rep_steps = [
                            {"description": f"Blocco {w_time}′", "duration_min": w_time, "type": "INTERVAL", "pace_ms": run_thresh_ms * phase_i_mult if act_type == "run" else None, "power_watts": int(ftp * phase_i_mult) if act_type == "bike" else None},
                            {"description": "Recupero 1′", "duration_min": 1, "type": "RECOVERY", "pace_ms": run_thresh_ms * 0.65 if act_type == "run" else None, "power_watts": int(ftp * 0.5) if act_type == "bike" else None}
                        ]

                    steps.append({
                        "repeat_count": reps,
                        "description": f"Serie {reps}x" + (f"[{rep_dist}m]" if act_type == "swim" else f"[{w_time}′ + 1′]"),
                        "steps": rep_steps
                    })

                elif pattern_idx == 1: # PYRAMID / LADDER
                    if act_type == "swim":
                        dists = [50, 100, 150, 100, 50]
                        for d in dists:
                            steps.append({"description": f"Piramde {d}m", "distance_m": d, "type": "INTERVAL", "pace_ms": css_ms * phase_i_mult})
                            steps.append({"description": "Recupero 15s", "duration_min": 0.25, "type": "RECOVERY"})
                    else:
                        blocks = [2, 4, 3, 2] if subtype == "VO2MAX" else [4, 6, 8, 6, 4]
                        actual_blocks = []
                        scale = main_dur / sum(blocks)
                        for b in blocks:
                            b_dur = max(1, int(b * scale * 0.8))
                            actual_blocks.append(b_dur)
                        
                        for i, b_dur in enumerate(actual_blocks):
                            m_step = {"description": f"Piramide Step {i+1} ({b_dur}′)", "duration_min": b_dur, "type": "INTERVAL", "pace_ms": run_thresh_ms * phase_i_mult if act_type == "run" else None, "power_watts": int(ftp * phase_i_mult) if act_type == "bike" else None}
                            steps.append(m_step)
                            if i < len(actual_blocks)-1:
                                steps.append({"description": "Recupero 1′", "duration_min": 1, "type": "RECOVERY"})

                else: # LADDER or OVER-UNDER
                    if act_type == "bike" and subtype == "SOGLIA":
                        reps = main_dur // 6
                        rep_steps = [
                            {"description": "2′ Over Threshold", "duration_min": 2, "type": "INTERVAL", "power_watts": int(ftp * 1.05)},
                            {"description": "2′ Under Threshold", "duration_min": 2, "type": "INTERVAL", "power_watts": int(ftp * 0.90)},
                            {"description": "2′ Recovery", "duration_min": 2, "type": "RECOVERY", "power_watts": int(ftp * 0.55)}
                        ]
                        steps.append({"repeat_count": reps, "description": f"Over-Under {reps}x[2'+2'+2']", "steps": rep_steps})
                    elif act_type == "swim":
                        reps = main_dur // 3
                        rep_steps = [
                            {"description": "150m Tempo Swim", "distance_m": 150, "type": "INTERVAL", "pace_ms": css_ms * 0.95},
                            {"description": "30s Rest", "duration_min": 0.5, "type": "RECOVERY"}
                        ]
                        steps.append({"repeat_count": reps, "description": "Tempo Sets", "steps": rep_steps})
                    else:
                        ladders = [1, 2, 3, 4, 3, 2, 1]
                        for l in ladders:
                            l_dur = max(1, int(l * (main_dur / sum(ladders))))
                            steps.append({"description": f"Ladder {l_dur}′", "duration_min": l_dur, "type": "INTERVAL", "pace_ms": run_thresh_ms * phase_i_mult if act_type == "run" else None, "power_watts": int(ftp * phase_i_mult) if act_type == "bike" else None})
                            steps.append({"description": "Recupero 30s", "duration_min": 0.5, "type": "RECOVERY"})

            elif subtype == "LONG":
                if pattern_idx == 0: # STEADY PROGRESSIVE
                    p1 = main_dur // 2
                    p2 = main_dur - p1
                    steps.append({"description": "Steady Part", "duration_min": p1, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.72, "power_watts": int(ftp * 0.70)})
                    steps.append({"description": "Progressive Part", "duration_min": p2, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.82, "power_watts": int(ftp * 0.80)})
                elif pattern_idx == 1: # WITH SURGES
                    reps = main_dur // 15
                    rep_steps = [
                        {"description": "Endurance Pace", "duration_min": 14, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.75, "power_watts": int(ftp * 0.72)},
                        {"description": "1′ Surge Tempo", "duration_min": 1, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.90, "power_watts": int(ftp * 0.95)}
                    ]
                    steps.append({"repeat_count": reps, "description": "Endurance with 1' Surges", "steps": rep_steps})
                else: # NEGATIVE SPLIT
                    p1 = int(main_dur * 0.6)
                    p2 = main_dur - p1
                    steps.append({"description": "First Half (Comfort)", "duration_min": p1, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.70, "power_watts": int(ftp * 0.68)})
                    steps.append({"description": "Second Half (Negative Split)", "duration_min": p2, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.80, "power_watts": int(ftp * 0.82)})

            else: # BASE / DRILLS
                if act_type == "swim":
                    # Drills focus
                    reps = max(4, main_dur // 4)
                    rep_steps = [
                        {"description": "50m Drill (Sculling/Single Arm)", "distance_m": 50, "type": "INTERVAL", "pace_ms": css_ms * 0.75},
                        {"description": "50m Perfect Form Swim", "distance_m": 50, "type": "INTERVAL", "pace_ms": css_ms * 0.90},
                        {"description": "20s Rest", "duration_min": 0.33, "type": "RECOVERY"}
                    ]
                    steps.append({"repeat_count": reps, "description": f"Tech Block {reps}x[50+50]", "steps": rep_steps})
                else:
                    # Variation: Fartlek or Cadence Play
                    if act_type == "bike":
                        steps.append({"description": "Steady Ride with High Cadence (>95) blocks", "duration_min": main_dur, "type": "INTERVAL", "power_watts": int(ftp * 0.7), "cadence": 100})
                    else:
                        # Fartlek
                        reps = main_dur // 4
                        rep_steps = [
                            {"description": "2′ Moderate", "duration_min": 2, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.85},
                            {"description": "2′ Easy", "duration_min": 2, "type": "INTERVAL", "pace_ms": run_thresh_ms * 0.70}
                        ]
                        steps.append({"repeat_count": reps, "description": "Fartlek Play", "steps": rep_steps})

            # Cooldown (common)
            cd_step = {"description": f"Defaticamento {cd_dur}′", "duration_min": cd_dur, "type": "COOLDOWN"}
            if act_type == "run": cd_step["pace_ms"] = run_thresh_ms * 0.60
            elif act_type == "bike": cd_step["power_watts"] = int(ftp * 0.5)
            elif act_type == "swim":
                cd_m = (cd_dur * 60 * css_ms // 50) * 50
                cd_step = {"description": f"Defaticamento {int(cd_m)}m", "distance_m": cd_m, "type": "COOLDOWN", "pace_ms": css_ms * 0.75}
            steps.append(cd_step)

            # --- TOTAL DISTANCE CALCULATION ---
            total_dist_m = 0
            for s in steps:
                repeat = s.get("repeat_count", 1)
                substeps = s.get("steps", [s])
                for rs in substeps:
                    step_dist = 0
                    if rs.get("distance_m"):
                        step_dist = rs["distance_m"]
                    elif rs.get("duration_min") and rs.get("pace_ms"):
                        step_dist = rs["duration_min"] * 60 * rs["pace_ms"]
                    elif rs.get("duration_min") and act_type == "bike":
                        # Estimate bike distance: approx 30km/h average for Z2/Z3
                        speed_ms = (ftp * phase_i_mult / 200) * 8.33 
                        step_dist = rs["duration_min"] * 60 * speed_ms
                    
                    total_dist_m += step_dist * repeat

            return {
                "activity": activity_display,
                "sport_type": act_type, # Explicit sport type for reliable sync
                "duration": duration,
                "distance_km": round(total_dist_m / 1000.0, 1),
                "intensity": intensity,
                "steps": steps,
                "note": motivational_note
            }

        # --- STANDARD PLAN GENERATION LOOP ---
        for w in range(1, weeks + 1):
            phase = phases[w-1]
            days_data = {}
            for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
                days_data[day] = get_workout_for_day(day, phase, w)
            
            focus_themes = {
                "BASE": "Settimana Foundation: Costruzione della base aerobica e tecnica.",
                "BUILD": "Settimana Ladder & Power: Aumento del carico e lavori strutturati.",
                "PEAK": "Settimana Specificity: Ritmo gara e resistenza mentale.",
                "RECOVERY": "Settimana Regenerate: Recupero attivo e focus sulla tecnica.",
                "RACE": "Settimana Taper: Freschezza e velocità."
            }
            week_payload = {
                "week_number": w,
                "phase": phase,
                "focus": focus_themes.get(phase, f"Concentrazione su {phase.lower()}"),
                "days": days_data
            }
            
            if w == 1 and reactive_note:
                week_payload["coach_note"] = reactive_note
                
            plan_weeks.append(week_payload)

        # --- REACTIVE OVERRIDE ENGINE (The "Proactive" logic) ---
        # "Se faccio un allenamento intenso ed il coach vede che ne sono uscito stravolto..."
        
        # 1. Identify "Exhaustion" State
        is_exhausted = False
        exhaustion_reason = []
        
        # Check Health Metrics (Objective Recover)
        if health:
            bb = health.get("body_battery", 100) or 100
            sleep = health.get("sleep_score", 100) or 100
            
            if bb < 35:
                is_exhausted = True
                exhaustion_reason.append(f"Body Battery critica ({bb}/100)")
            elif sleep < 50:
                is_exhausted = True
                exhaustion_reason.append(f"Sonno insufficiente ({sleep}/100)")
                
        # Check Recent Activity Intensity (Acute Load)
        last_hard_activity = None
        if recent_acts:
            # Sort by date descending
            sorted_acts = sorted(recent_acts, key=lambda x: str(x.get('startTimeLocal', '')), reverse=True)
            if sorted_acts:
                last_act = sorted_acts[0]
                # Check for high internal load (e.g. high HR for long duration)
                # Use (val or 0) to safely handle None
                avg_hr = last_act.get('averageHeartRate') or 0
                dur = (last_act.get('duration') or 0) / 60 # min
                
                # Simple threshold: HR > 160 for > 40 mins OR Any activity > 2 hours
                if (avg_hr > 160 and dur > 40) or (dur > 120):
                    # Potential fatigue source
                    if is_exhausted: # Confirmatory
                        exhaustion_reason.append(f"recupero post-{last_act.get('activityName', 'allenamento')}")
                    else:
                        # Even if metrics are ok, checking if it was REALLY hard
                        if avg_hr > 170 and dur > 60:
                            is_exhausted = True
                            exhaustion_reason.append("carico cardiaco eccessivo ieri")

        # 2. Apply Proactive Modification to Week 1
        if is_exhausted and plan_weeks:
            week1 = plan_weeks[0]
            days = week1["days"]
            # Find the first non-rest day to modify
            # Assuming we are generating for the week starting today/tomorrow
            for d_name, w_data in days.items():
                if w_data["activity"] != "Rest" and w_data["activity"] != "Rest Day":
                    # MODIFY THIS WORKOUT
                    original_type = w_data["activity"]
                    
                    # Downgrade Logic
                    w_data["activity"] = "Recovery Run" if w_data["sport_type"] == "run" else ("Recovery Ride" if w_data["sport_type"] == "bike" else "Easy Swim")
                    w_data["intensity"] = "Low"
                    w_data["duration"] = max(30, int(w_data["duration"] * 0.6))
                    w_data["steps"] = [{
                        "description": f"Recupero Attivo (modificato da {original_type})",
                        "duration_min": w_data["duration"],
                        "type": "RECOVERY",
                        "pace_ms": None,
                        "power_watts": int(ftp * 0.55) if w_data["sport_type"] == "bike" else None
                    }]
                    
                    # Add Proactive Note
                    reason_str = ", ".join(exhaustion_reason)
                    week1["coach_note"] = f"🛑 ANTIGRAVITY INTERVENTION: Ho rilevato {reason_str}. Ho trasformato l'allenamento di {d_name} in una sessione di recupero per evitare il sovrallenamento."
                    week1["proactive_modification"] = True
                    break # Only modify the immediate next one

        return {"weeks": plan_weeks}

    def _generate_technical_opinion(self, activity: Dict[str, Any], planned: Dict[str, Any] = None) -> str:
        """
        Generates a professional, technical, and realist coach opinion based on metrics.
        """
        name = activity.get("name") or "Sessione"
        sport = (activity.get("type") or "").lower()
        duration = activity.get("duration_min", 0)
        avg_hr = activity.get("avg_hr", 0)
        max_hr = activity.get("max_hr", 0)
        avg_power = activity.get("avg_power", 0)
        
        # Determine sport type
        is_bike = any(x in sport for x in ["cycl", "bike", "ride"])
        is_run = "run" in sport
        is_swim = "swim" in sport
        
        # Professional feedback mapping
        opinion = "Analisi sessione: dati insufficienti per un feedback tecnico approfondito."

        if is_bike:
            if avg_power and avg_power > 0:
                if avg_hr and avg_hr > 0:
                    efficiency_ratio = avg_power / avg_hr
                    if "Sweet Spot" in name or (planned and "Sweet Spot" in planned.get("activity", "")):
                        if avg_hr < 150:
                            opinion = f"Efficienza Sweet Spot confermata ({round(efficiency_ratio, 2)} P/HR). Il motore aerobico risponde bene, la deriva cardiaca è contenuta."
                        else:
                            opinion = "Lavoro Sweet Spot completato, ma il carico interno (HR) è eccessivo. Possibile affaticamento residuo o scarso adattamento termico."
                    elif avg_power > 260:
                        opinion = f"Potenza media elevata ({round(avg_power)}W). Attenzione alla gestione del glicogeno: sessioni di questo tipo richiedono un recupero di almeno 36-48h."
                    else:
                        opinion = f"Erogazione regolare. Focus sulla cadenza: se sei sotto le 80rpm stai sovraccaricando le articolazioni inutilmente."
                else:
                    opinion = f"Sessione di potenza pura ({round(avg_power)}W). Senza dati HR non posso valutare il costo metabolico. Assicurati di non aver lavorato in apnea."
            elif avg_hr:
                if avg_hr > 158:
                    opinion = "Battito cardiaco fuori range aerobico. Se non era un lavoro di soglia, hai spinto troppo. Nel triathlon la disciplina dell'intensità è tutto."
                else:
                    opinion = "Lavoro di fondo aerobico. Mantieni questo ritmo per costruire la base capillare necessaria per le frazioni lunghe."

        elif is_run:
            if avg_hr:
                if avg_hr > 170:
                    opinion = "Intensità da zona anaerobica/VO2Max. Utile per la potenza, ma pericoloso per l'infortunio se la tecnica decade sotto stress. Monitora il dolore ai tibiali."
                elif avg_hr < 138:
                    opinion = "Recupero attivo ben eseguito. Mantenere i battiti bassi oggi permette di spingere domani. Non cedere alla tentazione di accelerare."
                else:
                    if duration > 60:
                        opinion = "Corsa estesa in Z2/Z3. Buona resistenza, ma valuta se c'è 'decoupling' (deriva cardiaca) dopo i 45 minuti."
                    else:
                        opinion = "Sessione di corsa standard. Focus sulla frequenza dei passi: punta a 175-180 spm per ridurre l'impatto."
            else:
                opinion = "Corsa completata. Inserisci dati cardio per un'analisi del carico interno. Il ritmo da solo non spiega la fatica."

        elif is_swim:
            if duration < 30:
                opinion = "Sessione troppo breve per stimoli fisiologici significativi. Spero tu abbia lavorato puramente sulla tecnica di bracciata (catch phase)."
            else:
                opinion = "Volume nuoto completato. Ricorda: nel triathlon il nuoto serve a uscire dall'acqua freschi per la bici, non a fare il record del mondo."

        # Contextual adjustment based on plan comparison
        if planned:
            planned_dur = planned.get("duration", 0)
            if planned_dur > 0:
                if duration > planned_dur * 1.3:
                    opinion += " ATTENZIONE: Volume eccessivo rispetto al piano (+30%). Rischi di compromettere i lavori di qualità dei prossimi giorni."
                elif duration < planned_dur * 0.6:
                    opinion = f"Obiettivo fallito sul volume: solo {round(duration)} min su {planned_dur} previsti. La costanza è l'unico segreto nel triathlon."

        return opinion

    def analyze_executed_activities(self, planned_weeks: List[Dict[str, Any]], executed_activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compares planned workouts with executed activities and provides feedback.
        """
        analysis = {
            "overall_compliance": 0,
            "matches": [],
            "coach_feedback": "",
            "all_activities_feedback": []
        }
        
        # Map executed activities by date (can be multiple per day)
        executed_map = {}
        for act in executed_activities:
            date_str = act.get("date")
            if date_str not in executed_map:
                executed_map[date_str] = []
            executed_map[date_str].append(act)
            
        # Flatten planned workouts into a map {date: {workout, week}}
        planned_map = {}
        if planned_weeks:
            for week in planned_weeks:
                # Some safety check
                if not isinstance(week, dict) or "start_date" not in week: continue
                
                try:
                    start_date = datetime.date.fromisoformat(week["start_date"])
                except: continue

                days_map = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}
                for day_name, workout in week.get("days", {}).items():
                    if workout.get("activity") == "Rest": continue
                    
                    date_val = start_date + datetime.timedelta(days=days_map.get(day_name, 0))
                    date_str = date_val.isoformat()
                    planned_map[date_str] = {
                        "workout": workout,
                        "day": day_name,
                        "week": week.get("week_number")
                    }

        total_planned = 0
        total_executed_on_planned = 0
        matched_executed_ids = set()
        
        # Comparison logic
        for date_str, plan_info in planned_map.items():
            planned_workout = plan_info["workout"]
            planned_dur = planned_workout.get("duration", 0)
            total_planned += planned_dur
            
            # Find matching executed activity
            matches_today = executed_map.get(date_str, [])
            best_match = None
            
            # Match by sport type if possible
            plan_sport = planned_workout.get("sport_type", "").lower()
            for act in matches_today:
                act_type = act.get("type", "").lower()
                is_match = False
                if plan_sport == "swim" and "swim" in act_type: is_match = True
                elif plan_sport == "bike" and ("cycl" in act_type or "bike" in act_type): is_match = True
                elif plan_sport == "run" and "run" in act_type: is_match = True
                
                if is_match:
                    best_match = act
                    break
            
            if best_match:
                exec_dur = best_match.get("duration_min", 0)
                total_executed_on_planned += min(exec_dur, planned_dur)
                matched_executed_ids.add(best_match.get("activityId"))
                
                opinion = self._generate_technical_opinion(best_match, planned_workout)

                analysis["matches"].append({
                    "date": date_str,
                    "planned_name": planned_workout.get("activity"),
                    "executed_name": best_match.get("name"),
                    "planned_duration": planned_dur,
                    "executed_duration": exec_dur,
                    "compliance_pct": round((exec_dur / planned_dur * 100), 1) if planned_dur > 0 else 100,
                    "status": "Completed" if exec_dur >= planned_dur * 0.8 else "Partial",
                    "avg_hr": best_match.get("avg_hr"),
                    "avg_power": best_match.get("avg_power"),
                    "max_power": best_match.get("max_power"),
                    "calories": best_match.get("calories"),
                    "coach_opinion": opinion
                })
            else:
                analysis["matches"].append({
                    "date": date_str,
                    "planned_name": planned_workout.get("activity"),
                    "executed_name": None,
                    "planned_duration": planned_dur,
                    "executed_duration": 0,
                    "compliance_pct": 0,
                    "status": "Missed"
                })

        # Generate feedback for ALL executed activities
        for act in executed_activities:
            is_matched = act.get("activityId") in matched_executed_ids
            planned_ref = planned_map.get(act.get("date"), {}).get("workout")
            
            opinion = self._generate_technical_opinion(act, planned_ref if is_matched else None)
            
            analysis["all_activities_feedback"].append({
                "activityId": act.get("activityId"),
                "name": act.get("name"),
                "date": act.get("date"),
                "type": act.get("type"),
                "duration": act.get("duration_min"),
                "avg_hr": act.get("avg_hr"),
                "avg_power": act.get("avg_power"),
                "opinion": opinion,
                "is_extra": not is_matched
            })

        analysis["all_activities_feedback"].sort(key=lambda x: x.get("date") or "0000-00-00", reverse=True)

        if total_planned > 0:
            analysis["overall_compliance"] = round((total_executed_on_planned / total_planned) * 100, 1)
        
        # Global Coach Feedback
        if analysis["overall_compliance"] > 90:
            analysis["coach_feedback"] = "Eccellente! Stai seguendo il piano con grande precisione. Continua così, la forma sta crescendo."
        elif analysis["overall_compliance"] > 70:
            analysis["coach_feedback"] = "Buon lavoro. Hai saltato o ridotto qualche sessione, ma la costanza è buona. Cerca di recuperare i lavori di qualità."
        else:
            analysis["coach_feedback"] = "Attenzione: la compliance è bassa. Se hai avuto intoppi o stanchezza, adeguiamo il piano delle prossime settimane."

        return analysis

    async def generate_ai_plan(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Placeholder for real OpenAI integration.
        Requires an API key and the 'openai' package.
        """
        # In a real implementation:
        # response = await openai.ChatCompletion.acreate(
        #     model="gpt-4",
        #     messages=[{"role": "user", "content": self.generate_training_plan_prompt(user_profile)}]
        # )
        # return json.loads(response.choices[0].message.content)
        return self.mock_generate_plan(user_profile)
