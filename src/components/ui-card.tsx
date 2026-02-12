import { HTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function UICard({ children, className = "", ...props }: Props) {
  return (
    <div className={`rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
