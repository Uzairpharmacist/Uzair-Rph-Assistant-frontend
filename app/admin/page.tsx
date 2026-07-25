"use client";

import { ArrowLeft, LogOut, MessageSquare, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "@/components/chat/Markdown";
import {
  AdminApiError,
  getThread,
  listThreads,
  type ThreadMessage,
  type ThreadSummary,
} from "@/lib/adminApi";

const TOKEN_KEY = "uzair-rph-admin-token";

function formatTime(iso: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading sessionStorage, unavailable during SSR
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) void loadThreads(token);
  }, [token]);

  async function loadThreads(activeToken: string) {
    setThreadsLoading(true);
    setThreadsError("");
    try {
      const data = await listThreads(activeToken);
      data.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
      setThreads(data);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        window.sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setAuthError("That token was rejected. Please try again.");
        return;
      }
      setThreadsError(
        err instanceof AdminApiError ? err.message : "Couldn't load conversations."
      );
    } finally {
      setThreadsLoading(false);
    }
  }

  async function selectThread(threadId: string) {
    if (!token) return;
    setSelectedId(threadId);
    setMessagesLoading(true);
    setMessagesError("");
    try {
      const data = await getThread(token, threadId);
      setMessages(data);
    } catch (err) {
      setMessagesError(
        err instanceof AdminApiError ? err.message : "Couldn't load this conversation."
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  function handleTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) return;
    setAuthError("");
    window.sessionStorage.setItem(TOKEN_KEY, trimmed);
    setToken(trimmed);
  }

  function handleLogout() {
    window.sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTokenInput("");
    setThreads([]);
    setSelectedId(null);
    setMessages([]);
  }

  if (!token) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <form
          onSubmit={handleTokenSubmit}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Admin: view conversations
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the admin token to browse chat threads.
          </p>
          <input
            type="password"
            autoFocus
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token"
            className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {authError && <p className="mt-2 text-xs text-red-500">{authError}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            View conversations
          </button>
        </form>
      </div>
    );
  }

  const selectedThread = threads.find((t) => t.thread_id === selectedId) ?? null;

  return (
    <div className="flex h-dvh flex-col bg-slate-100 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
          Conversations
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadThreads(token)}
            disabled={threadsLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`size-3.5 ${threadsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Thread list */}
        <div
          className={`w-full shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:block sm:w-80 ${
            selectedId ? "hidden" : "block"
          }`}
        >
          {threadsError && (
            <p className="p-4 text-sm text-red-500">{threadsError}</p>
          )}
          {!threadsError && threadsLoading && threads.length === 0 && (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
          )}
          {!threadsLoading && !threadsError && threads.length === 0 && (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
              No conversations yet.
            </p>
          )}
          <ul>
            {threads.map((t) => (
              <li key={t.thread_id}>
                <button
                  type="button"
                  onClick={() => selectThread(t.thread_id)}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-amber-50 dark:border-slate-800 dark:hover:bg-amber-950/30 ${
                    selectedId === t.thread_id ? "bg-amber-50 dark:bg-amber-950/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                      {t.thread_id}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {t.message_count} msg{t.message_count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {t.last_message_preview || "(empty)"}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{formatTime(t.updated_at)}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected thread transcript */}
        <div className={`min-h-0 flex-1 overflow-y-auto ${selectedId ? "block" : "hidden sm:block"}`}>
          {!selectedId && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
              <MessageSquare className="size-8" />
              <p className="text-sm">Select a conversation to view it</p>
            </div>
          )}

          {selectedId && (
            <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 sm:hidden"
              >
                <ArrowLeft className="size-3.5" />
                Back to list
              </button>

              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {selectedId}
                </h2>
                {selectedThread && (
                  <p className="text-xs text-slate-400">
                    Last updated {formatTime(selectedThread.updated_at)}
                  </p>
                )}
              </div>

              {messagesLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
              )}
              {messagesError && <p className="text-sm text-red-500">{messagesError}</p>}

              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      m.role === "user"
                        ? "ml-auto bg-amber-500 text-white"
                        : "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-wide opacity-60">
                      {m.role}
                    </p>
                    {m.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <Markdown text={m.content} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
