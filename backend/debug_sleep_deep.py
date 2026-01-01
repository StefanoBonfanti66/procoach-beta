
from database import SessionLocal, User
from garmin_sync import GarminManager
import json
import datetime

def debug_sleep_deep():
    db = SessionLocal()
    user = db.query(User).first()
    if not user: return
    
    gm = GarminManager(user.email, user.hashed_password)
    if not gm.login(): return
    
    target_date = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    try:
        sleep_data = gm.client.get_sleep_data(target_date)
        # Clean print for debugging
        if 'dailySleepDTO' in sleep_data:
            dto = sleep_data['dailySleepDTO']
            print("DTO Content:", json.dumps(dto, indent=2))
        
        if 'sleepScores' in sleep_data:
            print(f"Sleep Scores: {json.dumps(sleep_data['sleepScores'], indent=2)}")
            
        summary = gm.client.get_user_summary(target_date)
        print("Summary Keys:", summary.keys())
        print(f"Summary Sleep Score: {summary.get('sleepScore')}")
        print(f"Summary Body Battery: {summary.get('bodyBatteryMostRecentValue')}")
        print(f"Summary Stress: {summary.get('averageStressLevel')}")
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    debug_sleep_deep()
