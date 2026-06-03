"use client";

import { Button } from "@open-cinema/ui";

type PublishToggleButtonProps = {
  isPublished: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
};

export function PublishToggleButton({
  isPublished,
  loading,
  onClick
}: PublishToggleButtonProps) {
  return (
    <Button
      type="button"
      variant={isPublished ? "outline" : "default"}
      disabled={loading}
      onClick={() => void onClick()}
    >
      {isPublished ? "Снять с публикации" : "Опубликовать"}
    </Button>
  );
}
