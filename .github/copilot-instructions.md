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

## Component Conventions & Composition-first Guidance

This project follows a composition-first approach to keep components small, predictable, and easy to maintain. The guidance below replaces patterns that relied on many boolean props or large, monolithic components.

### Composition over booleans
- Prefer composing small, focused components instead of toggling behavior with multiple boolean props. For example, rather than <Component editable={true} showHeader={false} condensed={true}>, create smaller components or wrappers that encapsulate the specific variant behavior.
- Use render props, slots/children, or HOCs sparingly for cross-cutting concerns. Favor explicit composition where a parent supplies the pieces the child needs.

### Modular Composer Pattern (Provider + Hooks)
- Build feature-specific composers as a provider that wraps related UI pieces and exposes hooks and actions via context. This reduces prop drilling and centralizes related state and side-effects.
- Contract: a composer provider should expose:
  - state shape and selectors (read-only where appropriate)
  - actions to mutate state (create/update/delete/async effects)
  - lifecycle hooks or callbacks for parent integration
- Example responsibilities:
  - orchestration of multi-part forms (validation, draft saving, submission)
  - shared UI state for complex flows (threaded messages, editor state)
- Keep the provider narrow in scope — one provider per logical composer (e.g., TicketComposer, UserComposer), not a single gigantic provider for unrelated features.

### State Management Strategies
- Local state: use for ephemeral UI state (open/closed, focused input, temp drafts).
- Lifted state: when multiple sibling components must share data, lift state to the nearest common ancestor or to a composer provider.
- Context providers: use context to share actions and read-only selectors. Keep context API stable and memoized to avoid unnecessary re-renders.
- Global sync: if data needs cross-device sync, keep the composer small but plug it into additional syncing layers (e.g., service workers, background sync, or a lightweight sync service).
- Avoid over-using a global state library unless the app growth justifies it; prefer focused composers and contexts first.

### Implementation details & patterns
- Encapsulate side-effects (API calls, localStorage) inside composer's actions/hooks. Use try/catch and expose error states to consumers for graceful UI handling.
- Provide small presentational components for UI (e.g., `FormField`, `FormActions`, `ComposerHeader`) and assemble them in the composer page.
- For forms, prefer controlled inputs with a single change handler and a typed form state object. Keep validation outside of presentation components when possible.
- Document the composer's public API (exposed hooks and events) in a short README or JSDoc above the provider.

## Data Management

### Local Storage Encryption
- All sensitive data encrypted using `encryptData()` / `decryptData()`
- Tickets stored as encrypted JSON arrays
- Use crypto utilities, never plain localStorage for user data

### State Management (summary)
- React state + Context for layout configuration
- No external state management library by default; prefer feature composers
- Prop drilling only for very small, local flows

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
