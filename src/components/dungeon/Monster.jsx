import React from 'react';

export function Monster({ monster, onClick, isTarget }) {
    if (!monster) return <div className="w-32 h-48 border-2 border-dashed border-gray-800 rounded bg-black/20" />;

    const { currentHP, monster: data } = monster;
    const maxHP = data.hp;
    const hpPercent = (currentHP / maxHP) * 100;

    return (
        <div
            onClick={onClick}
            className={`
                relative w-32 h-48 flex-shrink-0 rounded-lg border-2 bg-gray-900 overflow-hidden cursor-pointer transition-all
                ${isTarget ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105' : 'border-red-900 hover:border-red-700'}
            `}
        >
            {/* Header: Level & Name */}
            <div className="p-2 text-xs font-bold text-red-200 flex justify-between items-center bg-red-900/40 border-b border-red-800">
                <span className="w-5 h-5 flex items-center justify-center bg-red-950 rounded-full border border-red-500">
                    {data.level || "? منشور"}
                </span>
                <span className="truncate ml-1">{data.name}</span>
            </div>

            {/* Icon */}
            <div className="flex-1 flex items-center justify-center text-5xl">
                👾
            </div>

            {/* HP Bar */}
            <div className="absolute top-1/2 left-0 w-full px-2">
                <div className="h-1 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-red-500 transition-all" style={{ width: `${hpPercent}%` }} />
                </div>
            </div>

            {/* Stats Area */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/80 text-[10px] text-gray-300 absolute bottom-0 w-full">
                <div className="col-span-1 text-center border-r border-gray-700">
                    ❤️ {currentHP}/{maxHP}
                </div>
                <div className="col-span-1 text-center">
                    XP {data.xpGain}
                </div>

                {/* Light Requirement */}
                {data.lightReq > 0 && (
                    <div className="col-span-2 text-center text-yellow-500 font-bold bg-yellow-900/20 py-1">
                        ⚠️ Light Req: {data.lightReq}
                    </div>
                )}
            </div>
        </div>
    );
}
