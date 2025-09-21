from typing import Optional, Dict, List
from pydantic import BaseModel, EmailStr, field_validator


# ========== Auth Schemas ==========

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ========== User Profile & Goals Schemas (NEW) ==========

class UserGoals(BaseModel):
    daily_calories: Optional[float] = None
    daily_protein: Optional[float] = None
    daily_carbs: Optional[float] = None
    daily_fats: Optional[float] = None

class UserProfile(UserGoals):
    username: str
    email: EmailStr
    account_created: str


# ========== Diet Schemas ==========

class DietEntry(BaseModel):
    name: str
    protein: float
    carbs: float
    fats: float
    calories: float
    date: Optional[str] = None

    @field_validator("protein", "carbs", "fats", "calories")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v is None or v < 0:
            raise ValueError("must be >= 0")
        return float(v)


class DayTotals(BaseModel):
    protein: float
    carbs: float
    fats: float
    calories: float


class SummaryResponse(BaseModel):
    scope: str
    date: Optional[str] = None
    totals: DayTotals
    entries: Optional[List[DietEntry]] = None


# ========== Recipe Schemas ==========

class RecipeRequest(BaseModel):
    ingredients: list[str]
    cuisine: Optional[str] = None
    dietary_restrictions: Optional[list[str]] = None


class NutritionInfo(BaseModel):
    calories: str
    protein: str
    carbs: str
    fats: str


class RecipeResponse(BaseModel):
    title: str
    description: str
    ingredients: list[str]
    instructions: list[str]
    nutrition: NutritionInfo


# ========== Analytics Schemas ==========

class DailyCalorieData(BaseModel):
    date: str
    calories: float

class MacroTotals(BaseModel):
    protein: float
    carbs: float
    fats: float

class AnalyticsResponse(BaseModel):
    last_7_days_calories: List[DailyCalorieData]
    macro_distribution: MacroTotals
    # ADDED: Monthly data for the dropdown
    monthly_summary: Optional[List[DailyCalorieData]] = None

