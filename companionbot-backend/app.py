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

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct")
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

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
        if any(word in combined for word in ["lonely", "alone"]):
            return "Feeling lonely and alone"
        if any(word in combined for word in ["friend", "friends"]):
            return "Feeling left out by friends"
        return "Feeling low and emotional"

    if emotion == "stress":
        if any(word in combined for word in ["exam", "study", "assignment"]):
            return "Stress about studies"
        return "Managing stress"

    if emotion == "anxiety":
        if any(word in combined for word in ["future", "career"]):
            return "Worried about the future"
        return "Feeling anxious"

    if emotion == "happy":
        return "Positive moment"

    return create_chat_title(user_messages[0])


def fallback_emotion(text):
    text = text.lower()

    if any(word in text for word in ["sad", "alone", "lonely"]):
        return "sad", "85%"
    if any(word in text for word in ["stress", "pressure", "tired", "overwhelmed", "exhausted"]):
        return "stress", "85%"
    if any(word in text for word in ["anxious", "fear", "panic", "nervous", "worried"]):
        return "anxiety", "85%"
    if any(word in text for word in ["happy", "good", "great"]):
        return "happy", "85%"
    return "neutral", "70%"


def predict_emotion_local(text):
    vec = vectorizer.transform([text])
    pred = model.predict(vec)[0]
    return pred, "90%"


def hybrid_emotion(text):
    try:
        return predict_emotion_local(text)
    except Exception:
        return fallback_emotion(text)


def normalize_emotion(emotion, message):
    msg = message.lower()

    if any(w in msg for w in ["tired", "stress", "pressure", "overwhelmed", "burnout", "exhausted"]):
        return "stress"
    if any(w in msg for w in ["anxious", "nervous", "fear", "panic", "worried"]):
        return "anxiety"
    if any(w in msg for w in ["alone", "lonely", "sad", "hurt", "empty"]):
        return "sad"
    if any(w in msg for w in ["happy", "good", "great", "better"]):
        return "happy"

    if emotion in ["sadness", "sad"]:
        return "sad"
    if emotion in ["joy", "happy"]:
        return "happy"
    if emotion in ["fear", "anxiety"]:
        return "anxiety"
    if emotion in ["anger", "stress"]:
        return "stress"

    return "neutral"


def fallback_reply(emotion):
    if emotion == "sad":
        return "I'm really sorry you're feeling this way. Want to share what's been bothering you?"
    if emotion == "stress":
        return "That sounds stressful. What's putting the most pressure on you right now?"
    if emotion == "anxiety":
        return "That sounds overwhelming. Let's take it one step at a time. What's worrying you most?"
    if emotion == "happy":
        return "That's great to hear! What made you feel this way?"
    return "I'm here with you. Tell me more about how you're feeling."


def generate_reply(message, emotion, history=None):
    history = history or []

    messages = [
        {
            "role": "system",
            "content": (
                "You are CompanionBot, a supportive mental health chatbot for students. "
                "Be warm, calm, natural, and concise. "
                "Keep replies natural and engaging, 2 to 4 sentences max. "
                "Use simple everyday English. "
                "Do not mention being an AI. "
                "First acknowledge the feeling briefly, then ask one helpful follow-up question "
                "or suggest one small practical next step."
            )
        }
    ]

    for item in history[-6:]:
        role = "user" if item["sender"] == "user" else "assistant"
        messages.append({
            "role": role,
            "content": item["text"]
        })

    messages.append({
        "role": "user",
        "content": f"Detected emotion: {emotion}\nUser message: {message}"
    })

    if not HF_TOKEN:
        return fallback_reply(emotion)

    try:
        response = requests.post(
            HF_API_URL,
            headers={
                "Authorization": f"Bearer {HF_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "model": HF_MODEL,
                "messages": messages,
                "stream": False,
                "temperature": 0.6,
                "max_tokens": 150
            },
            timeout=60
        )

        if response.status_code != 200:
            print("HF ERROR:", response.text)
            return fallback_reply(emotion)

        data = response.json()
        reply = data["choices"][0]["message"]["content"].strip()

        return reply if reply else fallback_reply(emotion)

    except Exception as e:
        print("HF Exception:", e)
        return fallback_reply(emotion)


def recommend_activity(emotion):
    activity_map = {
        "sad": ["Grounding Activity", "Comfort Reflection", "Journaling Prompt"],
        "stress": ["Breathing Exercise", "Focus Reset", "Micro Break Routine"],
        "anxiety": ["Calming Activity", "Breathing Exercise", "Grounding Activity"],
        "happy": ["Gratitude Reflection", "Positive Journaling"],
        "neutral": ["Breathing Exercise", "Grounding Activity"]
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
        return jsonify({"error": "Required fields missing"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "User exists"}), 400

    users_collection.insert_one({
        "username": username,
        "password": password,
        "support_focus": support_focus
    })

    return jsonify({"message": "Signup successful", "username": username})


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
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "username": username})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    username = data.get("username", "").strip()
    message = data.get("message", "").strip()
    chat_id = data.get("chat_id") or str(uuid.uuid4())

    if not username or not message:
        return jsonify({"error": "Username and message are required"}), 400

    existing_chat = chats_collection.find_one({
        "chat_id": chat_id,
        "username": username
    })

    history = existing_chat["messages"] if existing_chat else []

    raw_emotion, confidence = hybrid_emotion(message)
    emotion = normalize_emotion(raw_emotion, message)

    reply = generate_reply(message, emotion, history)
    game_type, recommended_activities = recommend_activity(emotion)
    suggest_game = True

    if existing_chat:
        updated_messages = existing_chat["messages"] + [
            {"sender": "user", "text": message},
            {"sender": "bot", "text": reply}
        ]
        user_turns = len([item for item in updated_messages if item["sender"] == "user"])
        title = existing_chat.get("title", create_chat_title(message))

        if user_turns >= 3:
            title = improve_chat_title(updated_messages, emotion)

        chats_collection.update_one(
            {"chat_id": chat_id, "username": username},
            {"$set": {
                "messages": updated_messages,
                "title": title,
                "emotion": emotion,
                "confidence": confidence,
                "suggest_game": suggest_game,
                "game_type": game_type,
                "recommended_activities": recommended_activities
            }}
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
            "pinned": False,
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
        "recommended_activities": recommended_activities,
        "open_activity": False
    })


@app.route("/history/<username>", methods=["GET"])
def history(username):
    user_chats = chats_collection.find({"username": username}).sort("_id", -1)

    formatted = []
    for chat in user_chats:
        formatted.append({
            "chat_id": chat["chat_id"],
            "title": chat.get("title", "New conversation"),
            "emotion": chat.get("emotion", "neutral"),
            "pinned": chat.get("pinned", False)
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


@app.route("/history/chat/<chat_id>/pin", methods=["PATCH"])
def toggle_pin(chat_id):
    data = request.get_json(silent=True) or {}
    pinned = bool(data.get("pinned", False))

    result = chats_collection.update_one(
        {"chat_id": chat_id},
        {"$set": {"pinned": pinned}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Chat not found"}), 404

    return jsonify({"message": "Pin updated", "pinned": pinned})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
