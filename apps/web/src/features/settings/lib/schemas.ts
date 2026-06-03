import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().trim().min(1, "Введите имя пользователя"),
  email: z.email("Введите корректный email"),
  birthdate: z.string()
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currPass: z.string().min(1, "Введите текущий пароль"),
    newPass: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    confirmNewPass: z.string().min(1, "Подтвердите новый пароль")
  })
  .refine(data => data.newPass === data.confirmNewPass, {
    message: "Пароли не совпадают",
    path: ["confirmNewPass"]
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
