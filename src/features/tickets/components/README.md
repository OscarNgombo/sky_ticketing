useTableController

This small helper hook extracts table control concerns (filter/sort modals and refresh state) so you can either use the built-in `Table` component (it uses the hook internally) or control the behaviors from a parent/composer.

Basic usage from a parent/component:

```tsx
import { useTableController } from './useTableController';

function TicketsWrapper() {
  const { isFilterModalOpen, setIsFilterModalOpen, refresh, filterableColumns } = useTableController({ columns, initialFilters, initialSorts, onRefresh });

  return (
    <>
      <button onClick={() => setIsFilterModalOpen(true)}>Open Filter</button>
      <button onClick={() => void refresh()}>Refresh</button>
      <Table columns={columns} data={data} onFilter={onFilter} onSort={onSort} onRefresh={onRefresh} />
      {isFilterModalOpen && <FilterModal isOpen onClose={() => setIsFilterModalOpen(false)} columns={filterableColumns} onApply={onFilter} />}
    </>
  );
}
```

Notes
- The hook is intentionally small and focused. If you need more control (e.g., controlled filters/sorts state), implement that in a composer and pass handlers down to `Table` props.
- Keeping `Table` behavior backward-compatible preserves existing pages while allowing gradual migration to composer-driven orchestration.
