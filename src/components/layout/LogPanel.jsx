import React, { useRef, useEffect } from 'react';

export function LogPanel({ logs }) {
    const logEndRef = useRef(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const safeLog = logs || [];

    const getLogColor = (type) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'danger': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 h-full max-h-[180px] flex flex-col">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-800 flex-shrink-0">
                <h3 className="text-[10px] text-gray-500 uppercase font-bold">📜 冒險日誌</h3>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {safeLog.slice(-20).map((entry, idx) => (
                    <div
                        key={idx}
                        className={`text-[11px] leading-relaxed ${getLogColor(entry.type)}`}
                    >
                        <span className="text-gray-600 mr-1">[{safeLog.length - 20 + idx + 1}]</span>
                        {entry.message}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
    );
}
