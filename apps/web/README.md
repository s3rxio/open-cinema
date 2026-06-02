# Open Cinema - Web App

A modern, feature-rich video streaming platform built with Next.js 16, Radix UI, and TypeScript.

## Features

- 🎬 **Catalog Management**: Browse new and popular movies/series
- 🎯 **Video Player**: Full-featured player with quality, audio, and subtitle controls
- 📺 **Series Support**: Watch episodes with season/episode selection
- ❤️ **Favorites**: Save and manage favorite content
- 🔐 **Authentication**: User login/registration system
- 🎨 **Modern UI**: Built with Radix UI and Tailwind CSS
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: Zustand
- **API Client**: Apollo Client (GraphQL)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom CSS variables

## Installation

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd open-cinema
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env.local and set NEXT_PUBLIC_GRAPHQL_URL
   ```

4. **Start development server**
   ```bash
   pnpm nx serve web
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Development

### Project Structure

The web app follows **Feature-Sliced Design (FSD)** architecture:

```
src/
├── app/              # Next.js pages and routes
├── features/         # Feature modules (auth, catalog, player, favorites)
└── shared/          # Shared utilities (API, state, components)
```

### Key Directories

- **`src/app/`** - Next.js App Router pages and layouts
- **`src/features/`** - Feature modules with UI, API, and models
- **`src/shared/`** - Shared state, API clients, auth context
- **`../../packages/ui/`** - Reusable UI component library

### Common Tasks

#### Add a new page
1. Create folder in `src/app/`
2. Add `page.tsx` with component
3. Add route to navigation if needed

#### Add a new UI component
1. Create file in `packages/ui/src/lib/`
2. Export from `packages/ui/src/index.ts`
3. Use in app: `import { Component } from "@open-cinema/ui"`

#### Add a feature
1. Create folder in `src/features/<feature>/`
2. Structure: `ui/`, `api/`, `model/`
3. Implement components in `ui/`
4. Add stores in `src/shared/state/` if needed

### API Integration

GraphQL queries/mutations are defined in `src/shared/api/queries.ts`:

```tsx
import { useQuery, useMutation } from "@apollo/client";
import { QUERIES } from "@/shared/api/queries";

// Query example
const { data } = useQuery(QUERIES.getRecentContent, {
  variables: { skip: 0, take: 20 }
});

// Mutation example
const [login] = useMutation(QUERIES.login, {
  onCompleted: (data) => { /* handle */ }
});
```

### State Management

Using Zustand stores in `src/shared/state/`:

```tsx
// Use existing store
import { useAuthStore } from "@/shared/state/useAuthStore";

const token = useAuthStore((state) => state.token);
useAuthStore((state) => state.setToken(newToken));
```

## Styling

### Tailwind CSS

The app uses Tailwind CSS with custom theme:

```tsx
// Light mode (default)
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Click me
  </button>
</div>

// Responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* Content */}
</div>

// Dark mode
<div className="dark bg-background text-foreground">
  {/* Automatically inverts colors */}
</div>
```

### Available Colors

- `background` / `foreground`
- `card` / `card-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `destructive` / `destructive-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `border` / `input` / `ring`

## Player Controls

### Features
- **Play/Pause**: Space or click button
- **Progress**: Click/drag to seek
- **Volume**: Click icon or drag slider
- **Quality**: Select from available options
- **Audio**: Choose audio track
- **Subtitles**: Enable/disable subtitles
- **Fullscreen**: Full-screen playback
- **Auto-hide**: Controls hide after 3 seconds

### Episode Selection (Series)
- Select season from dropdown
- Episodes auto-update based on season
- Click episode to play

## Authentication

### Login/Register
- Email and password required
- Token stored in localStorage
- Automatically included in API requests
- Auto-logout on token expiry

### Protected Routes
Currently, all routes are accessible. To add protection:

```tsx
import { useAuth } from "@/shared/auth/AuthContext";

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return <YourContent />;
}
```

## Troubleshooting

### GraphQL Connection Error
- Check `NEXT_PUBLIC_GRAPHQL_URL` in `.env.local`
- Ensure API server is running
- Check CORS settings on backend

### Styles Not Loading
- Run `pnpm install` to ensure all dependencies
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

### Build Errors
- Check Node.js version (18+)
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `pnpm install`

## Performance Optimization

- **Code splitting**: Automatic with Next.js
- **Image optimization**: Use Next.js Image component
- **Caching**: Apollo Client cache for queries
- **Lazy loading**: Route-based code splitting

## Contributing

When adding features:
1. Follow FSD structure
2. Use TypeScript for type safety
3. Add Radix UI components for UI
4. Update documentation
5. Test in different browsers

## License

MIT
