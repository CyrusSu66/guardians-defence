import React from 'react';

export function Sidebar({ state }) {
    if (!state) return null;
    const { resources, meta } = state;

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Brand */}
            <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">
                    GD
                </h1>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Guardians Defence</span>
                <span className="text-[10px] text-gray-600">{meta.version}</span>
            </div>

            {/* Stats Container */}
            <div className="flex flex-row md:flex-col gap-4 justify-between md:justify-start">

                {/* Shield HP */}
                <div className="flex-1 bg-panel-bg p-3 rounded border border-gray-800 relative group transition hover:border-blue-900">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🛡️</span>
                        <span className="text-xs text-blue-400 font-bold uppercase">Shield</span>
                    </div>
                    <div className="text-2xl font-bold text-white tracking-wider">{resources.hp}</div>

                    {/* Progress Bar (Visual Only for now) */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 rounded-b overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${(resources.hp / 20) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Turn Count */}
                <div className="flex-1 bg-panel-bg p-3 rounded border border-gray-800">
                    <div className="text-xs text-gray-500 mb-1 uppercase">Turn</div>
                    <div className="text-xl font-bold text-gray-200">{meta.turn}</div>
                </div>

                {/* XP / Score */}
                <div className="flex-1 bg-panel-bg p-3 rounded border border-gray-800">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xs text-yellow-600 mb-1 uppercase">Gold</div>
                            <div className="text-lg font-bold text-gold">{resources.gold}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500">XP {resources.xp}</div>
                            <div className="text-[10px] text-gray-500">VP {resources.score}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
