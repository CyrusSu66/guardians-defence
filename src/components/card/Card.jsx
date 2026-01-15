import React from 'react';

// Global card info handler (set by CardInfoModal)
let showCardInfoGlobal = null;
export const setCardInfoHandler = (handler) => { showCardInfoGlobal = handler; };

export function Card({ card, onClick, isSelected, disabled, compact = false }) {
    if (!card) return <div className={`${compact ? 'w-20 h-28' : 'w-28 h-40'} bg-gray-900 rounded border border-gray-800`} />;

    const typeColor = getTypeColor(card.type);
    const borderColor = isSelected ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]' : `border-${typeColor}-600/50`;

    const handleInfoClick = (e) => {
        e.stopPropagation();
        if (showCardInfoGlobal) {
            showCardInfoGlobal(card);
        }
    };

    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`
                relative ${compact ? 'w-20 h-28' : 'w-28 h-40'} flex-shrink-0 rounded-lg border-2 bg-gray-800 
                transition-all duration-200 
                flex flex-col overflow-hidden select-none
                ${borderColor}
                ${!disabled ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                ${isSelected ? '-translate-y-2 z-10' : ''}
            `}
        >
            {/* Info Button */}
            <button
                onClick={handleInfoClick}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-700/80 hover:bg-blue-600 text-[10px] text-gray-300 hover:text-white z-20 flex items-center justify-center"
                title="查看詳情"
            >
                ⓘ
            </button>

            {/* Header: Cost & Name */}
            <div className={`p-1.5 ${compact ? 'text-[9px]' : 'text-xs'} font-bold text-white flex justify-between items-center bg-gray-900/80 border-b border-gray-700`}>
                <span className="text-gold text-[9px] w-4 h-4 flex items-center justify-center border border-gold/50 rounded-full">
                    {card.cost || 0}
                </span>
                <span className="truncate ml-1 flex-1 text-right">{card.name}</span>
            </div>

            {/* Icon */}
            <div className={`flex-1 flex items-center justify-center ${compact ? 'text-2xl' : 'text-3xl'} bg-gradient-to-b from-gray-800 to-gray-900`}>
                {getIcon(card)}
            </div>

            {/* Stats Area */}
            <div className={`grid grid-cols-2 gap-0.5 p-1 bg-gray-900/90 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
                {/* Attack */}
                {(card.attack > 0 || card.strength > 0) && (
                    <div className="col-span-2 flex justify-between text-red-400">
                        {card.attack > 0 && <span>⚔️{card.attack}</span>}
                        {card.strength > 0 && <span>💪{card.strength}</span>}
                    </div>
                )}

                {/* Magic / Light */}
                {(card.magic > 0 || card.light > 0) && (
                    <div className="col-span-2 flex justify-between text-blue-300">
                        {card.magic > 0 && <span>✨{card.magic}</span>}
                        {card.light > 0 && <span>💡{card.light}</span>}
                    </div>
                )}

                {/* Gold Value */}
                {card.goldValue > 0 && (
                    <div className="col-span-2 text-center text-gold font-bold">
                        +{card.goldValue} 💰
                    </div>
                )}
            </div>
        </div>
    );
}

function getTypeColor(type) {
    switch (type) {
        case 'Hero': return 'red';
        case 'Weapon': return 'orange';
        case 'Item': return 'blue';
        case 'Spell': return 'purple';
        case 'MagicBook': return 'purple';
        case 'Food': return 'green';
        case 'LightItem': return 'yellow';
        default: return 'gray';
    }
}

function getIcon(card) {
    if (card.icon) return card.icon;
    switch (card.type) {
        case 'Hero': return '🛡️';
        case 'Weapon': return '⚔️';
        case 'Item': return '🎒';
        case 'Spell': return '📜';
        case 'MagicBook': return '📖';
        case 'Food': return '🍖';
        case 'LightItem': return '🔥';
        default: return '❓';
    }
}
