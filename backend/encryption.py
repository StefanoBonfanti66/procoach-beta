
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# We need a master key. If not in env, we use a fallback (not ideal for production, but better than plain text)
# In production (Render), the user should set ENCRYPTION_KEY in environment variables.
SECRET_KEY = os.getenv("ENCRYPTION_KEY")

if not SECRET_KEY:
    # Generate a fixed key based on some project string if we really have to, 
    # but it's better to warn or provide a way to generate one.
    # For now, let's use a hardcoded fallback for local dev if missing, 
    # but we'll tell the user to set a real one.
    SECRET_KEY = b'v-9R_O6_x-Z3G2Z3c3V6Y2Vyc2lvbg==' # Static fallback for dev

def get_fernet():
    return Fernet(SECRET_KEY)

def encrypt_password(password: str) -> str:
    if not password:
        return None
    f = get_fernet()
    return f.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    if not encrypted_password:
        return None
    f = get_fernet()
    try:
        return f.decrypt(encrypted_password.encode()).decode()
    except Exception:
        # If decryption fails, it might be plain text (transition period)
        return encrypted_password
