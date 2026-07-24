export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="size-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-typing-dot [animation-delay:0ms]" />
      <span className="size-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-typing-dot [animation-delay:150ms]" />
      <span className="size-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-typing-dot [animation-delay:300ms]" />
    </div>
  );
}
