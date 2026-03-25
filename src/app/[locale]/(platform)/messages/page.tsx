"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { getMessageThreads, getJointOperation } from "@/lib/data/platform-api";
import type { MessageThread } from "@/lib/types/platform";
import { MessageSquare, ChevronRight, Lock } from "lucide-react";

const CURRENT_USER = "a1";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [opNames, setOpNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMessageThreads(CURRENT_USER);
        const sorted = [...data].sort(
          (a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt)
        );
        setThreads(sorted);

        // Fetch joint op names for group threads
        const ops: Record<string, string> = {};
        for (const t of sorted) {
          if (t.type === "group" && t.jointOpId) {
            const op = await getJointOperation(t.jointOpId);
            if (op) ops[t.id] = op.title;
          }
        }
        setOpNames(ops);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getOtherNames(thread: MessageThread): string {
    const otherNames = thread.participantNames.filter(
      (_, i) => thread.participants[i] !== CURRENT_USER
    );
    return otherNames.join(", ");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h1 className="text-base font-bold">Messages</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4">
        {/* E2E encryption badge */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">
            End-to-end encrypted
          </span>
        </div>

        {/* Thread list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No conversations yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Start a conversation from a collaboration or operation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const isUnread =
                thread.lastMessage !== undefined &&
                thread.lastMessageAt !== undefined;
              const otherNames = getOtherNames(thread);

              return (
                <Link
                  key={thread.id}
                  href={`/messages/${thread.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Group label */}
                        {thread.type === "group" && (
                          <span className="inline-block text-xs font-medium text-accent mb-1">
                            Group
                            {opNames[thread.id]
                              ? ` · ${opNames[thread.id]}`
                              : ""}
                          </span>
                        )}

                        {/* Participant names */}
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-slate-900 truncate">
                            {otherNames}
                          </h3>
                        </div>

                        {/* Last message preview */}
                        {thread.lastMessage && (
                          <p className="text-sm text-slate-500 truncate mt-1">
                            {thread.lastMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {thread.lastMessageAt && (
                          <span className="text-xs text-slate-400">
                            {timeAgo(thread.lastMessageAt)}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
