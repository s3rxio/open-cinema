import { RegisterForm } from "@/features/sign-in";

import { buildPageMetadata } from "@/shared/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Регистрация",
  description: "Создайте аккаунт Open Cinema для доступа к избранному, истории и совместному просмотру.",
  path: "/auth/register",
  noIndex: true
});

export function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 max-md:py-8">
      <RegisterForm />
    </div>
  );
}
