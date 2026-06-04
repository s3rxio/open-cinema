import Link from "next/link";
import { Container } from "@/shared/ui/Container";

export const metadata = {
  title: "Политика cookie | Open Cinema",
  description: "Информация об использовании файлов cookie"
};

export default function CookiePolicyPage() {
  return (
    <Container size="narrow" className="py-12">
      <article className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Политика использования cookie
          </h1>
          <p>
            Open Cinema использует файлы cookie и аналогичные технологии для
            корректной работы сайта.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            Обязательные cookie
          </h2>
          <p>
            Нужны для входа в аккаунт, обновления сессии и сохранения ваших
            настроек (например, темы оформления). Без них сервис не может
            работать в полном объёме.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Как управлять</h2>
          <p>
            При первом посещении вы можете принять использование cookie через
            уведомление на сайте. Вы также можете удалить cookie в настройках
            браузера; после этого может потребоваться повторный вход.
          </p>
        </section>

        <p>
          <Link
            href="/legal/privacy"
            className="text-primary font-medium hover:underline"
          >
            Обработка персональных данных
          </Link>
          {" · "}
          <Link href="/" className="text-primary font-medium hover:underline">
            На главную
          </Link>
        </p>
      </article>
    </Container>
  );
}
