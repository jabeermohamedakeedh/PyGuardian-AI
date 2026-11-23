from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# ─── Auth ────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    full_name: str
    username: str
    phone: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    plan: Optional[str] = "Free"
    created_at: datetime
    class Config:
        from_attributes = True

# ─── User Profile ─────────────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    phone: Optional[str] = ""
    role: str
    plan: str = "Free"
    status: str = "active"
    created_at: datetime
    ai_model: str = "Google Gemini (gemini-3.1-flash-lite)"
    engine: str = "Pylint · Bandit · Radon"
    app_version: str = "1.0.0"

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

# ─── Analysis ────────────────────────────────────────────────────────────────

class AnalysisOptions(BaseModel):
    quality: bool = True
    security: bool = True
    complexity: bool = True

class AnalysisRequest(BaseModel):
    code: str
    options: AnalysisOptions

class Issue(BaseModel):
    id: int
    title: str
    severity: str
    tool: str
    file: str
    line: int
    category: str
    description: str
    recommendation: str

class AnalysisResponse(BaseModel):
    summary: str
    issues: List[Issue]
    quality_score: float = 100.0
    security_score: float = 100.0
    complexity_score: float = 100.0

# Save analysis result to DB
class AnalysisSaveRequest(BaseModel):
    user_id: Optional[int] = None
    filename: str
    risk_score: float = 0.0
    quality_score: float
    security_score: float
    complexity_score: float
    issue_count: int
    issues_json: str        # JSON-serialised list of issues
    summary: str

class AnalysisRecord(BaseModel):
    id: int
    user_id: int
    filename: str
    risk_score: float
    quality_score: float
    security_score: float
    complexity_score: float
    issue_count: int
    issues_json: str
    summary: str
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_analyses: int
    total_issues: int
    quality_issues: int
    security_issues: int
    complexity_issues: int
    avg_risk_score: Optional[float] = None

# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

class ChatSaveRequest(BaseModel):
    user_id: Optional[int] = None
    role: str
    content: str

class ChatFeedbackRequest(BaseModel):
    feedback: str

class ChatMessageRecord(BaseModel):
    id: int
    user_id: int
    role: str
    content: str
    created_at: datetime
    feedback: Optional[str] = None
    class Config:
        from_attributes = True

# ─── Password Reset ───────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

# ─── Admin ───────────────────────────────────────────────────────────────────

class AdminUserRecord(BaseModel):
    id: int
    name: str
    email: str
    username: Optional[str] = ""
    role: Optional[str] = "user"
    phone: Optional[str] = ""
    plan: str
    status: str
    analyses: int
    total_issues: int
    joined: str
    lastActive: str

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None

class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, description="Initial temporary password, at least 8 characters")
    role: str = Field("user", description="'user' or 'admin'")
    plan: str = Field("Free", description="'Free', 'Pro', or 'Enterprise'")
    status: str = Field("active", description="'active' or 'suspended'")

class AdminReportRecord(BaseModel):
    id: str
    file: str
    user: str
    quality: int
    security: int
    issues: int
    date: str

class ActivityDay(BaseModel):
    date: str
    day: str
    analyses: int

class MonthlyIssueTrend(BaseModel):
    month: str
    quality: int
    security: int
    complexity: int
    total: int

class SystemHealth(BaseModel):
    database: str
    database_latency_ms: Optional[float] = None
    gemini_api: str
    system_status: str

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_analyses: int
    analyses_today: int
    total_issues: int
    critical_issues: int
    activity_7d: List[ActivityDay] = []
    monthly_issue_trend: List[MonthlyIssueTrend] = []
    system_health: Optional[SystemHealth] = None

# ─── Live System Health ───────────────────────────────────────────────────────

class ServiceHealthRecord(BaseModel):
    name: str
    status: str          # "operational" | "degraded" | "error" | "unavailable"
    latency_ms: Optional[float] = None
    detail: str

class SystemHealthResponse(BaseModel):
    services: List[ServiceHealthRecord]
    total_analyses: int
    checked_at: str
    overall_status: str  # "operational" | "degraded" | "error" | "unavailable"

# ─── Admin Settings ───────────────────────────────────────────────────────────

class GeneralSettingItem(BaseModel):
    label: str
    description: str
    status: str
    badge_type: str

class SecuritySettingItem(BaseModel):
    label: str
    description: str
    value: str
    enforced: bool

class IntegrationSettingItem(BaseModel):
    name: str
    category: str
    status: str
    detail: str

class PlatformAboutInfo(BaseModel):
    app_version: str
    total_users: int
    total_analyses: int
    database_version: str
    pylint_version: str
    bandit_version: str
    radon_version: str
    ai_model: str
    license: str

class AdminSettingsResponse(BaseModel):
    general: List[GeneralSettingItem]
    security: List[SecuritySettingItem]
    integrations: List[IntegrationSettingItem]
    about: PlatformAboutInfo
