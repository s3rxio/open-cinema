"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@open-cinema/ui";
import { REGISTER_MUTATION } from "@/shared/api/operations/auth";
import { useAuthStore } from "@/shared/state/useAuthStore";
import { registerSchema, type RegisterFormValues } from "../lib/schemas";

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  const [executeRegister, registerMutationResult] = useMutation(
    REGISTER_MUTATION,
    {
      onCompleted: data => {
        const { accessToken, refreshToken } = data.register;
        setAuth(accessToken, refreshToken);
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        router.push("/");
      },
      onError: err => {
        setServerError(err.message || "Ошибка при регистрации");
      }
    }
  );

  const loading = isSubmitting || registerMutationResult.loading;

  const onSubmit = async ({
    email,
    username,
    password
  }: RegisterFormValues) => {
    setServerError("");
    try {
      await executeRegister({
        variables: { registerInput: { email, username, password } }
      });
    } catch {
      setServerError("Ошибка при регистрации");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Регистрация</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {serverError}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              disabled={loading}
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Логин (имя пользователя)
            </label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              disabled={loading}
              autoComplete="username"
              aria-invalid={errors.username ? true : undefined}
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              {...register("password")}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Минимум 6 символов
            </p>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Подтверждение пароля
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Загрузка..." : "Зарегистрироваться"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Войти
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
