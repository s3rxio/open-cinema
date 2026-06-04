import { LoginForm } from "@/features/sign-in";

export const metadata = {
  title: "Вход | Open Cinema",
  description: "Войти в аккаунт"
};

export function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 max-md:py-8">
      <LoginForm />
    </div>
  );
}
