import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "")
engine = create_engine(DATABASE_URL)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS risk_score FLOAT DEFAULT 0.0;"))
        conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS quality_score FLOAT DEFAULT 0.0;"))
        conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS security_score FLOAT DEFAULT 0.0;"))
        conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS complexity_score FLOAT DEFAULT 0.0;"))
        conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS issue_count INTEGER DEFAULT 0;"))
        print("Successfully added columns to analyses table.")
except Exception as e:
    print(f"Error altering table: {e}")
