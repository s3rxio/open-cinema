import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().trim().min(1, "Введите email или логин"),
  password: z.string().min(1, "Введите пароль")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.email("Введите корректный email"),
    username: z.string().trim().min(1, "Введите логин"),
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль")
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"]
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
