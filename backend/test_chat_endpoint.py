import requests
import json

# Simula una richiesta di chat come fa il frontend
url = "http://localhost:8005/api/chat"

payload = {
    "email": "stefano.bonfanti@libero.it",
    "message": "Ciao, come va?"
}

print("Sending chat request to backend...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("\n" + "="*50 + "\n")

try:
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print("\nResponse Body:")
    print(json.dumps(response.json(), indent=2))
except requests.exceptions.Timeout:
    print("ERROR: Request timed out after 30 seconds")
except requests.exceptions.ConnectionError as e:
    print(f"ERROR: Could not connect to backend: {e}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")
