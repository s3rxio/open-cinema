"use client";

import Link from "next/link";
import { Button, Loader } from "@open-cinema/ui";
import { ChevronLeft, Copy, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { VideoPlayer } from "@/features/player/ui/VideoPlayer";
import { useAuth } from "@/shared/auth/AuthContext";
import { useWatchParty } from "../lib/useWatchParty";
import type { WatchPartyContentType } from "../lib/types";
import { WatchPartyChat } from "./WatchPartyChat";

type WatchPartyShellProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  contentId: string;
  contentType: WatchPartyContentType;
  roomCode?: string | null;
};

export function WatchPartyShell({
  backHref,
  backLabel = "Назад",
  title,
  contentId,
  contentType,
  roomCode
}: WatchPartyShellProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const party = useWatchParty({
    contentId,
    contentType,
    roomCode,
    enabled: true
  });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !party.room) return "";
    const url = new URL(window.location.href);
    url.searchParams.set("room", party.room.code);
    return url.toString();
  }, [party.room]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (party.needsAuth) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
        <p>Войдите в аккаунт, чтобы смотреть вместе</p>
        <Link href="/auth/login" className="text-primary hover:underline">
          Войти
        </Link>
        <Link href={backHref} className="text-sm text-zinc-400 hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-white">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
          <p className="text-xs text-zinc-400">Совместный просмотр</p>
        </div>

        {party.room && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono tracking-wider">
              {party.room.code}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => void handleCopyLink()}
              className="gap-1"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Скопировано" : "Ссылка"}
            </Button>
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <Users className="h-4 w-4" />
              {party.members.length}
            </span>
            {party.isHost && (
              <span className="text-xs text-amber-400">Вы ведущий</span>
            )}
          </div>
        )}
      </header>

      {party.status === "connecting" && (
        <div className="flex flex-1 items-center justify-center">
          <Loader size="lg" />
        </div>
      )}

      {party.error && party.status === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-red-400">{party.error}</p>
          <Link href={backHref} className="text-primary hover:underline">
            {backLabel}
          </Link>
        </div>
      )}

      {party.room && party.status === "connected" && (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
          <div className="relative min-h-[240px] bg-black lg:min-h-0">
            <VideoPlayer
              contentId={contentId}
              title={title}
              variant="cinema"
              autoPlay
              watchParty={{
                enabled: true,
                isHost: party.isHost,
                remotePlayback: party.playback,
                onLocalPlaybackChange: party.publishPlayback
              }}
            />
          </div>

          <WatchPartyChat
            messages={party.chat}
            currentUserId={user?.id}
            onSend={party.sendChat}
          />
        </div>
      )}
    </div>
  );
}
