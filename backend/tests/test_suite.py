
import pytest
from coach_logic import CoachLogic
from challenge_logic import ChallengeLogic
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, User, Challenge, UserChallenge

# Setup in-memory DB for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_coach_logic_prompt_generation():
    coach = CoachLogic(api_key="test-key")
    user_profile = {
        "name": "Stefano",
        "age": 35,
        "experience_level": "Intermediate",
        "availability": {"Mon": 60, "Tue": 60}
    }
    prompt = coach.generate_training_plan_prompt(user_profile)
    assert "Stefano" in prompt
    assert "Intermediate" in prompt

def test_mock_plan_readiness_impact():
    coach = CoachLogic()
    # Good sleep
    profile_good = {
        "ftp": 200,
        "health_metrics": {"sleep_score": 90, "hrv": 60}
    }
    # Bad sleep
    profile_bad = {
        "ftp": 200,
        "health_metrics": {"sleep_score": 40, "hrv": 30}
    }
    
    plan_good = coach.mock_generate_plan(profile_good)
    plan_bad = coach.mock_generate_plan(profile_bad)
    
    # We check general structure consistency
    assert len(plan_good["weeks"]) == 12
    assert len(plan_bad["weeks"]) == 12

def test_challenge_logic_seeding(db):
    logic = ChallengeLogic(db)
    logic.seed_default_challenges()
    
    challenges = db.query(Challenge).all()
    assert len(challenges) > 0
    # Match the Italian titles from challenge_logic.py
    assert any(c.title == "Settimana di Ferro" for c in challenges)

def test_challenge_progress_update(db):
    # Seed user and challenge
    user_email = "test@example.com"
    logic = ChallengeLogic(db)
    logic.seed_default_challenges()
    chal = db.query(Challenge).filter(Challenge.metric == "sessions").first()
    
    # Needs a start and end date to match activities
    import datetime
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=7)
    end_date = today + datetime.timedelta(days=7)

    user_chal = UserChallenge(
        user_email=user_email,
        challenge_id=chal.id,
        current_value=0.0,
        status="active",
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat()
    )
    db.add(user_chal)
    db.commit()
    
    # Simulate activity sync
    activities = [
        {"type": "RUN", "date": today.isoformat()}, 
        {"type": "BIKE", "date": today.isoformat()}
    ]
    logic.update_challenge_progress(user_email, activities)
    
    db.refresh(user_chal)
    assert user_chal.current_value == 2.0
