// components/ui/card.tsx

import React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  className = "",
  ...props
}: React.PropsWithChildren<DivProps>) {
  return (
    <div
      className={`border rounded-2xl shadow-md bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.PropsWithChildren<DivProps>) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}