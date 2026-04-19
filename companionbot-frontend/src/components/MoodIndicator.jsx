export default function MoodIndicator({ mood, confidence }) {
  return (
    <div className="rounded-3xl border border-[#2a2a2a] bg-[#141414] p-5 text-white">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
        Mood Insight
      </p>

      <h3 className="mt-2 text-lg font-semibold">Current emotional analysis</h3>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl bg-[#1b1b1b] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Detected Emotion
          </p>
          <p className="mt-1 text-base font-semibold text-[#7cc9c3]">
            {mood || "Not detected yet"}
          </p>
        </div>

        <div className="rounded-2xl bg-[#1b1b1b] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Confidence
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {confidence || "--"}
          </p>
        </div>
      </div>
    </div>
  );
}
