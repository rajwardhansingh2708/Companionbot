import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../services/authApi";

const inputStyle = {
  background: "var(--bg-elevated)",
  color: "var(--text)",
  borderColor: "var(--border)",
};

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [supportFocus, setSupportFocus] = useState("stress");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;

      if (mode === "login") {
        data = await loginUser({
          username,
          password,
        });
      } else {
        data = await signupUser({
          username,
          password,
          support_focus: supportFocus,
        });
      }

      localStorage.setItem("username", data.username || username);
      navigate("/chat");
    } catch (err) {
      setError(mode === "login" ? "Login failed." : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-xl rounded-[2rem] border p-8 shadow-md md:p-10"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--primary)]">
            Anonymous Access
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create your private space"}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-85"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          {mode === "login" ? "Switch to Sign up" : "Switch to Login"}
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium">Username</label>
          <input
            className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="Choose an anonymous username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input
            className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="Enter a secure password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {mode === "signup" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">Support Focus</label>
            <select
              className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              style={inputStyle}
              value={supportFocus}
              onChange={(e) => setSupportFocus(e.target.value)}
            >
              <option value="stress">Stress relief</option>
              <option value="anxiety">Anxiety support</option>
              <option value="journaling">Reflective journaling</option>
              <option value="sleep">Sleep and calm routines</option>
            </select>
          </div>
        ) : null}

        <div
          className="rounded-2xl border p-4 text-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            color: "var(--muted)",
          }}
        >
          No email, phone number, or real name is required. Your interface is
          designed for anonymous use and session-based support.
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "var(--primary)" }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Enter CompanionBot"
            : "Create Anonymous Account"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>By continuing, you agree this tool supports but does not replace therapy.</span>
        <Link to="/" className="font-medium text-[var(--primary)]">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
