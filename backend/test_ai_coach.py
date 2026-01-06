"""
Test script per verificare che l'AI Coach sia configurato correttamente
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_key():
    """Test se la chiave OpenAI è configurata"""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ ERRORE: OPENAI_API_KEY non trovata nel file .env")
        print("\n📝 Per configurare:")
        print("1. Crea un file .env nella cartella backend")
        print("2. Aggiungi: OPENAI_API_KEY=sk-tua-chiave-qui")
        print("3. Ottieni la chiave da: https://platform.openai.com/api-keys")
        return False
    
    if not api_key.startswith("sk-"):
        print("⚠️  WARNING: La chiave API non sembra valida (dovrebbe iniziare con 'sk-')")
        return False
    
    print("✅ OPENAI_API_KEY trovata e sembra valida")
    print(f"   Chiave: {api_key[:10]}...{api_key[-4:]}")
    return True

def test_openai_connection():
    """Test connessione a OpenAI"""
    try:
        from openai import OpenAI
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return False
        
        client = OpenAI(api_key=api_key)
        
        # Test semplice
        print("\n🔄 Testing connessione a OpenAI...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": "Rispondi solo con 'OK'"}
            ],
            max_tokens=10
        )
        
        result = response.choices[0].message.content
        print(f"✅ Connessione a OpenAI funzionante!")
        print(f"   Risposta di test: {result}")
        return True
        
    except Exception as e:
        print(f"❌ ERRORE nella connessione a OpenAI: {e}")
        if "api_key" in str(e).lower():
            print("   → La chiave API non è valida o è scaduta")
        elif "rate_limit" in str(e).lower():
            print("   → Hai superato il rate limit. Aspetta qualche minuto.")
        return False

def test_ai_coach():
    """Test AI Coach module"""
    try:
        from ai_coach import AICoach
        
        print("\n🤖 Testing AI Coach module...")
        coach = AICoach()
        
        if not coach.client:
            print("❌ AI Coach non inizializzato (manca API key)")
            return False
        
        # Test con profilo fittizio
        test_profile = {
            "name": "Test Athlete",
            "age": 30,
            "experience_level": "New",
            "primary_objective": "Race",
            "race_distance": "Olympic",
            "race_date": "2026-06-01"
        }
        
        response, metadata = coach.chat(
            "Ciao, sono pronto per iniziare!",
            [],
            test_profile
        )
        
        print("✅ AI Coach funzionante!")
        print(f"   Risposta: {response[:100]}...")
        return True
        
    except Exception as e:
        print(f"❌ ERRORE nel test AI Coach: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database():
    """Test database setup"""
    try:
        from database import ChatMessage, SessionLocal
        
        print("\n💾 Testing database...")
        db = SessionLocal()
        
        # Verifica che la tabella esista
        count = db.query(ChatMessage).count()
        print(f"✅ Database funzionante!")
        print(f"   Messaggi salvati: {count}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ ERRORE nel database: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 TEST AI COACH - ProCoach")
    print("=" * 60)
    
    results = []
    
    # Test 1: API Key
    print("\n[1/4] Verifica API Key...")
    results.append(test_openai_key())
    
    # Test 2: Connessione OpenAI
    if results[0]:
        print("\n[2/4] Test connessione OpenAI...")
        results.append(test_openai_connection())
    else:
        print("\n[2/4] ⏭️  Saltato (API key mancante)")
        results.append(False)
    
    # Test 3: AI Coach Module
    if results[1]:
        print("\n[3/4] Test AI Coach module...")
        results.append(test_ai_coach())
    else:
        print("\n[3/4] ⏭️  Saltato (connessione fallita)")
        results.append(False)
    
    # Test 4: Database
    print("\n[4/4] Test database...")
    results.append(test_database())
    
    # Riepilogo
    print("\n" + "=" * 60)
    print("📊 RIEPILOGO TEST")
    print("=" * 60)
    
    tests = [
        "API Key configurata",
        "Connessione OpenAI",
        "AI Coach module",
        "Database"
    ]
    
    for i, (test_name, result) in enumerate(zip(tests, results), 1):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i}. {test_name}: {status}")
    
    passed = sum(results)
    total = len(results)
    
    print("\n" + "=" * 60)
    if passed == total:
        print("🎉 TUTTI I TEST SUPERATI!")
        print("L'AI Coach è pronto all'uso! 🚀")
    else:
        print(f"⚠️  {total - passed}/{total} test falliti")
        print("\nConsulta AI_COACH_GUIDE.md per la configurazione")
    print("=" * 60)

if __name__ == "__main__":
    main()
