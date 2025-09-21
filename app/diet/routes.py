from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime, timedelta

from app.schemas import DietEntry, SummaryResponse, DayTotals, AnalyticsResponse, DailyCalorieData, MacroTotals
from app.database import get_diet_collection
from app.deps import get_current_user_id

router = APIRouter(prefix="/diet", tags=["Diet"])

@router.post("/add", status_code=201, response_model=dict)
def add_diet_entry(entry: DietEntry, current_user: str = Depends(get_current_user_id)):
    diet_collection = get_diet_collection()
    entry_dict = entry.model_dump()
    entry_dict["user_id"] = current_user
    if not entry_dict.get("date"):
        entry_dict["date"] = datetime.utcnow().strftime("%Y-%m-%d")
    diet_collection.insert_one(entry_dict)
    return {"msg": "Diet entry added successfully"}

@router.get("/today", response_model=SummaryResponse)
def get_today_summary(current_user: str = Depends(get_current_user_id)):
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    diet_collection = get_diet_collection()
    query = {"user_id": current_user, "date": today_str}
    entries_cursor = diet_collection.find(query, {"_id": 0})
    entries = [DietEntry(**e) for e in entries_cursor]
    
    totals = DayTotals(protein=0, carbs=0, fats=0, calories=0)
    for item in entries:
        totals.protein += item.protein
        totals.carbs += item.carbs
        totals.fats += item.fats
        totals.calories += item.calories
        
    return SummaryResponse(scope="date", date=today_str, totals=totals, entries=entries)

# --- NEW ANALYTICS ENDPOINT ---
@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(current_user: str = Depends(get_current_user_id)):
    diet_collection = get_diet_collection()
    
    # 1. Define date range for the last 7 days
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=6)
    
    # 2. MongoDB Aggregation Pipeline
    pipeline = [
        {
            "$match": {
                "user_id": current_user,
                "date": {"$gte": seven_days_ago.strftime("%Y-%m-%d"), "$lte": today.strftime("%Y-%m-%d")}
            }
        },
        {
            "$group": {
                "_id": "$date",
                "totalCalories": {"$sum": "$calories"},
                "totalProtein": {"$sum": "$protein"},
                "totalCarbs": {"$sum": "$carbs"},
                "totalFats": {"$sum": "$fats"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = list(diet_collection.aggregate(pipeline))
    
    # 3. Process results for charts
    
    # For the Bar Chart (Last 7 days calories)
    daily_calories_map = {res["_id"]: res["totalCalories"] for res in results}
    last_7_days_calories = []
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        last_7_days_calories.append(
            DailyCalorieData(date=day_str, calories=daily_calories_map.get(day_str, 0))
        )

    # For the Pie Chart (Macronutrient distribution)
    total_protein = sum(res.get("totalProtein", 0) for res in results)
    total_carbs = sum(res.get("totalCarbs", 0) for res in results)
    total_fats = sum(res.get("totalFats", 0) for res in results)

    # Avoid division by zero if no macros are logged
    if (total_protein + total_carbs + total_fats) == 0:
         macro_distribution = MacroTotals(protein=0, carbs=0, fats=0)
    else:
        macro_distribution = MacroTotals(
            protein=total_protein,
            carbs=total_carbs,
            fats=total_fats
        )

    return AnalyticsResponse(
        last_7_days_calories=last_7_days_calories,
        macro_distribution=macro_distribution
    )

