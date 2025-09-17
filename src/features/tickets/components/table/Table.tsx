import React, { useEffect } from "react";
import "../../styles/Table.css";
import {
  FilterIcon,
  SortIcon,
  RefreshIcon,
  CancelIcon,
} from "../../../../shared/icons/TableIcons";
import FilterModal from "../../../../shared/components/table/Filter";
import SortModal from "../../../../shared/components/table/Sort";
import { useTableController } from "./useTableController";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T]) => React.ReactNode;
};

export type TableFilter<T> = {
  field: keyof T;
  operator: string;
  value: string;
};

export type TableSort<T> = {
  field: keyof T;
  direction: string;
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
  actions?: {
    global?: Array<{
      key: string;
      label?: string;
      icon?: React.ReactNode;
      onClick: () => void | Promise<void>;
    }>;
    row?: Array<{
      key: string;
      label?: string;
      icon?: React.ReactNode;
      onClick: (row: T) => void | Promise<void>;
      visible?: (row: T) => boolean;
    }>;
    custom?: React.ReactNode;
  };
  pagination?:
    | {
        page: number;
        pageSize: number;
        total: number;
        onPageChange: (p: number) => void;
        onPageSizeChange?: (s: number) => void;
      }
    | false;
  footer?: React.ReactNode;
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
  actions,
  pagination,
  footer,
}: TableProps<T>) => {
  useEffect(() => {
    return () => {};
  }, []);

  // compute effective flags: prefer explicit boolean props, otherwise infer from provided handlers
  const showSortFlag = showSort ?? !!onSort;
  const showFilterFlag = showFilter ?? !!onFilter;
  const showRefreshFlag = showRefresh ?? !!onRefresh;

  const {
    isFilterModalOpen,
    setIsFilterModalOpen,
    isSortModalOpen,
    setIsSortModalOpen,
    isRefreshing,
    filterableColumns,
    activeFilterCount,
    activeSortCount,
    refresh,
  } = useTableController({
    columns,
    // cast to any/primitive shapes to satisfy useTableController's expected types
    initialFilters: initialFilters as unknown as
      | { field: string; operator: string; value: string }[]
      | undefined,
    initialSorts: initialSorts as unknown as
      | { field: string; direction: string }[]
      | undefined,
    onRefresh,
  });

  return (
    <div className="table-container">
      <div className="table-controls">
        <div className="control-group">
          {/* render global/custom actions if provided */}
          {actions?.custom}
          {actions?.global?.map((a) => (
            <button
              key={a.key}
              className="control-button"
              onClick={async () => {
                try {
                  await a.onClick();
                } catch {
                  // noop - caller handles errors
                }
              }}
              title={a.label}
            >
              {a.icon}
              {a.label && <span className="action-label">{a.label}</span>}
            </button>
          ))}
          {showSortFlag &&
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
          {showFilterFlag &&
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
          {showRefreshFlag && (
            <button
              onClick={async () => {
                await refresh();
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
                    {/* row actions cell */}
                    {actions?.row && (
                      <td>
                        <div className="row-actions">
                          {actions.row.map((ra) => {
                            if (ra.visible && !ra.visible(row)) return null;
                            return (
                              <button
                                key={ra.key}
                                className="row-action-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    ra.onClick(row);
                                  } catch {
                                    /* noop */
                                  }
                                }}
                                title={ra.label}
                              >
                                {ra.icon}
                                {ra.label && (
                                  <span className="sr-only">{ra.label}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showFilterFlag && onFilter && (
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
      {showSortFlag && onSort && (
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
      {/* footer area: custom footer -> pagination -> nothing */}
      <div className="table-footer">
        {footer ? (
          footer
        ) : pagination === false ? null : pagination ? (
          <div className="pagination-controls">
            <div className="pagination-info">
              {`Showing page ${pagination.page} — ${pagination.total} items`}
            </div>
            <div className="pagination-actions">
              <button
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Prev
              </button>
              <button
                disabled={
                  pagination.page * pagination.pageSize >= pagination.total
                }
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </button>
              {pagination.onPageSizeChange && (
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    pagination.onPageSizeChange?.(Number(e.target.value))
                  }
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Table;
