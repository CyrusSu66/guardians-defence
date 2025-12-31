/**
 * 《守護者防線：雷霆遺產》核心邏輯 (v3.1.1)
 * 實作規則：手動啟用手牌效果、4+4+4 市集佈局、休息限額銷毀 (1張)、戰鬥持續性優化。
 */

import { CARDPOOL, GameState } from './data.js';
import { UIManager } from './ui.js';

class GuardiansDefenceGame {
    constructor() {
        this.version = "v3.1.1.260101"; // 流程與市集精細化重構
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
        this.maxVillageHP = 20;
        this.currentGold = 0;
        this.currentXP = 0;
        this.totalScore = 0;

        this.deck = [];
        this.hand = [];
        this.discard = [];
        this.playedCards = []; // 本回合已啟用的卡片

        this.monsterDeck = [];
        this.dungeonHall = { rank1: null, rank2: null, rank3: null };

        this.marketItems = { basics: [], heroes: [], items: [], spells: [] };
        this.log = [];
        this.combat = null;

        this.currentAction = null; // null, 'VILLAGE', 'REST', 'DUNGEON'
        this.hasBought = false;    // 本回合是否已購買
        this.hasDestroyed = false; // 本回合休息是否已銷毀
        this.selectedDestroyIdx = null; // v3.1.3 新增：休息時預備銷毀的索引
    }

    // --- 遊戲初始化 ---

    startNewGame() {
        this.init();
        const startingIds = [
            'basic_regular_army', 'basic_regular_army', 'basic_regular_army',
            'basic_regular_army', 'basic_regular_army', 'basic_regular_army',
            'basic_torch', 'basic_torch',
            'basic_spear', 'basic_spear',
            'basic_rations', 'basic_rations'
        ];
        this.deck = startingIds.map(id => this.getCardPoolItem(id));
        this.shuffle(this.deck);

        this.createMonsterDeck();
        this.spawnNextMonster();

        this.addLog('守護者防線 v3.1.1 核心重裝上陣！', 'success');
        this.refreshMarket();
        this.nextTurn();
    }

    getCardPoolItem(id) {
        for (const cat in CARDPOOL) {
            const found = CARDPOOL[cat].find(c => c.id === id);
            if (found) return JSON.parse(JSON.stringify(found));
        }
        return null;
    }

    createMonsterDeck() {
        const pool = CARDPOOL.monsters;
        const t1 = this.shuffleArray(pool.filter(m => m.monster.tier === 1));
        const t2 = this.shuffleArray(pool.filter(m => m.monster.tier === 2));
        const t3 = this.shuffleArray(pool.filter(m => m.monster.tier === 3));
        const s1 = t1.slice(0, 10);
        const s2 = t2.slice(0, 10);
        const s3 = t3.slice(0, 10);
        const bossIdx = Math.floor(Math.random() * s3.length);
        s3[bossIdx].hasThunderstone = true;
        s3[bossIdx].monster.hp += 3;
        s3[bossIdx].name += " ⚡";
        this.monsterDeck = [...s1, ...s2, ...s3].reverse();
    }

    // --- 核心流程 ---

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

        // 每 3 回合刷新一次隨機市場 (v3.1)
        if (this.turn % 3 === 0) {
            this.refreshMarket();
            this.addLog('市集貨源已更新！', 'success');
        }

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

    // --- 怪物效果與傷害 ---

    processBreachEffect(monster) {
        if (!monster || !monster.abilities || !monster.abilities.onBreach) return;
        this.addLog(`⚠️ ${monster.name} 的進場威壓！`, 'warning');
        const effect = monster.abilities.onBreach;
        if (effect === 'gain_disease') {
            const disease = this.getCardPoolItem('spec_disease');
            if (disease) this.discard.push(disease);
        } else if (effect === 'discard_1') {
            this.forcePlayerDiscard(1);
        } else if (effect === 'discard_magic_or_item') {
            this.forceTypeDiscard(['Spell', 'Item', 'Weapon'], 1);
        }
    }

    getActiveAuras() {
        const auras = { strMod: 0, atkMod: 0, lightReqMod: 0 };
        [this.dungeonHall.rank1, this.dungeonHall.rank2, this.dungeonHall.rank3].forEach(m => {
            if (!m || !m.abilities || !m.abilities.aura) return;
            const effect = m.abilities.aura;
            if (effect === 'str_minus_1') auras.strMod -= 1;
            if (effect === 'atk_minus_1') auras.atkMod -= 1;
            if (effect === 'light_req_plus_2') auras.lightReqMod += 2;
        });
        return auras;
    }

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

    // --- 手動卡片啟用 (v3.1.1 核心) ---

