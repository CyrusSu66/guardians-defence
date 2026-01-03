/**
 * 《守護者防線：雷霆遺產》核心控制器 (v3.6)
 * 實作規則：架構重構為 Controller-Engine 模式，提升模組化程度。
 */

import { CARDPOOL, GameState } from './data.js';
import { UIManager } from './ui.js';
import { CombatEngine } from './engine/CombatEngine.js';
import { VillageEngine } from './engine/VillageEngine.js';
import { DungeonEngine } from './engine/DungeonEngine.js';
import { CardEngine } from './engine/CardEngine.js';

class GuardiansDefenceGame {
    constructor() {
        this.version = "v3.26.0-beta.2"; // Branch: fix-monster-breach & Resize

        // 初始化引擎
        this.cardEngine = new CardEngine(this);
        this.combatEngine = new CombatEngine(this);
        this.villageEngine = new VillageEngine(this);
        this.dungeonEngine = new DungeonEngine(this);

        this.ui = new UIManager(this);
        this.init();
        this.setupErrorHandler();
    }

    setupErrorHandler() {
        window.onerror = (msg, url, line) => {
            this.addLog(`[ERROR] ${msg} (Line ${line})`, 'danger');
        };
    }

    init() {
        this.state = GameState.IDLE;
        this.turn = 0;
        this.villageHP = 20;
        this.currentGold = 0;
        this.currentXP = 0;
        this.totalScore = 0;

        this.deck = [];
        this.hand = [];
        this.discard = [];
        this.playedCards = [];

        this.monsterDeck = [];
        this.dungeonHall = { rank1: null, rank2: null, rank3: null };

        this.marketItems = { basics: [], heroes: [], items: [], spells: [] };
        this.log = [];
        // v3.22: 3欄位戰鬥配置
        this.combat = { targetRank: null, selectedHeroIdx: null, selectedDamageIdx: null, selectedAuxIdx: null };

        this.currentAction = null;
        this.hasBought = false;
        this.hasDestroyed = false;
        this.selectedDestroyIdx = null;

        // v3.23.5: Ensure UI reflects Initial State (Hidden Panels)
        if (this.ui) this.ui.updateUI();
    }

    // --- 遊戲初始化 ---

    startNewGame() {
        try {
            console.log('[Game] startNewGame begun');
            this.addLog('正在初始系統資源...', 'info');
            this.init();
            console.log('[Game] init completed');
        } catch (e) {
            console.error('[Game] init failed:', e);
            alert('Init Failed: ' + e.message);
            return;
        }
        const startingIds = [
            'basic_regular_army', 'basic_regular_army', 'basic_regular_army',
            'basic_regular_army', 'basic_regular_army', 'basic_regular_army',
            'basic_torch', 'basic_torch',
            'basic_spear', 'basic_spear',
            'basic_rations', 'basic_rations'
        ];

        try {
            this.addLog('正在佈署初始牌堆...', 'info');
            this.deck = startingIds.map(id => this.getCardPoolItem(id));
            if (this.deck.includes(null)) throw new Error("部分初始卡片遺失");
            this.shuffle(this.deck);

            this.addLog('正在生成怪物巢穴...', 'info');
            this.monsterDeck = this.cardEngine.createMonsterDeck();

            this.addLog('正在偵測地城前線...', 'info');
            this.spawnNextMonster();

            this.addLog('守護者防線 v3.6.1 模組化引擎全面啟動！', 'success');
            this.refreshMarket();
            this.nextTurn();
        } catch (e) {
            this.addLog(`❌ 啟動失敗: ${e.message}`, 'danger');
        }
    }

    // --- 流程控制器 ---

