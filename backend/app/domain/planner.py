from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# =========================
# Time Estimates
# =========================
class TimeEstimates(BaseModel):
    total_hours: Optional[int] = None
    total_days: Optional[int] = None
    total_weeks: Optional[int] = None

    planning: Optional[int] = None
    design: Optional[int] = None
    development: Optional[int] = None
    testing: Optional[int] = None
    deployment: Optional[int] = None


# =========================
# Cost & Budget Estimates
# =========================
class CostEstimates(BaseModel):
    total_budget: Optional[float] = None
    currency: Optional[str] = None

    hourly_rate: Optional[float] = None
    estimated_hours: Optional[int] = None

    planning_cost: Optional[float] = None
    development_cost: Optional[float] = None
    testing_cost: Optional[float] = None
    deployment_cost: Optional[float] = None


# =========================
# Technical Stack
# =========================
class TechnicalStack(BaseModel):
    frontend: Optional[List[str]] = []
    backend: Optional[List[str]] = []
    database: Optional[List[str]] = []
    devops: Optional[List[str]] = []
    hosting: Optional[List[str]] = []
    tools: Optional[List[str]] = []


# =========================
# Risks (Static)
# =========================
class Risk(BaseModel):
    label: str
    impact_level: Optional[str] = None  # low / medium / high
    description: Optional[str] = None


# =========================
# Success Criteria (Static)
# =========================
class SuccessCriteria(BaseModel):
    title: str
    description: Optional[str] = None
    measurable: Optional[bool] = False


# =========================
# Main Planner Domain
# =========================
class PlannerDomain(Document):
    project_id: PydanticObjectId

    time_estimates: Optional[TimeEstimates] = None
    cost_estimates: Optional[CostEstimates] = None
    technical_stack: Optional[TechnicalStack] = None

    risks: Optional[List[Risk]] = []
    success_criteria: Optional[List[SuccessCriteria]] = []

    schema_version: int = 1

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "planners"
