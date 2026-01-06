import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"GOOGLE API Key found: {bool(api_key)}")

if api_key:
    print(f"Key starts with: {api_key[:10]}...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        print("Model configured. Sending test message...")
        response = model.generate_content("Ciao, sei attivo?")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Google Gemini Error: {e}")
else:
    print("No API Key in .env")
