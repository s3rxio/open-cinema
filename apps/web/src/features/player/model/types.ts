export type EpisodeOption = {
  id: string;
  title: string;
  season: number;
  episode: number;
};

export type WatchPartyPlayback = {
  currentTime: number;
  isPlaying: boolean;
  updatedAt: string;
};

export type WatchPartyConfig = {
  enabled: boolean;
  isHost: boolean;
  remotePlayback: WatchPartyPlayback | null;
  onLocalPlaybackChange: (state: {
    currentTime: number;
    isPlaying: boolean;
  }) => void;
};

export interface VideoPlayerProps {
  /** Movie or episode id (same as createStream contentId). */
  contentId?: string;
  movieId?: string;
  episodeId?: string;
  streamId?: string | null;
  title?: string;
  variant?: "embedded" | "cinema";
  autoPlay?: boolean;
  watchPartyHref?: string;
  watchParty?: WatchPartyConfig;
  seasons?: { season: number; episodes: EpisodeOption[] }[];
  selectedSeason?: number;
  selectedEpisodeId?: string;
  onEpisodeChange?: (episodeId: string) => void;
}
