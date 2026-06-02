export const ROLE_OPTIONS = [
  { value: "user", label: "Пользователь" },
  { value: "editor", label: "Редактор" },
  { value: "admin", label: "Администратор" }
] as const;

export type RoleSlugValue = (typeof ROLE_OPTIONS)[number]["value"];

export function roleLabel(slug: string): string {
  return ROLE_OPTIONS.find(option => option.value === slug)?.label ?? slug;
}
