# Diet App MVP

A full-stack diet tracking application with a FastAPI backend and a React Native mobile frontend. The app allows users to register, log in, track daily meals and macros, set nutrition goals, view analytics, and get AI-powered recipe suggestions.

---

## Features

### Backend (FastAPI)
- **User Authentication:** Register and login with JWT-based authentication.
- **Profile & Goals:** View and update daily nutrition goals.
- **Diet Logging:** Add meals with macros (calories, protein, carbs, fats).
- **Daily Summary:** Get a summary of today's intake and meal log.
- **Analytics:** View last 7 days and monthly calorie/macro analytics.
- **Recipe Suggestion:** Get creative recipes using AI (Groq API) based on available ingredients.
- **CORS Support:** Configurable for mobile app access via ngrok.

### Mobile App (React Native)
- **Login/Register:** Secure authentication and persistent login.
- **Dashboard:** View daily summary, log meals, and see meal history.
- **Analytics:** Interactive charts for calories and macros, monthly dropdown, and progress bars for goals.
- **Set Goals:** Update daily nutrition goals directly from the app.
- **Recipe Recommender:** Enter ingredients and get AI-generated recipes.
- **Profile:** Placeholder for future user profile features.

---

## File Structure

```
.env
.gitignore
requirements.txt
test_env.py
app/
    __init__.py
    config.py
    database.py
    deps.py
    main.py
    models.py
    schemas.py
    auth/
        deps.py
        jwt_handler.py
        routes.py
        utils.py
    diet/
        routes.py
    recipe/
        routes.py
    user/
        routes.py
mobile-app/
    App.js
    package.json
    src/
        components/
            common.js
        config/
            api.js
        screens/
            HomeScreen.js
            AnalyticsScreen.js
            ProfileScreen.js
    .expo/
        devices.json
        README.md
recovered/
```

---

## Getting Started

### 1. Backend Setup

- **Install dependencies:**
  ```sh
  pip install -r requirements.txt
  ```
- **Configure environment variables:**  
  Edit `.env` for MongoDB, JWT, and Groq API keys.

- **Run the server:**
  ```sh
  uvicorn app.main:app --reload
  ```

- **Expose via ngrok:**
  ```sh
  ngrok http 8000
  ```
  Update `origins` in [`app/main.py`](app/main.py) and `API_BASE_URL` in [`mobile-app/src/config/api.js`](mobile-app/src/config/api.js) with your ngrok URL.

### 2. Mobile App Setup

- **Install dependencies:**
  ```sh
  cd mobile-app
  npm install
  ```
- **Start the app:**
  ```sh
  npx expo start
  ```
- **Configure API URL:**  
  Set your backend ngrok URL in [`src/config/api.js`](mobile-app/src/config/api.js).

---

## API Endpoints

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and get JWT token

### User
- `GET /user/profile` — Get user profile and goals
- `POST /user/goals` — Update daily goals

### Diet
- `POST /diet/add` — Add a meal entry
- `GET /diet/today` — Get today’s summary
- `GET /diet/analytics` — Get analytics (last 7 days or by month)

### Recipe
- `POST /recipe/suggest` — Get AI-powered recipe suggestion

---

## Technologies Used

- **Backend:** FastAPI, MongoDB, JWT, Groq API
- **Frontend:** React Native (Expo), AsyncStorage, Chart Kit

---

## Notes

- Ensure MongoDB is running locally or update `.env` for remote DB.
- Groq API key required for recipe suggestions.
- CORS and API URLs must match between backend and mobile app.

---
## Reference Images
<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/9f3d4155-856b-438f-96ae-e5f7019dd678" alt="Image 1" width="150" height="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/81dafc7b-5b24-4431-9594-148a5d02e0a1" alt="Image 2" width="150" height="300"/></td>
    <td><img src="https://github.com/user-attachments/assets/cf901b62-0799-4e83-ac7a-16d8b3e17a18" alt="Image 3" width="150" height="300"/></td>
  </tr>
</table>

---
## License
MIT
