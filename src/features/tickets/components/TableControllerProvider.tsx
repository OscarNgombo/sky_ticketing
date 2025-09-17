import type { ReactNode } from "react";
import { useTableController } from "./table/useTableController";
import type { Column } from "./table/Table";
import type { TableFilter, TableSort } from "./table/Table";
import { TableControllerContextProvider } from "./table/TableControllerContext";

export function TableControllerProvider<T extends { id: string | number }>({
  children,
  columns,
  initialFilters,
  initialSorts,
  onRefresh,
}: {
  children: ReactNode;
  columns: Column<T>[];
  initialFilters?: TableFilter<T>[] | { field: string; operator: string; value: string }[];
  initialSorts?: TableSort<T>[] | { field: string; direction: string }[];
  onRefresh?: () => Promise<void> | void;
}) {
  const controller = useTableController({
    columns,
    initialFilters: initialFilters as unknown as { field: string; operator: string; value: string }[] | undefined,
    initialSorts: initialSorts as unknown as { field: string; direction: string }[] | undefined,
    onRefresh,
  });

  return <TableControllerContextProvider value={controller}>{children}</TableControllerContextProvider>;
}
