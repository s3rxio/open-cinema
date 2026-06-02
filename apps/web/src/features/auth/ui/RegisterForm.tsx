"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";
import { QUERIES } from "@/shared/api/queries";
import { useAuthStore } from "@/shared/state/useAuthStore";

export function RegisterForm() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [register, { loading }] = useMutation<any>(QUERIES.register, {
    onCompleted: (data) => {
      const { token } = data.register;
      setToken(token);
      localStorage.setItem("authToken", token);
      router.push("/");
    },
    onError: (err) => {
      setError(err.message || "Ошибка при регистрации");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !username || !password || !confirmPassword) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await register({
        variables: { email, username, password },
      });
    } catch (err) {
      setError("Ошибка при регистрации");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Регистрация</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Логин (имя пользователя)</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground mt-1">Минимум 6 символов</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Подтверждение пароля</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Загрузка..." : "Зарегистрироваться"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Войти
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
