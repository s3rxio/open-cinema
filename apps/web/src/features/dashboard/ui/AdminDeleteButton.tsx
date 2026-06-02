"use client";

import { useApolloClient } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@open-cinema/ui";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";

type AdminDeleteButtonProps = {
  label: string;
  confirmMessage: string;
  redirectTo: string;
  onDelete: () => Promise<unknown>;
  refetchQueries?: DocumentNode[];
};

export function AdminDeleteButton({
  label,
  confirmMessage,
  redirectTo,
  onDelete,
  refetchQueries
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onDelete();

      if (refetchQueries?.length) {
        await client.refetchQueries({ include: refetchQueries });
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(getApolloErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={loading}
        onClick={handleDelete}
      >
        {loading ? "Удаление…" : label}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
