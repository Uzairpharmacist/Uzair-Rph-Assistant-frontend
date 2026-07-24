import { AlertTriangle, User } from "lucide-react";
import Image from "next/image";
import Markdown from "./Markdown";
import type { ChatMessage } from "./types";

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "error") {
    return (
      <div className="flex items-start gap-3 px-1 animate-message-in">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertTriangle className="size-4" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {message.text}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 px-1 animate-message-in ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900">
          <User className="size-4" />
        </div>
      ) : (
        <Image
          src="/logo-mark.png"
          alt="Uzair Rph logo"
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full shadow-sm"
        />
      )}

      <div className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`max-w-full break-words rounded-2xl px-4 py-2.5 shadow-sm ${
            isUser
              ? "whitespace-pre-wrap rounded-tr-sm bg-slate-800 text-sm leading-relaxed text-white dark:bg-slate-100 dark:text-slate-900"
              : "rounded-tl-sm border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          }`}
        >
          {isUser ? message.text : <Markdown text={message.text} />}
        </div>
        <span className="px-1 text-[11px] text-slate-400 dark:text-slate-500">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
