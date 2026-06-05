# OpenCinema

Учебное веб-приложение онлайн-кинотеатра с трёхзвенной архитектурой: клиент (Next.js), сервер приложений (NestJS + GraphQL) и уровень данных (PostgreSQL, Redis).

**Демо:** [open-cinema.s3rxio.lol](https://open-cinema.s3rxio.lol)

## О проекте

OpenCinema — монорепозиторий на базе [Nx](https://nx.dev), реализующий ключевой функционал онлайн-кинотеатра:

- каталог фильмов и сериалов с поиском и фильтрацией;
- карточки контента с описанием, рейтингом и рецензиями;
- авторизация, избранное и история просмотров;
- HLS-видеоплеер с выбором качества, озвучки и субтитров;
- совместный просмотр (Watch Party) с синхронизацией плеера и чатом;
- панель администратора для управления контентом и пользователями.

### Стек

| Слой   | Технологии                                                               |
| ------ | ------------------------------------------------------------------------ |
| Клиент | Next.js 16, React 19, Apollo Client, Tailwind CSS, Feature-Sliced Design |
| Сервер | NestJS 11, GraphQL, Socket.IO, Prisma 7, Bull, FFmpeg                    |
| Данные | PostgreSQL 18, Redis 8, S3-совместимое хранилище (RustFS)                |

### Структура репозитория

```
apps/
  api/          # NestJS API (GraphQL, WebSocket, обработка медиа)
  web/          # Next.js клиент
packages/
  core/         # общие утилиты и типы
  ui/           # UI-компоненты
docker/         # Dockerfile для api и web
deploy/         # production Compose / Swarm
docker-compose.yml  # инфраструктура для локальной разработки
```

## Минимальные требования

### Для пользователя (браузер)

- ОС: Windows 10+, macOS 12+, Linux;
- браузер: Chrome, Firefox, Edge или Safari (актуальная версия);
- ОЗУ: от 4 ГБ;
- подключение к интернету.

### Для разработки

| Компонент | Версия                             |
| --------- | ---------------------------------- |
| Node.js   | 22 (рекомендуется) или 20+         |
| pnpm      | 9+                                 |
| Docker    | 24+ и Docker Compose v2            |
| FFmpeg    | для транскодирования видео на API  |
| ОЗУ       | от 8 ГБ (с учётом обработки медиа) |
| Диск      | от 10 ГБ свободного места          |

### Инфраструктурные сервисы

| Сервис      | Версия | Назначение                      |
| ----------- | ------ | ------------------------------- |
| PostgreSQL  | 18     | основная БД                     |
| Redis       | 8      | Watch Party, очереди Bull       |
| RustFS (S3) | latest | хранение постеров и медиафайлов |

---

## Запуск для разработки (без Docker для приложений)

В этом режиме Docker поднимает только инфраструктуру (PostgreSQL, Redis, RustFS), а API и web запускаются локально через Nx.

### 1. Клонирование и зависимости

```sh
git clone <url-репозитория> open-cinema
cd open-cinema
pnpm install
```

### 2. Инфраструктура в Docker

```sh
docker compose up -d
```

Будут доступны:

| Сервис         | Адрес                   | Учётные данные                                      |
| -------------- | ----------------------- | --------------------------------------------------- |
| PostgreSQL     | `localhost:5432`        | `postgres` / `open_cinema_local`, БД: `open_cinema` |
| Redis          | `localhost:6379`        | без пароля                                          |
| RustFS (S3)    | `http://localhost:9000` | `rustfsadmin` / `rustfsadmin`                       |
| RustFS Console | `http://localhost:9001` | —                                                   |

Создайте S3-бucket `open-cinema` в консоли RustFS (`http://localhost:9001`).

### 3. Переменные окружения API

Создайте файл `.env.local` в корне репозитория:

```env
NODE_ENV=development

API_HOST=localhost
API_PORT=5000
API_URL=http://localhost:5000

API_DB_URL=postgresql://postgres:open_cinema_local@localhost:5432/open_cinema

API_REDIS_HOST=localhost
API_REDIS_PORT=6379
API_REDIS_PASSWORD=

API_SECRET=dev-secret-change-me
API_BCRYPT_SALT=dev-salt-change-me
API_BCRYPT_SALT_ROUNDS=10
API_JWT_SECRET=dev-jwt-secret-change-me
API_TOKEN_ACCESS_LIFETIME=15m
API_TOKEN_REFRESH_LIFETIME=7d

API_S3_ENDPOINT=http://localhost:9000
API_S3_REGION=us-east-1
API_S3_BUCKET=open-cinema
API_S3_ACCESS_KEY_ID=rustfsadmin
API_S3_SECRET_ACCESS_KEY=rustfsadmin

API_MEDIA_TMP_DIR=/tmp/open-cinema-media
```

> Секреты выше подходят только для локальной разработки. В production используйте длинные случайные значения.

### 4. Переменные окружения web

```sh
cp apps/web/.env.example apps/web/.env.local
```

Убедитесь, что URL API совпадает с портом сервера (по умолчанию `5000`):

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5000/graphql
GRAPHQL_API_URL=http://localhost:5000/graphql
```

### 5. База данных

```sh
pnpm nx run api:types-gen
pnpm nx run api:migrate
pnpm nx run api:seed
```

### 6. Запуск приложений

В двух терминалах:

```sh
# API — http://localhost:5000/graphql
pnpm nx serve api

# Web — http://localhost:3000
pnpm nx dev web
```

После первого запуска API доступен GraphQL Playground по адресу `http://localhost:5000/graphql`.

**Тестовый пользователь** (создаётся сидом): `admin` / `admin123`.

---

## Запуск с Docker (production-стек)

Полный стек (PostgreSQL, Redis, API, web) описан в `deploy/compose.yml`. Образы собираются из `docker/api/Dockerfile` и `docker/web/Dockerfile`.

### 1. Настройка окружения

```sh
cp deploy/.env.example deploy/.env
```

Отредактируйте `deploy/.env`: задайте надёжные значения для `POSTGRES_PASSWORD`, `API_SECRET`, `API_BCRYPT_SALT`, `API_JWT_SECRET` и `API_S3_SECRET_ACCESS_KEY`.

Дополнительно укажите параметры S3-хранилища:

```env
API_S3_ENDPOINT=http://<host-s3>:9000
API_S3_REGION=us-east-1
API_S3_BUCKET=open-cinema
API_S3_ACCESS_KEY_ID=rustfsadmin
API_S3_SECRET_ACCESS_KEY=<ваш-ключ>
```

Если S3 ещё не развёрнут, поднимите RustFS из корневого `docker-compose.yml` и создайте bucket в консоли.

### 2. Сборка и запуск

```sh
docker compose -f deploy/compose.yml --env-file deploy/.env up -d --build
```

### 3. Доступ

| Сервис        | URL                              |
| ------------- | -------------------------------- |
| Web           | http://localhost:3000            |
| API / GraphQL | http://localhost:5000/graphql    |
| Health check  | http://localhost:5000/api/health |

Миграции выполняются автоматически при старте API (`RUN_MIGRATIONS=true`). Сиды включаются переменной `RUN_SEEDS=true` — рекомендуется только при первом деплое на чистую БД.

### Остановка

```sh
docker compose -f deploy/compose.yml --env-file deploy/.env down
```

Для удаления данных PostgreSQL добавьте флаг `-v`.

---

## Полезные команды

```sh
# GraphQL-типы для клиента (API должен быть запущен)
pnpm codegen

# Prisma Studio
pnpm nx run api:prisma -- studio

# Линтинг FSD-архитектуры web
pnpm steiger

# Сборка production
pnpm nx build api
pnpm nx build web

# Тесты
pnpm nx test api
pnpm nx test web
```

## Порты по умолчанию

| Сервис         | Порт |
| -------------- | ---- |
| Web            | 3000 |
| API            | 5000 |
| PostgreSQL     | 5432 |
| Redis          | 6379 |
| RustFS S3      | 9000 |
| RustFS Console | 9001 |
