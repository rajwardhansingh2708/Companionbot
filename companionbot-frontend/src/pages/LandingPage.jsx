import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-[var(--primary)]">
          Your private companion for emotional support
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Anonymous chat, mood detection, and stress-relief mini-games.
        </p>
        <Link
          to="/auth"
          className="mt-8 inline-block rounded-2xl bg-[var(--primary)] px-6 py-3 text-white"
        >
          Start Anonymously
        </Link>
      </section>
    </>
  );
}
