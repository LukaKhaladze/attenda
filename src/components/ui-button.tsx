import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "md" | "lg";

type Props = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-[#1e40af]",
  secondary: "border-2 border-primary bg-white text-primary hover:bg-[#eff6ff]",
  outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg"
};

export function UIButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`rounded-md font-medium transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
