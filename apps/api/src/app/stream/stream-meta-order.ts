import { Prisma } from "../../../prisma/generated/client";

/** Include для загрузки дорожек в нужном порядке. */
export const streamMetasInclude = {
  videoMetas: {
    orderBy: [
      { height: "desc" },
      { width: "desc" },
      { bitrate: "desc" }
    ] satisfies Prisma.VideoMetaOrderByWithRelationInput[]
  },
  audioMetas: {
    orderBy: { orderNumer: "asc" }
  },
  subtitleMetas: {
    orderBy: { orderNumer: "asc" }
  }
} satisfies Pick<Prisma.StreamInclude, "videoMetas" | "audioMetas" | "subtitleMetas">;

export function sortVideoMetas<T extends { height: number; width: number; bitrate: number }>(
  metas: T[]
): T[] {
  return [...metas].sort((a, b) => {
    if (b.height !== a.height) {
      return b.height - a.height;
    }

    if (b.width !== a.width) {
      return b.width - a.width;
    }

    return b.bitrate - a.bitrate;
  });
}

export function sortByOrderNumer<T extends { orderNumer: number }>(metas: T[]): T[] {
  return [...metas].sort((a, b) => a.orderNumer - b.orderNumer);
}
