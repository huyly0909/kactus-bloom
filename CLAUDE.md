# Kactus Bloom Frontend — Claude Code Instructions

## Architecture

**pnpm workspaces + Turborepo** monorepo with 3 packages:

| Package | Import As | Purpose |
|---------|-----------|---------|
| `bloom-ui` | `@kactus-bloom/ui` | Shared UI components, hooks, stores, services, types, theme |
| `bloom-app` | — | Main web application (pages, routes, layouts) |
| `docker-hub` | — | Docker Compose configs for dev/stag/prod |

### Dependency Flow (One-Way — NEVER reverse)

```
bloom-app ──▶ bloom-ui
```

**Never import from bloom-app into bloom-ui.**

## Tech Stack

- **React 18** + **TypeScript 5** + **Vite 6**
- **Mantine 7** (UI library — no other UI libs)
- **Recharts** (charts) + **Lucide React** (icons)
- **React Router v7** (Outlet-based layouts with guards)
- **TanStack Query v5** (server state via `useApiQuery`/`useApiMutation`)
- **Zustand** (client state: auth, project, permissions, UI)
- **Axios** (HTTP, `withCredentials: true`, 401 interceptor)
- **React Hook Form + Zod** (forms + validation)
- **js-cookie** (project selection cookie)
- **ESLint 9 + Prettier** + **Husky + lint-staged**
- **Vitest + React Testing Library** (testing)

## Backend API

Backend: `kactus-fin` (FastAPI) at port **17600**. Gateway: port **17601**.

Response envelope: `{ "data": T, "message": string, "code": number }` — TypeScript: `ApiResponse<T>`

## TypeScript Conventions

- Always `.ts` / `.tsx` — never `.js` / `.jsx`
- `interface` for object shapes, `type` for unions/intersections
- `import type` for type-only imports
- Never `any` — use `unknown` or proper types

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | `PascalCase.tsx` in folder | `DataTable/DataTable.tsx` + `index.ts` |
| Hooks | `use` prefix, camelCase | `useAuth.ts` |
| Stores | `Store` suffix, camelCase | `authStore.ts` |
| Services | `Service` suffix, camelCase | `authService.ts` |
| Utils/Types | camelCase | `formatters.ts` |
| Pages | Folder with `index.tsx` | `Dashboard/index.tsx` |

## Import Paths

```tsx
// ✅ Components + theme — from barrel
import { DataTable, ChartCard, AppLayout } from '@kactus-bloom/ui';

// ✅ Sub-paths for hooks/stores/services/types
import { useAuth, useApiQuery, useApiMutation } from '@kactus-bloom/ui/hooks';
import { useAuthStore, useProjectStore } from '@kactus-bloom/ui/stores';
import { authService, projectService } from '@kactus-bloom/ui/services';
import type { ApiResponse, User } from '@kactus-bloom/ui/types';

// ✅ Mantine
import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// ✅ Icons
import { Search, Bell } from 'lucide-react';

// ❌ NEVER import hooks/stores/services from barrel '@kactus-bloom/ui'
// ❌ NEVER cross package boundaries with relative imports
```

## Where to Put Code

| You need to... | Put it in... |
|----------------|-------------|
| Reusable component | `bloom-ui/src/components/<Name>/` (`<Name>.tsx` + `index.ts`) |
| Shared hook | `bloom-ui/src/hooks/` → export from `hooks/index.ts` |
| Zustand store | `bloom-ui/src/stores/` → export from `stores/index.ts` |
| API service | `bloom-ui/src/services/` → export from `services/index.ts` |
| Shared types | `bloom-ui/src/types/` → export from `types/index.ts` |
| Utilities | `bloom-ui/src/utils/` |
| Page/route | `bloom-app/src/pages/<PageName>/` + register in `router/index.tsx` |
| Mantine theme | `bloom-ui/src/theme/` |
| Docker config | `docker-hub/` |

## Component Pattern

```tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return <div>{title}</div>;
};
```

- Named exports only (no default exports)
- Functional components with `FC<Props>`
- Mantine + Lucide only (no Ant Design, MUI, Chakra)

## Data Fetching

- API calls through services (object methods): `transactionService.getAll()`
- Services unwrap `data.data` from `ApiResponse<T>` envelope
- `useApiQuery` for GET, `useApiMutation` for POST/PUT/PATCH/DELETE
- NEVER make API calls directly in components — use services + hooks
- NEVER use `useEffect` for data fetching — use `useApiQuery`

## State Management

- **Zustand** stores: `useAuthStore`, `useProjectStore`, `usePermissionStore`, `useUIStore`
- **TanStack Query** for server state
- NEVER store tokens in localStorage — session is in httpOnly cookie
- Project selection persisted via `js-cookie`

## Auth Flow

1. Login → POST `/api/auth/login` → server sets httpOnly cookie
2. `apiClient` uses `withCredentials: true` → cookies sent automatically
3. On 401 → interceptor redirects to `/login`
4. `AuthGuard` calls `checkSession()` on mount
5. `ProjectGuard` restores project from cookie

## Routing

- React Router v7 with Outlet-based layout pattern
- Guards: `AuthGuard` → `AdminGuard`/`ProjectGuard` as wrapper components
- Adding pages: create folder in `pages/`, add `index.tsx`, register in `router/index.tsx`

## Testing

```tsx
// Vitest + React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" onAction={vi.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

- Colocated test files (`*.test.tsx` next to source)
- `userEvent` for interactions (NOT `fireEvent`)
- Mock stores with `vi.mock('@kactus-bloom/ui/stores')`
- Use `renderWithProviders` helper for full context (QueryClient + Mantine + Router)

## Commands

```bash
pnpm dev              # Start all packages in dev mode
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm --filter bloom-app test  # Run tests
pnpm format           # Run Prettier
```

## Environment Variables

Prefix with `VITE_`:
```
VITE_API_BASE_URL=http://localhost:17600/api
VITE_WS_BASE_URL=ws://localhost:17600/ws
VITE_APP_NAME=Kactus Bloom
```

## Don'ts

- ❌ `.js`/`.jsx` — always `.ts`/`.tsx`
- ❌ `any` — define proper types
- ❌ Class components — functional + hooks only
- ❌ `default export` for components — named exports only
- ❌ Import bloom-app into bloom-ui (one-way only)
- ❌ Store tokens in localStorage — httpOnly cookie only
- ❌ Direct API calls in components — use services + `useApiQuery`/`useApiMutation`
- ❌ Ant Design, MUI, Chakra — Mantine only
- ❌ `var` — use `const`/`let`
- ❌ Skip TypeScript interfaces for props
- ❌ `useEffect` for data fetching — use `useApiQuery`
- ❌ Dockerfiles in app packages — keep in `docker-hub/`
- ❌ Skip tests — every feature needs tests
- ❌ Import hooks/stores/services from barrel — use sub-paths
