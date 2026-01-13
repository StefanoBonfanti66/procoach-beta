
import sqlite3
import json

def extract():
    try:
        conn = sqlite3.connect('triathlon_coach_v6.db')
        cursor = conn.cursor()
        
        email = 'stefano.bonfanti@libero.it'
        cursor.execute("SELECT email, garmin_tokens FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        
        if row:
            email, tokens = row
            if tokens:
                with open('garmin_token_da_copiare.txt', 'w') as f:
                    f.write(tokens)
                print(f"Token estratti correttamente in 'garmin_token_da_copiare.txt'")
            else:
                print(f"L'utente {email} esiste ma non ha token salvati.")
        else:
            print(f"Utente {email} non trovato.")
            
        conn.close()
    except Exception as e:
        print(f"Errore: {e}")

if __name__ == "__main__":
    extract()
