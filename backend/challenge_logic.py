
import datetime
from sqlalchemy.orm import Session
from database import Challenge, UserChallenge, PerformanceHistory
import logging

logger = logging.getLogger(__name__)

class ChallengeLogic:
    def __init__(self, db: Session):
        self.db = db

    def seed_default_challenges(self):
        """Creates standard challenges if they don't exist"""
        defaults = [
            {
                "title": "Settimana di Ferro",
                "description": "Completa 5 sessioni di allenamento in una settimana",
                "category": "consistency",
                "challenge_type": "weekly",
                "metric": "sessions",
                "target_value": 5,
                "badge_icon": "ShieldCheck",
                "xp_reward": 150
            },
            {
                "title": "Macinatore di Chilometri",
                "description": "Supera i 100km totali di bici in una settimana",
                "category": "volume",
                "challenge_type": "weekly",
                "metric": "distance_bike",
                "target_value": 100,
                "badge_icon": "Bike",
                "xp_reward": 200
            },
            {
                "title": "Costanza Top",
                "description": "Raggiungi il 90% della durata pianificata nell'intera settimana",
                "category": "consistency",
                "challenge_type": "weekly",
                "metric": "compliance",
                "target_value": 90,
                "badge_icon": "Zap",
                "xp_reward": 300
            },
            {
                "title": "Miglioramento Soglia",
                "description": "Aumenta la tua FTP di almeno 5 watt nel prossimo test",
                "category": "performance",
                "challenge_type": "checkpoint",
                "metric": "power",
                "target_value": 5,
                "badge_icon": "TrendingUp",
                "xp_reward": 500
            }
        ]
        
        for d in defaults:
            exists = self.db.query(Challenge).filter(Challenge.title == d["title"]).first()
            if not exists:
                ch = Challenge(**d)
                self.db.add(ch)
        self.db.commit()

    def generate_weekly_challenges(self, user_email: str):
        """Assigns weekly challenges to the user based on their plan status"""
        # Ensure we have some challenges to pick from
        self.seed_default_challenges()
        
        # Check if user already has active weekly challenges
        active = self.db.query(UserChallenge).join(Challenge, UserChallenge.challenge_id == Challenge.id).filter(
            UserChallenge.user_email == user_email,
            UserChallenge.status == "active",
            Challenge.challenge_type == "weekly"
        ).first() # Simplified check
        
        if not active:
            # Pick a few challenges to assign
            all_ch = self.db.query(Challenge).filter(Challenge.challenge_type == "weekly").all()
            
            # Assign first 2 for now (could be randomized or based on AI coach logic)
            today = datetime.date.today()
            start_date = today - datetime.timedelta(days=today.weekday()) # Monday
            end_date = start_date + datetime.timedelta(days=6) # Sunday
            
            for ch in all_ch[:2]:
                uc = UserChallenge(
                    user_email=user_email,
                    challenge_id=ch.id,
                    current_value=0.0,
                    status="active",
                    start_date=start_date.isoformat(),
                    end_date=end_date.isoformat()
                )
                self.db.add(uc)
            self.db.commit()

    def update_challenge_progress(self, user_email: str, activities: list):
        """Updates user challenge progress based on actual activities from Garmin"""
        active_challenges = self.db.query(UserChallenge).filter(
            UserChallenge.user_email == user_email,
            UserChallenge.status == "active"
        ).all()
        
        if not active_challenges:
            return

        for uc in active_challenges:
            ch = self.db.query(Challenge).filter(Challenge.id == uc.challenge_id).first()
            if not ch: continue
            
            # Filter activities within challenge timeframe
            relevant_acts = [
                a for a in activities 
                if uc.start_date <= a.get('date', '') <= uc.end_date
            ]
            
            new_val = 0.0
            if ch.metric == "sessions":
                new_val = float(len(relevant_acts))
            elif ch.metric == "distance_bike":
                new_val = sum(a.get('distance_km', 0) for a in relevant_acts if 'bike' in a.get('type', '').lower() or 'cycl' in a.get('type', '').lower())
            
            uc.current_value = new_val
            
            # Check for completion
            if uc.current_value >= ch.target_value:
                uc.status = "completed"
                logger.info(f"Challenge COMPLETED for {user_email}: {ch.title}")

        self.db.commit()

    def record_performance_check(self, user_email: str, metric_type: str, value: float):
        """Records a new performance point (e.g. after a test session)"""
        record = PerformanceHistory(
            user_email=user_email,
            metric_type=metric_type,
            value=value,
            recorded_at=datetime.date.today().isoformat()
        )
        self.db.add(record)
        self.db.commit()
