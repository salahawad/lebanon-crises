"use client";

import { useState, useEffect, useRef, use } from "react";
import { Link } from "@/i18n/navigation";
import { getMessages, getMessageThreads } from "@/lib/data/platform-api";
import type { Message, MessageThread } from "@/lib/types/platform";
import { ArrowLeft, Send, Lock } from "lucide-react";

const CURRENT_USER = "a1";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: threadId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [msgs, threads] = await Promise.all([
          getMessages(threadId),
          getMessageThreads(CURRENT_USER),
        ]);
        const sorted = [...msgs].sort((a, b) => a.createdAt - b.createdAt);
        setMessages(sorted);

        const t = threads.find((th) => th.id === threadId) ?? null;
        setThread(t);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getOtherNames(): string {
    if (!thread) return "";
    const otherNames = thread.participantNames.filter(
      (_, i) => thread.participants[i] !== CURRENT_USER
    );
    return otherNames.join(", ");
  }

  function getReadByCount(msg: Message): number {
    return msg.readBy.filter((id) => id !== msg.senderId).length;
  }

  function handleSend() {
    if (!inputValue.trim()) return;
    // Demo only — doesn't actually send
    setInputValue("");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center gap-3">
          <Link
            href="/messages"
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">{getOtherNames()}</h1>
            {thread?.type === "group" && (
              <p className="text-xs text-white/70">
                {thread.participantNames.length} participants
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-emerald-300">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs">Encrypted</span>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 max-w-lg mx-auto md:max-w-4xl w-full px-4 py-4 overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div className="bg-white rounded-lg p-3 animate-pulse w-2/3">
                  <div className="h-3 bg-slate-200 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.senderId === CURRENT_USER;
              const readCount = getReadByCount(msg);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      isOwn
                        ? "bg-primary text-white"
                        : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    {/* Sender name */}
                    {!isOwn && (
                      <p
                        className={`text-xs font-semibold mb-1 ${
                          isOwn ? "text-blue-200" : "text-primary"
                        }`}
                      >
                        {msg.senderName}
                      </p>
                    )}

                    {/* Message content */}
                    <p className="text-sm leading-relaxed">{msg.content}</p>

                    {/* Time and read indicator */}
                    <div
                      className={`flex items-center gap-2 mt-1.5 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          isOwn ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                      {isOwn && readCount > 0 && (
                        <span className="text-xs text-blue-200">
                          Read by {readCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Message input */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Demo mode — messages are not sent
          </p>
        </div>
      </div>
    </div>
  );
}
