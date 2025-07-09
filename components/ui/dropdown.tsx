// components/ui/dropdown.tsx
import React from "react";

export type DropdownOption = {
  value: string;
  label: string;
};

export type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: DropdownOption[];
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <div className="relative">
      <select
        {...props}
        disabled={disabled}
        className={`
          h-12 w-full rounded-lg border border-gray-200 bg-white
          px-4 text-sm placeholder-gray-400 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          appearance-none disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </div>
    </div>
  );
};