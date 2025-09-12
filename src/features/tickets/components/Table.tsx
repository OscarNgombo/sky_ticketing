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

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  showSort?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  onFilter?: (filters: any[]) => void;
  onSort?: (sorts: any[]) => void;
  initialFilters?: any[];
  initialSorts?: any[];
  onRefresh?: () => Promise<void> | void;
  onRowClick?: (row: T) => void;
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
  {showSort && (
          (activeSortCount && activeSortCount > 0) ? (
            <div className="control-active">
              <span className="control-count">{activeSortCount}</span>
              <button className="control-label" onClick={() => setIsSortModalOpen(true)}>Sort</button>
              <button className="control-cancel" onClick={() => onSort && onSort([])} title="Clear sorts"><CancelIcon /></button>
            </div>
          ) : (
            <button
              onClick={() => setIsSortModalOpen(true)}
              className="control-button"
            >
              <SortIcon /> Sort
            </button>
          )
        )}
        {showFilter && (
          (activeFilterCount && activeFilterCount > 0) ? (
            <div className="control-active">
              <span className="control-count">{activeFilterCount}</span>
              <button className="control-label" onClick={() => setIsFilterModalOpen(true)}>Filter</button>
              <button className="control-cancel" onClick={() => onFilter && onFilter([])} title="Clear filters"><CancelIcon /></button>
            </div>
          ) : (
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="control-button"
            >
              <FilterIcon /> Filter
            </button>
          )
        )}
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
            <RefreshIcon className={isRefreshing ? 'refresh-spin' : ''} />
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
              data.map((row) => (
                <tr
                  key={row.id}
                  className={onRowClick ? 'clickable-row' : undefined}
                  onClick={(e) => {
                    // prevent row click if the user clicked an interactive element inside the row
                    const target = e.target as HTMLElement;
                    if (target && (target.closest('button') || target.closest('a') || target.closest('input'))) return;
                    if (onRowClick) onRowClick(row);
                  }}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!onRowClick) return;
                    if (e.key === 'Enter' || e.key === ' ') {
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
              ))
            )}
          </tbody>
        </table>
      </div>
      {showFilter && onFilter && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          columns={filterableColumns}
          initialFilters={initialFilters}
          onApply={onFilter}
          onClear={() => onFilter([])}
        />
      )}
      {showSort && onSort && (
        <SortModal
          isOpen={isSortModalOpen}
          onClose={() => setIsSortModalOpen(false)}
          columns={filterableColumns}
          initialSorts={initialSorts}
          onApply={onSort}
          onClear={() => onSort([])}
        />
      )}
    </div>
  );
};

export default Table;
