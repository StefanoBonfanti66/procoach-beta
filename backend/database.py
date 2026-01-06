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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
