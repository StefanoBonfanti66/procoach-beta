
from database import SessionLocal, User
from garmin_sync import GarminManager
from coach_logic import CoachLogic
import json
import datetime

def test_analysis():
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        print("No user found")
        return
    
    print(f"Testing analysis for {user.email}")
    gm = GarminManager(user.email, user.hashed_password)
    recent_activities = gm.get_recent_activities(days=30)
    
    print(f"Found {len(recent_activities) if recent_activities else 0} activities")
    
    cl = CoachLogic()
    # Test with empty plan
    analysis = cl.analyze_executed_activities([], recent_activities)
    
    print(f"Analysis generated. all_activities_feedback count: {len(analysis.get('all_activities_feedback', []))}")
    if analysis.get('all_activities_feedback'):
        print(f"First activity feedback: {analysis['all_activities_feedback'][0]['opinion']}")

if __name__ == "__main__":
    test_analysis()
