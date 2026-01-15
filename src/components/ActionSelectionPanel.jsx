import React from 'react';

/**
 * ActionSelectionPanel - Shown INLINE (not fullscreen)
 * Allows player to see dungeon and hand while choosing action
 */
export function ActionSelectionPanel({ onVisitVillage, onEnterDungeon, onRest }) {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-lg border border-gray-700 min-h-[200px]">
            {/* Title */}
            <h2 className="text-lg font-bold text-gray-200 mb-1">選擇本回合行動</h2>
            <p className="text-gray-500 text-xs mb-6">觀察地城威脅與手牌資源，決定行動方針</p>

            {/* Action Buttons - Horizontal on Desktop */}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">

                {/* Visit Village */}
                <button
                    onClick={onVisitVillage}
                    className="flex-1 flex items-center gap-3 p-4 rounded-lg border-2 border-blue-700 bg-blue-900/30 hover:bg-blue-800/50 hover:border-blue-500 transition-all"
                >
                    <span className="text-3xl">🏛️</span>
                    <div className="text-left">
                        <h3 className="text-white font-bold">造訪村莊</h3>
                        <p className="text-blue-300 text-xs">啟用資源、購買卡片</p>
                    </div>
                </button>

                {/* Enter Dungeon */}
                <button
                    onClick={onEnterDungeon}
                    className="flex-1 flex items-center gap-3 p-4 rounded-lg border-2 border-red-700 bg-red-900/30 hover:bg-red-800/50 hover:border-red-500 transition-all"
                >
                    <span className="text-3xl">⚔️</span>
                    <div className="text-left">
                        <h3 className="text-white font-bold">進入地城</h3>
                        <p className="text-red-300 text-xs">選擇英雄、挑戰怪物</p>
                    </div>
                </button>

                {/* Rest */}
                <button
                    onClick={onRest}
                    className="flex-1 flex items-center gap-3 p-4 rounded-lg border-2 border-green-700 bg-green-900/30 hover:bg-green-800/50 hover:border-green-500 transition-all"
                >
                    <span className="text-3xl">💤</span>
                    <div className="text-left">
                        <h3 className="text-white font-bold">休息整補</h3>
                        <p className="text-green-300 text-xs">+1 XP、可銷毀卡片</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
