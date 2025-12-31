import React from "react";
import Skeleton from "./Skeleton";

export default function FormSkeleton() {
    return (
        <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
            <div className="card overflow-hidden border border-slate-100 shadow-card">
                {/* Header Skeleton */}
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </div>

                {/* Body Skeleton */}
                <div className="grid gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)]">
                    {/* Left Column (Fields) */}
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
                                </div>
                            ))}
                        </div>

                        {/* Textarea substitute */}
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-28 w-full rounded-xl bg-slate-100" />
                        </div>
                    </div>

                    {/* Right Column (Sidebar/Avatar) */}
                    <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6">
                        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
                            <Skeleton className="h-3 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                        </div>
                        <div className="mt-8 space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
