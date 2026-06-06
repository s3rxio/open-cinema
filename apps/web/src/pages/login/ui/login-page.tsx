import { LoginForm } from "@/features/sign-in";

import { buildPageMetadata } from "@/shared/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Вход",
  description: "Войдите в аккаунт Open Cinema, чтобы сохранять избранное и историю просмотров.",
  path: "/auth/login",
  noIndex: true
});

export function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 max-md:py-8">
      <LoginForm />
    </div>
  );
}
