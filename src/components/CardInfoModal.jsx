import React, { useState, useEffect } from 'react';
import { setCardInfoHandler } from './card/Card';

export function CardInfoModal() {
    const [card, setCard] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Register handler with Card component
    useEffect(() => {
        setCardInfoHandler((cardData) => {
            setCard(cardData);
            setIsOpen(true);
        });
        return () => setCardInfoHandler(null);
    }, []);

    if (!isOpen || !card) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="bg-gray-900 rounded-xl border border-gray-700 max-w-sm w-full p-5 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h2 className="text-lg font-bold text-white">{card.name}</h2>
                        <p className="text-xs text-gray-500">
                            {card.type}
                            {card.hero && ` - Lv.${card.hero.level}`}
                            {card.subTypes && ` (${card.subTypes.join(', ')})`}
                        </p>
                    </div>
                    <span className="text-gold text-lg">{card.cost || 0}💰</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-3 text-center text-xs">
                    {card.attack > 0 && <Stat icon="⚔️" value={card.attack} label="攻擊" color="text-red-400" />}
                    {card.strength > 0 && <Stat icon="💪" value={card.strength} label="力量" color="text-orange-400" />}
                    {card.magic > 0 && <Stat icon="✨" value={card.magic} label="魔法" color="text-purple-400" />}
                    {card.light > 0 && <Stat icon="💡" value={card.light} label="光照" color="text-yellow-400" />}
                    {card.goldValue > 0 && <Stat icon="🪙" value={`+${card.goldValue}`} label="金幣" color="text-yellow-300" />}
                </div>

                {/* Description */}
                {card.desc && (
                    <div className="bg-gray-800 rounded p-3 text-sm text-gray-300 mb-3 leading-relaxed">
                        {card.desc}
                    </div>
                )}

                {/* Abilities */}
                {card.abilities && Object.keys(card.abilities).length > 0 && (
                    <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-800/50 rounded">
                        <span className="font-bold text-blue-400">能力: </span>
                        {Object.entries(card.abilities).map(([key, val]) => (
                            <span key={key} className="mr-2">{key}</span>
                        ))}
                    </div>
                )}

                {/* Close */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200"
                >
                    關閉
                </button>
            </div>
        </div>
    );
}

function Stat({ icon, value, label, color }) {
    return (
        <div className="p-2 bg-gray-800 rounded">
            <div className={`text-base ${color}`}>{icon} {value}</div>
            <div className="text-[9px] text-gray-500">{label}</div>
        </div>
    );
}
