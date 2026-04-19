export default function ChatInput({ input, setInput, onSend, loading }) {
  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !loading) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div
      className="rounded-[2rem] border px-5 py-4 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
      style={{
        background: "#151515",
        borderColor: "#2b2b2b",
      }}
    >
      <div className="flex items-end gap-3">
        <textarea
          className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-3 text-base outline-none"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          style={{ color: "#ffffff" }}
        />

        <button
          onClick={() => onSend()}
          disabled={loading}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "#7cc9c3", color: "#0f172a" }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Press `Enter` to send, `Shift + Enter` for a new line.
      </p>
    </div>
  );
}
