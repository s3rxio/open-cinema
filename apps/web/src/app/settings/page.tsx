import { ProfileSettingsForm } from "@/features/settings";

export const metadata = {
  title: "Профиль | Настройки | Open Cinema",
  description: "Изменение профиля"
};

export default function SettingsProfilePage() {
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
