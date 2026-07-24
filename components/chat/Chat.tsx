"use client";

import { RotateCcw, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { sendMessage, ChatApiError } from "@/lib/api";
import { getOrCreateThreadId, resetThreadId } from "@/lib/thread";
import ChatComposer from "./ChatComposer";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { ChatMessage } from "./types";

const SUGGESTIONS = [
  "Can we get a 20% discount on the annual plan?",
  "What's the best price for a 12-month contract?",
  "Can you match a competitor's offer?",
  "What flexibility is there on payment terms?",
];

function messagesKey(threadId: string) {
  return `uzair-rph-messages-${threadId}`;
}

function makeMessage(role: ChatMessage["role"], text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    timestamp: Date.now(),
  };
}

export default function Chat() {
  // threadId/messages start empty so the client's first render matches the
  // server-rendered (localStorage-less) HTML; the real values are hydrated
  // from localStorage right after mount, below.
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = getOrCreateThreadId();
    const saved = window.localStorage.getItem(messagesKey(id));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage, which isn't available during SSR/hydration
    setThreadId(id);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore corrupt cache
      }
    }
  }, []);

  useEffect(() => {
    if (!threadId) return;
    window.localStorage.setItem(messagesKey(threadId), JSON.stringify(messages));
  }, [messages, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !threadId || isSending) return;

    setInput("");
    setMessages((prev) => [...prev, makeMessage("user", text)]);
    setIsSending(true);

    try {
      const reply = await sendMessage(text, threadId);
      setIsOnline(true);
      setMessages((prev) => [...prev, makeMessage("agent", reply)]);
    } catch (err) {
      const message =
        err instanceof ChatApiError ? err.message : "Something went wrong. Please try again.";
      if (err instanceof ChatApiError && !err.status) setIsOnline(false);
      setMessages((prev) => [...prev, makeMessage("error", message)]);
    } finally {
      setIsSending(false);
    }
  }

  function handleNewChat() {
    const id = resetThreadId();
    setThreadId(id);
    setMessages([]);
    setInput("");
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-100 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-mark.png"
            alt="Uzair Rph logo"
            width={40}
            height={40}
            priority
            className="size-10 shrink-0 rounded-xl shadow-sm"
          />
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
              Uzair Rph Assistant
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="size-3" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="size-3 text-red-500" />
                  <span className="text-red-500">Connection issue</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw className="size-3.5" />
          New chat
        </button>
      </header>

      <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-4 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
              <Image
                src="/logo-mark.png"
                alt="Uzair Rph logo"
                width={64}
                height={64}
                className="size-16 rounded-2xl shadow-md"
              />
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Let&apos;s negotiate a great deal
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Ask about pricing, discounts, contract terms, or anything else you&apos;d like
                  to work out.
                </p>
              </div>
              <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-800 dark:hover:bg-amber-950/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isSending && (
            <div className="flex items-start gap-3 px-1">
              <Image
                src="/logo-mark.png"
                alt="Uzair Rph logo"
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full shadow-sm"
              />
              <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatComposer value={input} onChange={setInput} onSend={handleSend} disabled={isSending} />
    </div>
  );
}
