from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    plan = Column(String, default="Free")
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    reset_code = Column(String, nullable=True)
    reset_code_expires = Column(DateTime, nullable=True)


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    filename = Column(String, default="code.py")
    risk_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    security_score = Column(Float, default=0.0)
    complexity_score = Column(Float, default=0.0)
    issue_count = Column(Integer, default=0)
    issues_json = Column(Text, default="[]")   # JSON string of issues list
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    role = Column(String)          # "user" or "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    feedback = Column(String(20), nullable=True)
