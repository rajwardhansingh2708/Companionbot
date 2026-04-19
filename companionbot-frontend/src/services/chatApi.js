const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";


export async function sendMessage(payload) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
