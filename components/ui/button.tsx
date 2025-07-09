// components/ui/button.tsx

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  const baseStyles =
    "px-4 py-2 rounded-md transition font-medium";
  const variantStyles =
    variant === "outline"
      ? "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}