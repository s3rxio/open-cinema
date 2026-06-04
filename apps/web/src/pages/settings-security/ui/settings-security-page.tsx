import { SecuritySettingsForm } from "@/features/settings";

export const metadata = {
  title: "Безопасность | Настройки | Open Cinema",
  description: "Смена пароля"
};

export function SettingsSecurityPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Безопасность</h2>
        <p className="text-sm text-muted-foreground">
          Изменение пароля для входа в аккаунт
        </p>
      </header>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <SecuritySettingsForm />
      </div>
    </div>
  );
}
