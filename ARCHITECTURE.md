# Open Cinema - Web App Architecture Guide

## Overview
This is a Feature-Sliced Design (FSD) monorepo using Next.js 16, Radix UI, Apollo Client, Zustand, and TypeScript.

## Folder Structure

```
apps/web/src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home/Catalog page
│   ├── providers.tsx            # Global providers (Apollo, Auth, Theme)
│   ├── global.css               # Global tailwind styles
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── register/page.tsx   # Register page
│   ├── player/[id]/
│   │   └── page.tsx            # Movie player page
│   ├── series/[id]/
│   │   └── page.tsx            # Series player page
│   └── favorites/
│       └── page.tsx            # Favorites page
│
├── features/                     # Feature-Sliced Design layers
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── api/                # Auth API layer
│   │   └── model/              # Auth types/models
│   │
│   ├── catalog/
│   │   ├── ui/
│   │   │   ├── CatalogList.tsx    # Main catalog component
│   │   │   └── ContentCard.tsx    # Reusable content card
│   │   ├── api/
│   │   └── model/
│   │
│   ├── favorites/
│   │   ├── ui/
│   │   │   └── FavoritesList.tsx
│   │   ├── api/
│   │   └── model/
│   │
│   └── player/
│       ├── ui/
│       │   ├── VideoPlayer.tsx    # Full-featured video player
│       │   └── EpisodeSelector.tsx
│       ├── api/
│       └── model/
│
└── shared/                       # Shared utilities
    ├── api/
    │   ├── apolloClient.ts      # Apollo Client config
    │   ├── ApolloProvider.tsx   # Apollo Provider
    │   ├── queries.ts           # GraphQL queries/mutations
    │   └── graphqlClient.ts
    ├── auth/
    │   └── AuthContext.tsx      # Auth context
    ├── state/
    │   ├── useAuthStore.ts      # Zustand: token management
    │   ├── useCatalogStore.ts   # Zustand: catalog state
    │   ├── usePlayerStore.ts    # Zustand: player state
    │   └── useFavoritesStore.ts # Zustand: favorites state
    └── ui/
        └── ThemeProvider.tsx

packages/ui/src/
├── lib/
│   ├── button.tsx           # Button component
│   ├── card.tsx            # Card components
│   ├── dialog.tsx          # Dialog/Modal components
│   ├── input.tsx           # Input field component
│   ├── tabs.tsx            # Tabs component
│   ├── select.tsx          # Select dropdown component
│   ├── slider.tsx          # Slider component
│   ├── loader.tsx          # Loading spinner
│   └── utils.ts            # cn() utility function
└── index.ts                # Barrel export
```

## Key Features

### 1. Authentication
- **LoginForm**: Email/password login with GraphQL mutation
- **RegisterForm**: User registration with email, username, password
- **Token Management**: Stored in localStorage, sent in Apollo headers
- **AuthContext**: Global auth state with user info

### 2. Catalog
- **New & Popular tabs** with pagination
- **ContentCard**: Reusable card for movies and series
- **Favorite button**: Heart icon to toggle favorites
- **Responsive grid**: 1-4 columns based on screen size

### 3. Video Player
- **Full player controls**:
  - Play/Pause
  - Progress bar with seek
  - Volume control
  - Quality selection (from video metas)
  - Audio track selection
  - Subtitle selection
  - Fullscreen button
- **Auto-hiding controls** (hide after 3 seconds, show on mouse move)
- **Slider for progress**: Draggable progress bar

### 4. Series Support
- **Episode Selector**: Select season and episode
- **Multi-season support**: Dynamic episode list per season
- **Episode metadata**: Title, description, rating

### 5. Favorites
- **Add/Remove**: Click heart icon on cards
- **Sync with backend**: GraphQL mutation to toggle
- **Persistent state**: Zustand store + API sync

## Component Usage

### Using UI Components
```tsx
import { Button, Input, Card, CardContent, Tabs, Select } from "@open-cinema/ui";

// Button variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
<Button variant="outline" size="sm">Click me</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Tabs
<Tabs value="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>

// Select
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Using Zustand Stores
```tsx
import { useAuthStore } from "@/shared/state/useAuthStore";
import { useFavoritesStore } from "@/shared/state/useFavoritesStore";
import { usePlayerStore } from "@/shared/state/usePlayerStore";

// Auth
const token = useAuthStore((state) => state.token);
useAuthStore((state) => state.setToken(token));

// Favorites
const isFav = useFavoritesStore((state) => state.isFavorite(id));
useFavoritesStore((state) => state.addFavorite(id));

// Player
const quality = usePlayerStore((state) => state.currentQuality);
usePlayerStore((state) => state.setQuality("1080p"));
```

### Using Apollo Queries
```tsx
import { useQuery, useMutation } from "@apollo/client";
import { QUERIES } from "@/shared/api/queries";

const { data, loading, error } = useQuery(QUERIES.getRecentContent, {
  variables: { skip: 0, take: 20 }
});

const [login, { loading }] = useMutation(QUERIES.login, {
  onCompleted: (data) => {
    // Handle success
  }
});
```

## Styling

### Tailwind CSS
- Custom CSS variables for colors (--background, --foreground, etc.)
- Dark mode support via `.dark` class
- Responsive design: `sm:`, `md:`, `lg:` prefixes

### Design System
```css
/* Colors available via Tailwind */
bg-background
text-foreground
border-border
bg-card
bg-primary
bg-secondary
bg-destructive
etc.
```

## Environment Variables

Create `.env.local` in `apps/web/`:
```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3333/graphql
```

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start dev server**
   ```bash
   pnpm nx serve web
   ```

3. **API should be running on**
   ```
   http://localhost:3333/graphql
   ```

4. **Access app at**
   ```
   http://localhost:3000
   ```

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Catalog with new/popular tabs |
| `/auth/login` | LoginForm | User login |
| `/auth/register` | RegisterForm | User registration |
| `/player/[id]` | MoviePage | Movie player |
| `/series/[id]` | SeriesPage | Series player with episodes |
| `/favorites` | FavoritesPage | User's favorite content |

## Future Improvements
- [ ] Search functionality
- [ ] Sorting and filtering
- [ ] User profile page
- [ ] Watch history
- [ ] Recommendations
- [ ] Social features (ratings, comments)
