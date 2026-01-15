import React from 'react';
import { useGame } from './hooks/useGame';
import { GameLayout, SidebarContainer, MainStage } from './components/layout/GameLayout';
import { Sidebar as SidebarContent } from './components/layout/Sidebar';
import { LogPanel } from './components/layout/LogPanel';
import { DungeonPanel } from './components/dungeon/DungeonPanel';
import { VillagePanel } from './components/village/VillagePanel';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ActionSelectionPanel } from './components/ActionSelectionPanel';
import { RestPanel } from './components/RestPanel';
import { HandDrawer } from './components/HandDrawer';
import { FloatingNav, GAME_SECTIONS } from './components/FloatingNav';
import { CardInfoModal } from './components/CardInfoModal';

function App() {
    const gameState = useGame();

    // Loading
    if (!gameState) {
        return (
            <div className="min-h-screen bg-game-bg flex items-center justify-center text-gold animate-pulse">
                載入中...
            </div>
        );
    }

    // IDLE = Start Screen
    if (gameState.meta.state === 'IDLE') {
        return <StartScreen onStart={() => window.game.startNewGame()} />;
    }

    // GAME_OVER
    if (gameState.flags.isGameOver) {
        return <GameOverScreen score={gameState.resources.score} onRestart={() => window.game.startNewGame()} />;
    }

    // Active Gameplay
    const currentAction = gameState.meta.currentAction;
    const isActionSelection = gameState.meta.state === 'VILLAGE' && !currentAction;

    return (
        <>
            {/* Card Info Modal (Global) */}
            <CardInfoModal />

            {/* Floating Nav (Mobile) */}
            <FloatingNav sections={GAME_SECTIONS} />

            <GameLayout>
                {/* Sidebar (Desktop) */}
                <SidebarContainer className="hidden md:flex">
                    <SidebarContent state={gameState} />
                </SidebarContainer>

                {/* Main Stage */}
                <MainStage>
                    {/* Mobile Header */}
                    <div className="md:hidden p-2 bg-panel-bg border-b border-gray-800 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                            <span className="text-red-400">🛡️ {gameState.resources.hp}</span>
                            <span className="text-gold">💰 {gameState.resources.gold}</span>
                            <span className="text-blue-400">✨ {gameState.resources.xp}</span>
                        </div>
                        <span className="text-gray-400">Turn {gameState.meta.turn}</span>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden md:flex p-3 border-b border-gray-800 justify-between items-center bg-panel-bg">
                        <div className="text-gray-400 text-sm">
                            <span className="text-white font-bold mr-2">Turn {gameState.meta.turn}</span>
                            {currentAction === 'VILLAGE' && <span className="text-blue-400">🏛️ 村莊</span>}
                            {currentAction === 'DUNGEON' && <span className="text-red-400">⚔️ 戰鬥</span>}
                            {currentAction === 'REST' && <span className="text-green-400">💤 休息</span>}
                            {isActionSelection && <span className="text-yellow-400">🎯 選擇行動</span>}
                        </div>
                        {currentAction && (
                            <div className="flex gap-2">
                                {currentAction === 'DUNGEON' && (
                                    <button onClick={() => window.game.performCombat()}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">
                                        ⚔️ 攻擊
                                    </button>
                                )}
                                <button onClick={() => window.game.finishAction()}
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded">
                                    結束行動
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Content (with bottom padding for drawer) */}
                    <div className="flex-1 overflow-y-auto pb-16">

                        {/* Section 1: Dungeon */}
                        <section id="section-dungeon" className="p-3 border-b border-gray-800">
                            <DungeonPanel
                                dungeon={gameState.dungeon}
                                currentTargetRank={gameState.combat.targetRank}
                                onSelectTarget={(rank) => window.game.selectCombatTarget(rank)}
                            />
                        </section>

                        {/* Section 2: Action Area */}
                        <section id="section-action" className="p-3 border-b border-gray-800">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Log (Desktop) */}
                                <div className="hidden lg:block lg:col-span-1">
                                    <LogPanel logs={gameState.logs} />
                                </div>

                                {/* Main Panel */}
                                <div className="lg:col-span-2">
                                    {isActionSelection && (
                                        <ActionSelectionPanel
                                            onVisitVillage={() => window.game.visitVillageAction()}
                                            onEnterDungeon={() => window.game.enterDungeonAction()}
                                            onRest={() => window.game.restAction()}
                                        />
                                    )}
                                    {currentAction === 'VILLAGE' && (
                                        <VillagePanel
                                            market={gameState.market}
                                            currentGold={gameState.resources.gold}
                                            onBuy={(id, cost) => window.game.buyCard(id, cost)}
                                        />
                                    )}
                                    {currentAction === 'DUNGEON' && (
                                        <div className="bg-[#1a0505] rounded-lg border border-red-900/30 p-4">
                                            <h3 className="text-red-400 text-sm font-bold mb-2">⚔️ 戰鬥配置</h3>
                                            <p className="text-gray-400 text-xs mb-3">點擊上方怪物選擇目標，展開手牌選擇英雄/武器</p>
                                            <div className="flex gap-4 text-xs">
                                                <span>目標: <b className="text-red-400">{gameState.combat.targetRank ? `Rank ${gameState.combat.targetRank}` : '未選'}</b></span>
                                                <span>英雄: <b className={gameState.combat.selectedHeroIdx !== null ? 'text-green-400' : 'text-gray-500'}>{gameState.combat.selectedHeroIdx !== null ? '已選' : '未選'}</b></span>
                                            </div>
                                            {/* Mobile Attack Button */}
                                            <div className="mt-4 md:hidden flex gap-2">
                                                <button onClick={() => window.game.performCombat()}
                                                    className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded">
                                                    ⚔️ 攻擊
                                                </button>
                                                <button onClick={() => window.game.finishAction()}
                                                    className="px-4 py-2 bg-gray-700 text-gray-200 text-sm rounded">
                                                    撤退
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {currentAction === 'REST' && (
                                        <RestPanel
                                            hand={gameState.inventory.hand}
                                            selectedDestroyIdx={gameState.flags.selectedDestroyIdx}
                                            onSelectCard={(idx) => window.game.playCard(idx)}
                                            onConfirm={(doDestroy) => {
                                                if (doDestroy) window.game.confirmRestAndDestroy();
                                                else window.game.finishAction();
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Mobile Log (Collapsed) */}
                        <section className="lg:hidden p-3 border-b border-gray-800">
                            <LogPanel logs={gameState.logs} />
                        </section>
                    </div>
                </MainStage>
            </GameLayout>

            {/* Hand Drawer (Bottom) */}
            <div id="section-hand">
                <HandDrawer
                    hand={gameState.inventory.hand}
                    selectedIndices={[
                        gameState.combat.selectedHeroIdx,
                        gameState.combat.selectedDamageIdx,
                        gameState.combat.selectedAuxIdx,
                        gameState.flags.selectedDestroyIdx,
                    ].filter(x => x !== null && x !== undefined)}
                    onPlayCard={(idx) => window.game.playCard(idx)}
                    deckCount={gameState.inventory.deckCount}
                    discardCount={gameState.inventory.discardCount}
                />
            </div>
        </>
    );
}

export default App;
