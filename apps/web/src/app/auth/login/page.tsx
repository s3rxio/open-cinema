import { Navbar } from "@/shared/ui/Navbar";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export const metadata = {
  title: "Вход | Open Cinema",
  description: "Войти в аккаунт",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar showNav={false} />
      <div className="flex-1 flex items-center justify-center px-4">
        <LoginForm />
      </div>
    </div>
  );
}

