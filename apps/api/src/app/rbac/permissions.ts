export const Permission = {
  All: "*",

  ProfileRead: "profile:read",

  UsersRead: "users:read",
  UsersCreate: "users:create",
  UsersUpdate: "users:update",
  UsersDelete: "users:delete",

  ContentRead: "content:read",
  ContentCreate: "content:create",
  ContentUpdate: "content:update",
  ContentDelete: "content:delete",

  StreamRead: "stream:read",
  StreamCreate: "stream:create",
  StreamManage: "stream:manage",
  StreamUpload: "stream:upload",

  MovieRead: "movie:read",
  MovieCreate: "movie:create",
  MovieUpdate: "movie:update",
  MovieDelete: "movie:delete",

  SeriesRead: "series:read",
  SeriesCreate: "series:create",
  SeriesUpdate: "series:update",
  SeriesDelete: "series:delete",

  EpisodeRead: "episode:read",
  EpisodeCreate: "episode:create",
  EpisodeUpdate: "episode:update",
  EpisodeDelete: "episode:delete",

  FavoritesRead: "favorites:read",
  FavoritesCreate: "favorites:create",
  FavoritesUpdate: "favorites:update",
  FavoritesDelete: "favorites:delete",

  WatchHistoryRead: "watch-history:read",
  WatchHistoryCreate: "watch-history:create",
  WatchHistoryUpdate: "watch-history:update",
  WatchHistoryDelete: "watch-history:delete"
} as const;

export type PermissionSlug = (typeof Permission)[keyof typeof Permission];

export const RoleSlug = {
  User: "user",
  Editor: "editor",
  Admin: "admin"
} as const;

export type RoleSlugType = (typeof RoleSlug)[keyof typeof RoleSlug];

type PermissionSeed = {
  slug: PermissionSlug;
  name: string;
  description?: string;
};

export const PERMISSION_DEFINITIONS: PermissionSeed[] = [
  { slug: Permission.All, name: "Все права", description: "Полный доступ" },
  { slug: Permission.ProfileRead, name: "Профиль: чтение" },
  { slug: Permission.UsersRead, name: "Пользователи: чтение" },
  { slug: Permission.UsersCreate, name: "Пользователи: создание" },
  { slug: Permission.UsersUpdate, name: "Пользователи: изменение" },
  { slug: Permission.UsersDelete, name: "Пользователи: удаление" },
  { slug: Permission.ContentRead, name: "Контент: чтение" },
  { slug: Permission.ContentCreate, name: "Контент: создание" },
  { slug: Permission.ContentUpdate, name: "Контент: изменение" },
  { slug: Permission.ContentDelete, name: "Контент: удаление" },
  { slug: Permission.StreamRead, name: "Стрим: чтение" },
  { slug: Permission.StreamCreate, name: "Стрим: создание" },
  { slug: Permission.StreamManage, name: "Стрим: управление" },
  { slug: Permission.StreamUpload, name: "Стрим: загрузка медиа" },
  { slug: Permission.MovieRead, name: "Фильмы: чтение" },
  { slug: Permission.MovieCreate, name: "Фильмы: создание" },
  { slug: Permission.MovieUpdate, name: "Фильмы: изменение" },
  { slug: Permission.MovieDelete, name: "Фильмы: удаление" },
  { slug: Permission.SeriesRead, name: "Сериалы: чтение" },
  { slug: Permission.SeriesCreate, name: "Сериалы: создание" },
  { slug: Permission.SeriesUpdate, name: "Сериалы: изменение" },
  { slug: Permission.SeriesDelete, name: "Сериалы: удаление" },
  { slug: Permission.EpisodeRead, name: "Эпизоды: чтение" },
  { slug: Permission.EpisodeCreate, name: "Эпизоды: создание" },
  { slug: Permission.EpisodeUpdate, name: "Эпизоды: изменение" },
  { slug: Permission.EpisodeDelete, name: "Эпизоды: удаление" },
  { slug: Permission.FavoritesRead, name: "Избранное: чтение" },
  { slug: Permission.FavoritesCreate, name: "Избранное: создание" },
  { slug: Permission.FavoritesUpdate, name: "Избранное: изменение" },
  { slug: Permission.FavoritesDelete, name: "Избранное: удаление" },
  { slug: Permission.WatchHistoryRead, name: "История: чтение" },
  { slug: Permission.WatchHistoryCreate, name: "История: запись" },
  { slug: Permission.WatchHistoryUpdate, name: "История: изменение" },
  { slug: Permission.WatchHistoryDelete, name: "История: удаление" }
];

const userPermissions: PermissionSlug[] = [
  Permission.ProfileRead,
  Permission.ContentRead,
  Permission.StreamRead,
  Permission.MovieRead,
  Permission.SeriesRead,
  Permission.EpisodeRead,
  Permission.FavoritesRead,
  Permission.FavoritesCreate,
  Permission.FavoritesUpdate,
  Permission.FavoritesDelete,
  Permission.WatchHistoryRead,
  Permission.WatchHistoryCreate,
  Permission.WatchHistoryUpdate,
  Permission.WatchHistoryDelete
];

const editorExtraPermissions: PermissionSlug[] = [
  Permission.ContentCreate,
  Permission.ContentUpdate,
  Permission.ContentDelete,
  Permission.StreamCreate,
  Permission.StreamManage,
  Permission.StreamUpload,
  Permission.MovieCreate,
  Permission.MovieUpdate,
  Permission.MovieDelete,
  Permission.SeriesCreate,
  Permission.SeriesUpdate,
  Permission.SeriesDelete,
  Permission.EpisodeCreate,
  Permission.EpisodeUpdate,
  Permission.EpisodeDelete
];

export const ROLE_PERMISSION_MAP: Record<
  RoleSlugType,
  readonly PermissionSlug[]
> = {
  [RoleSlug.User]: userPermissions,
  [RoleSlug.Editor]: [...userPermissions, ...editorExtraPermissions],
  [RoleSlug.Admin]: [Permission.All]
};
