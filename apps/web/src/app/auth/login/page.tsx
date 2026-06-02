import { LoginForm } from "@/features/auth/ui/LoginForm";

export const metadata = {
  title: "Вход | Open Cinema",
  description: "Войти в аккаунт"
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
