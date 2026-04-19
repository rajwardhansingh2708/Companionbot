import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";
import MoodIndicator from "../components/MoodIndicator";
import SuggestionCard from "../components/SuggestionCard";
import { sendMessage } from "../services/chatApi";
import { fetchHistory, fetchChatById, deleteChatById } from "../services/historyApi";

const promptChips = [
  "Calm my thoughts",
  "Help with anxiety",
  "I feel lonely",
  "Need motivation",
  "Sleep better",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "demo_user";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyList, setHistoryList] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [mood, setMood] = useState("Not detected yet");
  const [confidence, setConfidence] = useState("--");
  const [suggestion, setSuggestion] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [recommendedActivities, setRecommendedActivities] = useState([]);


  const bottomRef = useRef(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    loadHistory();
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadHistory() {
    try {
      const data = await fetchHistory(username);
      setHistoryList(data);
    } catch (err) {
      console.log("History load failed");
    }
  }

  useEffect(() => {
  const savedChatId = localStorage.getItem("activeChatId");
  if (savedChatId) {
    handleOpenHistory(savedChatId);
  }
}, []);


  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    if (!query) return historyList;

    return historyList.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const emotion = (item.emotion || "").toLowerCase();
      return title.includes(query) || emotion.includes(query);
    });
  }, [historyList, historySearch]);

  const currentHistoryItem = historyList.find((item) => item.chat_id === currentChatId);
  const currentChatTitle = currentHistoryItem?.title || "New conversation";

  async function handleSendMessage(customText) {
    const finalInput = (customText || input).trim();
    if (!finalInput) return;

    const userMessage = {
      sender: "user",
      text: finalInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const data = await sendMessage({
        username,
        message: userMessage.text,
        chat_id: currentChatId || "",
      });

      const botMessage = {
        sender: "bot",
        text: data.reply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setMood(data.emotion || "Not detected yet");
      setConfidence(data.confidence || "--");
      setSuggestion(data.suggest_game ? data.game_type : "");
      setRecommendedActivities(data.recommended_activities || []);


      if (data.suggest_game && data.game_type) {
        localStorage.setItem("suggestedActivity", data.game_type);
      }

      if (!currentChatId && data.chat_id) {
  setCurrentChatId(data.chat_id);
  localStorage.setItem("activeChatId", data.chat_id);
}


      loadHistory();
    } catch (err) {
      setError("Failed to get response from backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput("");
    setMood("Not detected yet");
    setConfidence("--");
    setSuggestion("");
    setError("");
    setCurrentChatId(null);
    setRecommendedActivities([]);
    localStorage.removeItem("activeChatId");


  }

  async function handleOpenHistory(chatId) {
    try {
      const chat = await fetchChatById(chatId);

      const formattedMessages = chat.messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        time: "",
      }));

      setMessages(formattedMessages);
      setCurrentChatId(chat.chat_id);
      localStorage.setItem("activeChatId", chat.chat_id);

      setMood(chat.emotion || "Not detected yet");
      setConfidence(chat.confidence || "--");
      setSuggestion(chat.suggest_game ? chat.game_type : "");
      setRecommendedActivities(chat.recommended_activities || []);

      setError("");
    } catch (err) {
      console.log("Failed to open chat");
    }
  }

  function requestDeleteHistory(chatId) {
    setDeleteTargetId(chatId);
  }

  async function confirmDeleteHistory() {
    if (!deleteTargetId) return;

    try {
      await deleteChatById(deleteTargetId);

      if (currentChatId === deleteTargetId) {
        handleNewChat();
      }

      setDeleteTargetId(null);
      loadHistory();
    } catch (err) {
      console.log("Failed to delete chat");
    }
  }

  function cancelDeleteHistory() {
    setDeleteTargetId(null);
  }

  function requestLogout() {
    setShowLogoutConfirm(true);
  }

  function confirmLogout() {
    localStorage.removeItem("username");
    localStorage.removeItem("suggestedActivity");
    localStorage.removeItem("activeChatId");

    navigate("/auth");
  }

  function cancelLogout() {
    setShowLogoutConfirm(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      <aside className="flex w-[72px] flex-col items-center border-r border-[#1f1f1f] bg-[#0b0b0b] py-4">
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#151515] text-sm font-bold text-[#7cc9c3]"
          title="CompanionBot"
        >
          CB
        </div>

        <div className="mt-auto flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#171717] text-xs font-semibold uppercase text-[#7cc9c3]"
              title={username}
            >
              {username.slice(0, 2)}
            </div>
            <p className="max-w-[56px] truncate text-center text-[10px] text-gray-500">
              {username}
            </p>
          </div>

          <button
            onClick={requestLogout}
            className="rounded-full border border-[#2a2a2a] bg-[#151515] px-3 py-2 text-[11px] text-white transition hover:bg-[#202020]"
          >
            Logout
          </button>
        </div>
      </aside>

      <aside className="flex w-[290px] min-h-0 flex-col border-r border-[#1f1f1f] bg-[#111111] px-4 py-5">
        <button
          onClick={handleNewChat}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-[#262626] bg-[#171717] px-4 py-3 text-left text-sm font-medium transition hover:bg-[#202020]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222222] text-base text-[#7cc9c3]">
            +
          </span>
          <span>New chat</span>
        </button>

        <div className="relative mb-4">
          <input
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full rounded-2xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 pr-10 text-sm outline-none"
            placeholder="Search chats"
          />
          {historySearch ? (
            <button
              onClick={() => setHistorySearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
            Recents
          </p>
          <p className="text-xs text-gray-600">{filteredHistory.length}</p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredHistory.length === 0 ? (
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#151515] px-4 py-4 text-sm text-gray-500">
              No chats found.
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isActive = currentChatId === item.chat_id;

              return (
                <div
                  key={item.chat_id}
                  className={`group rounded-2xl border px-3 py-3 transition ${
                    isActive ? "bg-[#1e1e1e]" : "bg-transparent hover:bg-[#1a1a1a]"
                  }`}
                  style={{
                    borderColor: isActive ? "#2f6f6d" : "#1f1f1f",
                    boxShadow: isActive ? "0 0 0 1px rgba(124,201,195,0.15)" : "none",
                  }}
                >
                  <button
                    onClick={() => handleOpenHistory(item.chat_id)}
                    className="w-full text-left"
                  >
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs capitalize text-gray-500">
                        {item.emotion}
                      </p>
                      {isActive ? (
                        <span className="rounded-full bg-[#173231] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7cc9c3]">
                          Open
                        </span>
                      ) : null}
                    </div>
                  </button>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => requestDeleteHistory(item.chat_id)}
                      className="rounded-full border border-[#2a2a2a] px-3 py-1 text-xs text-red-400 opacity-0 transition group-hover:opacity-100 hover:bg-[#1d1d1d] hover:text-red-300"
                      title="Delete chat"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 bg-black">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-[#1f1f1f] px-6 py-4">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Active Chat
                </p>
                <h2 className="mt-1 line-clamp-1 text-lg font-semibold text-white">
                  {isEmpty ? "New conversation" : currentChatTitle}
                </h2>
              </div>
              
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center">
                <h1 className="mb-8 text-center text-4xl font-semibold md:text-5xl">
                  Hey {username}, what's on your mind today?
                </h1>

                <div className="w-full max-w-3xl">
                  <div className="flex flex-wrap justify-center gap-3">
                    {promptChips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleSendMessage(chip)}
                        className="rounded-full border border-[#2b2b2b] bg-[#171717] px-4 py-2 text-sm text-gray-300 transition hover:bg-[#202020]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pb-28">
                <ChatWindow messages={messages} loading={loading} bottomRef={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-[#1f1f1f] bg-black/90 px-6 py-5 backdrop-blur">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSendMessage}
                loading={loading}
              />
              {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
            </div>
          </div>
        </div>

        <aside className="hidden w-[320px] border-l border-[#1f1f1f] bg-[#101010] p-5 xl:block">
          <div className="space-y-4">
            <MoodIndicator mood={mood} confidence={confidence} />
            <SuggestionCard
  suggestion={suggestion}
  activities={recommendedActivities}
/>

          </div>
        </aside>
      </main>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#2a2a2a] bg-[#121212] p-6 text-white shadow-2xl">
            <h3 className="text-xl font-semibold">Do you want to logout?</h3>
            <p className="mt-3 text-sm text-gray-400">
              You will be returned to the login page and your active session will end.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-5 py-2 text-sm"
              >
                No
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-full bg-[#7cc9c3] px-5 py-2 text-sm font-semibold text-black"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTargetId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#2a2a2a] bg-[#121212] p-6 text-white shadow-2xl">
            <h3 className="text-xl font-semibold">Are you sure to delete it?</h3>
            <p className="mt-3 text-sm text-gray-400">
              This chat history will be removed permanently from your session list.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDeleteHistory}
                className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-5 py-2 text-sm"
              >
                No
              </button>
              <button
                onClick={confirmDeleteHistory}
                className="rounded-full bg-red-400 px-5 py-2 text-sm font-semibold text-black"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
