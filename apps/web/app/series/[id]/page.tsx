import { SeriesDetailPage } from "@/pages/series-detail";
import {
  ContentJsonLd,
  fetchSeriesForSeo,
  generateSeriesMetadata
} from "@/shared/seo";

type SeriesPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: SeriesPageProps) {
  const { id } = await params;
  return generateSeriesMetadata(id);
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;
  const series = await fetchSeriesForSeo(id);

  return (
    <>
      {series ? <ContentJsonLd content={series} kind="TVSeries" /> : null}
      <SeriesDetailPage />
    </>
  );
}
