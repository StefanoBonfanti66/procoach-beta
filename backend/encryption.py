
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# We need a master key. If not in env, we use a fallback (not ideal for production)
SECRET_KEY = os.getenv("ENCRYPTION_KEY")

if not SECRET_KEY:
    # A valid 32-byte base64 encoded key for local development
    SECRET_KEY = "IJe3RwfQ1Hqx3zJp8k10lyQ2f1P_fsFFnrwl75QCAC4="

def get_fernet():
    # Fernet requires bytes
    key = SECRET_KEY.encode() if isinstance(SECRET_KEY, str) else SECRET_KEY
    return Fernet(key)

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
