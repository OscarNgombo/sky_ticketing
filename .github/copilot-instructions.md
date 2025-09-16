# Sky Ticketing - AI Coding Instructions

## Project Overview
React 19 + TypeScript + Vite ticketing system using TanStack Router, encrypted localStorage auth, and TipTap rich text editor. Features-based architecture with shared components and strict type safety.

## Architecture Patterns

### Routing & Navigation
- **TanStack Router** with file-based routing in `/src/routes/`
- Auto-generated `routeTree.gen.ts` (don't edit manually)
- Protected routes under `/_authenticated/` use `beforeLoad` auth guards
- Route structure: `__root.tsx` → `_authenticated.tsx` → feature routes

### Authentication Flow
- Encrypted localStorage using `crypto-js` with hardcoded secret
- Auth utilities in `/src/utils/auth.ts` and `/src/utils/crypto.tsx`
- User data: `{username, userType, company}` encrypted in `loggedInUser` key
- Use `isLoggedIn()` and `getCurrentUser()` for auth checks

### Layout System (Critical Pattern)
- Dynamic layout via React Context in `/src/shared/layouts/`
- `LayoutProvider` wraps authenticated routes
- `useSetLayout(config)` hook to configure header per page:
  ```tsx
  useSetLayout({
    leftText: "Page Title",
    leftButtonText: "User Type", 
    rightItems: [<Component />],
    mainContentClassName: "optional-class"
  })
  ```

### Features Organization
- Feature-based structure: `/src/features/{tickets,tasks}/`
- Each feature has: `components/`, `pages/`, `styles/`, `api.ts`
- Pages use feature-specific components, shared components from `/src/shared/`

### Development Workflow
- **pnpm** enforced via preinstall script and Corepack
- Key commands: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm ci`
- Testing: Vitest + jsdom, setup in `/src/test/setup.ts`
- Auto-formatting enforced, use TypeScript strict mode

## Component Conventions

### Shared Components Pattern
- Reusable UI in `/src/shared/components/{buttons,forms,modal,navs,table}/`
- Feature components in `/src/features/{feature}/components/`
- CSS co-located with components (e.g., `Button.tsx` + `Button.css`)

### Props & Typing
- Always define interfaces for component props
- Optional props use `?` syntax, default in destructuring
- Export types when used across features

### TipTap Integration
- Rich text editor with custom video extension
- Extensions in `/src/utils/tiptap/extensions/`
- Form integration pattern in `CreateTicketForm.tsx`

## Data Management

### Local Storage Encryption
- All sensitive data encrypted using `encryptData()` / `decryptData()`
- Tickets stored as encrypted JSON arrays
- Use crypto utilities, never plain localStorage for user data

### State Management
- React state + Context for layout configuration
- No external state management library
- Prop drilling for simple data flows

## Key Implementation Notes

### File Naming
- Components: PascalCase (`TicketsPage.tsx`)
- Utilities: camelCase (`auth.ts`)
- Routes: snake_case for generated files, follow TanStack conventions

### Error Handling
- Try-catch blocks in crypto operations and localStorage access
- Graceful fallbacks for auth failures (redirect to login)
- Type guards for parsed JSON data

### Performance
- Vite HMR enabled, React 19 features available
- Lazy loading not implemented yet
- CSS imports co-located with components

## Common Patterns to Follow

1. **Page Setup**: Import layout hook, configure via `useSetLayout()` in `useEffect`
2. **Authentication**: Check `isLoggedIn()` before sensitive operations
3. **Navigation**: Use TanStack Router's `useNavigate()` hook
4. **Styling**: Import component-specific CSS, use CSS custom properties
5. **Forms**: Controlled components with TypeScript interfaces for form data

## Testing Setup
- Vitest + React Testing Library
- Global setup in `/src/test/setup.ts`
- Run via `pnpm test` or `pnpm test:coverage`