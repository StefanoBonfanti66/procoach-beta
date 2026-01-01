import sqlite3
import os

db_path = r"c:\progetti_stefano\automations\garmin_connect\backend\triathlon_coach_v4.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    columns_to_add = [
        ("hr_max_cycle", "INTEGER"),
        ("hr_max_swim", "INTEGER"),
        ("lactate_threshold_hr", "INTEGER"),
        ("gender", "TEXT"),
        ("birthdate", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists")
            else:
                print(f"Error adding {col_name}: {e}")
    
    conn.commit()
    conn.close()
    print("Database migration complete.")
else:
    print("Database file not found, it will be created with new schema on next startup.")
