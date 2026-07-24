"use client";

import { Send } from "lucide-react";
import { useRef } from "react";
import type { KeyboardEvent } from "react";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white/80 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-amber-950">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message to Uzair Rph Assistant…"
          rows={1}
          disabled={disabled}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          <Send className="size-4" />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400 dark:text-slate-500">
        Press Enter to send, Shift + Enter for a new line.
      </p>
    </div>
  );
}