    activateAllResources() {
        if (this.currentAction !== 'VILLAGE') return;
        let activatedCount = 0;
        for (let i = this.hand.length - 1; i >= 0; i--) {
            if (this.hand[i].goldValue > 0) {
                this.playCard(i);
                activatedCount++;
            }
        }
        if (activatedCount > 0) this.addLog(`自動啟用了 ${activatedCount} 張資源卡。`, 'info');
        this.updateUI();
    }

    playCard(idx) {
        const card = this.hand[idx];
        if (!card) return;

        // 在村莊階段，點擊卡片以啟用資源與效果
        if (this.currentAction === 'VILLAGE') {
            const played = this.hand.splice(idx, 1)[0];
            this.playedCards.push(played);

            // 啟用金幣
            if (played.goldValue) {
                this.currentGold += played.goldValue;
                this.addLog(`啟動「${played.name}」，獲得 ${played.goldValue} 金幣。`, 'success');
            }

            // 觸發村莊效果
            if (played.abilities && played.abilities.onVillage) {
                this.triggerCardEffect(played.abilities.onVillage);
            }
            this.updateUI();
        }

        // 在休息階段，點擊卡片以「預備」銷毀
        else if (this.currentAction === 'REST') {
            if (this.hasDestroyed) return this.addLog('本回合休息已執行過銷毀。', 'warning');

            // 如果點擊已選中的，則取消選取
            if (this.selectedDestroyIdx === idx) {
                this.selectedDestroyIdx = null;
            } else {
                this.selectedDestroyIdx = idx;
                const card = this.hand[idx];
                this.addLog(`已選取「${card.name}」，點擊下方確認按鈕以執行銷毀。`, 'info');
            }
            this.updateUI();
        }
    }

    // 執行休息銷毀並結束回合
    confirmRestAndDestroy() {
        if (this.currentAction !== 'REST') return;

        if (this.selectedDestroyIdx !== null) {
            const removed = this.hand.splice(this.selectedDestroyIdx, 1)[0];
            this.hasDestroyed = true;
            this.selectedDestroyIdx = null;
            this.addLog(`🔥 已銷毀卡片：「${removed.name}」，休息行動結束。`, 'warning');
        } else {
            this.addLog('直接結束休息行動，未銷毀任何卡片。', 'info');
        }
        this.finishAction();
    }

    triggerCardEffect(effectKey) {
        if (effectKey === 'destroy_disease') {
            // 從手牌、棄牌或牌庫移除疾病？通常是手牌或棄牌
            const dIdx = this.hand.findIndex(c => c.id === 'spec_disease');
            if (dIdx !== -1) {
                this.hand.splice(dIdx, 1);
                this.addLog('✨ 效果觸發：已移除手牌中的疾病卡。', 'success');
            } else {
                this.addLog('✨ 效果觸發：未發現可移除的疾病。', 'info');
            }
        }
    }

