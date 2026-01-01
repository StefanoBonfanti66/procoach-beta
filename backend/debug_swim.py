
try:
    from garminconnect.workout import StrokeType, EquipmentType
    print(f"Stroke types: {dir(StrokeType)}")
    print(f"Equipment types: {dir(EquipmentType)}")
except Exception as e:
    print(f"Error: {e}")
    
    # Check if SwimmingWorkout can be created (already confirmed, but let's keep it clean)
    sport_dict = {"sportTypeId": 4, "sportTypeKey": "swimming"}
    pool_unit_dict = {"unitId": 2, "unitKey": "meter"}
    duration_secs = 1800.0
    step = create_interval_step(duration_secs, 1)
    segment = WorkoutSegment(segmentOrder=1, sportType=sport_dict, workoutSteps=[step])
    workout_obj = SwimmingWorkout(
        workoutName="Test Swim",
        description="Test Description",
        sportType=sport_dict,
        estimatedDurationInSecs=duration_secs,
        poolLength=25.0,
        poolLengthUnit=pool_unit_dict,
        workoutSegments=[segment]
    )
    print("SwimmingWorkout object created.")
    try:
        import json
        # Pydantic v2 uses model_dump_json()
        if hasattr(workout_obj, 'model_dump_json'):
            print(workout_obj.model_dump_json(indent=2))
        else:
            print(workout_obj.json(indent=2))
    except Exception as e:
        print(f"Could not print JSON: {e}")

except Exception as e:
    print(f"Error: {e}")
