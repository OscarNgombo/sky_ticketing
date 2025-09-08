import React from "react";
import "./Table.css";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T]) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

const Table = <T extends { id: string | number }>({
  columns,
  data,
}: TableProps<T>) => {
  return (
    <table className="reusable-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.accessor)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={String(col.accessor)}>
                {col.cell
                  ? col.cell(row[col.accessor])
                  : String(row[col.accessor])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
