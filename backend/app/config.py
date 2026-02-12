from datetime import date, timedelta

RACE_DATE = date(2026, 10, 11)
RACE_NAME = "Chicago Marathon 2026"
GOAL_TIME_SECONDS = 3 * 3600 + 45 * 60  # 3:45:00
MARATHON_DISTANCE_MILES = 26.2
GOAL_PACE_SECONDS = int(GOAL_TIME_SECONDS / MARATHON_DISTANCE_MILES)  # ~8:35/mi

DATABASE_URL = "sqlite:///./marathon_training.db"
