/**
 * 《守護者防線：雷霆遺產》核心控制器 (v3.6)
 * 實作規則：架構重構為 Controller-Engine 模式，提升模組化程度。
 */

import { CARDPOOL, GameState, getCardById } from './data.js';
import { UIManager } from './ui.js';
import { CombatEngine } from './engine/CombatEngine.js';
import { VillageEngine } from './engine/VillageEngine.js';
import { DungeonEngine } from './engine/DungeonEngine.js';
import { CardEngine } from './engine/CardEngine.js';

class GuardiansDefenceGame {
    constructor() {
        this.version = "v3.26 Final"; // Stable Release

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
        // Combat Slots: Hero, Weapon, Aux, Target
        this.combat = { targetRank: null, selectedHeroIdx: null, selectedDamageIdx: null, selectedAuxIdx: null };

        this.currentAction = null;
        this.hasBought = false;
        this.hasDestroyed = false;
        this.selectedDestroyIdx = null;

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
            this.dungeonEngine.spawn();

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

        // v3.27: Spawn monster AFTER drawing cards, so breach effects hit the correct hand
        this.dungeonEngine.spawn();

        setTimeout(() => {
            this.state = GameState.VILLAGE;
            this.updateUI();
        }, 300);
    }

    drawCards(count) {
        // v3.26: Bag of Holding - Retrieve saved cards first
        if (this.savedCards && this.savedCards.length > 0) {
            this.addLog(`🎒 次元背包：取回了 ${this.savedCards.length} 張卡片。`, 'info');
            this.savedCards.forEach(c => this.hand.push(c));
            this.savedCards = [];
        }

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
    // ... (omitted) ...

    // --- 動作觸發 ---
    // ... (omitted) ...

    visitVillageAction() {
        if (this.state !== GameState.DRAW && this.state !== GameState.VILLAGE) return;

        this.state = GameState.VILLAGE;
        this.currentAction = 'VILLAGE';
        this.addLog('隊伍進入了村莊市集。', 'info');
        this.updateUI();
    }

    restAction() {
        if (this.state !== GameState.DRAW && this.state !== GameState.VILLAGE) return;

        this.state = GameState.VILLAGE; // Recycle Village UI for Rest (showing Hand)
        this.currentAction = 'REST';

        // Grant Rest Reward
        this.currentXP += 1;
        this.addLog('全軍休整：精力恢復，獲得 1 XP。', 'success');
        this.addLog('您現在可以銷毀這回合的一張手牌，或者點擊「完成」結束回合。', 'info');
        this.updateUI();
    }

    // --- Delegated Actions (Village & Rest) ---

    confirmRestAndDestroy() {
        this.villageEngine.confirmRest();
    }

    buyCard(cardId, cost) {
        this.villageEngine.buy(cardId, cost);
    }

    promoteRegularArmy(handIdx, marketHeroId) {
        this.villageEngine.promoteRegular(handIdx, marketHeroId);
    }

    // --- Delegated Actions (Combat & Dungeon) ---

    selectCombatTarget(rank) {
        // Simple state update, handled here or in CombatEngine if complex
        if (this.currentAction !== 'DUNGEON') return;
        this.combat.targetRank = rank;
        this.updateUI();
    }

    performCombat() {
        this.combatEngine.perform();
    }

    // --- Data Accessors for UI ---

    getActiveAuras() {
        return this.dungeonEngine.getActiveAuras();
    }

    calculateHeroCombatStats(...args) {
        return this.combatEngine.calculateStats(...args);
    }

    enterDungeonAction() {
        this.state = GameState.COMBAT;
        this.currentAction = 'DUNGEON';
        this.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: null };
        this.addLog('進入地城！正在準備戰鬥...', 'info');

        // v3.26: Sentry Turret Logic (Auto Damage Rank 1)
        // v3.26: Data-Driven Dungeon Entry Effects
        // Optimized: Scans for 'onDungeon' ability regardless of card ID.
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

    endTurnWithAdvance() {
        this.dungeonEngine.advance();
    }

    playCard(handIdx) {
        // v3.26: Intercept for Merchant Trade Effect
        if (this.pendingMerchantTrade) {
            this.resolveMerchantTrade(handIdx);
            return;
        }

        // v3.26: Intercept for Priest Cleanse
        if (this.pendingPriestCleanse) {
            this.resolvePriestCleanse(handIdx);
            return;
        }

        // v3.26: Intercept for Bag Retain
        if (this.pendingBagRetain) {
            this.resolveBagRetain(handIdx);
            return;
        }

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
                    const played = this.hand.splice(handIdx, 1)[0];
                    this.playedCards.push(played);
                    this.triggerCardEffect(played.abilities.onVillage);
                    this.updateUI();
                }
                return;
            }

