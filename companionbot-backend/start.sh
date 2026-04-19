#!/usr/bin/env bash
set -e

OLLAMA_MODEL="${OLLAMA_MODEL:-phi3}"

echo "Starting Ollama..."
ollama serve > /tmp/ollama.log 2>&1 &

echo "Waiting for Ollama to be ready..."
until curl -s http://127.0.0.1:11434/api/tags > /dev/null; do
  sleep 2
done

echo "Pulling model: $OLLAMA_MODEL"
ollama pull "$OLLAMA_MODEL"

echo "Starting Flask app..."
python app.py
