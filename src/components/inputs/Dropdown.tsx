import React from "react";
import "./Dropdown.css";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  label?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="dropdown-wrapper">
      <select className="dropdown-select" value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg
        width="24"
        height="30"
        viewBox="0 0 24 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.66663 13.25L12 10.9167L14.3333 13.25M14.3333 16.75L12 19.0833L9.66663 16.75"
          stroke="#868E96"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Dropdown;
