import React from 'react';
import { Hand } from './card/Hand';

export function RestPanel({ hand, selectedDestroyIdx, onSelectCard, onConfirm }) {
    return (
        <div className="flex flex-col gap-6 p-4 bg-[#0a1a0a] rounded-lg border border-green-900/30 min-h-[300px]">
            <div className="flex justify-between items-center text-green-400 uppercase text-xs tracking-widest font-bold">
                <h2>💤 休息整補</h2>
                <span className="text-gold">+1 XP 已獲得</span>
            </div>

            <div className="text-gray-400 text-sm">
                <p>您可以選擇銷毀一張手牌來精簡牌庫。</p>
                <p className="text-gray-600 text-xs mt-1">點擊下方卡片選取，然後按「確認銷毀」。或直接按「跳過」結束回合。</p>
            </div>

            {/* Card Selection */}
            <div className="flex-1">
                <Hand
                    hand={hand}
                    selectedIndices={selectedDestroyIdx !== null ? [selectedDestroyIdx] : []}
                    onPlayCard={onSelectCard}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => onConfirm(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200"
                >
                    跳過 (不銷毀)
                </button>
                <button
                    onClick={() => onConfirm(true)}
                    disabled={selectedDestroyIdx === null}
                    className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white font-bold"
                >
                    確認銷毀
                </button>
            </div>
        </div>
    );
}
