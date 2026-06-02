import { Container } from "@/shared/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";

export const metadata = {
  title: "Настройки | Open Cinema",
  description: "Настройки аккаунта"
};

export default function SettingsPage() {
  return (
    <main className="py-8">
      <section>
        <Container size="narrow">
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
        </Container>
      </section>
    </main>
  );
}
