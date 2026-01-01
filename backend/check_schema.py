import sqlite3
conn = sqlite3.connect('triathlon_coach_v6.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
for col in columns:
    print(col)
conn.close()
