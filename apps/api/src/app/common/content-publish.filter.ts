export function withPublishedFilter<T>(
  where: T | undefined,
  includeUnpublished: boolean
): T | undefined {
  if (includeUnpublished) {
    return where;
  }

  const publishedFilter = { isPublished: true };

  if (!where) {
    return publishedFilter as T;
  }

  return { AND: [where, publishedFilter] } as T;
}

export function publishedOnlyWhere() {
  return { isPublished: true };
}
