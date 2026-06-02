"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";
import { QUERIES } from "@/shared/api/queries";
import { useAuthStore } from "@/shared/state/useAuthStore";

export function LoginForm() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loginMutation, { loading }] = useMutation<any>(QUERIES.login, {
    onCompleted: (data) => {
      const { token } = data.login;
      setToken(token);
      localStorage.setItem("authToken", token);
      router.push("/");
    },
    onError: (err) => {
      setError(err.message || "Ошибка при входе");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!login || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    try {
      await loginMutation({
        variables: { login, password },
      });
    } catch (err) {
      setError("Ошибка при входе");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Вход</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Email или логин</label>
            <Input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="your@email.com или username"
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
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Загрузка..." : "Войти"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <a href="/auth/register" className="text-primary hover:underline font-medium">
              Зарегистрируйтесь
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
