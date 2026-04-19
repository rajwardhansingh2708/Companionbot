FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://ollama.com/install.sh | bash

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x /app/start.sh

EXPOSE 5000
EXPOSE 11434

CMD ["/app/start.sh"]
