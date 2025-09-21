from pymongo import MongoClient
from .config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.MONGO_DB]

users_collection = db["users"]

def get_diet_collection():
    return db["diet"]

