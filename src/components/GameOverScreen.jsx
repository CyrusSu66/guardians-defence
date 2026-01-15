import React from 'react';

export function GameOverScreen({ score, onRestart }) {
    return (
        <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-5xl font-bold text-red-500 mb-4">GAME OVER</h1>
            <p className="text-gray-400 text-lg mb-2">防線已被突破...</p>

            <div className="my-8 p-6 bg-panel-bg rounded-lg border border-gray-700">
                <p className="text-gray-500 text-sm uppercase mb-2">Final Score</p>
                <p className="text-6xl font-bold text-gold">{score}</p>
            </div>

            <button
                onClick={onRestart}
                className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition"
            >
                再試一次
            </button>
        </div>
    );
}
