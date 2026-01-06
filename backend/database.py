from sqlalchemy import Column, Integer, String, Float, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./triathlon_coach_v6.db")

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    age = Column(Integer)
    weight = Column(Float)
    height = Column(Float)
    hashed_password = Column(String) # Encrypted Garmin password
    experience_level = Column(String) # New, Progressing, Veteran
    primary_objective = Column(String) # Race, Performance, Fitness
    race_distance = Column(String) # Sprint, Olympic, 70.3, Full
    race_date = Column(String) # YYYY-MM-DD
    race_time_goal = Column(String) # Target race finish time in HH:MM:SS format
    hr_rest = Column(Integer, default=60)
    hr_max = Column(Integer, default=190)
    ftp = Column(Integer, default=200)
    vo2_max_run = Column(Float)
    vo2_max_cycle = Column(Float)
    css = Column(String)
    running_threshold = Column(String)
    hr_max_cycle = Column(Integer)
    hr_max_swim = Column(Integer)
    lactate_threshold_hr = Column(Integer)
    gender = Column(String)
    birthdate = Column(String)
    availability = Column(JSON)
    habits = Column(JSON)
    pool_length = Column(Float, default=25.0)
    garmin_tokens = Column(JSON) # To store session tokens (bypassing login)

class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    category = Column(String) # 'consistency', 'performance', 'volume'
    challenge_type = Column(String) # 'weekly', 'monthly', 'checkpoint'
    metric = Column(String) # 'sessions', 'tss', 'distance', 'pace', 'power'
    target_value = Column(Float)
    badge_icon = Column(String) # Lucide icon name or URL
    xp_reward = Column(Integer, default=100)

class UserChallenge(Base):
    __tablename__ = "user_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    challenge_id = Column(Integer)
    current_value = Column(Float, default=0.0)
    status = Column(String, default="active") # 'active', 'completed', 'expired'
    start_date = Column(String)
    end_date = Column(String)
    is_notified = Column(Integer, default=0) # Boolean if user saw the completion

class PerformanceHistory(Base):
    __tablename__ = "performance_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    metric_type = Column(String) # 'ftp', 'css', 'run_pace', 'hr_rest'
    value = Column(Float)
    recorded_at = Column(String) # ISO date string

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    role = Column(String) # 'user' or 'assistant'
    content = Column(String)
    timestamp = Column(String)
    msg_metadata = Column(JSON) # For storing context, actions taken, etc.

Base.metadata.create_all(bind=engine)


def migrate_db():
    """Simple migration tool to add missing columns without Alembic"""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    # Check User table columns
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    # List of columns that might be missing from older versions
    required_shifts = {
        "experience_level": "ALTER TABLE users ADD COLUMN experience_level VARCHAR",
        "primary_objective": "ALTER TABLE users ADD COLUMN primary_objective VARCHAR",
        "race_distance": "ALTER TABLE users ADD COLUMN race_distance VARCHAR",
        "race_date": "ALTER TABLE users ADD COLUMN race_date VARCHAR",
        "race_time_goal": "ALTER TABLE users ADD COLUMN race_time_goal VARCHAR",
        "hr_rest": "ALTER TABLE users ADD COLUMN hr_rest INTEGER DEFAULT 60",
        "hr_max": "ALTER TABLE users ADD COLUMN hr_max INTEGER DEFAULT 190",
        "ftp": "ALTER TABLE users ADD COLUMN ftp INTEGER DEFAULT 200",
        "vo2_max_run": "ALTER TABLE users ADD COLUMN vo2_max_run FLOAT",
        "vo2_max_cycle": "ALTER TABLE users ADD COLUMN vo2_max_cycle FLOAT",
        "css": "ALTER TABLE users ADD COLUMN css VARCHAR",
        "running_threshold": "ALTER TABLE users ADD COLUMN running_threshold VARCHAR",
        "hr_max_cycle": "ALTER TABLE users ADD COLUMN hr_max_cycle INTEGER",
        "hr_max_swim": "ALTER TABLE users ADD COLUMN hr_max_swim INTEGER",
        "lactate_threshold_hr": "ALTER TABLE users ADD COLUMN lactate_threshold_hr INTEGER",
        "gender": "ALTER TABLE users ADD COLUMN gender VARCHAR",
        "birthdate": "ALTER TABLE users ADD COLUMN birthdate VARCHAR",
        "availability": f"ALTER TABLE users ADD COLUMN availability {'JSON' if not SQLALCHEMY_DATABASE_URL.startswith('sqlite') else 'TEXT'}",
        "habits": f"ALTER TABLE users ADD COLUMN habits {'JSON' if not SQLALCHEMY_DATABASE_URL.startswith('sqlite') else 'TEXT'}",
        "pool_length": "ALTER TABLE users ADD COLUMN pool_length FLOAT DEFAULT 25.0",
        "garmin_tokens": f"ALTER TABLE users ADD COLUMN garmin_tokens {'JSON' if not SQLALCHEMY_DATABASE_URL.startswith('sqlite') else 'TEXT'}"
    }

    with engine.connect() as conn:
        for col_name, alter_cmd in required_shifts.items():
            if col_name not in columns:
                print(f"MIGRATION: Adding missing column {col_name} to users table...")
                try:
                    conn.execute(text(alter_cmd))
                    conn.commit()
                except Exception as e:
                    print(f"MIGRATION WARNING: Could not add {col_name}: {e}")
        
        # Ensure new tables are created as well
        Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
