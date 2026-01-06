import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"GOOGLE API Key found: {bool(api_key)}")

if api_key:
    try:
        genai.configure(api_key=api_key)
        # Using 'gemini-pro' as configured in ai_coach.py now
        model = genai.GenerativeModel('gemini-pro')
        
        print("Model configured (gemini-pro). Sending test message...")
        chat = model.start_chat(history=[])
        response = chat.send_message("Ciao, sei attivo?")
        
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Google Gemini Error: {e}")
else:
    print("No API Key in .env")
