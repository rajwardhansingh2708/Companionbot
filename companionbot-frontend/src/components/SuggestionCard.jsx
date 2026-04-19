import { useNavigate } from "react-router-dom";

export default function SuggestionCard({ suggestion, activities = [] }) {
  const navigate = useNavigate();

  function openActivity(activityName) {
    localStorage.setItem("suggestedActivity", activityName);
    navigate("/game");
  }

  return (
    <div className="rounded-3xl border border-[#2a2a2a] bg-[#141414] p-5 text-white">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
        Suggested Support
      </p>

      <h3 className="mt-2 text-lg font-semibold">Recommended calming activity</h3>

      <div className="mt-4 rounded-2xl bg-[#1b1b1b] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
          Primary Activity
        </p>
        <p className="mt-1 text-base font-semibold text-[#7cc9c3]">
          {suggestion || "No activity suggested yet"}
        </p>

        {suggestion ? (
          <button
            onClick={() => openActivity(suggestion)}
            className="mt-4 inline-flex rounded-full bg-[#7cc9c3] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Open Primary Activity
          </button>
        ) : null}
      </div>

      {activities.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-400">
            More options
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => openActivity(activity)}
                className="rounded-full border border-[#2b2b2b] bg-[#171717] px-3 py-2 text-xs text-gray-300 transition hover:bg-[#202020]"
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
