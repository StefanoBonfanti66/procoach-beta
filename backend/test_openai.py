import os
from dotenv import load_dotenv
import openai

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

print(f"API Key present: {bool(api_key)}")
if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key start: {api_key[:5]}...")

try:
    client = openai.OpenAI(api_key=api_key)
    # Simple test call
    print("Attempting simple API call...")
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5
        )
        print("API Call Success!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"API Call Failed: {e}")
except Exception as e:
    print(f"Client Init Failed: {e}")
