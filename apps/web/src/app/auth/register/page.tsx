import { RegisterForm } from "@/features/auth/ui/RegisterForm";

export const metadata = {
  title: "Регистрация | Open Cinema",
  description: "Создать аккаунт"
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 max-md:py-8">
      <RegisterForm />
    </div>
  );
}
