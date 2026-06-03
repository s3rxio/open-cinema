import { Genre, PrismaClient } from "../../generated/client";
import type { EpisodeSeed } from "../data/types";

export async function seedMovie(
  prisma: PrismaClient,
  data: {
    title: string;
    description: string;
    releaseDate: Date;
    genres: Genre[];
    director: string;
    rating: number;
    isPublished?: boolean;
  }
) {
  const existing = await prisma.movie.findFirst({
    where: { title: data.title, deletedAt: null }
  });

  if (existing) {
    console.log(`  Movie "${data.title}" already exists, skipping`);
    return existing;
  }

  const movie = await prisma.movie.create({ data });
  console.log(`  Movie "${data.title}" created`);
  return movie;
}

export async function seedSeriesWithEpisodes(
  prisma: PrismaClient,
  seriesData: {
    title: string;
    description: string;
    releaseDate: Date;
    genres: Genre[];
    director: string;
    rating: number;
    isPublished?: boolean;
  },
  episodes: EpisodeSeed[]
) {
  let series = await prisma.series.findFirst({
    where: { title: seriesData.title, deletedAt: null }
  });

  if (!series) {
    series = await prisma.series.create({ data: seriesData });
    console.log(`  Series "${seriesData.title}" created`);
  } else {
    console.log(`  Series "${seriesData.title}" already exists`);
  }

  let created = 0;
  for (const ep of episodes) {
    const exists = await prisma.episode.findFirst({
      where: {
        seriesId: series.id,
        season: ep.season,
        episode: ep.episode,
        deletedAt: null
      }
    });

    if (exists) continue;

    await prisma.episode.create({
      data: {
        title: ep.title,
        description: ep.description,
        releaseDate: new Date(ep.releaseDate),
        rating: ep.rating ?? seriesData.rating,
        season: ep.season,
        episode: ep.episode,
        seriesId: series.id,
        isPublished: seriesData.isPublished ?? false
      }
    });
    created++;
  }

  console.log(
    `  Episodes for "${seriesData.title}": ${created} created, ${episodes.length - created} skipped`
  );

  return series;
}
