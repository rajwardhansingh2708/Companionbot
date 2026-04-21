const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:10000";

async function parseResponse(response, fallbackMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.details || data?.error || fallbackMessage;
    throw new Error(errorMessage);
  }

  return data;
}

export async function loginUser(payload) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Login failed");
}

export async function signupUser(payload) {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Signup failed");
}
