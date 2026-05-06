# CompanionBot

CompanionBot is a full-stack AI-based mental health companion bot built with React, Flask, MongoDB, and the Hugging Face API.

It provides supportive conversations, basic emotion detection, chat history, authentication, and guided activity suggestions such as breathing, grounding, journaling, and reflection prompts.

## Features

- User signup and login
- AI-generated supportive chat replies using the Hugging Face API
- Local emotion detection with fallback logic
- Emotion-based activity suggestions
- Persistent chat history with titles
- Pin and unpin important chats
- Guided activities such as:
  - Breathing Exercise
  - Grounding Activity
  - Calming Activity
  - Journaling Prompt
  - Gratitude Reflection
  - Positive Journaling
- Responsive frontend built with React
- MongoDB-based data persistence

## Tech Stack

### Frontend

- React
- React Router
- Vite
- Tailwind CSS

### Backend

- Flask
- Flask-CORS
- PyMongo
- python-dotenv
- scikit-learn

### AI / ML

- Hugging Face Inference API for chatbot responses
- Local scikit-learn emotion classification model using:
  - `model.pkl`
  - `vectorizer.pkl`

### Database

- MongoDB / MongoDB Atlas

## Project Structure

```text
CompanionBot/
├── companionbot-frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── companionbot-backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── model.pkl
│   ├── vectorizer.pkl
│   ├── train_model.py
│   └── .env
└── README.md
```

## How It Works

1. The user signs up or logs in from the React frontend.
2. The frontend sends requests to the Flask backend through REST APIs.
3. The backend stores users and chats in MongoDB.
4. When the user sends a message:
   - the backend detects the likely emotion
   - normalizes it into application categories like `sad`, `stress`, `anxiety`, `happy`, or `neutral`
   - generates a supportive reply using the Hugging Face API
   - recommends an activity based on the detected emotion
5. The conversation is stored in MongoDB and shown in chat history.

## Local Setup

## 1. Clone the repository

```bash
git clone <https://github.com/rajwardhansingh2708/Companionbot.git>
cd CompanionBot
```

## 2. Backend setup

```bash
cd companionbot-backend
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Install backend dependencies

```bash
pip install -r requirements.txt
```

### Create backend `.env`

Create a `.env` file inside `companionbot-backend/`:

```env
MONGO_URI=mongodb://localhost:27017/
MONGO_DB=companionbot
HF_TOKEN=your_huggingface_token
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
PORT=10000
```

### Run backend

```bash
python app.py
```

The backend should run on:

```text
http://127.0.0.1:10000
```

## 3. Frontend setup

Open a new terminal:

```bash
cd companionbot-frontend
npm install
```

### Create frontend environment variable

For local development, create a `.env` file inside `companionbot-frontend/` if needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:10000
```

### Run frontend

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

- `POST /signup`
- `POST /login`

### Chat

- `POST /chat`

### History

- `GET /history/<username>`
- `GET /history/chat/<chat_id>`
- `DELETE /history/chat/<chat_id>`
- `PATCH /history/chat/<chat_id>/pin`

## Example Chat Response Payload

```json
{
  "chat_id": "sample-id",
  "reply": "That sounds stressful. What's putting the most pressure on you right now?",
  "emotion": "stress",
  "confidence": "90%",
  "suggest_game": true,
  "game_type": "Breathing Exercise",
  "recommended_activities": [
    "Breathing Exercise",
    "Focus Reset",
    "Micro Break Routine"
  ],
  "open_activity": false
}
```

## Deployment

### Frontend

- Hosted on Vercel
- `vercel.json` is used for SPA route rewrites so refresh works on routes like `/auth`, `/chat`, and `/game`

### Backend

- Hosted on Render
- Uses environment variables for MongoDB Atlas and Hugging Face

### Production environment variables

#### Backend

```env
MONGO_URI=your_mongodb_atlas_uri
MONGO_DB=companionbot
HF_TOKEN=your_huggingface_token
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
```

#### Frontend

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

## Known Limitations

- Emotion detection is approximate and not clinically accurate
- Password security should be improved with hashing such as bcrypt or Argon2
- The chatbot is for supportive conversation only and is not a replacement for professional mental health care
- Free hosting plans may introduce cold starts and slower first responses

## Future Improvements

- Hash passwords securely
- Add JWT or session-based authentication
- Add rate limiting and stronger validation
- Improve ML model accuracy with better training data
- Add analytics and monitoring
- Add streaming chat responses
- Add better accessibility and mobile UX improvements

## Important Note

This project is designed as a supportive mental wellness assistant for educational and demonstration purposes. It is not intended to diagnose, treat, or replace professional mental health support.

## Author

Built by Raj Wardhan.

