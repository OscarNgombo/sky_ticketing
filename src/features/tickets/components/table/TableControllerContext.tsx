import React from "react";
import type { TableControllerReturn } from "./useTableController";

const TableControllerContext =
  React.createContext<TableControllerReturn | null>(null);

export function TableControllerContextProvider({
  value,
  children,
}: {
  value: TableControllerReturn | null;
  children: React.ReactNode;
}) {
  return (
    <TableControllerContext.Provider value={value}>
      {children}
    </TableControllerContext.Provider>
  );
}

export default TableControllerContext;
