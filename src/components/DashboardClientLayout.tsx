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

    // Close sidebar on window resize (if switching to desktop)
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
                {/* Sticky sidebar (desktop) + Mobile Drawer (handled by Sidebar component specific logic or props) */}

                {/* We pass isOpen state to Sidebar if it accepts props, or we let Sidebar consume context if we refactor it.
            For now, let's assume we will refactor Sidebar to accept props or strictly consume context.
            Let's pass context logic into Sidebar by just rendering it here. 
            The Sidebar component itself needs to change to respect 'isOpen'.
        */}
                <aside className="fixed inset-y-0 z-50 md:static md:h-dvh md:w-64 md:shrink-0">
                    <Sidebar />
                </aside>

                {/* Main content */}
                <div className="min-w-0 flex-1 flex flex-col min-h-dvh">
                    {children}
                </div>

                {/* Mobile overlay - strictly controlled by context state */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in"
                        onClick={close}
                        aria-hidden="true"
                    />
                )}
            </div>
        </SidebarContext.Provider>
    );
}
