"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

type SidebarContextType = {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a DashboardClientLayout");
    }
    return context;
}

export default function DashboardClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    // Close sidebar on window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close }}>
            <div className="min-h-dvh md:flex overflow-x-hidden">
                {/* Content Area - Rendered first in DOM for focus/accessibility, 
            but Topbar has higher z-index so it's clickable when Sidebar is closed. */}
                <div className="min-w-0 flex-1 flex flex-col min-h-dvh">
                    {children}
                </div>

                {/* Mobile menu overlay - Higher z-index to cover content when open */}
                <div
                    className={[
                        "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden",
                        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                    ].join(" ")}
                    onClick={close}
                    aria-hidden="true"
                />

                {/* Sidebar Container - Highest z-index */}
                <aside
                    className={[
                        "fixed inset-y-0 left-0 z-[70] w-72 transition-all duration-300 ease-in-out",
                        "md:static md:w-64 md:translate-x-0 md:opacity-100 md:visible md:pointer-events-auto",
                        isOpen
                            ? "translate-x-0 opacity-100 visible pointer-events-auto"
                            : "-translate-x-full opacity-0 invisible pointer-events-none",
                    ].join(" ")}
                >
                    <Sidebar />
                </aside>
            </div>
        </SidebarContext.Provider>
    );
}
