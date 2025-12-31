"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const close = useCallback(() => setIsOpen(false), []);

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
            {/* 
        Force dir="ltr" on the main container to ensure the sidebar stays on the left 
        even if the user's system/browser is set to RTL.
      */}
            <div dir="ltr" className="flex min-h-dvh bg-white flex-row">

                {/* DESKTOP SIDEBAR (LEFT) */}
                <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 h-screen sticky top-0 bg-white">
                    <Sidebar />
                </aside>

                {/* MOBILE SIDEBAR (DRAWER) */}
                <div
                    className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
                        }`}
                >
                    {/* Overlay */}
                    <div
                        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={close}
                    />
                    {/* Slider */}
                    <div
                        className={`absolute inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                            }`}
                    >
                        <Sidebar />
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}
