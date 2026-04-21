const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:10000";


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

export async function togglePinnedChat(chatId, pinned) {
  const response = await fetch(`${BASE_URL}/history/chat/${chatId}/pin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pinned }),
  });

  if (!response.ok) {
    throw new Error("Failed to update pin");
  }

  return response.json();
}
