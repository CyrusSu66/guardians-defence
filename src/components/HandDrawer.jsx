import React, { useState } from 'react';
import { Hand } from './card/Hand';

export function HandDrawer({ hand, selectedIndices, onPlayCard, deckCount, discardCount }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`
            fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-700 
            transition-all duration-300 z-40
            ${isExpanded ? 'max-h-[60vh]' : 'max-h-[50px]'}
        `}>
            {/* Drawer Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 px-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="w-10 h-1 bg-gray-600 rounded-full" />
                    <span className="text-sm text-gray-300">
                        🎴 手牌 ({hand?.length || 0})
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📚 {deckCount}</span>
                    <span>🗑️ {discardCount}</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▲
                    </span>
                </div>
            </button>

            {/* Hand Content */}
            <div className={`
                overflow-hidden transition-all duration-300
                ${isExpanded ? 'opacity-100 p-4' : 'opacity-0 h-0 p-0'}
            `}>
                <Hand
                    hand={hand}
                    selectedIndices={selectedIndices}
                    onPlayCard={onPlayCard}
                />
            </div>
        </div>
    );
}
