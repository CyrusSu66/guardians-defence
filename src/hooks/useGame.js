import { useState, useEffect } from 'react';

export function useGame() {
    // Initial state from the global game instance
    // We assume window.game is initialized before this hook is run
    const [gameState, setGameState] = useState(() => {
        if (!window.game) return null;
        return window.game.getState();
    });

    useEffect(() => {
        if (!window.game) return;

        // update function to be passed to subscribe
        const handleUpdate = (newState) => {
            setGameState({ ...newState }); // Spread to ensure new reference for React
        };

        const unsubscribe = window.game.subscribe(handleUpdate);

        // Force initial sync in case we missed an update
        setGameState(window.game.getState());

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return gameState;
}
