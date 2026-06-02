import { Navbar } from "@/shared/ui/Navbar";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";

export const metadata = {
  title: "Регистрация | Open Cinema",
  description: "Создать новый аккаунт",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar showNav={false} />
      <div className="flex-1 flex items-center justify-center px-4">
        <RegisterForm />
      </div>
    </div>
  );
}

