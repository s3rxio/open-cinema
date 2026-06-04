"use client";

import { useState } from "react";
import { Button, Label } from "@open-cinema/ui";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { graphqlSingleFileUpload } from "@/shared/api/graphqlUpload";
import {
  UPLOAD_CONTENT_BANNER_MUTATION,
  UPLOAD_CONTENT_POSTER_MUTATION
} from "@/features/dashboard/api/dashboard";

type ContentImageUploadProps = {
  contentId: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  onUploaded: () => void | Promise<void>;
};

export function ContentImageUpload({
  contentId,
  posterUrl,
  bannerUrl,
  onUploaded
}: ContentImageUploadProps) {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [posterInputKey, setPosterInputKey] = useState(0);
  const [bannerInputKey, setBannerInputKey] = useState(0);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handlePosterUpload = async () => {
    if (!posterFile) {
      setStatus("Выберите файл постера");
      return;
    }

    setUploadingPoster(true);
    setStatus(null);
    try {
      await graphqlSingleFileUpload({
        document: UPLOAD_CONTENT_POSTER_MUTATION,
        variables: { input: { contentId, file: null } },
        fileVariablePath: "input.file",
        file: posterFile
      });
      setPosterFile(null);
      setPosterInputKey(key => key + 1);
      setStatus("Постер загружен");
      await onUploaded();
    } catch (error) {
      setStatus(getApolloErrorMessage(error));
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) {
      setStatus("Выберите файл баннера");
      return;
    }

    setUploadingBanner(true);
    setStatus(null);
    try {
      await graphqlSingleFileUpload({
        document: UPLOAD_CONTENT_BANNER_MUTATION,
        variables: { input: { contentId, file: null } },
        fileVariablePath: "input.file",
        file: bannerFile
      });
      setBannerFile(null);
      setBannerInputKey(key => key + 1);
      setStatus("Баннер загружен");
      await onUploaded();
    } catch (error) {
      setStatus(getApolloErrorMessage(error));
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <section className="mt-8 space-y-6 rounded-lg border p-4">
      <h3 className="font-medium">Изображения</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageUploadField
          label="Постер"
          hint="Вертикальное изображение 2:3 для карточек и слайдера"
          inputKey={posterInputKey}
          currentUrl={posterUrl}
          uploading={uploadingPoster}
          onFileChange={setPosterFile}
          onUpload={handlePosterUpload}
        />

        <ImageUploadField
          label="Баннер"
          hint="Широкое изображение для фона слайдера на главной"
          inputKey={bannerInputKey}
          currentUrl={bannerUrl}
          uploading={uploadingBanner}
          onFileChange={setBannerFile}
          onUpload={handleBannerUpload}
        />
      </div>

      {status ? (
        <p className="text-sm text-muted-foreground">{status}</p>
      ) : null}
    </section>
  );
}

function ImageUploadField({
  label,
  hint,
  inputKey,
  currentUrl,
  uploading,
  onFileChange,
  onUpload
}: {
  label: string;
  hint: string;
  inputKey: number;
  currentUrl?: string | null;
  uploading: boolean;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>

      {currentUrl ? (
        <img
          src={currentUrl}
          alt={label}
          className="max-h-40 rounded-md border object-cover"
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Изображение не загружено
        </p>
      )}

      <input
        key={inputKey}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={uploading}
        className="block w-full text-sm"
        onChange={event => onFileChange(event.target.files?.[0] ?? null)}
      />

      <Button type="button" disabled={uploading} onClick={onUpload}>
        {uploading ? "Загрузка…" : `Загрузить ${label.toLowerCase()}`}
      </Button>
    </div>
  );
}
