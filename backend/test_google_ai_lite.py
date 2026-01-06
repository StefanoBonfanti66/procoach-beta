import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print("Testing gemini-2.0-flash-lite...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    response = model.generate_content("Ciao!")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-2.0-flash-lite: {e}")
