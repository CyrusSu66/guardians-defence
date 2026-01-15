import React from 'react';

export function StartScreen({ onStart }) {
    return (
        <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center text-center p-8">
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold mb-4 animate-pulse">
                守護者防線
            </h1>
            <p className="text-gray-400 text-lg mb-8">Guardians Defence</p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-8 text-center mb-12 max-w-lg">
                <div>
                    <span className="text-4xl">🛡️</span>
                    <p className="text-xs text-gray-500 mt-1">Defend</p>
                </div>
                <div>
                    <span className="text-4xl">⚔️</span>
                    <p className="text-xs text-gray-500 mt-1">Fight</p>
                </div>
                <div>
                    <span className="text-4xl">🏰</span>
                    <p className="text-xs text-gray-500 mt-1">Build</p>
                </div>
            </div>

            {/* Start Button */}
            <button
                onClick={onStart}
                className="px-12 py-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white text-xl font-bold rounded-lg shadow-2xl transition-all transform hover:scale-105 border border-red-500"
            >
                開始守護
            </button>

            <p className="text-gray-600 text-xs mt-8">v3.28 — Powered by React</p>
        </div>
    );
}
