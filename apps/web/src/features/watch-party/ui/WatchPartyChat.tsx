"use client";

import { Button, Textarea } from "@open-cinema/ui";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import type { WatchPartyChatMessage } from "../lib/types";

const CHAT_MAX_LENGTH = 300;

type WatchPartyChatProps = {
  messages: WatchPartyChatMessage[];
  currentUserId?: string;
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function WatchPartyChat({
  messages,
  currentUserId,
  onSend,
  disabled
}: WatchPartyChatProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submitMessage = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-white/10 bg-zinc-950">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Чат</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-3">
          {messages.length === 0 && (
            <li className="text-sm text-zinc-500">Пока нет сообщений</li>
          )}
          {messages.map(message => (
            <li key={message.id} className="space-y-1">
              <div className="flex items-baseline gap-2 text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">
                  {message.userId === currentUserId
                    ? `${message.username} (вы)`
                    : message.username}
                </span>
                <span aria-hidden>·</span>
                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </time>
              </div>
              <p className="whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-zinc-800/90 px-3 py-2 text-sm text-zinc-100">
                {message.text}
              </p>
            </li>
          ))}
        </ul>
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-white/10 p-3"
      >
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение… (Enter — отправить, Shift+Enter — новая строка)"
          disabled={disabled}
          maxLength={CHAT_MAX_LENGTH}
          rows={3}
          className="min-h-[72px] resize-none bg-zinc-900 border-zinc-700 text-white"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-500 tabular-nums">
            {draft.length}/{CHAT_MAX_LENGTH}
          </span>
          <Button type="submit" disabled={disabled || !draft.trim()}>
            Отправить
          </Button>
        </div>
      </form>
    </div>
  );
}
