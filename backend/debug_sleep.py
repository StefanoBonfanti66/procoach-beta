
from database import SessionLocal, User
from garmin_sync import GarminManager
import json
import datetime

def debug_sleep():
    db = SessionLocal()
    user = db.query(User).first()
    if not user: return
    
    gm = GarminManager(user.email, user.hashed_password)
    if not gm.login(): return
    
    target_date = datetime.date.today().isoformat()
    try:
        sleep_data = gm.client.get_sleep_data(target_date)
        print("Sleep Data keys:", sleep_data.keys())
        if 'dailySleepDTO' in sleep_data:
            dto = sleep_data['dailySleepDTO']
            print("DTO keys:", dto.keys())
            print("Sleep Score (DTO):", dto.get('sleepScore'))
        
        if 'sleepScores' in sleep_data:
            print("Sleep Scores:", sleep_data['sleepScores'])
            
        summary = gm.client.get_user_summary(target_date)
        print("Summary Sleep Score (if any):", summary.get('sleepScore'))
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    debug_sleep()