            if (hasGold) {
                // Case B: Value Only -> Move to Played & Add Gold
                const played = this.hand.splice(handIdx, 1)[0];
                this.playedCards.push(played);
                this.currentGold += played.goldValue;
                this.addLog(`啟動「${played.name}」，獲得 ${played.goldValue} 金幣。`, 'success');
                this.updateUI();
                return;
            }

        } else if (this.currentAction === 'DUNGEON') {
            // v3.26: Combat Slot Selection Logic

            // 1. Hero Selection
            if (card.hero) {
                if (this.combat.selectedHeroIdx === handIdx) {
                    this.combat.selectedHeroIdx = null; // Toggle Off
                } else {
                    this.combat.selectedHeroIdx = handIdx; // Select
                }
                this.updateUI();
                return;
            }

            // 2. Damage Source Selection (Weapon or Spell)
            if (card.equipment || card.type === 'Spell' || card.type === 'MagicBook') {
                if (this.combat.selectedDamageIdx === handIdx) {
                    this.combat.selectedDamageIdx = null;
                } else {
                    this.combat.selectedDamageIdx = handIdx;
                }
                this.updateUI();
                return;
            }

            // 3. Aux/Item Selection (Food, Potion, etc.)
            // Assuming everything else is an Item/Aux for now, or strictly check types
            if (card.type === 'Item' || card.type === 'Food' || card.type === 'Potion') {
                if (this.combat.selectedAuxIdx === handIdx) {
                    this.combat.selectedAuxIdx = null;
                } else {
                    this.combat.selectedAuxIdx = handIdx;
                }
                this.updateUI();
                return;
            }

            this.addLog('此卡片無法在戰鬥中使用。', 'warning');

        } else if (this.currentAction === 'REST') {
            if (this.hasDestroyed) return this.addLog('本回合休息已執行過銷毀。', 'warning');
            if (this.selectedDestroyIdx === handIdx) {
                this.selectedDestroyIdx = null; // For REST action
                this.pendingGrailEffect = false; // v3.26: For Grail Knight destroy effect
            } else {
                this.selectedDestroyIdx = handIdx;
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

    // v3.26: Handle Merchant Trade Selection
    resolveMerchantTrade(handIdx) {
        const card = this.hand[handIdx];
        if (!card) return;

        // Calculate Gold
        let gain = card.goldValue * 2;
        if (gain === 0) gain = 1; // Minimum 1 Gold

        // Execute Destroy
        this.hand.splice(handIdx, 1);
        this.currentGold += gain;
        this.addLog(`💰 非法交易：已銷毀「${card.name}」，獲得 ${gain} 金幣！`, 'success');

        // Reset State
        this.pendingMerchantTrade = false;
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

    // v3.26: Handle Priest Cleanse Selection
    resolvePriestCleanse(handIdx) {
        const card = this.hand[handIdx];
        if (!card) return;

        // Check Type
        const isCurse = card.type === 'Curse' || card.type === 'Disease';
        // Allow removing ANY card? No, description says Curse/Disease.
        if (!isCurse) {
            // If user selects wrong card, cancel or warn?
            // User might want to cancel effect. Assume picking non-curse = cancel?
            // Let's enforce: If not curse, show warning.
            return this.addLog('❌ 祭司只能淨化「詛咒」或「疾病」類別的卡片。', 'warning');
        }

        this.hand.splice(handIdx, 1);
        this.addLog(`✨ 祭司：已淨化並移除「${card.name}」。`, 'success');
        this.pendingPriestCleanse = false;
        this.updateUI();
    }

    // v3.26: Handle Bag of Holding Selection
    resolveBagRetain(handIdx) {
        const card = this.hand[handIdx];
        if (!card) return;

        // Move to savedCards
        if (!this.savedCards) this.savedCards = [];
        this.savedCards.push(this.hand.splice(handIdx, 1)[0]);
        this.addLog(`🎒 次元背包：已將「${card.name}」放入背包，下回合取回。`, 'info');
        this.pendingBagRetain = false;
        this.updateUI();
    }

    triggerCardEffect(effectKey, sourceName = '未知來源') {
        if (!effectKey) return;
        if (effectKey === 'mining_4') {
            // Find the card (source) to destroy. Since trigger is from playedCards (it was just played),
            // playCard logic already moved it to playedCards. We need to remove it from playedCards to "Destroy" it.
            // Wait, playCard moves to playedCards. If we want to destroy it self, we remove from playedCards.
            const playedIdx = this.playedCards.findIndex(c => c.abilities && c.abilities.onVillage === 'mining_4');
            if (playedIdx !== -1) {
                const removed = this.playedCards.splice(playedIdx, 1)[0];
                // Actually we shouldn't rely on findIndex if multiple pickaxes played.
                // But usually triggered immediately.
                // Let's trust normal flow: It's in playedCards. We remove it 'from game' (trash).
                // Or does 'Destroy' mean put in trash? Usually means remove from deck.
                // Yes, remove from playedCards (so it doesn't go to discard).
            }
            this.currentGold += 4;
            this.addLog(`⛏️ ${sourceName}：挖掘成功！獲得 4 金幣 (卡片已銷毀)。`, 'success');

        } else if (effectKey === 'cleanse_curse') {
            this.pendingPriestCleanse = true;
            this.addLog(`🙏 ${sourceName}：請選擇一張「詛咒」或「疾病」卡進行淨化。`, 'action');
            this.updateUI();

        } else if (effectKey === 'retain_card') {
            this.pendingBagRetain = true;
            this.addLog(`🎒 ${sourceName}：請選擇一張手牌放入背包。`, 'action');
            this.updateUI();

        } else if (effectKey === 'destroy_disease') {
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
        } else if (effectKey === 'gain_2xp') {
            this.currentXP += 2;
            this.addLog(`✨ ${sourceName}：戰鬥經驗增加 2 XP。`, 'success');
        } else if (effectKey === 'gain_3xp') {
            this.currentXP += 3;
            this.addLog(`✨ ${sourceName}：戰鬥經驗增加 3 XP。`, 'success');
        } else if (effectKey === 'gain_1vp') {
            this.totalScore += 1;
            this.addLog(`✨ ${sourceName}：獲得 1 VP (勝利點數)。`, 'success');
        } else if (effectKey === 'gain_2vp') {
            this.totalScore += 2;
            this.addLog(`✨ ${sourceName}：獲得 2 VP (勝利點數)。`, 'success');
        } else if (effectKey === 'gain_3vp') {
            this.totalScore += 3;
            this.addLog(`✨ ${sourceName}：獲得 3 VP (勝利點數)。`, 'success');
        } else if (effectKey === 'heal_2') {
            this.villageHP = Math.min(20, this.villageHP + 2);
            this.addLog(`🛡️ ${sourceName}：護罩大幅修復 +2 (當前: ${this.villageHP})`, 'success');
        } else if (effectKey === 'destroy_any_heal_1') {
            this.pendingGrailEffect = true;
            this.addLog(`✨ ${sourceName}：請點擊一張手牌進行銷毀與修復。`, 'action');
            this.updateUI(); // To show hint in UI
        } else if (effectKey === 'trade_trash_for_gold') {
            this.pendingMerchantTrade = true;
            this.addLog(`💰 ${sourceName}：請點擊一張手牌進行非法交易 (銷毀換取金幣)。`, 'action');
            this.updateUI();

        } else if (effectKey === 'turret_damage_1') {
            const monster = this.dungeonHall.rank1;
            if (monster) {
                const dmg = 1;
                monster.currentHP -= dmg;
                this.addLog(`🛡️ ${sourceName}：對 Rank 1 怪物 (${monster.name}) 造成 ${dmg} 點傷害！`, 'success');

                // Auto-Kill Check (Similar to original logic, simplified)
                if (monster.currentHP <= 0) {
                    this.addLog(`☠️ Rank 1 ${monster.name} 已被 ${sourceName} 殲滅！`, 'success');
                    this.currentXP += monster.monster.xpGain;
                    this.totalScore += 1 + (monster.vp || 0);
                    this.addLog(`🎉 獲得 ${monster.monster.xpGain} XP 與 1 VP！`, 'success');
                    this.dungeonHall.rank1 = null;
                }
            } else {
                // No Rank 1 monster, do nothing or log info
                // this.addLog(`🛡️ ${sourceName}：偵測範圍內無敵軍。`, 'info');
            }

        } else if (effectKey === 'gain_2_gold') {
            this.currentGold += 2;
            this.addLog(`📜 ${sourceName}生效：獲得額外 2 金幣！`, 'success');
        }
    }

    getCardPoolItem(id) {
        const item = getCardById(id);
        if (!item) {
            console.error(`[Game] getCardPoolItem: Cannot find card with ID '${id}'`);
            return null;
        }
        // Return a Deep Copy to prevent reference sharing issues
        return JSON.parse(JSON.stringify(item));
    }

    refreshMarket() {
        this.addLog('正在刷新契約與物資...', 'info');
        this.marketItems = this.cardEngine.refreshMarket();
        this.updateUI();
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
        if (this.log.length > 50) this.log.shift();
        this.updateUI();

        // Auto-scroll to bottom
        setTimeout(() => {
            const el = document.getElementById('gameLog');
            if (el && el.parentElement) {
                // Scroll the parent container (which has overflow-y: auto)
                el.parentElement.scrollTop = el.parentElement.scrollHeight;
            }
        }, 0);
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
