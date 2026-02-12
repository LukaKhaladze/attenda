import { InputHTMLAttributes } from "react";

type Props = {
  label: string;
  requiredMark?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export function UIInput({ label, requiredMark = false, className = "", ...props }: Props) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label} {requiredMark ? <span className="text-error">*</span> : null}
      </span>
      <input className={`w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base ${className}`} {...props} />
    </label>
  );
}
