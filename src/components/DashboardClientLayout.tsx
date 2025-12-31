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
            <div className="min-h-dvh md:flex">
                {/* Mobile menu overlay */}
                <div
                    className={[
                        "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
                        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                    ].join(" ")}
                    onClick={close}
                    aria-hidden="true"
                />

                {/* Sidebar Container */}
                <aside
                    className={[
                        "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0",
                        isOpen ? "translate-x-0" : "-translate-x-full",
                    ].join(" ")}
                >
                    <Sidebar />
                </aside>

                {/* Content Area */}
                <div className="min-w-0 flex-1 flex flex-col min-h-dvh">
                    {children}
                </div>
            </div>
        </SidebarContext.Provider>
    );
}
