import React, { forwardRef } from "react";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    hint?: string;
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, icon, error, hint, className = "", ...props }, ref) => {
        const baseInputClass =
            "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1";

        // Determine border color based on error state
        const borderClass = error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500";

        return (
            <div className={`space-y-1 ${className}`}>
                <label className="text-xs font-medium text-slate-600">
                    {label}
                </label>

                <div className="relative">
                    {icon && (
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        className={`${baseInputClass} ${borderClass}`}
                        aria-invalid={!!error}
                        {...props}
                    />
                </div>

                {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
                {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
            </div>
        );
    }
);

InputField.displayName = "InputField";

export default InputField;
