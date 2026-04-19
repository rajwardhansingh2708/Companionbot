export default function ChatWindow({ messages, loading, bottomRef }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {messages.map((msg, index) => {
        const isUser = msg.sender === "user";

        return (
          <div
            key={index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[80%] flex-col gap-2 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className="rounded-3xl px-5 py-4 text-sm leading-7"
                style={{
                  background: isUser ? "#7cc9c3" : "#1b1b1b",
                  color: isUser ? "#0f172a" : "#f5f5f5",
                }}
              >
                {msg.text}
              </div>

              {msg.time ? (
                <span className="px-1 text-xs text-gray-500">{msg.time}</span>
              ) : null}
            </div>
          </div>
        );
      })}

      {loading ? (
        <div className="flex justify-start">
          <div
            className="max-w-[80%] rounded-3xl px-5 py-4 text-sm"
            style={{
              background: "#1b1b1b",
              color: "#f5f5f5",
            }}
          >
            CompanionBot is thinking...
          </div>
        </div>
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}
