import { HTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function UICard({ children, className = "", ...props }: Props) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(17,24,39,0.06)] ${className}`} {...props}>
      {children}
    </div>
  );
}
