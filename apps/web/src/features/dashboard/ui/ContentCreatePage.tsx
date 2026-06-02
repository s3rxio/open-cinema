"use client";

import { useMutation, useApolloClient } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  CREATE_MOVIE_MUTATION,
  CREATE_SERIES_MUTATION,
  DASHBOARD_MOVIES_QUERY,
  DASHBOARD_SERIES_LIST_QUERY
} from "@/shared/api/operations/dashboard";
import {
  contentFormToInput,
  defaultContentFormValues
} from "../lib/defaultContentFormValues";
import { ContentEditForm } from "./ContentEditForm";
import { Container } from "@/shared/ui/Container";

type ContentCreatePageProps = {
  kind: "movie" | "series";
};

const config = {
  movie: {
    title: "Создать фильм",
    backHref: "/dashboard/movies",
    editHref: (id: string) => `/dashboard/movies/${id}`,
    listQuery: DASHBOARD_MOVIES_QUERY
  },
  series: {
    title: "Создать сериал",
    backHref: "/dashboard/series",
    editHref: (id: string) => `/dashboard/series/${id}`,
    listQuery: DASHBOARD_SERIES_LIST_QUERY
  }
} as const;

export function ContentCreatePage({ kind }: ContentCreatePageProps) {
  const router = useRouter();
  const client = useApolloClient();
  const meta = config[kind];
  const [createMovie, createMovieState] = useMutation(CREATE_MOVIE_MUTATION);
  const [createSeries, createSeriesState] = useMutation(CREATE_SERIES_MUTATION);
  const [status, setStatus] = useState<string | null>(null);

  const saving = createMovieState.loading || createSeriesState.loading;

  return (
    <>
      <section>
        <Container size="dashboard">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={meta.backHref}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Назад к списку
            </Link>
            <h1 className="text-2xl font-semibold">{meta.title}</h1>
          </div>
        </Container>
      </section>

      <section>
        <Container size="dashboard">
          <div className="space-y-6">
            <ContentEditForm
              initial={defaultContentFormValues()}
              saving={saving}
              submitLabel="Создать"
              onSubmit={async values => {
                setStatus(null);
                try {
                  const input = contentFormToInput(values);
                  const id =
                    kind === "movie"
                      ? (
                          await createMovie({
                            variables: { createMovieInput: input }
                          })
                        ).data?.createMovie.id
                      : (
                          await createSeries({
                            variables: { createSeriesInput: input }
                          })
                        ).data?.createSeries.id;

                  if (!id) {
                    throw new Error("Не удалось создать запись");
                  }

                  await client.refetchQueries({ include: [meta.listQuery] });
                  router.push(meta.editHref(id));
                  router.refresh();
                } catch (error) {
                  setStatus(getApolloErrorMessage(error));
                }
              }}
            />

            {status ? <p className="text-sm text-destructive">{status}</p> : null}
          </div>
        </Container>
      </section>
    </>
  );
}
