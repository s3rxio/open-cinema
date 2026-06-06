import { ProfileSettingsForm } from "@/features/settings";

import { buildPageMetadata } from "@/shared/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Профиль",
  description: "Изменение имени, email и даты рождения в аккаунте Open Cinema.",
  path: "/settings",
  noIndex: true,
  absoluteTitle: true
});

export function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Профиль</h2>
        <p className="text-sm text-muted-foreground">
          Имя, email и дата рождения вашего аккаунта
        </p>
      </header>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ProfileSettingsForm />
      </div>
    </div>
  );
}
