import { useCallback, useMemo, useState } from "react";
import type { TableFilter, TableSort, Column } from "../Table";

export type TableControllerReturn = {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (v: boolean) => void;
  isSortModalOpen: boolean;
  setIsSortModalOpen: (v: boolean) => void;
  isRefreshing: boolean;
  setIsRefreshing: (v: boolean) => void;
  filterableColumns: { value: string; text: string }[];
  activeFilterCount: number;
  activeSortCount: number;
  refresh: () => Promise<void>;
};

export function useTableController<T extends { id: string | number }>(opts: {
  columns: Column<T>[];
  initialFilters?: TableFilter<T>[] | { field: string; operator: string; value: string }[];
  initialSorts?: TableSort<T>[] | { field: string; direction: string }[];
  onRefresh?: () => Promise<void> | void;
}) {
  const { columns, initialFilters, initialSorts, onRefresh } = opts;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filterableColumns = useMemo(
    () => columns.map((col) => ({ value: String(col.accessor), text: col.header })),
    [columns]
  );

  const activeFilterCount = (initialFilters?.length ?? 0) as number;
  const activeSortCount = (initialSorts?.length ?? 0) as number;

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return {
    isFilterModalOpen,
    setIsFilterModalOpen,
    isSortModalOpen,
    setIsSortModalOpen,
    isRefreshing,
    setIsRefreshing,
    filterableColumns,
    activeFilterCount,
    activeSortCount,
    refresh,
  };
}
