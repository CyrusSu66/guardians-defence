import React from 'react';

/**
 * Main Layout Container
 * - Desktop: 3-column or Side-Main split
 * - Mobile: Flex column
 */
export function GameLayout({ children }) {
    return (
        <div className="min-h-screen bg-game-bg text-gray-200 font-sans selection:bg-gold selection:text-black overflow-hidden flex flex-col md:flex-row">
            {children}
        </div>
    );
}

export function SidebarContainer({ children }) {
    return (
        <aside className="w-full md:w-64 bg-[#111] border-b md:border-b-0 md:border-r border-gray-800 flex-shrink-0 flex flex-col p-4 gap-4 z-10">
            {children}
        </aside>
    );
}

export function MainStage({ children }) {
    return (
        <main className="flex-1 relative overflow-hidden flex flex-col bg-game-bg">
            {children}
        </main>
    );
}
