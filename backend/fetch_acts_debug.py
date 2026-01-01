import asyncio
import json
from garmin_sync import GarminManager
from database import SessionLocal, User

async def main():
    db = SessionLocal()
    user = db.query(User).filter(User.email == 'stefano.bonfanti@libero.it').first()
    if not user:
        print("User not found")
        return
    
    gm = GarminManager(user.email, user.hashed_password)
    # Fetch more days to be sure
    acts = gm.get_recent_activities(days=3)
    
    with open('latest_activities.json', 'w') as f:
        json.dump(acts, f, indent=4)
    print("Activities saved to latest_activities.json")
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
