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
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@open-cinema/ui";
import { LOGIN_MUTATION } from "@/shared/api/operations/auth";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { useAuthStore } from "@/shared/state/useAuthStore";
import { loginSchema, type LoginFormValues } from "../lib/schemas";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" }
  });

  const [executeLogin, loginMutationResult] = useMutation(LOGIN_MUTATION, {
    onCompleted: data => {
      const { accessToken, refreshToken } = data.login;
      setAuth(accessToken, refreshToken);
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      router.push("/");
    }
  });

  const loading = isSubmitting || loginMutationResult.loading;

  const onSubmit = async ({ login, password }: LoginFormValues) => {
    setAlertMessage(null);
    try {
      await executeLogin({
        variables: { loginInput: { login, password } }
      });
    } catch (error) {
      setAlertMessage(
        getApolloErrorMessage(error, "Не удалось выполнить вход")
      );
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="login" className="block text-sm font-medium mb-2">
                Email или логин
              </label>
              <Input
                id="login"
                type="text"
                placeholder="your@email.com или username"
                disabled={loading}
                autoComplete="username"
                aria-invalid={errors.login ? true : undefined}
                {...register("login")}
              />
              {errors.login && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.login.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Загрузка..." : "Войти"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-medium hover:underline"
              >
                Зарегистрируйтесь
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={alertMessage !== null}
        onOpenChange={open => {
          if (!open) {
            setAlertMessage(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ошибка входа</DialogTitle>
            <DialogDescription>{alertMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setAlertMessage(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
