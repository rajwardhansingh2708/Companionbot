import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/auth", label: "Access" },
  { to: "/chat", label: "Chat" },
  { to: "/game", label: "Activities" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 px-4 py-4 md:px-6">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between rounded-full border px-5 py-3 shadow-[0_10px_40px_rgba(13,25,23,0.08)] backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--surface) 88%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <Link to="/" className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
          >
            C
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-[var(--primary)]">
              COMPANIONBOT
            </p>
            <p className="text-xs text-[var(--muted)]">
              Private mental wellness support
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "text-white" : ""}`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--primary)" : "transparent",
                color: isActive ? "#ffffff" : "var(--text)",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <ThemeToggle />
      </nav>
    </header>
  );
}
