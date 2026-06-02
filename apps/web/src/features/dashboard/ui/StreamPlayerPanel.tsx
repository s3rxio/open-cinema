"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";
import { Button, Input, Label, Loader } from "@open-cinema/ui";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { graphqlSingleFileUpload } from "@/shared/api/graphqlUpload";
import {
  CREATE_STREAM_MUTATION,
  GENERATE_MASTER_MUTATION,
  GET_STREAM_INFO_QUERY,
  UPDATE_AUDIO_META_MUTATION,
  UPDATE_SUBTITLE_META_MUTATION,
  UPDATE_VIDEO_META_MUTATION,
  REMOVE_VIDEO_META_MUTATION,
  REMOVE_AUDIO_META_MUTATION,
  REMOVE_SUBTITLE_META_MUTATION,
  UPLOAD_AUDIO_MUTATION,
  UPLOAD_SUBTITLE_MUTATION,
  UPLOAD_VIDEO_MUTATION
} from "@/shared/api/operations/dashboard";
import type { StreamInfo } from "@/shared/api/operation-types";
import {
  STREAM_POLL_INTERVAL_MS,
  streamNeedsPolling
} from "../lib/streamPolling";

type StreamPlayerPanelProps = {
  contentId: string;
  streamId: string | null | undefined;
  pollingEnabled?: boolean;
  onStreamCreated?: (streamId: string) => void;
};

type TrackDraft = {
  displayName: string;
  slug: string;
  orderNumer: string;
};

export function StreamPlayerPanel({
  contentId,
  streamId,
  pollingEnabled = true,
  onStreamCreated
}: StreamPlayerPanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pollIntervalMs, setPollIntervalMs] = useState(0);

  const [createStream, createStreamState] = useMutation(CREATE_STREAM_MUTATION);
  const [generateMaster, generateMasterState] = useMutation(
    GENERATE_MASTER_MUTATION
  );

  const streamQuery = useQuery(GET_STREAM_INFO_QUERY, {
    skip: !streamId,
    variables: { streamId: streamId ?? "" },
    fetchPolicy: "cache-and-network",
    pollInterval: pollIntervalMs
  });

  const stream = streamQuery.data?.getStreamInfo;

  useEffect(() => {
    if (pollingEnabled && streamId) {
      void streamQuery.refetch();
    }
  }, [pollingEnabled, streamId, streamQuery]);

  useEffect(() => {
    if (!pollingEnabled || !streamId) {
      setPollIntervalMs(0);
      return;
    }

    setPollIntervalMs(
      streamNeedsPolling(stream, uploading) ? STREAM_POLL_INTERVAL_MS : 0
    );
  }, [pollingEnabled, streamId, stream, uploading]);

  const isPolling = pollIntervalMs > 0;

  const refreshStream = useCallback(() => {
    if (streamId) {
      void streamQuery.refetch();
    }
  }, [streamId, streamQuery]);

  const handleCreateStream = async () => {
    setMessage(null);
    try {
      const result = await createStream({
        variables: { createStreamInput: { contentId } }
      });
      const newStreamId = result.data?.createStream.id;
      if (newStreamId) {
        onStreamCreated?.(newStreamId);
        setMessage("Стрим создан");
      }
    } catch (error) {
      setMessage(getApolloErrorMessage(error));
    }
  };

  const handleGenerateMaster = async () => {
    if (!streamId) return;
    setMessage(null);
    try {
      await generateMaster({ variables: { streamId } });
      setMessage("Master playlist пересобран");
      refreshStream();
    } catch (error) {
      setMessage(getApolloErrorMessage(error));
    }
  };

  if (!streamId) {
    return (
      <div className="space-y-4 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Для этого контента ещё не создан стрим. Создайте его, чтобы загружать
          медиа.
        </p>
        <Button
          type="button"
          onClick={handleCreateStream}
          disabled={createStreamState.loading}
        >
          {createStreamState.loading ? "Создание…" : "Создать стрим"}
        </Button>
        {message ? <p className="text-sm">{message}</p> : null}
      </div>
    );
  }

  if (streamQuery.loading && !stream) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateMaster}
          disabled={generateMasterState.loading}
        >
          {generateMasterState.loading
            ? "Генерация…"
            : "Пересобрать master playlist"}
        </Button>
        <Button type="button" variant="ghost" onClick={refreshStream}>
          Обновить
        </Button>
        {isPolling ? (
          <span className="text-xs text-muted-foreground">
            Автообновление каждые {STREAM_POLL_INTERVAL_MS / 1000} с…
          </span>
        ) : null}
      </div>

      {stream?.masterPlaylistUrl ? (
        <p className="text-sm text-muted-foreground">
          Master playlist: активен
        </p>
      ) : (
        <p className="text-sm text-amber-600">
          Master playlist ещё не сгенерирован
        </p>
      )}

      <StreamSingleFileUpload
        streamId={streamId}
        uploading={uploading}
        onUploadingChange={setUploading}
        onSuccess={msg => {
          setMessage(msg);
          refreshStream();
        }}
        onError={error => setMessage(getApolloErrorMessage(error))}
      />

      {stream ? (
        <TrackLists stream={stream} onUpdated={refreshStream} />
      ) : null}

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
      {streamQuery.error ? (
        <p className="text-sm text-destructive">
          {getApolloErrorMessage(streamQuery.error)}
        </p>
      ) : null}
    </div>
  );
}

