import { create } from "zustand";

export type PlayerState = {
  currentQuality: string | null;
  currentAudio: string | null;
  currentSubtitle: string | null;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  setQuality: (quality: string) => void;
  setAudio: (audio: string) => void;
  setSubtitle: (subtitle: string | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  reset: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentQuality: null,
  currentAudio: null,
  currentSubtitle: null,
  currentTime: 0,
  isPlaying: false,
  volume: 1,
  setQuality: (quality) => set({ currentQuality: quality }),
  setAudio: (audio) => set({ currentAudio: audio }),
  setSubtitle: (subtitle) => set({ currentSubtitle: subtitle }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  reset: () =>
    set({
      currentQuality: null,
      currentAudio: null,
      currentSubtitle: null,
      currentTime: 0,
      isPlaying: false,
      volume: 1,
    }),
}));
