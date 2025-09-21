from fastapi import APIRouter, Depends, HTTPException
from app.database import users_collection
from app.deps import get_current_user_id
from app.schemas import UserGoals, UserProfile
from bson import ObjectId  # <-- THIS IMPORT IS ESSENTIAL AND WAS MISSING
from datetime import datetime

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile", response_model=UserProfile)
def get_user_profile(user_email: str = Depends(get_current_user_id)):
    user = users_collection.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # This line will now work correctly because ObjectId is imported
    account_created_date = user['_id'].generation_time.strftime("%Y-%m-%d")

    return UserProfile(
        username=user.get("username"),
        email=user.get("email"),
        daily_calories=user.get("daily_calories"),
        daily_protein=user.get("daily_protein"),
        daily_carbs=user.get("daily_carbs"),
        daily_fats=user.get("daily_fats"),
        account_created=account_created_date
    )

@router.post("/goals", response_model=dict)
def set_user_goals(goals: UserGoals, user_email: str = Depends(get_current_user_id)):
    update_data = {f"daily_{k}": v for k, v in goals.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No goal data provided.")

    result = users_collection.update_one(
        {"email": user_email},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"msg": "Goals updated successfully"}

