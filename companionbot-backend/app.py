from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import uuid
import requests
import pickle

load_dotenv()

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, "model.pkl")
VECTORIZER_FILE = os.path.join(BASE_DIR, "vectorizer.pkl")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB", "companionbot")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
users_collection = db["users"]
chats_collection = db["chats"]

model = pickle.load(open(MODEL_FILE, "rb"))
vectorizer = pickle.load(open(VECTORIZER_FILE, "rb"))


def create_chat_title(text):
    text = text.strip()
    if not text:
        return "New conversation"
    return text[:28] + "..." if len(text) > 28 else text


def improve_chat_title(messages, emotion):
    user_messages = [m["text"] for m in messages if m["sender"] == "user"]

    if not user_messages:
        return "New conversation"

    combined = " ".join(user_messages[-3:]).lower()

    if emotion == "sad":
        if "lonely" in combined or "alone" in combined:
            return "Feeling lonely and alone"
        if "friend" in combined or "friends" in combined:
            return "Feeling left out by friends"
        return "Feeling emotionally low"

    if emotion == "stress":
        if "exam" in combined or "study" in combined:
            return "Stress about studies"
        if "work" in combined or "pressure" in combined:
            return "Feeling under pressure"
        return "Managing stress"

    if emotion == "anxiety":
        if "future" in combined:
            return "Worried about the future"
        if "panic" in combined or "fear" in combined:
            return "Dealing with anxious thoughts"
        return "Feeling anxious"

    if emotion == "happy":
        return "Sharing a positive moment"

    return create_chat_title(user_messages[0])


def fallback_emotion(text):
    text = text.lower()

    if "sad" in text or "alone" in text or "lonely" in text:
        return "sad", "85%"
    elif "stress" in text or "pressure" in text or "overwhelmed" in text or "tired" in text or "exhausted" in text:
        return "stress", "85%"
    elif "anxious" in text or "fear" in text or "panic" in text or "worried" in text:
        return "anxiety", "85%"
    elif "happy" in text or "good" in text or "great" in text:
        return "happy", "85%"
    else:
        return "neutral", "70%"


def predict_emotion_local(text):
    vec = vectorizer.transform([text])
    pred = model.predict(vec)[0]
    return pred, "90%"


def hybrid_emotion(text):
    try:
        local_emotion, local_conf = predict_emotion_local(text)
        return local_emotion, local_conf
    except Exception:
        return fallback_emotion(text)


def normalize_emotion(emotion, message):
    msg = message.lower()

    if any(word in msg for word in ["tired", "stress", "stressed", "overwhelmed", "pressure", "burnout", "exhausted"]):
        return "stress"

    if any(word in msg for word in ["anxious", "panic", "worried", "nervous", "fear"]):
        return "anxiety"

    if any(word in msg for word in ["alone", "lonely", "empty", "hurt", "sad", "crying"]):
        return "sad"

    if any(word in msg for word in ["happy", "good", "great", "better", "relaxed", "calm"]):
        return "happy"

    if emotion in ["sadness", "sad"]:
        return "sad"
    elif emotion in ["joy", "happy"]:
        return "happy"
    elif emotion in ["fear", "anxiety"]:
        return "anxiety"
    elif emotion in ["anger", "stress"]:
        return "stress"

    return "neutral"


def build_ollama_prompt(message, emotion, history):
    history_lines = []
    for item in history[-6:]:
        role = "User" if item["sender"] == "user" else "Assistant"
        history_lines.append(f"{role}: {item['text']}")

    history_text = "\n".join(history_lines)

    return f"""
You are CompanionBot, a supportive mental health chatbot for students.

Style rules:
- Be warm, calm, and natural.
- Sound like a supportive friend, not a therapist, article, or poet.
- Keep replies short: maximum 2 or 3 sentences.
- Use simple everyday English.
- Do not be overly dramatic or overly creative.
- Do not give long explanations.
- Do not mention being an AI or any company.
- Do not apologize unless clearly necessary.
- First acknowledge the feeling briefly.
- Then ask one relevant follow-up question OR give one small practical suggestion.
- Focus on emotional support, not general knowledge.

Current detected emotion: {emotion}

Conversation so far:
{history_text}

User: {message}
Assistant:
""".strip()


def fallback_reply(emotion):
    if emotion == "sad":
        return "That sounds heavy. I am glad you shared it. Do you want to tell me a little more about what happened?"
    if emotion == "stress":
        return "It sounds like you are carrying a lot right now. What feels like the most stressful part?"
    if emotion == "anxiety":
        return "That sounds overwhelming. Let us slow it down together. What is the main worry on your mind right now?"
    if emotion == "happy":
        return "That is good to hear. What has been helping you feel this way?"
    return "I am here with you. Tell me a little more so I can understand better."


