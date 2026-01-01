import requests

def test_login():
    url = "http://localhost:8005/user/sync-metrics"
    payload = {"email": "test@example.com", "password": "password"}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