type UploadTrackKind = "video" | "audio" | "subtitle";

function defaultUploadDraft(kind: UploadTrackKind): TrackDraft {
  if (kind === "subtitle") {
    return { slug: "ru", displayName: "Русские", orderNumer: "0" };
  }
  return { slug: "ru", displayName: "Русский", orderNumer: "0" };
}

const UPLOAD_KIND_CONFIG: Record<
  UploadTrackKind,
  { label: string; accept: string; successMessage: string }
> = {
  video: {
    label: "Видео",
    accept: "video/*",
    successMessage: "Видео загружено и поставлено в очередь обработки"
  },
  audio: {
    label: "Аудио",
    accept: "audio/*",
    successMessage: "Аудио загружено"
  },
  subtitle: {
    label: "Субтитры",
    accept: ".vtt,.srt,text/*",
    successMessage: "Субтитры загружены"
  }
};

function StreamSingleFileUpload({
  streamId,
  uploading,
  onUploadingChange,
  onSuccess,
  onError
}: {
  streamId: string;
  uploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: unknown) => void;
}) {
  const [kind, setKind] = useState<UploadTrackKind>("video");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [draft, setDraft] = useState<TrackDraft>(() =>
    defaultUploadDraft("video")
  );

  const resetForm = useCallback(() => {
    setFile(null);
    setFileInputKey(key => key + 1);
    setDraft(defaultUploadDraft(kind));
  }, [kind]);

  const config = UPLOAD_KIND_CONFIG[kind];
  const showTrackMeta = kind !== "video";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      onError(new Error("Выберите файл"));
      return;
    }

    onUploadingChange(true);
    try {
      if (kind === "video") {
        await graphqlSingleFileUpload({
          document: UPLOAD_VIDEO_MUTATION,
          variables: { uploadVideoInput: { streamId, file: null } },
          fileVariablePath: "uploadVideoInput.file",
          file
        });
      } else if (kind === "audio") {
        await graphqlSingleFileUpload({
          document: UPLOAD_AUDIO_MUTATION,
          variables: {
            uploadAudioInput: {
              streamId,
              file: null,
              slug: draft.slug,
              displayName: draft.displayName,
              orderNumer: Number(draft.orderNumer) || 0,
              isDefault: false
            }
          },
          fileVariablePath: "uploadAudioInput.file",
          file
        });
      } else {
        await graphqlSingleFileUpload({
          document: UPLOAD_SUBTITLE_MUTATION,
          variables: {
            uploadSubtitleInput: {
              streamId,
              file: null,
              slug: draft.slug,
              displayName: draft.displayName,
              orderNumer: Number(draft.orderNumer) || 0
            }
          },
          fileVariablePath: "uploadSubtitleInput.file",
          file
        });
      }

      resetForm();
      onSuccess(config.successMessage);
    } catch (error) {
      onError(error);
    } finally {
      onUploadingChange(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">Загрузка файла</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <Label htmlFor="upload-kind">Тип</Label>
          <select
            id="upload-kind"
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={kind}
            disabled={uploading}
            onChange={event => {
              const nextKind = event.target.value as UploadTrackKind;
              setKind(nextKind);
              setFile(null);
              setFileInputKey(key => key + 1);
              setDraft(defaultUploadDraft(nextKind));
            }}
          >
            <option value="video">Видео</option>
            <option value="audio">Аудио</option>
            <option value="subtitle">Субтитры</option>
          </select>
        </div>

        {showTrackMeta ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="upload-slug">Slug</Label>
              <Input
                id="upload-slug"
                value={draft.slug}
                disabled={uploading}
                onChange={event =>
                  setDraft(prev => ({ ...prev, slug: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="upload-name">Название дорожки</Label>
              <Input
                id="upload-name"
                value={draft.displayName}
                disabled={uploading}
                onChange={event =>
                  setDraft(prev => ({
                    ...prev,
                    displayName: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="upload-order">Порядок</Label>
              <Input
                id="upload-order"
                type="number"
                min={0}
                value={draft.orderNumer}
                disabled={uploading}
                onChange={event =>
                  setDraft(prev => ({
                    ...prev,
                    orderNumer: event.target.value
                  }))
                }
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <Label htmlFor="upload-file">Файл ({config.label})</Label>
          <Input
            id="upload-file"
            key={`${kind}-${fileInputKey}`}
            type="file"
            accept={config.accept}
            disabled={uploading}
            onChange={event => setFile(event.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-xs text-muted-foreground">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={uploading || !file}>
          {uploading ? "Загрузка…" : "Загрузить"}
        </Button>
      </form>
    </section>
  );
}

function TrackLists({
  stream,
  onUpdated
}: {
  stream: StreamInfo;
  onUpdated: () => void;
}) {
  const [updateVideoMeta] = useMutation(UPDATE_VIDEO_META_MUTATION);
  const [updateAudioMeta] = useMutation(UPDATE_AUDIO_META_MUTATION);
  const [updateSubtitleMeta] = useMutation(UPDATE_SUBTITLE_META_MUTATION);
  const [removeVideoMeta] = useMutation(REMOVE_VIDEO_META_MUTATION);
  const [removeAudioMeta] = useMutation(REMOVE_AUDIO_META_MUTATION);
  const [removeSubtitleMeta] = useMutation(REMOVE_SUBTITLE_META_MUTATION);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveMeta = async (
    kind: "video" | "audio" | "subtitle",
    id: string,
    displayName: string,
    slug: string,
    orderNumer?: number
  ) => {
    setSavingId(id);
    try {
      if (kind === "video") {
        await updateVideoMeta({
          variables: {
            updateVideoMetaInput: { id, displayName, slug }
          }
        });
      } else if (kind === "audio") {
        await updateAudioMeta({
          variables: {
            updateAudioMetaInput: {
              id,
              displayName,
              slug,
              orderNumer
            }
          }
        });
      } else {
        await updateSubtitleMeta({
          variables: {
            updateSubtitleMetaInput: {
              id,
              displayName,
              slug,
              orderNumer
            }
          }
        });
      }
      onUpdated();
    } finally {
      setSavingId(null);
    }
  };

  const deleteMeta = async (kind: "video" | "audio" | "subtitle", id: string) => {
    if (
      !window.confirm(
        "Удалить дорожку? Файлы в хранилище также будут удалены."
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      if (kind === "video") {
        await removeVideoMeta({ variables: { id } });
      } else if (kind === "audio") {
        await removeAudioMeta({ variables: { id } });
      } else {
        await removeSubtitleMeta({ variables: { id } });
      }
      onUpdated();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <MetaList
        title="Видео дорожки"
        items={stream.videoMetas.map(meta => ({
          id: meta.id,
          displayName: meta.displayName,
          slug: meta.slug,
          extra: `${meta.width}×${meta.height}, ${meta.bitrate} kbps`,
          processed: meta.isProcessed
        }))}
        savingId={savingId}
        deletingId={deletingId}
        onSave={(id, displayName, slug) =>
          saveMeta("video", id, displayName, slug)
        }
        onDelete={id => deleteMeta("video", id)}
      />
      <MetaList
        title="Аудио дорожки"
        items={stream.audioMetas.map(meta => ({
          id: meta.id,
          displayName: meta.displayName,
          slug: meta.slug,
          orderNumer: meta.orderNumer,
          extra: meta.isDefault ? "по умолчанию" : undefined,
          processed: meta.isProcessed
        }))}
        savingId={savingId}
        deletingId={deletingId}
        showOrder
        onSave={(id, displayName, slug, orderNumer) =>
          saveMeta("audio", id, displayName, slug, orderNumer)
        }
        onDelete={id => deleteMeta("audio", id)}
      />
      <MetaList
        title="Субтитры"
        items={stream.subtitleMetas.map(meta => ({
          id: meta.id,
          displayName: meta.displayName,
          slug: meta.slug,
          orderNumer: meta.orderNumer,
          processed: true
        }))}
        savingId={savingId}
        deletingId={deletingId}
        showOrder
        onSave={(id, displayName, slug, orderNumer) =>
          saveMeta("subtitle", id, displayName, slug, orderNumer)
        }
        onDelete={id => deleteMeta("subtitle", id)}
      />
    </div>
  );
}

type MetaListItem = {
  id: string;
  displayName: string;
  slug: string;
  orderNumer?: number;
  extra?: string;
  processed?: boolean;
};

function MetaList({
  title,
  items,
  savingId,
  deletingId,
  showOrder,
  onSave,
  onDelete
}: {
  title: string;
  items: MetaListItem[];
  savingId: string | null;
  deletingId: string | null;
  showOrder?: boolean;
  onSave: (
    id: string,
    displayName: string,
    slug: string,
    orderNumer?: number
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  if (items.length === 0) {
    return (
      <section className="space-y-2">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">Нет дорожек</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      <ul className="space-y-3">
        {items.map(item => (
          <TrackRow
            key={item.id}
            item={item}
            showOrder={showOrder}
            saving={savingId === item.id}
            deleting={deletingId === item.id}
            onSave={onSave}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}

function TrackRow({
  item,
  showOrder,
  saving,
  deleting,
  onSave,
  onDelete
}: {
  item: MetaListItem;
  showOrder?: boolean;
  saving: boolean;
  deleting: boolean;
  onSave: (
    id: string,
    displayName: string,
    slug: string,
    orderNumer?: number
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(item.displayName);
  const [slug, setSlug] = useState(item.slug);
  const [orderNumer, setOrderNumer] = useState(String(item.orderNumer ?? 0));

  return (
    <li className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="space-y-1">
        <Label className="text-xs">Название</Label>
        <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Slug</Label>
        <Input value={slug} onChange={e => setSlug(e.target.value)} />
      </div>
      {showOrder ? (
        <div className="space-y-1">
          <Label className="text-xs">Порядок</Label>
          <Input
            type="number"
            min={0}
            value={orderNumer}
            onChange={e => setOrderNumer(e.target.value)}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 sm:col-span-full">
        {item.extra ? (
          <span className="text-xs text-muted-foreground">{item.extra}</span>
        ) : null}
        {item.processed === false ? (
          <span className="text-xs text-amber-600">обработка…</span>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={saving || deleting}
          onClick={() =>
            onSave(
              item.id,
              displayName,
              slug,
              showOrder ? Number(orderNumer) : undefined
            )
          }
        >
          {saving ? "…" : "Сохранить"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={saving || deleting}
          onClick={() => onDelete(item.id)}
        >
          {deleting ? "…" : "Удалить"}
        </Button>
      </div>
    </li>
  );
}
