"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  pendingLabel?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ServerActionButton({
  children,
  pendingLabel = "მიმდინარეობს...",
  disabled,
  className = "",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button {...props} disabled={disabled || pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
