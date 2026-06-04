# FSD + Next.js

Структура по [гайду FSD + Next.js](https://fsd.how/ru/docs/guides/tech/with-nextjs/).

```
apps/web/
├── app/                 # Next.js App Router (тонкие page.tsx, layout.tsx)
├── pages/README.md      # заглушка — не даёт Next использовать src/pages как Pages Router
└── src/
    ├── app/             # слой FSD App: providers, styles, api-routes
    ├── pages/           # слой FSD Pages (композиция, @/pages/…)
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

## Пример маршрута

`app/catalog/page.tsx`:

```ts
export { CatalogPage as default, metadata } from "@/pages/catalog";
```

`src/pages/catalog/ui/catalog-page.tsx` — реализация страницы.

## Команды

```bash
pnpm steiger              # nx run web:steiger
pnpm codegen              # nx run web:codegen
pnpm nx run web:build
```

GraphQL Codegen: `codegen.ts` в корне монорепо (`entities/**/api`, `features/**/api` → `shared/api/generated/types.ts`).
