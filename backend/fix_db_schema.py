import sqlite3
import os

db_path = "triathlon_coach_v6.db"

if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Fix Users table
print("Checking 'users' table...")
try:
    cursor.execute("SELECT garmin_tokens FROM users LIMIT 1")
    print("Column 'garmin_tokens' already exists.")
except sqlite3.OperationalError:
    print("Column 'garmin_tokens' not found in 'users'. Adding it...")
    cursor.execute("ALTER TABLE users ADD COLUMN garmin_tokens TEXT")
    conn.commit()
    print("Added 'garmin_tokens' column.")

# 2. Fix ChatMessages table (renamed metadata -> msg_metadata)
print("Checking 'chat_messages' table...")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_messages'")
if cursor.fetchone():
    try:
        cursor.execute("SELECT msg_metadata FROM chat_messages LIMIT 1")
        print("Column 'msg_metadata' already exists.")
    except sqlite3.OperationalError:
        print("Column 'msg_metadata' not found in 'chat_messages'. Checking for 'metadata'...")
        try:
            cursor.execute("SELECT metadata FROM chat_messages LIMIT 1")
            print("Found old 'metadata' column. Renaming to 'msg_metadata'...")
            cursor.execute("ALTER TABLE chat_messages RENAME COLUMN metadata TO msg_metadata")
            conn.commit()
        except sqlite3.OperationalError:
             print("Old 'metadata' also not found. Adding 'msg_metadata'...")
             cursor.execute("ALTER TABLE chat_messages ADD COLUMN msg_metadata TEXT")
             conn.commit()
else:
    print("Table 'chat_messages' does not exist. It will be created by SQLAlchemy.")

conn.close()
