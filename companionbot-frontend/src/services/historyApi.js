const BASE_URL = "http://127.0.0.1:5000";

export async function fetchHistory(username) {
  const response = await fetch(`${BASE_URL}/history/${username}`);
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
}

export async function fetchChatById(chatId) {
  const response = await fetch(`${BASE_URL}/history/chat/${chatId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch chat");
  }
  return response.json();
}

export async function deleteChatById(chatId) {
  const response = await fetch(`${BASE_URL}/history/chat/${chatId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete chat");
  }

  return response.json();
}
