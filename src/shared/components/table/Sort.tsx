import React, { useState, useEffect } from "react";
import ReusableModal from "../modal/ReusableModal";
import { SortIcon } from "../../icons/TableIcons";
import "../../../features/tickets/styles/Modal.css";

interface Column {
  value: string;
  text: string;
}

interface Sort {
  field: string;
  direction: string;
}

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  initialSorts?: Sort[];
  onApply: (sorts: Sort[]) => void;
  onClear: () => void;
}

const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  columns,
  initialSorts,
  onApply,
  onClear,
}) => {
  const [sorts, setSorts] = useState<Sort[]>(() => initialSorts ?? []);

  useEffect(() => {
    if (initialSorts) setSorts(initialSorts);
  }, [initialSorts]);

  const addSortRow = () => {
    setSorts([...sorts, { field: "", direction: "" }]);
  };

  const removeSortRow = (index: number) => {
    setSorts(sorts.filter((_, i) => i !== index));
  };

  const updateSort = (index: number, field: keyof Sort, value: string) => {
    const updatedSorts = sorts.map((sort, i) =>
      i === index ? { ...sort, [field]: value } : sort
    );
    setSorts(updatedSorts);
  };

  const handleApply = () => {
    const activeSorts = sorts.filter((s) => s.field && s.direction);
    onApply(activeSorts);
    onClose();
  };

  const handleClear = () => {
    setSorts([]);
    onClear();
  };

  const footerButtons = (
    <>
      <button type="button" className="sort-clear-button" onClick={handleClear}>
        <span>Clear</span>
      </button>
      <button type="button" className="sort-apply-button" onClick={handleApply}>
        <span>Apply Sorts</span>
      </button>
    </>
  );

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sort Table"
      titleIcon={<SortIcon />}
      footerButtons={footerButtons}
    >
      <div id="sort-rows-container">
        {sorts.map((sort, index) => (
          <div key={index} className="sort-row">
            <div className="sort-control">
              <select
                name="sort-field"
                className="sort-field"
                value={sort.field}
                onChange={(e) => updateSort(index, "field", e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Select Column
                </option>
                {columns.map((column) => (
                  <option key={column.value} value={column.value}>
                    {column.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="sort-control">
              <select
                name="sort-direction"
                className="sort-direction"
                value={sort.direction}
                onChange={(e) => updateSort(index, "direction", e.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Select Order
                </option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <button
              type="button"
              className="delete-row-button"
              title="Remove sort"
              onClick={() => removeSortRow(index)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3V4H4V6H5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"
                  fill="#A10900"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="add-sort-button" onClick={addSortRow}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.6667 8.66671H8.66671V12.6667H7.33337V8.66671H3.33337V7.33337H7.33337V3.33337H8.66671V7.33337H12.6667V8.66671Z"
            fill="#5856D6"
          ></path>
        </svg>
        <span>Add Sort</span>
      </button>
    </ReusableModal>
  );
};

export default SortModal;
