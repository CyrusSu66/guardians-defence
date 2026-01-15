import React from 'react';
import { Card } from './Card';

export function Hand({ hand, onPlayCard, selectedIndices = [] }) {
    if (!hand || hand.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
                Empty Hand
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-gray-400 text-xs uppercase ml-1">Hand ({hand.length})</h3>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 px-1 min-h-[220px]">
                {hand.map((card, idx) => (
                    <Card
                        key={`${card.id}-${idx}`} // Use idx as fallback unique key if no runtimeId
                        card={card}
                        isSelected={selectedIndices.includes(idx)}
                        onClick={() => onPlayCard(idx)}
                    />
                ))}
            </div>
        </div>
    );
}
