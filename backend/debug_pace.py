import asyncio
from coach_logic import CoachLogic

async def debug():
    cl = CoachLogic()
    user_profile = {
        "name": "Stefano",
        "running_threshold": "5:07",
        "ftp": 204,
        "race_distance": "Olympic",
        "availability": {"Mon": 60, "Tue": 60, "Wed": 60, "Thu": 60, "Fri": 60, "Sat": 120, "Sun": 180},
        "habits": {"day_preferences": {"Sun": {"run": 120}}}
    }
    plan = await cl.generate_ai_plan(user_profile)
    for week in plan["weeks"][:1]:
        sun = week["days"]["Sun"]
        print(f"Activity: {sun['activity']}")
        for step in sun["steps"]:
            if "repeat_count" in step:
                for s in step["steps"]:
                    print(f"  Rep Step: {s.get('description')} | Pace MS: {s.get('pace_ms')}")
            else:
                print(f"Step: {step.get('description')} | Pace MS: {step.get('pace_ms')}")

asyncio.run(debug())
