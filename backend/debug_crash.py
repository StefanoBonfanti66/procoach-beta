import asyncio
from coach_logic import CoachLogic

async def debug():
    cl = CoachLogic()
    user_data = {
        "name": "Stefano",
        "age": 40,
        "primary_objective": "Triathlon",
        "race_distance": "Olympic",
        "race_date": "2025-06-01",
        "race_time_goal": "2:30",
        "ftp": 204,
        "css": "2:00",
        "running_threshold": "5:07",
        "hr_max": 180,
        "availability": {"Mon": 60, "Tue": 60, "Wed": 60, "Thu": 60, "Fri": 60, "Sat": 120, "Sun": 180},
        "habits": {"day_preferences": {"Sun": {"run": 120}}}
    }
    try:
        plan = await cl.generate_ai_plan(user_data)
        print("Plan generated successfully!")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(debug())
