import React, { useState, useEffect } from "react";
import "../styles/Table.css";
import {
  FilterIcon,
  SortIcon,
  RefreshIcon,
  CancelIcon,
} from "../../../shared/icons/TableIcons";
import FilterModal from "../../../shared/components/table/Filter";
import SortModal from "../../../shared/components/table/Sort";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T]) => React.ReactNode;
}

// Generic filter/sort types keyed to the row type
export type TableFilter<T> = {
  field: keyof T;
  operator: "contains" | "is" | "is_not" | "starts_with" | "ends_with";
  value: string;
};

export type TableSort<T> = {
  field: keyof T;
  direction: "asc" | "desc";
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  showSort?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  onFilter?: (filters: TableFilter<T>[]) => void;
  onSort?: (sorts: TableSort<T>[]) => void;
  initialFilters?:
    | TableFilter<T>[]
    | { field: string; operator: string; value: string }[];
  initialSorts?: TableSort<T>[] | { field: string; direction: string }[];
  onRefresh?: () => Promise<void> | void;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
}

const Table = <T extends { id: string | number }>({
  columns,
  data,
  showSort,
  showFilter,
  showRefresh,
  onFilter,
  onSort,
  initialFilters,
  initialSorts,
  onRefresh,
  onRowClick,
  getRowClassName,
}: TableProps<T>) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    return () => {};
  }, []);

  const filterableColumns = columns.map((col) => ({
    value: String(col.accessor),
    text: col.header,
  }));

  const activeFilterCount = initialFilters?.length ?? 0;
  const activeSortCount = initialSorts?.length ?? 0;

  return (
    <div className="table-container">
      <div className="table-controls">
        <div className="control-group">
          {showSort &&
            (activeSortCount && activeSortCount > 0 ? (
              <div className="control-active">
                <span className="control-count">{activeSortCount}</span>
                <button
                  className="control-label"
                  onClick={() => setIsSortModalOpen(true)}
                >
                  Sort
                </button>
                <button
                  className="control-cancel"
                  onClick={() =>
                    onSort && onSort([] as unknown as TableSort<T>[])
                  }
                  title="Clear sorts"
                >
                  <CancelIcon />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSortModalOpen(true)}
                className="control-button"
              >
                <SortIcon /> Sort
              </button>
            ))}
          {showFilter &&
            (activeFilterCount && activeFilterCount > 0 ? (
              <div className="control-active">
                <span className="control-count">{activeFilterCount}</span>
                <button
                  className="control-label"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
                <button
                  className="control-cancel"
                  onClick={() =>
                    onFilter && onFilter([] as unknown as TableFilter<T>[])
                  }
                  title="Clear filters"
                >
                  <CancelIcon />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="control-button"
              >
                <FilterIcon /> Filter
              </button>
            ))}
          {showRefresh && (
            <button
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  if (onRefresh && typeof onRefresh === "function") {
                    await onRefresh();
                  }
                } finally {
                  setIsRefreshing(false);
                }
              }}
              className="control-button icon-only"
              title="Refresh"
              aria-label="Refresh table"
            >
              <RefreshIcon className={isRefreshing ? "refresh-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      <div className="table-scroll">
        <table className="reusable-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.accessor)}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No tickets
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowClasses = [
                  onRowClick ? "clickable-row" : "",
                  getRowClassName ? getRowClassName(row) : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <tr
                    key={row.id}
                    className={rowClasses || undefined}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target &&
                        (target.closest("button") ||
                          target.closest("a") ||
                          target.closest("input"))
                      )
                        return;
                      if (onRowClick) onRowClick(row);
                    }}
                    role={onRowClick ? "button" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!onRowClick) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }}
                  >
                    {columns.map((col) => (
                      <td key={String(col.accessor)}>
                        {col.cell
                          ? col.cell(row[col.accessor])
                          : String(row[col.accessor])}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showFilter && onFilter && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          columns={filterableColumns}
          initialFilters={
            initialFilters as unknown as {
              field: string;
              operator: string;
              value: string;
            }[]
          }
          onApply={(filters) =>
            onFilter(
              (filters || []).map((f) => ({
                field: f.field as keyof T,
                operator: f.operator as TableFilter<T>["operator"],
                value: f.value,
              }))
            )
          }
          onClear={() => onFilter([] as unknown as TableFilter<T>[])}
        />
      )}
      {showSort && onSort && (
        <SortModal
          isOpen={isSortModalOpen}
          onClose={() => setIsSortModalOpen(false)}
          columns={filterableColumns}
          initialSorts={
            initialSorts as unknown as { field: string; direction: string }[]
          }
          onApply={(sorts) =>
            onSort(
              (sorts || []).map((s) => ({
                field: s.field as keyof T,
                direction: (s.direction as "asc" | "desc") ?? "asc",
              }))
            )
          }
          onClear={() => onSort([] as unknown as TableSort<T>[])}
        />
      )}
    </div>
  );
};

export default Table;
