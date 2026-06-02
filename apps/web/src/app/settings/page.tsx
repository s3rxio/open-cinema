import { Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";

export const metadata = {
  title: "Настройки | Open Cinema",
  description: "Настройки аккаунта"
};

export default function SettingsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Настройки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Раздел настроек в разработке
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
