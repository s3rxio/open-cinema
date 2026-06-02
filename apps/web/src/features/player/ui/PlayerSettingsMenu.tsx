"use client";

import { useEffect, useRef } from "react";
import { Check, Settings } from "lucide-react";
import { Button, cn } from "@open-cinema/ui";
import type { AudioMeta, SubtitleMeta, VideoMeta } from "@/shared/api/operation-types";
import { AUTO_QUALITY } from "../lib/useHlsTracks";

type PlayerSettingsMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualityValue: string;
  audioValue: string;
  subtitleValue: string;
  videoMetas: VideoMeta[];
  audioMetas: AudioMeta[];
  subtitleMetas: SubtitleMeta[];
  useMaster: boolean;
  onQualityChange: (value: string) => void;
  onAudioChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
};

function SettingsRow({
  label,
  selected,
  onSelect
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10",
        selected && "bg-white/10"
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {selected ? <Check className="h-4 w-4 text-white" /> : null}
      </span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

function SettingsSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white/50">
        {title}
      </p>
      {children}
    </div>
  );
}

export function PlayerSettingsMenu({
  open,
  onOpenChange,
  qualityValue,
  audioValue,
  subtitleValue,
  videoMetas,
  audioMetas,
  subtitleMetas,
  useMaster,
  onQualityChange,
  onAudioChange,
  onSubtitleChange
}: PlayerSettingsMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      const trigger = (e.target as HTMLElement).closest("[data-settings-trigger]");
      if (trigger) return;
      onOpenChange(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onOpenChange]);

  const showQuality = useMaster ? videoMetas.length > 0 : videoMetas.length > 1;
  const showAudio = audioMetas.length > 0;
  const showSubtitles = subtitleMetas.length > 0;
  const hasMenu = showQuality || showAudio || showSubtitles;

  if (!hasMenu) return null;

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        data-settings-trigger
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Настройки воспроизведения"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "hover:bg-white/20 text-white",
          open && "bg-white/20"
        )}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {open && (
        <div
          className="absolute bottom-full right-0 z-50 mb-2 max-h-[min(70vh,420px)] w-72 overflow-y-auto rounded-lg bg-[#212121]/95 py-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm"
          role="menu"
        >
          {showQuality && (
            <SettingsSection title="Качество">
              {useMaster && (
                <SettingsRow
                  label="Авто"
                  selected={qualityValue === AUTO_QUALITY}
                  onSelect={() => {
                    onQualityChange(AUTO_QUALITY);
                  }}
                />
              )}
              {videoMetas.map(meta => (
                <SettingsRow
                  key={meta.id}
                  label={meta.displayName}
                  selected={qualityValue === meta.id}
                  onSelect={() => onQualityChange(meta.id)}
                />
              ))}
            </SettingsSection>
          )}

          {showSubtitles && (
            <>
              {showQuality && <div className="mx-3 my-1 h-px bg-white/10" />}
              <SettingsSection title="Субтитры">
                <SettingsRow
                  label="Выкл."
                  selected={subtitleValue === "off"}
                  onSelect={() => onSubtitleChange("off")}
                />
                {subtitleMetas.map(meta => (
                  <SettingsRow
                    key={meta.id}
                    label={meta.displayName}
                    selected={subtitleValue === meta.id}
                    onSelect={() => onSubtitleChange(meta.id)}
                  />
                ))}
              </SettingsSection>
            </>
          )}

          {showAudio && (
            <>
              {(showQuality || showSubtitles) && (
                <div className="mx-3 my-1 h-px bg-white/10" />
              )}
              <SettingsSection title="Аудиодорожка">
                {audioMetas.map(meta => (
                  <SettingsRow
                    key={meta.id}
                    label={meta.displayName}
                    selected={audioValue === meta.id}
                    onSelect={() => onAudioChange(meta.id)}
                  />
                ))}
              </SettingsSection>
            </>
          )}
        </div>
      )}
    </div>
  );
}
