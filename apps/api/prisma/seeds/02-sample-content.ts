import { PrismaClient } from "../generated/client";
import { Pool } from "pg";

export default async function seed(prisma: PrismaClient, pool: Pool) {
  console.log("Creating sample movies and series...");

  // Create Movies
  try {
    await prisma.movie.create({
      data: {
        title: "1+1",
        description:
          "A wealthy man with quadriplegia hires a caregiver from the projects to help him with his daily life.",
        releaseDate: new Date("2011-11-02"),
        genre: "Drama",
        director: "Olivier Nakache, Éric Toledano",
        rating: 8.3
      }
    });
    console.log("Movie '1+1' created");
  } catch (e) {
    console.log("Movie '1+1' already exists");
  }

  // Create Series
  try {
    const chainsaw = await prisma.series.create({
      data: {
        title: "Chainsaw Man: Reze Arc",
        description:
          "A high schooler who becomes the human host of a chainsaw devil fights for survival while seeking revenge.",
        releaseDate: new Date("2022-10-11"),
        genre: "Action, Supernatural",
        director: "Mitsuyuki Masuhara",
        rating: 8.5
      }
    });

    // Add episodes for Chainsaw Man
    const episodes = [
      {
        title: "Reze",
        description: "A mysterious girl appears in Denji's life.",
        season: 1,
        episode: 7,
        releaseDate: new Date("2022-11-08"),
        rating: 8.4
      },
      {
        title: "Reze, Explained",
        description: "The story of Reze unfolds.",
        season: 1,
        episode: 8,
        releaseDate: new Date("2022-11-15"),
        rating: 8.5
      }
    ];

    for (const ep of episodes) {
      await prisma.episode.create({
        data: {
          ...ep,
          seriesId: chainsaw.id
        }
      });
    }

    console.log("Series 'Chainsaw Man: Reze Arc' created with episodes");
  } catch (e) {
    console.log("Series 'Chainsaw Man: Reze Arc' already exists");
  }

  // Create Attack on Titan series
  try {
    const aot = await prisma.series.create({
      data: {
        title: "Attack on Titan: The Final Attack",
        description:
          "Humanity's last bastion against the Titans comes to an end in this climactic final season.",
        releaseDate: new Date("2023-03-03"),
        genre: "Action, Adventure, Dark Fantasy",
        director: "Yuichiro Hayashi",
        rating: 9.0
      }
    });

    // Add episodes for Attack on Titan
    const aotEpisodes = [
      {
        title: "Beneath the Tree",
        description: "The final battle begins.",
        season: 4,
        episode: 25,
        releaseDate: new Date("2023-03-03"),
        rating: 9.1
      },
      {
        title: "Thundering Footsteps",
        description: "The fight continues.",
        season: 4,
        episode: 26,
        releaseDate: new Date("2023-03-10"),
        rating: 9.0
      },
      {
        title: "The Final Chapters",
        description: "The end of the world.",
        season: 4,
        episode: 27,
        releaseDate: new Date("2023-03-17"),
        rating: 9.2
      }
    ];

    for (const ep of aotEpisodes) {
      await prisma.episode.create({
        data: {
          ...ep,
          seriesId: aot.id
        }
      });
    }

    console.log("Series 'Attack on Titan: The Final Attack' created with episodes");
  } catch (e) {
    console.log("Series 'Attack on Titan: The Final Attack' already exists");
  }

  console.log("Sample content created successfully");
}
