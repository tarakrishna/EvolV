from fastapi import APIRouter, Depends, HTTPException
import json
from groq import Groq, APIError  # 1. Import the specific APIError

from app.schemas import RecipeRequest, RecipeResponse
from app.deps import get_current_user_id
from app.config import settings

router = APIRouter(prefix="/recipe", tags=["Recipe"])

# This try-except block handles errors during client initialization (e.g., missing API key)
try:
    client = Groq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    print(f"FATAL: Failed to initialize Groq client. Check your GROQ_API_KEY in the .env file. Error: {e}")
    client = None

SYSTEM_PROMPT = """
You are a helpful culinary assistant. Your task is to generate a single, creative recipe based on a list of available ingredients.
Your response MUST be a valid JSON object that strictly follows this structure:
{
  "title": "Recipe Title",
  "description": "A brief, appealing description of the dish.",
  "ingredients": ["Ingredient 1", "Ingredient 2", ...],
  "instructions": ["Step 1", "Step 2", ...],
  "nutrition": {
    "calories": "X kcal",
    "protein": "Y g",
    "carbs": "Z g",
    "fats": "W g"
  }
}
Do not include any text or markdown formatting outside of the main JSON object.
"""

@router.post("/suggest", response_model=RecipeResponse)
def suggest_recipe(
    req: RecipeRequest,
    current_user: str = Depends(get_current_user_id)
):
    if not client:
        raise HTTPException(status_code=500, detail="AI service is not configured correctly.")

    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Ingredients list cannot be empty.")

    ingredients_str = ", ".join(req.ingredients)
    user_prompt = f"Please generate a recipe using the following ingredients: {ingredients_str}. You can assume basic pantry staples like salt, pepper, and oil are available."
    
    print(f"--- Sending request to Groq with prompt: {user_prompt} ---")

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        
        response_content = chat_completion.choices[0].message.content
        print(f"--- Received response from Groq: {response_content} ---")
        
        response_json = json.loads(response_content)
        return RecipeResponse(**response_json)

    # 2. Add specific error handling for Groq API errors
    except APIError as e:
        print(f"!!! Groq API Error: {e.status_code} - {e.message} !!!")
        raise HTTPException(status_code=500, detail=f"The AI service returned an error: {e.message}")
    except json.JSONDecodeError:
        print("!!! Failed to parse JSON response from Groq !!!")
        raise HTTPException(status_code=500, detail="AI failed to return a valid recipe format.")
    except Exception as e:
        print(f"!!! An unexpected error occurred: {e} !!!")
        raise HTTPException(status_code=500, detail="An unexpected error occurred with the AI service.")
