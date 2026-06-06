import { MovieDetailPage } from "@/pages/movie-detail";
import {
  ContentJsonLd,
  fetchMovieForSeo,
  generateMovieMetadata
} from "@/shared/seo";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  return generateMovieMetadata(id);
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await fetchMovieForSeo(id);

  return (
    <>
      {movie ? <ContentJsonLd content={movie} kind="Movie" /> : null}
      <MovieDetailPage />
    </>
  );
}
