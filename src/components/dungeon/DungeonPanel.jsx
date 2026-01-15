import React from 'react';
import { Monster } from './Monster';

export function DungeonPanel({ dungeon, onSelectTarget, currentTargetRank }) {
    const safeDungeon = dungeon || {};

    return (
        <div className="bg-[#1a0505] rounded-lg border border-red-900/30 p-3">
            {/* Header */}
            <div className="flex justify-between items-center text-red-500 uppercase text-[10px] tracking-widest font-bold mb-3">
                <h2>⚔️ 地城大廳</h2>
                <span className="text-gray-500">怪物牌庫: {safeDungeon.deckSize || 0}</span>
            </div>

            {/* Lane Display - Horizontal */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
                {/* Village (Left) */}
                <div className="flex-shrink-0 flex flex-col items-center w-12">
                    <span className="text-2xl">🏰</span>
                    <span className="text-[8px] text-gray-500">村莊</span>
                </div>

                {/* Rank 1 (Front) */}
                <LaneSlot
                    monster={safeDungeon.rank1}
                    label="Rank 1"
                    sublabel="前線"
                    isTarget={currentTargetRank === 1}
                    onClick={() => onSelectTarget?.(1)}
                />

                {/* Rank 2 (Middle) */}
                <LaneSlot
                    monster={safeDungeon.rank2}
                    label="Rank 2"
                    sublabel="中層"
                    isTarget={currentTargetRank === 2}
                    onClick={() => onSelectTarget?.(2)}
                />

                {/* Rank 3 (Deep) */}
                <LaneSlot
                    monster={safeDungeon.rank3}
                    label="Rank 3"
                    sublabel="深層"
                    isTarget={currentTargetRank === 3}
                    onClick={() => onSelectTarget?.(3)}
                />

                {/* Depths (Right) */}
                <div className="flex-shrink-0 flex flex-col items-center w-12">
                    <span className="text-2xl">🌑</span>
                    <span className="text-[8px] text-gray-500">深淵</span>
                </div>
            </div>
        </div>
    );
}

function LaneSlot({ monster, label, sublabel, isTarget, onClick }) {
    return (
        <div
            className="flex-1 min-w-[80px] max-w-[120px] flex flex-col items-center gap-1 cursor-pointer"
            onClick={onClick}
        >
            <div className={`
                w-full aspect-[3/4] rounded-lg border-2 bg-gray-900/50 flex items-center justify-center
                transition-all
                ${isTarget ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-gray-700 hover:border-gray-500'}
                ${monster ? '' : 'border-dashed'}
            `}>
                {monster ? (
                    <div className="text-center p-1">
                        <div className="text-2xl">👾</div>
                        <div className="text-[9px] text-gray-300 truncate w-full">{monster.name}</div>
                        <div className="text-[8px] text-red-400">❤️ {monster.currentHP}/{monster.monster?.hp}</div>
                    </div>
                ) : (
                    <span className="text-gray-600 text-xs">空</span>
                )}
            </div>
            <div className="text-center">
                <div className="text-[9px] text-gray-400">{label}</div>
                <div className="text-[7px] text-gray-600">{sublabel}</div>
            </div>
        </div>
    );
}
