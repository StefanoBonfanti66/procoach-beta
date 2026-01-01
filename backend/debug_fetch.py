
from database import SessionLocal, User
from garmin_sync import GarminManager
import json

def debug_activities():
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        print("No user found")
        return
    
    print(f"Testing for {user.email}")
    gm = GarminManager(user.email, user.hashed_password)
    activities = gm.get_recent_activities(days=30)
    
    print(f"Found {len(activities) if activities else 0} activities")
    if activities:
        for a in activities[:3]:
            print(f" - {a['date']}: {a['name']} ({a['type']})")

if __name__ == "__main__":
    debug_activities()
