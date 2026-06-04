import Link from "next/link";
import { Container } from "@/shared/ui/Container";

export const metadata = {
  title: "Обработка персональных данных | Open Cinema",
  description: "Политика обработки персональных данных"
};

export default function PrivacyPolicyPage() {
  return (
    <Container size="narrow" className="py-12 max-md:py-6">
      <article className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Согласие на обработку персональных данных
          </h1>
          <p>
            Регистрируясь на Open Cinema, вы даёте согласие на обработку
            персональных данных в целях, указанных ниже.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            Какие данные обрабатываются
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>адрес электронной почты;</li>
            <li>имя пользователя (логин);</li>
            <li>пароль в зашифрованном виде;</li>
            <li>данные об использовании сервиса (история просмотров, избранное).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Цели обработки</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>создание и ведение учётной записи;</li>
            <li>предоставление доступа к каталогу и просмотру контента;</li>
            <li>обеспечение безопасности и технической поддержки сервиса.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Срок и отзыв</h2>
          <p>
            Обработка осуществляется на время использования сервиса. Вы можете
            удалить аккаунт или отозвать согласие, обратившись к администратору
            проекта.
          </p>
        </section>

        <p>
          <Link href="/" className="text-primary font-medium hover:underline">
            На главную
          </Link>
        </p>
      </article>
    </Container>
  );
}
