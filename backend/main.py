from fastapi import FastAPI, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import SessionLocal, engine, User, get_db
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

# Load env vars from .env file (local dev)
load_dotenv()

app = FastAPI(title="Triathlon Coach API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"VALIDATION ERROR: {exc.errors()}")
    print(f"BODY: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(await request.body())},
    )

from pydantic import BaseModel, Field, ConfigDict

class UserProfileSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: str
    password: Optional[str] = None
    name: Optional[str] = "Athlete"
    age: Optional[int] = 30
    weight: Optional[float] = 70.0
    height: Optional[float] = 175.0
    experience_level: Optional[str] = "New"
    primary_objective: Optional[str] = "Race"
    race_distance: Optional[str] = "Olympic"
    race_date: Optional[str] = None
    race_time_goal: Optional[str] = None  # Target race finish time in HH:MM:SS format
    hr_rest: Optional[int] = 60
    hr_max: Optional[int] = 190
    ftp: Optional[int] = 200
    vo2_max_run: Optional[float] = None
    vo2_max_cycle: Optional[float] = None
    css: Optional[str] = None
    running_threshold: Optional[str] = None
    hr_max_cycle: Optional[int] = None
    hr_max_swim: Optional[int] = None
    lactate_threshold_hr: Optional[int] = None
    gender: Optional[str] = None
    birthdate: Optional[str] = None
    availability: Dict[str, int] = Field(default_factory=dict)
    habits: Optional[Dict[str, Any]] = {}
    pool_length: Optional[float] = 25.0

@app.get("/")
async def root():
    return {"message": "Triathlon Coach API is running"}

@app.post("/user/sync-metrics")
async def sync_metrics(credentials: Dict[str, str], db: Session = Depends(get_db)):
    print(f"DEBUG: Sync request received for {credentials.get('email')}")
    
    # Try to find existing tokens
    db_user = db.query(User).filter(User.email == credentials.get('email')).first()
    tokens = db_user.garmin_tokens if db_user else None
    
    from garmin_sync import GarminManager
    gm = GarminManager(credentials['email'], credentials['password'], tokens=tokens)
    metrics = gm.get_performance_metrics()
    
    # Save tokens to help Cloud instance
    if gm.get_session_tokens() and db_user:
        db_user.garmin_tokens = gm.get_session_tokens()
        db.commit()
    
    if not metrics:
        print("WARNING: Sync failed during onboarding, but proceeding to allow user creation.")
        return {"status": "partial_success", "metrics": {}, "warning": "Garmin sync skipped"}
    
    if isinstance(metrics, dict) and "error" in metrics:
        print(f"WARNING: Garmin login error: {metrics['error']}. Proceeding anyway.")
        return {"status": "partial_success", "metrics": {}, "warning": metrics["error"]}
        
    return {"status": "success", "metrics": metrics}

@app.post("/user/profile")
async def update_profile(profile: UserProfileSchema, db: Session = Depends(get_db)):
    print(f"DEBUG: Received profile update for {profile.email}")
    try:
        db_user = db.query(User).filter(User.email == profile.email).first()
        
        if not db_user:
            db_user = User(email=profile.email)
            db.add(db_user)
        
        db_user.name = profile.name
        db_user.age = profile.age
        db_user.weight = profile.weight
        db_user.height = profile.height
        db_user.experience_level = profile.experience_level
        db_user.primary_objective = profile.primary_objective
        db_user.race_distance = profile.race_distance
        db_user.race_date = profile.race_date
        db_user.hr_rest = profile.hr_rest
        db_user.hr_max = profile.hr_max
        db_user.ftp = profile.ftp
        db_user.vo2_max_run = profile.vo2_max_run
        db_user.vo2_max_cycle = profile.vo2_max_cycle
        db_user.css = profile.css
        db_user.running_threshold = profile.running_threshold
        db_user.hr_max_cycle = profile.hr_max_cycle
        db_user.hr_max_swim = profile.hr_max_swim
        db_user.lactate_threshold_hr = profile.lactate_threshold_hr
        db_user.gender = profile.gender
        db_user.birthdate = profile.birthdate
        db_user.availability = profile.availability
        db_user.habits = profile.habits
        db_user.pool_length = profile.pool_length
        
        if profile.password:
            db_user.hashed_password = profile.password
            
        db.commit()
        db.refresh(db_user)
        return {"status": "success", "user": {"email": db_user.email}}
    except Exception as e:
        print(f"ERROR UPDATING PROFILE: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/profile/{email}")
async def get_profile(email: str, db: Session = Depends(get_db)):
    print(f"DEBUG: Fetching profile for {email}")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return as much data as we have, but naturally don't send the password in a real app
    # (Here we might send it back if that's what the current frontend expects, 
    # but let's be safe and return the fields we have)
    return {
        "email": db_user.email,
        "name": db_user.name,
        "age": db_user.age,
        "weight": db_user.weight,
        "height": db_user.height,
        "experience_level": db_user.experience_level or "New",
        "primary_objective": db_user.primary_objective or "Race",
        "race_distance": db_user.race_distance or "Olympic",
        "race_date": db_user.race_date,
        "race_time_goal": db_user.race_time_goal,
        "hr_rest": db_user.hr_rest,
        "hr_max": db_user.hr_max,
        "ftp": db_user.ftp,
        "vo2_max_run": db_user.vo2_max_run,
        "vo2_max_cycle": db_user.vo2_max_cycle,
        "css": db_user.css,
        "running_threshold": db_user.running_threshold,
        "hr_max_cycle": db_user.hr_max_cycle,
        "hr_max_swim": db_user.hr_max_swim,
        "lactate_threshold_hr": db_user.lactate_threshold_hr,
        "gender": db_user.gender,
        "birthdate": db_user.birthdate,
        "availability": db_user.availability or {},
        "habits": db_user.habits or {},
        "pool_length": db_user.pool_length or 25.0,
        "password": db_user.hashed_password # For internal sync simplicity in this dev phase
    }

@app.get("/user/training-stats/{email}")
async def get_training_stats(email: str, db: Session = Depends(get_db)):
    print(f"DEBUG: Fetching training stats for {email}")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not db_user.hashed_password:
        raise HTTPException(status_code=400, detail="User credentials not found")
        
    from garmin_sync import GarminManager
    gm = GarminManager(db_user.email, db_user.hashed_password, tokens=db_user.garmin_tokens)
    stats = gm.get_training_stats(days=30)
    
    # Save tokens to persist session
    if gm.get_session_tokens():
        db_user.garmin_tokens = gm.get_session_tokens()
        db.commit()
    
    if not stats:
        raise HTTPException(status_code=500, detail="Failed to calculate training stats")
        
    return stats

@app.get("/user/health-metrics/{email}")
async def get_health_metrics(email: str, db: Session = Depends(get_db)):
    print(f"DEBUG: Fetching health metrics for {email}")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not db_user.hashed_password:
        raise HTTPException(status_code=400, detail="User credentials not found")
        
    from garmin_sync import GarminManager
    gm = GarminManager(db_user.email, db_user.hashed_password)
    metrics = gm.get_health_metrics()
    
    if not metrics:
        raise HTTPException(status_code=500, detail="Failed to fetch health metrics")
        
    return metrics

@app.get("/user/recent-activities/{email}")
async def get_recent_activities(email: str, db: Session = Depends(get_db)):
    print(f"DEBUG: Fetching recent activities for {email}")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not db_user.hashed_password:
        raise HTTPException(status_code=400, detail="User credentials not found")
        
    from garmin_sync import GarminManager
    gm = GarminManager(db_user.email, db_user.hashed_password)
    activities = gm.get_recent_activities(days=14)
    
    return activities

@app.post("/user/generate-plan")
async def generate_plan(payload: Dict[str, str], db: Session = Depends(get_db)):
    email = payload.get("email")
    print(f"DEBUG: Generating detailed plan for {email}")

    from garmin_sync import GarminManager
    from coach_logic import CoachLogic
    
    # 1. Load User Profile
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
         raise HTTPException(status_code=404, detail="User not found")
         
    # 2. Fetch Health Metrics & Recent Activities (Reactive Coaching)
    health_metrics = None
    recent_activities = []
    if db_user.hashed_password:
        try:
            gm = GarminManager(db_user.email, db_user.hashed_password)
            health_metrics = gm.get_health_metrics()
            recent_activities = gm.get_recent_activities(days=7) # Last week
            print(f"DEBUG: Reactive metrics for {email}: {health_metrics}")
            print(f"DEBUG: Recent activities for {email}: {len(recent_activities)}")
        except Exception as e:
            print(f"DEBUG: Could not fetch reactive data: {e}")

    # 3. Prepare User Data for Coach
    user_data = {
        "name": db_user.name,
        "age": db_user.age,
        "primary_objective": db_user.primary_objective,
        "race_distance": db_user.race_distance,
        "race_date": db_user.race_date,
        "race_time_goal": db_user.race_time_goal,
        "ftp": db_user.ftp,
        "css": db_user.css,
        "running_threshold": db_user.running_threshold,
        "hr_max": db_user.hr_max,
        "availability": db_user.availability or {},
        "habits": db_user.habits or {},
        "health_metrics": health_metrics, # This activates the reactive logic
        "recent_activities": recent_activities
    }
    
    cl = CoachLogic()
    plan_structure = await cl.generate_ai_plan(user_data)
    
    # Post-process dates (Critical for Calendar Sync)
    import datetime
    start_date = datetime.date.today()
    # Find next Monday
    while start_date.weekday() != 0:
        start_date += datetime.timedelta(days=1)
        
    final_plan_weeks = []
    
    for i, week in enumerate(plan_structure.get("weeks", [])):
        week_start = start_date + datetime.timedelta(weeks=i)
        week_end = week_start + datetime.timedelta(days=6)
        
        week["start_date"] = week_start.isoformat()
        week["end_date"] = week_end.isoformat()
        final_plan_weeks.append(week)
        
    return {"status": "success", "plan": final_plan_weeks}

@app.post("/user/sync-calendar")
async def sync_calendar(payload: Dict[str, Any], db: Session = Depends(get_db)):
    email = payload.get("email")
    week_data = payload.get("week_data")
    print(f"DEBUG: Syncing calendar for {email}, week {week_data.get('week_number')}")
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password:
         raise HTTPException(status_code=400, detail="User credentials not found")
         
    from garmin_sync import GarminManager
    gm = GarminManager(user.email, user.hashed_password)
    
    results = []
    import datetime
    
    try:
        if not gm.login():
             raise HTTPException(status_code=400, detail="Garmin login failed")
             
        # Week start date
        week_start_str = week_data.get("start_date")
        week_start = datetime.date.fromisoformat(week_start_str)
        
        days_map = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}
        
        for p_day, workout in week_data.get("days", {}).items():
            if workout.get("activity") == "Rest":
                continue
                
            day_offset = days_map.get(p_day, 0)
            workout_date = week_start + datetime.timedelta(days=day_offset)
            workout_date_str = workout_date.isoformat()
            
            # Skip past dates if desired, but user might want to fill history.
            # Let's just push.
            
            activity_type = "RUNNING" # Default
            act_lower = workout.get("activity", "").lower()
            sport_meta = workout.get("sport_type", "").lower()
            
            if sport_meta == "swim" or "swim" in act_lower or "nuoto" in act_lower: 
                activity_type = "SWIMMING"
            elif sport_meta == "bike" or "cycl" in act_lower or "bik" in act_lower or "rid" in act_lower or "bici" in act_lower: 
                activity_type = "CYCLING"
            else: 
                activity_type = "RUNNING"
            
            description = f"Phase: {week_data.get('phase')}. Intensity: {workout.get('intensity')}."
            
            print(f"Scheduling {activity_type} on {workout_date_str}")
            
            success = gm.create_and_schedule_workout(
                name=workout.get('activity'),
                description=description,
                duration_min=workout.get("duration", 60),
                date_str=workout_date_str,
                activity_type=activity_type,
                steps=workout.get("steps"),
                pool_length=user.pool_length or 25.0
            )
            results.append({"day": p_day, "success": success})

    except Exception as e:
        print(f"Sync error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"status": "success", "results": results}

@app.post("/user/sync-single-workout")
async def sync_single_workout(payload: Dict[str, Any], db: Session = Depends(get_db)):
    email = payload.get("email")
    workout = payload.get("workout")
    date_str = payload.get("date") # Expected YYYY-MM-DD
    
    print(f"DEBUG: Syncing single workout for {email}, workout {workout.get('activity')} on {date_str}")
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password:
         raise HTTPException(status_code=400, detail="User credentials not found")
         
    from garmin_sync import GarminManager
    gm = GarminManager(user.email, user.hashed_password)
    
    try:
        if not gm.login():
             raise HTTPException(status_code=400, detail="Garmin login failed")
             
        activity_type = "RUNNING"
        act_lower = workout.get("activity", "").lower()
        sport_meta = workout.get("sport_type", "").lower()

        if sport_meta == "swim" or "swim" in act_lower or "nuoto" in act_lower: 
            activity_type = "SWIMMING"
        elif sport_meta == "bike" or "cycl" in act_lower or "bik" in act_lower or "rid" in act_lower or "bici" in act_lower: 
            activity_type = "CYCLING"
        
        success = gm.create_and_schedule_workout(
            name=workout.get('activity'),
            description=workout.get('description', 'Saved from Library'),
            duration_min=workout.get("duration", 60),
            date_str=date_str,
            activity_type=activity_type,
            steps=workout.get("steps"),
            pool_length=user.pool_length or 25.0
        )
        return {"status": "success", "workout_id": success}

    except Exception as e:
        print(f"Single sync error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/analyze-compliance")
async def analyze_compliance(payload: Dict[str, Any], db: Session = Depends(get_db)):
    email = payload.get("email")
    plan = payload.get("plan") # The current full plan
    
    print(f"DEBUG: analyze_compliance for {email}")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password:
         raise HTTPException(status_code=400, detail="User credentials not found")
         
    from garmin_sync import GarminManager
    from coach_logic import CoachLogic
    
    gm = GarminManager(user.email, user.hashed_password)
    # Fetch last 30 days to have a good look back
    recent_activities = gm.get_recent_activities(days=30)
    
    if recent_activities is None:
        print(f"DEBUG: Garmin login failed for {email}")
        raise HTTPException(status_code=401, detail="Garmin login failed. Please check your credentials.")
    
    print(f"DEBUG: Found {len(recent_activities)} activities for {email}")
        
    cl = CoachLogic()
    analysis = cl.analyze_executed_activities(plan, recent_activities)
    print(f"DEBUG: Analysis complete. All feedback count: {len(analysis['all_activities_feedback'])}")
    
    return {"status": "success", "analysis": analysis}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
