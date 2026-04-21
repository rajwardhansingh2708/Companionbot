const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:10000";

export async function loginUser(payload) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function signupUser(payload) {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Signup failed");
  }

  return response.json();
}
