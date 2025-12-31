import React from "react";

type IconButtonProps = {
    title: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: "neutral" | "primary" | "danger";
    children: React.ReactNode;
    className?: string;
    type?: "button" | "submit" | "reset";
};

export default function IconButton({
    title,
    onClick,
    variant = "neutral",
    children,
    className = "",
    type = "button",
}: IconButtonProps) {
    const base =
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition shadow-sm";
    const styles =
        variant === "primary"
            ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            : variant === "danger"
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

    return (
        <button
            type={type}
            title={title}
            onClick={onClick}
            className={`${base} ${styles} ${className}`}
        >
            {children}
        </button>
    );
}
