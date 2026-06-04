"use client";

import { useAuth } from "@/entities/user";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getWatchPartySocketBaseUrl } from "./socketUrl";
import type {
  RoomJoinedPayload,
  WatchPartyChatMessage,
  WatchPartyContentType,
  WatchPartyMember,
  WatchPartyPlaybackState,
  WatchPartyRoom
} from "./types";

const WATCH_PARTY_NAMESPACE = "/watch-party";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export function useWatchParty(options: {
  contentId: string;
  contentType: WatchPartyContentType;
  roomCode?: string | null;
  enabled: boolean;
  onContentChanged?: (contentId: string) => void;
}) {
  const { token, isAuthenticated, isReady, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const contentIdRef = useRef(options.contentId);
  const onContentChangedRef = useRef(options.onContentChanged);

  contentIdRef.current = options.contentId;
  onContentChangedRef.current = options.onContentChanged;

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<WatchPartyRoom | null>(null);
  const [members, setMembers] = useState<WatchPartyMember[]>([]);
  const [chat, setChat] = useState<WatchPartyChatMessage[]>([]);
  const [playback, setPlayback] = useState<WatchPartyPlaybackState | null>(
    null
  );
  const [isHost, setIsHost] = useState(false);
  const [hostUserId, setHostUserId] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!token || socketRef.current?.connected) return;

    setStatus("connecting");
    setError(null);

    const socket = io(
      `${getWatchPartySocketBaseUrl()}${WATCH_PARTY_NAMESPACE}`,
      {
        auth: { token },
        transports: ["websocket", "polling"]
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      if (options.roomCode) {
        socket.emit("room:join", { code: options.roomCode });
      } else {
        socket.emit("room:create", {
          contentId: contentIdRef.current,
          contentType: options.contentType
        });
      }
    });

    socket.on("connect_error", () => {
      setStatus("error");
      setError("Не удалось подключиться к серверу совместного просмотра");
    });

    socket.on("room:error", (payload: { message?: string }) => {
      setError(payload.message ?? "Ошибка комнаты");
      setStatus("error");
    });

    socket.on("room:joined", (payload: RoomJoinedPayload) => {
      setRoom(payload.room);
      setMembers(payload.members);
      setChat(payload.chat);
      setPlayback(payload.playback);
      setIsHost(payload.isHost);
      setHostUserId(payload.room.hostUserId);
      setError(null);
    });

    socket.on(
      "room:member-joined",
      (payload: { members: WatchPartyMember[] }) => {
        setMembers(payload.members);
      }
    );

    socket.on(
      "room:member-left",
      (payload: { members: WatchPartyMember[] }) => {
        setMembers(payload.members);
      }
    );

    socket.on("room:host-changed", (payload: { hostUserId: string }) => {
      setHostUserId(payload.hostUserId);
      setIsHost(payload.hostUserId === user?.id);
      setRoom(prev =>
        prev ? { ...prev, hostUserId: payload.hostUserId } : prev
      );
    });

    socket.on("chat:message", (message: WatchPartyChatMessage) => {
      setChat(prev => [...prev, message]);
    });

    socket.on("player:sync", (state: WatchPartyPlaybackState) => {
      setPlayback(state);
    });

    socket.on(
      "room:content-changed",
      (payload: {
        contentId: string;
        playback: WatchPartyPlaybackState | null;
      }) => {
        setRoom(prev =>
          prev ? { ...prev, contentId: payload.contentId } : prev
        );
        if (payload.playback) {
          setPlayback(payload.playback);
        }
        onContentChangedRef.current?.(payload.contentId);
      }
    );

    socket.on("disconnect", () => {
      setStatus("idle");
    });
  }, [token, user?.id, options.contentType, options.roomCode]);

  useEffect(() => {
    if (!options.enabled || !isReady || !isAuthenticated || !token) return;

    connect();

    return () => {
      const socket = socketRef.current;
      if (socket) {
        socket.emit("room:leave");
        socket.removeAllListeners();
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect, options.enabled, isReady, isAuthenticated, token]);

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit("chat:send", { text });
  }, []);

  const publishPlayback = useCallback(
    (state: { currentTime: number; isPlaying: boolean }) => {
      if (!isHost) return;
      socketRef.current?.emit("player:update", state);
    },
    [isHost]
  );

  const setRoomContent = useCallback((contentId: string) => {
    socketRef.current?.emit("room:set-content", { contentId });
  }, []);

  const resolvedHostId = hostUserId ?? room?.hostUserId ?? null;
  const resolvedIsHost = resolvedHostId !== null && resolvedHostId === user?.id;

  return {
    status,
    error,
    room,
    members,
    chat,
    playback,
    isHost: resolvedIsHost || isHost,
    hostUserId: resolvedHostId,
    sendChat,
    publishPlayback,
    setRoomContent,
    needsAuth: isReady && !isAuthenticated
  };
}
