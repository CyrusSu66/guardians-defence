import React from 'react';

export function ActionSelectionScreen({ onVisitVillage, onEnterDungeon, onRest }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-game-bg to-[#0a0a0a]">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-200 mb-2">選擇行動</h2>
            <p className="text-gray-500 text-sm mb-8">本回合您要做什麼？</p>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">

                {/* Visit Village */}
                <ActionCard
                    icon="🏛️"
                    title="造訪村莊"
                    subtitle="經濟與建設"
                    description="打出卡牌獲得金幣，購買新卡片或升級英雄。"
                    color="blue"
                    onClick={onVisitVillage}
                />

                {/* Enter Dungeon */}
                <ActionCard
                    icon="⚔️"
                    title="進入地城"
                    subtitle="戰鬥與討伐"
                    description="選擇英雄與裝備，挑戰地城中的怪物。"
                    color="red"
                    onClick={onEnterDungeon}
                />

                {/* Rest */}
                <ActionCard
                    icon="💤"
                    title="休息整補"
                    subtitle="清理與回復"
                    description="獲得 1 XP，並可銷毀一張手牌精簡牌庫。"
                    color="green"
                    onClick={onRest}
                />
            </div>
        </div>
    );
}

function ActionCard({ icon, title, subtitle, description, color, onClick }) {
    const colorMap = {
        blue: 'border-blue-600 hover:border-blue-400 hover:bg-blue-900/20',
        red: 'border-red-600 hover:border-red-400 hover:bg-red-900/20',
        green: 'border-green-600 hover:border-green-400 hover:bg-green-900/20',
    };

    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center p-6 rounded-xl border-2 bg-panel-bg
                transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                ${colorMap[color] || colorMap.blue}
            `}
        >
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{subtitle}</p>
            <p className="text-sm text-gray-400 text-center">{description}</p>
        </button>
    );
}
