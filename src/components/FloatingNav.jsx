import React from 'react';

export function FloatingNav({ sections }) {
    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fixed left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 md:hidden">
            {sections.map(section => (
                <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`
                        w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg
                        ${section.color} border border-white/20
                        active:scale-90 transition-transform
                    `}
                    title={section.label}
                >
                    {section.icon}
                </button>
            ))}
        </div>
    );
}

export const GAME_SECTIONS = [
    { id: 'section-dungeon', icon: '👾', label: '地城', color: 'bg-red-800' },
    { id: 'section-action', icon: '🎯', label: '行動', color: 'bg-blue-800' },
    { id: 'section-hand', icon: '🃏', label: '手牌', color: 'bg-green-800' },
];
