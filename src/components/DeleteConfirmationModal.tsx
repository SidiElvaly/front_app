"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting?: boolean;
};

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false,
}: DeleteConfirmationModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    // Use portal to render at document root level to avoid z-index issues
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 p-4 pt-20 backdrop-blur-sm sm:items-center sm:pt-4">
            <div
                className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
                        <AlertTriangle className="h-6 w-6 text-rose-600" />
                    </div>

                    <div className="space-y-2">
                        <h3
                            id="modal-title"
                            className="text-lg font-bold text-slate-900 leading-tight"
                        >
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 sm:w-1/2"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50 sm:w-1/2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
