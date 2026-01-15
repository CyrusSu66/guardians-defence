import React from 'react';
import { Card } from '../card/Card';

export function VillagePanel({ market, currentGold, onBuy }) {
    // Defensive: ensure market and its arrays exist
    const safeMarket = market || {};

    // Market structure from CardEngine.refreshMarket():
    // { basics, heroes, attackItems, dungeonItems, otherItems }
    const sections = [
        { title: '基礎卡', items: safeMarket.basics || [], color: 'gray' },
        { title: '英雄', items: safeMarket.heroes || [], color: 'red' },
        { title: '攻擊道具', items: safeMarket.attackItems || [], color: 'orange' },
        { title: '地城道具', items: safeMarket.dungeonItems || [], color: 'yellow' },
        { title: '其他道具', items: safeMarket.otherItems || [], color: 'purple' },
    ];

    return (
        <div className="flex flex-col gap-4 p-4 bg-[#0a1a1a] rounded-lg border border-blue-900/30">
            <div className="flex justify-between items-center text-blue-400 uppercase text-xs tracking-widest font-bold">
                <h2>🏛️ 村莊市集</h2>
                <span className="text-gold">金幣: {currentGold}</span>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                {sections.map(section => (
                    <div key={section.title}>
                        <h3 className="text-gray-500 text-[10px] uppercase mb-2 border-b border-gray-800 pb-1 sticky top-0 bg-[#0a1a1a]">
                            {section.title} ({section.items.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {section.items.map((item, idx) => (
                                <div key={item.id || idx} className="relative group">
                                    <Card
                                        card={item}
                                        disabled={item.cost > currentGold}
                                        compact={true}
                                    />
                                    {/* Buy Overlay */}
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <button
                                            disabled={item.cost > currentGold}
                                            onClick={() => onBuy(item.id, item.cost)}
                                            className="px-3 py-1 bg-gold text-black font-bold rounded text-xs hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            購買 ({item.cost}💰)
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {section.items.length === 0 && (
                                <span className="text-gray-600 text-xs italic">暫無庫存</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
