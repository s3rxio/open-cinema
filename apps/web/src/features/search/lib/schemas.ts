import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().trim().min(1, "Введите поисковый запрос")
});

export type SearchFormValues = z.infer<typeof searchSchema>;
