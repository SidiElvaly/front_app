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
            <div className="flex min-h-dvh bg-white flex-row overflow-hidden">
                {/* DESKTOP SIDEBAR (LEFT) */}
                <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 h-screen sticky top-0">
                    <Sidebar />
                </aside>

                {/* MOBILE SIDEBAR (DRAWER) - Only render when open to prevent blocking */}
                {isOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-black/40 animate-in fade-in duration-300"
                            onClick={close}
                        />
                        {/* Slider */}
                        <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                            <Sidebar />
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 max-h-screen">
                    <main className="flex-1 overflow-y-auto overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}
