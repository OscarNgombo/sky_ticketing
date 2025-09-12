import React, { useState, useEffect } from "react";
import ReusableModal from "../modal/ReusableModal";
import { FilterIcon } from "../../icons/TableIcons";
import "../../../features/tickets/styles/Modal.css";

interface Column {
  value: string;
  text: string;
}

interface Filter {
  field: string;
  operator: string;
  value: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  initialFilters?: Filter[];
  onApply: (filters: Filter[]) => void;
  onClear: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  columns,
  initialFilters,
  onApply,
  onClear,
}) => {
  const [filters, setFilters] = useState<Filter[]>(() => initialFilters ?? []);

  useEffect(() => {
    if (initialFilters) setFilters(initialFilters);
  }, [initialFilters]);

  const addFilterRow = () => {
    setFilters([...filters, { field: "", operator: "", value: "" }]);
  };

  const removeFilterRow = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof Filter, value: string) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? { ...filter, [field]: value } : filter
    );
    setFilters(updatedFilters);
  };

  const handleApply = () => {
    const activeFilters = filters.filter(
      (f) => f.field && f.operator && f.value.trim()
    );
    onApply(activeFilters);
    onClose();
  };

  const handleClear = () => {
    setFilters([]);
    onClear();
  };

  const footerButtons = (
    <>
      <button
        type="button"
        className="filter-clear-button"
        onClick={handleClear}
      >
        <span>Clear All</span>
      </button>
      <button
        type="button"
        className="filter-apply-button"
        onClick={handleApply}
      >
        <span>Apply Filters</span>
      </button>
    </>
  );

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Table"
      titleIcon={<FilterIcon />}
      footerButtons={footerButtons}
    >
      <div id="filter-rows-container">
        {filters.map((filter, index) => (
          <div key={index} className="filter-row">
            <div className="filter-control">
              <select
                name="filter-field"
                className="filter-field"
                value={filter.field}
                onChange={(e) => updateFilter(index, "field", e.target.value)}
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

            <div className="filter-control">
              <select
                name="filter-operator"
                className="filter-operator"
                value={filter.operator}
                onChange={(e) =>
                  updateFilter(index, "operator", e.target.value)
                }
                required
              >
                <option value="" disabled hidden>
                  Select Relation
                </option>
                <option value="contains">contains</option>
                <option value="is">is</option>
                <option value="is_not">is not</option>
                <option value="starts_with">starts with</option>
                <option value="ends_with">ends with</option>
              </select>
            </div>

            <div className="filter-control">
              <input
                type="text"
                name="filter-value"
                className="filter-value"
                placeholder="Enter value"
                value={filter.value}
                onChange={(e) => updateFilter(index, "value", e.target.value)}
              />
            </div>

            <button
              type="button"
              className="delete-row-button"
              title="Remove filter"
              onClick={() => removeFilterRow(index)}
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
      <button
        type="button"
        className="add-filter-button"
        onClick={addFilterRow}
      >
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
        Add Filter
      </button>
    </ReusableModal>
  );
};

export default FilterModal;
