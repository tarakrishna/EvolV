from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UserRegister, UserLogin, TokenResponse
from app.models import User
from app.database import users_collection
from app.auth.utils import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=dict)
def register(user: UserRegister):
    users = users_collection
    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Use the modern .model_dump() instead of the deprecated .dict()
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user.password)
    users.insert_one(user_dict)
    return {"msg": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin):
    """
    Handles user login by expecting a JSON body with email and password.
    """
    users = users_collection
    db_user = users.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
    # The "sub" (subject) of the token is the user's email
    token = create_access_token({"sub": db_user["email"]})
    return TokenResponse(access_token=token)

