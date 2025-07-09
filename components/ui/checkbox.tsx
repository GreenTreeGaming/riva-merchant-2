import React from "react";

type CheckboxProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onCheckedChange }) => {
  return (
    <div className="relative flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </div>
  );
};