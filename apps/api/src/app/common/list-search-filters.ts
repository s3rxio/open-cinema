export function buildContentListSearchFilter(search?: string) {
  const query = search?.trim();
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      { title: { contains: query, mode: "insensitive" as const } },
      { genre: { contains: query, mode: "insensitive" as const } },
      { director: { contains: query, mode: "insensitive" as const } }
    ]
  };
}

export function buildUserListSearchFilter(search?: string) {
  const query = search?.trim();
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      { username: { contains: query, mode: "insensitive" as const } },
      { email: { contains: query, mode: "insensitive" as const } }
    ]
  };
}
