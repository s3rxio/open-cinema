export const WATCH_PARTY_NAMESPACE = "watch-party";

export const ROOM_TTL_SECONDS = 60 * 60 * 24;
export const CHAT_MAX_MESSAGES = 200;
export const CHAT_MAX_TEXT_LENGTH = 300;
export const ROOM_CODE_LENGTH = 8;

export const redisKeys = {
  room: (roomId: string) => `watchparty:room:${roomId}`,
  code: (code: string) => `watchparty:code:${code.toUpperCase()}`,
  members: (roomId: string) => `watchparty:room:${roomId}:members`,
  state: (roomId: string) => `watchparty:room:${roomId}:state`,
  chat: (roomId: string) => `watchparty:room:${roomId}:chat`
} as const;
