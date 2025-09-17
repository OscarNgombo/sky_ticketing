import type { ReactNode } from "react";
import { useTableController } from "./useTableController";
import type { Column } from "../Table";
import type { TableFilter, TableSort } from "../Table";
import { TableControllerContextProvider } from "./TableControllerContext";

export function TableControllerProvider<T extends { id: string | number }>({
  children,
  columns,
  initialFilters,
  initialSorts,
  onRefresh,
}: {
  children: ReactNode;
  columns: Column<T>[];
  initialFilters?:
    | TableFilter<T>[]
    | { field: string; operator: string; value: string }[];
  initialSorts?: TableSort<T>[] | { field: string; direction: string }[];
  onRefresh?: () => Promise<void> | void;
}) {
  const controller = useTableController({
    columns,
    initialFilters,
    initialSorts,
    onRefresh,
  });

  return (
    <TableControllerContextProvider value={controller}>
      {children}
    </TableControllerContextProvider>
  );
}