    // --- 行動選擇 ---

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
        this.addLog('進入地城！您可以多次分配英雄進攻，直到點擊結束。', 'info');
        this.updateUI();
    }

    finishAction() {
        this.addLog('行動確認，地城正在推移...', 'info');
        // 清理已啟用的卡片
        this.playedCards.forEach(c => this.discard.push(c));
        this.playedCards = [];
        this.endTurnWithAdvance();
    }

    // --- 市場、購買與升級 ---

    refreshMarket() {
        const basics = JSON.parse(JSON.stringify(CARDPOOL.basic));
        // v3.1.3：精確 4 英雄 + 4 隨機道具/裝備/法術 + 4 基礎
        const heroes = this.shuffleArray(CARDPOOL.heroes.filter(h => h.hero.level === 1)).slice(0, 4);
        const randomPool = [
            ...(CARDPOOL.items || []),
            ...(CARDPOOL.weapons || []),
            ...(CARDPOOL.spells || [])
        ];
        const items = this.shuffleArray(randomPool).slice(0, 4);

        this.marketItems = {
            basics: basics.slice(0, 4),
            heroes: heroes,
            items: items
        };
        this.updateUI();
    }

    buyCard(cardId, cost) {
        if (this.currentGold < cost) return this.addLog('金幣不足！', 'danger');
        if (this.hasBought) return this.addLog('造訪期間僅限執行一次購買。', 'warning');

        this.currentGold -= cost;
        this.hasBought = true;
        const card = this.getCardPoolItem(cardId);
        this.discard.push(card);
        this.addLog(`購入「${card.name}」。`, 'success');
        this.updateUI();
    }

    upgradeHero(cardId) {
        const idx = this.hand.findIndex(c => c.id === cardId);
        const hero = this.hand[idx];
        if (!hero || !hero.hero.upgradeToId || this.currentXP < hero.hero.xpToUpgrade) return;
        this.currentXP -= hero.hero.xpToUpgrade;
        const nextLv = this.getCardPoolItem(hero.hero.upgradeToId);
        this.hand.splice(idx, 1);
        this.discard.push(nextLv);
        this.addLog(`英雄升級：${hero.name} ➔ ${nextLv.name}`, 'success');
        this.updateUI();
    }

    // --- 戰鬥系統 ---

    selectCombatTarget(rank) {
        if (this.state !== GameState.COMBAT) return;
        this.combat.targetRank = rank;
        this.updateUI();
    }

    performCombat() {
        if (!this.combat.targetRank) return this.addLog('請選擇目標怪物。', 'danger');
        const monster = this.dungeonHall[`rank${this.combat.targetRank}`];
        if (!monster) return;

        const hIdx = this.combat.selectedHeroIdx;
        const wIdx = this.combat.selectedWeaponIdx;
        const hero = this.hand[hIdx];
        const weapon = this.hand[wIdx];

        if (!hero) return this.addLog('請至少選擇一名英雄。', 'danger');

        const auras = this.getActiveAuras();
        let heroStr = hero.hero.strength + auras.strMod;

        if (weapon && heroStr < weapon.equipment.weight) {
            return this.addLog(`❌ 負重不足！${hero.name} 無法使用 ${weapon.name}`, 'danger');
        }

        let totalLight = 0;
        this.hand.forEach(c => totalLight += (c.light || 0));
        const lightReq = this.combat.targetRank + auras.lightReqMod;
        const lightPenalty = Math.max(0, lightReq - totalLight) * 2;

        let physAtk = hero.hero.attack + (weapon ? weapon.equipment.attack : 0) + auras.atkMod;
        let magAtk = hero.hero.magicAttack + (weapon ? weapon.equipment.magicAttack : 0);

        if (monster.abilities && monster.abilities.battle === 'phys_immune') physAtk = 0;
        if (monster.abilities && monster.abilities.battle === 'magic_only') physAtk = 0;

        let finalAtk = Math.max(0, physAtk - lightPenalty) + magAtk;

        if (finalAtk >= monster.monster.hp) {
            this.addLog(`✨ 擊斃 ${monster.name}！`, 'success');
            this.currentXP += monster.monster.xpGain;
            this.totalScore += (monster.vp || 0);
            this.dungeonHall[`rank${this.combat.targetRank}`] = null;

            // 消耗卡片
            const toDiscard = [hIdx];
            if (wIdx !== null) toDiscard.push(wIdx);
            toDiscard.sort((a, b) => b - a).forEach(i => this.discard.push(this.hand.splice(i, 1)[0]));

            if (monster.hasThunderstone) {
                this.addLog('🏆 您奪得了雷霆之石，防線獲得最終勝利！', 'success');
                this.gameOver();
            } else {
                this.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: null };
                this.updateUI();
            }
        } else {
            this.addLog(`❌ 戰力不足 (${finalAtk}/${monster.monster.hp})，攻擊無效！`, 'danger');
            this.updateUI();
        }
    }

    // --- 地城推進 ---

    spawnNextMonster() {
        if (this.monsterDeck.length > 0) {
            const m = this.monsterDeck.pop();
            this.dungeonHall.rank3 = m;
            this.processBreachEffect(m);
        }
    }

    endTurnWithAdvance() {
        this.monsterAdvance();
    }

    monsterAdvance() {
        this.state = GameState.MONSTER_ADVANCE;
        if (this.dungeonHall.rank1) {
            const escaped = this.dungeonHall.rank1;
            if (escaped.hasThunderstone) return this.gameOver();
            this.addLog(`⚠️ ${escaped.name} 已逃出地城，村莊受損！`, 'danger');
            this.villageHP -= 2;
        }

        this.dungeonHall.rank1 = this.dungeonHall.rank2;
        this.dungeonHall.rank2 = this.dungeonHall.rank3;
        this.dungeonHall.rank3 = null;
        this.spawnNextMonster();

        this.updateUI();
        if (this.villageHP <= 0) this.gameOver();
        else {
            setTimeout(() => {
                this.hand.forEach(c => this.discard.push(c));
                this.hand = [];
                this.nextTurn();
            }, 800);
        }
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        this.updateUI();
    }

    // --- 工具與查看功能 ---

    showDeckModal(type) {
        if (!this.ui) return;
        const list = type === 'deck' ? [...this.deck] : [...this.discard];
        const title = type === 'deck' ? '查看牌庫 (隨機順序)' : '查看棄牌堆';

        // 如果是查看牌庫，應以此顯示玩家知道的內容，為了公平性我們可以做一次隨機展示或按字母排名
        if (type === 'deck') {
            this.shuffle(list); // 不影響實際牌庫，僅展示
        }

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
        this.log.unshift({ message: msg, type });
        if (this.log.length > 20) this.log.pop();
        this.updateUI();
    }

    updateUI() {
        if (this.ui) this.ui.updateUI();
    }
}

window.game = new GuardiansDefenceGame();
