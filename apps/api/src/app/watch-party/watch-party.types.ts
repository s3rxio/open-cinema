export type WatchPartyContentType = "movie" | "episode";

export interface WatchPartyRoom {
  id: string;
  code: string;
  contentId: string;
  contentType: WatchPartyContentType;
  hostUserId: string;
  createdAt: string;
}

export interface WatchPartyMember {
  userId: string;
  username: string;
  joinedAt: string;
}

export interface WatchPartyPlaybackState {
  currentTime: number;
  isPlaying: boolean;
  updatedAt: string;
  updatedByUserId: string;
}

export interface WatchPartyChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface WatchPartySocketUser {
  id: string;
  username: string;
}
