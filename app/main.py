from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router
from app.diet.routes import router as diet_router
from app.recipe.routes import router as recipe_router
from app.user.routes import router as user_router # 1. Import the new user router

app = FastAPI(title="Diet App MVP")

# Make sure to use your actual ngrok URL here
origins = [
    "https://9d28068bab94.ngrok-free.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(diet_router)
app.include_router(recipe_router)
app.include_router(user_router) # 2. Include the new user router in the app

@app.get("/")
def root():
    return {"msg": "Welcome to Diet App API"}
