const DASHBOARD_ROLE_SLUGS = new Set(["admin", "editor"]);

export function canAccessDashboard(roleSlugs: string[]): boolean {
  return roleSlugs.some(slug => DASHBOARD_ROLE_SLUGS.has(slug));
}

export function canManageUsers(roleSlugs: string[]): boolean {
  return roleSlugs.includes("admin");
}