def generate_reply(message, emotion, history=None):
    history = history or []
    prompt = build_ollama_prompt(message, emotion, history)

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.6,
                    "top_p": 0.9
                }
            },
            timeout=60
        )

        if response.status_code != 200:
            return fallback_reply(emotion)

        data = response.json()
        reply = data.get("response", "").strip()

        if not reply:
            return fallback_reply(emotion)

        return reply

    except Exception:
        return fallback_reply(emotion)


def recommend_activity(emotion):
    activity_map = {
        "sad": ["Grounding Activity", "Journaling Prompt", "Comfort Reflection"],
        "stress": ["Breathing Exercise", "Focus Reset", "Micro Break Routine"],
        "anxiety": ["Calming Activity", "Grounding Activity", "Breathing Exercise"],
        "happy": ["Gratitude Reflection", "Positive Journaling"],
        "neutral": ["Breathing Exercise"]
    }

    activities = activity_map.get(emotion, ["Breathing Exercise"])
    return activities[0], activities


@app.route("/")
def home():
    return jsonify({"message": "CompanionBot backend is running"})


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    support_focus = data.get("support_focus", "stress")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    users_collection.insert_one({
        "username": username,
        "password": password,
        "support_focus": support_focus
    })

    return jsonify({
        "message": "Signup successful",
        "username": username
    })


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    user = users_collection.find_one({
        "username": username,
        "password": password
    })

    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({
        "message": "Login successful",
        "username": username
    })


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    username = data.get("username", "").strip()
    message = data.get("message", "").strip()
    chat_id = data.get("chat_id", "").strip()

    if not username or not message:
        return jsonify({"error": "Username and message are required"}), 400

    if not chat_id:
        chat_id = str(uuid.uuid4())

    existing_chat = chats_collection.find_one({
        "chat_id": chat_id,
        "username": username
    })

    conversation_history = existing_chat["messages"] if existing_chat else []

    raw_emotion, confidence = hybrid_emotion(message)
    emotion = normalize_emotion(raw_emotion, message)

    reply = generate_reply(message, emotion, conversation_history)

    game_type, recommended_activities = recommend_activity(emotion)
    suggest_game = True if recommended_activities else False

    if existing_chat:
        updated_messages = existing_chat["messages"] + [
            {"sender": "user", "text": message},
            {"sender": "bot", "text": reply}
        ]

        user_turns = len([m for m in updated_messages if m["sender"] == "user"])
        updated_title = existing_chat["title"]

        if user_turns >= 3:
            updated_title = improve_chat_title(updated_messages, emotion)

        chats_collection.update_one(
            {"chat_id": chat_id, "username": username},
            {
                "$set": {
                    "messages": updated_messages,
                    "emotion": emotion,
                    "confidence": confidence,
                    "suggest_game": suggest_game,
                    "game_type": game_type,
                    "recommended_activities": recommended_activities,
                    "title": updated_title
                }
            }
        )
    else:
        chats_collection.insert_one({
            "chat_id": chat_id,
            "username": username,
            "title": create_chat_title(message),
            "emotion": emotion,
            "confidence": confidence,
            "suggest_game": suggest_game,
            "game_type": game_type,
            "recommended_activities": recommended_activities,
            "messages": [
                {"sender": "user", "text": message},
                {"sender": "bot", "text": reply}
            ]
        })

    return jsonify({
        "chat_id": chat_id,
        "reply": reply,
        "emotion": emotion,
        "confidence": confidence,
        "suggest_game": suggest_game,
        "game_type": game_type,
        "recommended_activities": recommended_activities
    })


@app.route("/history/<username>", methods=["GET"])
def history(username):
    user_chats = chats_collection.find({"username": username}).sort("_id", -1)

    formatted = []
    for chat in user_chats:
        formatted.append({
            "chat_id": chat["chat_id"],
            "title": chat["title"],
            "emotion": chat.get("emotion", "neutral")
        })

    return jsonify(formatted)


@app.route("/history/chat/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    chat = chats_collection.find_one({"chat_id": chat_id})

    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    chat["_id"] = str(chat["_id"])
    return jsonify(chat)


@app.route("/history/chat/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    result = chats_collection.delete_one({"chat_id": chat_id})

    if result.deleted_count == 0:
        return jsonify({"error": "Chat not found"}), 404

    return jsonify({"message": "Chat deleted successfully"})


if __name__ == "__main__":
    app.run(debug=True)
