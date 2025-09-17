# Composer Pattern — README

This folder documents the "composer" pattern used across the Sky Ticketing app. A composer is a small feature-scoped provider + hooks package that encapsulates state, side-effects, and actions needed by a set of related UI components.

Why composers?
- Reduce prop drilling between related components.
- Replace large components with many boolean flags by composing smaller specialized components.
- Centralize side-effects (API calls, localStorage, validation, save/draft flows) in a single place.
- Make unit testing and integration testing easier by separating orchestration from presentation.

When to create a composer
- Pages that orchestrate multi-part forms (create/update ticket workflows).
- Components that share non-trivial state across many siblings (threaded messages, assignment modals, edit flows).
- Flows that need to persist drafts, auto-save, or manage optimistic updates.

Composer contract (recommended)
- Provider: wraps the UI subtree and accepts lightweight configuration props.
- Hooks: `use{Feature}State()` and `use{Feature}Actions()` or a combined `use{Feature}()`.
- Public API should expose:
  - selectors/read-only getters for derived state
  - actions for mutations and async effects (create, update, delete, fetch, saveDraft)
  - optional lifecycle hooks/callback props (onSave, onCancel, onError)

Basic patterns
- Keep the provider narrow in scope — one provider per logical composer (e.g., `TicketComposer`, not `AppComposer`).
- Memoize context values and actions to avoid unnecessary re-renders.
- Encapsulate API/localStorage calls inside action functions and expose an `error` state.
- For forms, prefer controlled inputs and a single `setField(name, value)` action.

Minimal folder example

src/features/tickets/composer/
- TicketComposer.tsx        # provider + context value
- useTicketComposer.ts     # hook(s) for consumers
- types.ts                 # public types and interfaces
- README.md                # composer-specific notes and usage

JSDoc template for a composer provider

/**
 * TicketComposer
 *
 * Provider responsibilities:
 * - load ticket drafts and persisted tickets
 * - expose ticket form state and validation errors
 * - handle create/update/delete and draft saving
 *
 * Public API (via `useTicketComposer()`):
 * - state: { ticket: Ticket | null, draft: TicketDraft, loading: boolean, error?: Error }
 * - actions: { setField(name: string, value: any), saveDraft(), submit(), reset() }
 * - callbacks: onSave?: (ticket) => void, onCancel?: () => void
 *
 * Example usage:
 * const { state, actions } = useTicketComposer();
 * actions.setField('problem', 'Network outage');
 * await actions.submit();
 */


Small example: provider skeleton

```tsx
// TicketComposer.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Ticket, TicketDraft } from './types';

const TicketComposerContext = createContext(null as any);

export function TicketComposerProvider({ children, initialDraft }: { children: React.ReactNode, initialDraft?: TicketDraft }) {
  const [draft, setDraft] = useState<TicketDraft>(initialDraft ?? { /* ... */ });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const actions = useMemo(() => ({
    setField(name: string, value: any) { setDraft((d) => ({ ...d, [name]: value })); },
    async saveDraft() { /* ... */ },
    async submit() { /* ... */ }
  }), []);

  const value = useMemo(() => ({ draft, loading, error, actions }), [draft, loading, error, actions]);
  return <TicketComposerContext.Provider value={value}>{children}</TicketComposerContext.Provider>;
}

export function useTicketComposer(){
  return useContext(TicketComposerContext);
}
```

Testing tips
- Test provider actions (submit, saveDraft) as unit tests mocking network/localStorage.
- Test that presentational components render correctly using mocked context values.

Migration checklist for refactoring a large component into a composer
1. Identify the local state, derived state, and side-effects in the component.
2. Create a composer provider encapsulating that state and actions.
3. Replace local state with context-backed state in the component and children.
4. Extract presentational parts into focused components that consume the composer hooks.
5. Add tests for the composer actions and a couple of integration tests for the composed UI.


Notes
- Keep the provider API stable and documented; small breaking changes are ok but prefer additive changes.
- If you need global cross-app features (e.g., notifications, auth), keep them separate from composers.