    nextTurn() {
        this.turn++;
        this.currentGold = 0;
        this.playedCards = [];
        this.currentAction = null;
        this.hasBought = false;
        this.hasDestroyed = false;
        this.selectedDestroyIdx = null;
        this.state = GameState.DRAW;

        this.addLog(`【第 ${this.turn} 回合】開始`, 'info');
        this.drawCards(6);

        setTimeout(() => {
            this.state = GameState.VILLAGE;
            this.updateUI();
        }, 300);
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                if (this.discard.length === 0) break;
                this.deck = this.shuffleArray([...this.discard]);
                this.discard = [];
            }
            this.hand.push(this.deck.pop());
        }
        this.updateUI();
    }

    // --- 委派行為 (Delegation) ---

    // 卡牌與市集相關
    getCardPoolItem(id) { return this.cardEngine.getItem(id); }
    refreshMarket() { this.marketItems = this.cardEngine.refreshMarket(); this.updateUI(); }

    // 戰鬥相關
    getActiveAuras() { return this.combatEngine.getActiveAuras(); }
    calculateHeroCombatStats(hero, weapon, monster, lightPenalty, totalLight = 0, lightReq = 0, auxItem = null, heroStr = 0) {
        return this.combatEngine.calculateStats(hero, weapon, monster, lightPenalty, totalLight, lightReq, auxItem, heroStr);
    }
    performCombat() { this.combatEngine.perform(); }
    selectCombatTarget(rank) {
        if (this.state !== GameState.COMBAT) return;
        this.combat.targetRank = rank;
        this.updateUI();
    }

    // 村莊相關
    buyCard(cardId, cost) { this.villageEngine.buy(cardId, cost); }
    upgradeHero(cardId) { this.villageEngine.upgrade(cardId); }
    promoteRegularArmy(handIdx, marketHeroId) { this.villageEngine.promoteRegular(handIdx, marketHeroId); }
    confirmRestAndDestroy() { this.villageEngine.confirmRest(); }
    activateAllResources() { this.villageEngine.activateAllResources(); }

    // 地城相關
    spawnNextMonster() { this.dungeonEngine.spawn(); }
    monsterAdvance() { this.dungeonEngine.advance(); }
    processBreachEffect(monster) { this.dungeonEngine.processBreach(monster); }
    endTurnWithAdvance() { this.monsterAdvance(); }

    // --- 動作觸發 ---

    visitVillageAction() {
        this.state = GameState.VILLAGE;
        this.currentAction = 'VILLAGE';
        this.addLog('造訪村莊。請點擊手牌以啟用金幣與效果，產出總額後再進行一次購買。', 'info');
        this.updateUI();
    }

    restAction() {
        this.state = GameState.VILLAGE;
        this.currentAction = 'REST';
        this.currentXP += 1;
        this.addLog('休息整補，獲得 1 XP。您可以點擊一張手牌進行銷毀。', 'success');
        this.updateUI();
    }

    enterDungeonAction() {
        this.state = GameState.COMBAT;
        this.currentAction = 'DUNGEON';
        this.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: null };
        this.addLog('進入地城！正在準備戰鬥...', 'info');

        this.hand.forEach(card => {
            if (card.abilities && card.abilities.onDungeon) {
                this.triggerCardEffect(card.abilities.onDungeon, card.name);
            }
        });
        this.updateUI();
    }

    finishAction() {
        this.addLog('行動確認，地城正在推移...', 'info');
        this.playedCards.forEach(c => this.discard.push(c));
        this.playedCards = [];
        this.endTurnWithAdvance();
    }

    playCard(handIdx) {
        // v3.26: Intercept for Grail Knight Destroy Effect
        if (this.pendingGrailEffect) {
            this.resolveGrailDestroy(handIdx);
            return;
        }

        const card = this.hand[handIdx];
        if (!card) return;

        if (this.currentAction === 'VILLAGE') {
            // Refactor v3.25: Strict Play Logic
            const hasGold = (card.goldValue && card.goldValue > 0);
            const hasAbility = (card.abilities && card.abilities.onVillage);

            if (!hasGold && !hasAbility) {
                // Case C: No Value, No Ability -> Do Nothing
                return;
            }

            if (hasAbility) {
                // Case A: Ability -> Confirm & Execute
                if (confirm(`是否發動 ${card.name} 的效果？`)) {
                    const played = this.hand.splice(idx, 1)[0];
                    this.playedCards.push(played);
                    this.triggerCardEffect(played.abilities.onVillage);
                    this.updateUI();
                }
                return;
            }

            if (hasGold) {
                // Case B: Value Only -> Move to Played & Add Gold
                const played = this.hand.splice(idx, 1)[0];
                this.playedCards.push(played);
                this.currentGold += played.goldValue;
                this.addLog(`啟動「${played.name}」，獲得 ${played.goldValue} 金幣。`, 'success');
                this.updateUI();
                return;
            }

        } else if (this.currentAction === 'REST') {
            if (this.hasDestroyed) return this.addLog('本回合休息已執行過銷毀。', 'warning');
            if (this.selectedDestroyIdx === idx) {
                this.selectedDestroyIdx = null; // For REST action
                this.pendingGrailEffect = false; // v3.26: For Grail Knight destroy effect
            } else {
                this.selectedDestroyIdx = idx;
                this.addLog(`已選取「${card.name}」，點擊下方確認按鈕以執行銷毀。`, 'info');
            }
            this.updateUI();
        }
    }

    // v3.26: Handle Grail Knight Destroy Selection
    resolveGrailDestroy(handIdx) {
        const card = this.hand[handIdx];
        if (!card) return;

        // Execute Destroy
        this.hand.splice(handIdx, 1);
        this.addLog(`✨ 聖杯儀式：已銷毀「${card.name}」。`, 'success');

        // Execute Heal (Standard 1)
        this.villageHP = Math.min(20, this.villageHP + 1);
        this.addLog('🛡️ 魔法護罩修復 +1 (當前: ' + this.villageHP + ')', 'success');

        // Reset State
        this.pendingGrailEffect = false;
        this.updateUI();
    }

    /**
     * Revert a played card (Undo)
     * Only for cards with Gold Value (no abilities)
     */
    unplayCard(playedIdx) {
        const card = this.playedCards[playedIdx];
        if (!card) return;

        // Security Check: Cannot undo if ability was triggered (assumed complex state change)
        // For now, if it has onVillage ability, we deny undo.
        if (card.abilities && card.abilities.onVillage) {
            return this.addLog('無法復原已發動效果的卡牌。', 'warning');
        }

        if (card.goldValue > 0) {
            this.currentGold -= card.goldValue;
            this.playedCards.splice(playedIdx, 1);
            this.hand.push(card);
            this.addLog(`已復原「${card.name}」，扣除 ${card.goldValue} 金幣。`, 'info');
            this.updateUI();
        }
    }

    triggerCardEffect(effectKey, sourceName = '未知來源') {
        if (!effectKey) return;
        if (effectKey === 'destroy_disease') {
            const dIdx = this.hand.findIndex(c => c.id === 'spec_disease');
            if (dIdx !== -1) {
                this.hand.splice(dIdx, 1);
                this.addLog(`✨ ${sourceName}：已移除手牌中的疾病卡。`, 'success');
            } else {
                this.addLog(`✨ ${sourceName}：未發現可移除的疾病。`, 'info');
            }
        } else if (effectKey === 'draw_1') {
            this.addLog(`✨ ${sourceName}：觸發抽牌效果。`, 'success');
            this.drawCards(1);
        } else if (effectKey === 'draw_2') {
            this.addLog(`✨ ${sourceName}：激發潛能，抽 2 張牌！`, 'success');
            this.drawCards(2);
        } else if (effectKey === 'gain_1xp') {
            this.currentXP += 1;
            this.addLog(`✨ ${sourceName}：戰鬥經驗增加 1 XP。`, 'success');
        } else if (effectKey === 'buy_light') {
            this.addLog(`✨ ${sourceName}：戰勝獲得補給，本回合可額外購買光源道具（未實作連動）。`, 'info');
        } else if (effectKey === 'heal_2') {
            this.villageHP = Math.min(20, this.villageHP + 2);
            this.addLog(`🛡️ ${sourceName}：護罩大幅修復 +2 (當前: ${this.villageHP})`, 'success');
        } else if (effectKey === 'destroy_any_heal_1') {
            this.pendingGrailEffect = true;
            this.addLog(`✨ ${sourceName}：請點擊一張手牌進行銷毀與修復。`, 'action');
            this.updateUI(); // To show hint in UI
        }
    }

    // --- 實用工具 ---

    forcePlayerDiscard(count) {
        for (let i = 0; i < count; i++) {
            if (this.hand.length > 0) {
                const idx = Math.floor(Math.random() * this.hand.length);
                const removed = this.hand.splice(idx, 1)[0];
                this.discard.push(removed);
                this.addLog(`💔 受到傷害，失去手牌：「${removed.name}」`, 'danger');
            }
        }
        this.updateUI();
    }

    forceTypeDiscard(types, count) {
        let discarded = 0;
        for (let i = this.hand.length - 1; i >= 0; i--) {
            if (types.includes(this.hand[i].type)) {
                this.discard.push(this.hand.splice(i, 1)[0]);
                discarded++;
                if (discarded >= count) break;
            }
        }
        this.updateUI();
    }

    // v3.22.14: 破壞手牌 (移除出遊戲)
    forcePlayerDestroy(count, targetTypes = null) {
        let destroyed = 0;
        // 如果指定類型
        if (targetTypes) {
            for (let i = this.hand.length - 1; i >= 0; i--) {
                const card = this.hand[i];
                // 檢查類型 (type) 或子類型 (subTypes)
                const isMatch = targetTypes.includes(card.type) || (card.subTypes && card.subTypes.some(t => targetTypes.includes(t)));
                if (isMatch) {
                    const removed = this.hand.splice(i, 1)[0];
                    this.addLog(`💔 遭受破壞，${removed.name} 已被移除。`, 'danger');
                    destroyed++;
                    if (destroyed >= count) break;
                }
            }
        } else {
            // 隨機破壞
            for (let i = 0; i < count; i++) {
                if (this.hand.length > 0) {
                    const idx = Math.floor(Math.random() * this.hand.length);
                    const removed = this.hand.splice(idx, 1)[0];
                    this.addLog(`💔 遭受破壞，${removed.name} 已被移除。`, 'danger');
                }
            }
        }
        this.updateUI();
    }

    showDeckModal(type) {
        if (!this.ui) return;
        const list = type === 'deck' ? [...this.deck] : [...this.discard];
        const title = type === 'deck' ? '查看牌庫 (隨機順序)' : '查看棄牌堆';
        if (type === 'deck') this.shuffle(list);
        this.ui.renderDeckView(title, list);
    }

    shuffleArray(array) {
        const a = [...array];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    addLog(msg, type) {
        this.log.push({ message: msg, type });
        // if (this.log.length > 50) this.log.shift(); // Optional: limit log size but keep old ones for a bit? User said "scroll to old". Keep all? Or limit to 50? Current is 20.
        // User said "can scroll to check old messages", implies persistence.
        // Let's increase limit to 50 for now.
        if (this.log.length > 50) this.log.shift();
        this.updateUI();
    }

    updateUI() {
        if (this.ui) this.ui.updateUI();
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        this.updateUI();
        if (this.ui) this.ui.showGameOver(this.totalScore);
    }
}

window.game = new GuardiansDefenceGame();
