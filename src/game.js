/**
 * 《守護者防線：雷霆遺產》核心邏輯 (v2.1)
 * 實作規則：怪物效果觸發時機 (進場/光環/戰鬥)、受傷棄牌、精確負重與光源計算。
 */

import { CARDPOOL, GameState } from './data.js';
import { UIManager } from './ui.js';

class GuardiansDefenceGame {
    constructor() {
        this.version = "v3.0.251231C"; // 重大改版：怪物效果引擎與規則重構
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
        this.playedCards = [];

        this.monsterDeck = [];
        this.dungeonHall = { rank1: null, rank2: null, rank3: null };

        this.marketItems = [];
        this.log = [];
        this.combat = null;
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
        this.spawnNextMonster(); // 初始刷怪觸發 [進場]

        this.addLog('守護者防線 v2.1 引擎已就緒，戰役開始！', 'success');
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
        s3[bossIdx].name += " (雷霆之石)";

        this.monsterDeck = [...s1, ...s2, ...s3].reverse();
    }

    // --- 核心流程 ---

    nextTurn() {
        this.turn++;
        this.currentGold = 0;
        this.playedCards = [];
        this.state = GameState.DRAW;

        this.addLog(`【第 ${this.turn} 回合】`, 'info');
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

    // --- 怪物效果引擎 (v2.1 重點) ---

    // 1. [進場] 效果：怪物進入 Rank 3 時觸發
    processBreachEffect(monster) {
        if (!monster || !monster.abilities || !monster.abilities.onBreach) return;

        this.addLog(`⚠️ 警告：${monster.name} 的進場威壓！`, 'warning');
        const effect = monster.abilities.onBreach;

        if (effect === 'discard_1') {
            this.forcePlayerDiscard(1);
        } else if (effect === 'discard_magic_or_item') {
            this.forceTypeDiscard(['Spell', 'Item', 'Weapon'], 1);
        } else if (effect === 'gain_disease') {
            const disease = this.getCardPoolItem('special_disease');
            if (disease) {
                this.discard.push(disease);
                this.addLog(`🦠 ${monster.name} 使你的牌組染上疾病...`, 'danger');
            }
        }
    }

    // 2. [持續] 效果：計算當前所有光環
    getActiveAuras() {
        const auras = {
            strMod: 0,
            atkMod: 0,
            lightReqMod: 0,
            magicOnly: false,
            physImmune: false
        };

        [this.dungeonHall.rank1, this.dungeonHall.rank2, this.dungeonHall.rank3].forEach(m => {
            if (!m || !m.abilities || !m.abilities.aura) return;
            const effect = m.abilities.aura;
            if (effect === 'str_minus_1') auras.strMod -= 1;
            if (effect === 'atk_minus_1') auras.atkMod -= 1;
            if (effect === 'light_req_plus_2') auras.lightReqMod += 2;
        });

        return auras;
    }

    // 3. [受傷] 邏輯：隨機棄牌
    forcePlayerDiscard(count) {
        for (let i = 0; i < count; i++) {
            if (this.hand.length > 0) {
                const idx = Math.floor(Math.random() * this.hand.length);
                const removed = this.hand.splice(idx, 1)[0];
                this.discard.push(removed);
                this.addLog(`💔 受到傷害，失去卡片：「${removed.name}」`, 'danger');
            }
        }
        this.updateUI();
    }

    forceTypeDiscard(types, count) {
        let discarded = 0;
        for (let i = this.hand.length - 1; i >= 0; i--) {
            if (types.includes(this.hand[i].type)) {
                const removed = this.hand.splice(i, 1)[0];
                this.discard.push(removed);
                this.addLog(`✨ 魔法干擾，失去卡片：「${removed.name}」`, 'danger');
                discarded++;
                if (discarded >= count) break;
            }
        }
        this.updateUI();
    }

    // --- 行動選擇 ---

    visitVillageAction() {
        // 造訪村莊：計算手牌金幣
        let goldGenerated = 0;
        this.hand.forEach(c => { if (c.goldValue) goldGenerated += c.goldValue; });
        this.currentGold += goldGenerated;
        if (goldGenerated > 0) this.addLog(`獲得補給資金：${goldGenerated}`, 'success');

        this.refreshMarket();
        this.endTurnWithAdvance();
    }

    restAction() {
        this.currentXP += 1;
        this.addLog('休息整補，獲得 1 XP。', 'success');
        this.endTurnWithAdvance();
    }

    enterDungeonAction() {
        this.state = GameState.COMBAT;
        this.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: null };
        this.addLog('進入地城！請分配英雄、裝備與目標。', 'info');
        this.updateUI();
    }

    // --- 市場與升級 ---

    refreshMarket() {
        const basics = JSON.parse(JSON.stringify(CARDPOOL.basic));
        const heroes = this.shuffleArray(CARDPOOL.heroes.filter(h => h.hero.level === 1)).slice(0, 4);
        const weapons = this.shuffleArray(CARDPOOL.weapons).slice(0, 4);
        const items = this.shuffleArray([...CARDPOOL.spells, ...CARDPOOL.items]).slice(0, 4);
        this.marketItems = [...basics, ...heroes, ...weapons, ...items];
        this.updateUI();
    }

    buyCard(cardId, cost) {
        if (this.currentGold < cost) return;
        this.currentGold -= cost;
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
        const hIdx = this.combat.selectedHeroIdx;
        const wIdx = this.combat.selectedWeaponIdx;
        const hero = this.hand[hIdx];
        const weapon = this.hand[wIdx];

        if (!hero) return this.addLog('請至少選擇一名英雄。', 'danger');

        // 1. 獲取光環與基礎數值
        const auras = this.getActiveAuras();
        let heroStr = hero.hero.strength + auras.strMod;
        let weaponWeight = weapon ? weapon.equipment.weight : 0;

        // 2. 負重檢查
        if (weapon && heroStr < weaponWeight) {
            return this.addLog(`❌ 負重不足！${hero.name} 無力揮動 ${weapon.name}`, 'danger');
        }

        // 3. 計算光照與懲罰
        let totalLight = 0;
        this.hand.forEach(c => totalLight += (c.light || 0));
        const lightReq = this.combat.targetRank + auras.lightReqMod;
        const lightPenalty = Math.max(0, lightReq - totalLight) * 2;

        // 4. 計算最終攻擊
        let physAtk = hero.hero.attack + (weapon ? weapon.equipment.attack : 0) + auras.atkMod;
        let magAtk = hero.hero.magicAttack + (weapon ? weapon.equipment.magicAttack : 0);

        // 物理免疫判定
        if (monster.abilities && monster.abilities.battle === 'phys_immune') physAtk = 0;
        if (monster.abilities && monster.abilities.battle === 'magic_only') physAtk = 0;

        let finalAtk = Math.max(0, physAtk - lightPenalty) + magAtk;

        this.addLog(`⚔️ ${hero.name} 發動攻勢！物理:${physAtk} 魔法:${magAtk} 光懲:-${lightPenalty} 總計:${finalAtk}`, 'info');

        // 5. 結算
        if (finalAtk >= monster.monster.hp) {
            this.addLog(`✨ 擊敗 ${monster.name}！`, 'success');
            this.currentXP += monster.monster.xpGain;
            this.totalScore += monster.vp || 0;
            this.dungeonHall[`rank${this.combat.targetRank}`] = null;

            // 消耗出戰卡
            const toDiscard = [hIdx];
            if (wIdx !== null) toDiscard.push(wIdx);
            toDiscard.sort((a, b) => b - a).forEach(i => this.discard.push(this.hand.splice(i, 1)[0]));

            if (monster.hasThunderstone) {
                this.addLog('🏆 獲得雷霆之石！您拯救了防線！', 'success');
                this.gameOver();
            } else {
                this.endTurnWithAdvance();
            }
        } else {
            this.addLog(`❌ 攻擊力不足，敗退！`, 'danger');
            this.endTurnWithAdvance();
        }
    }

    // --- 地城進度 ---

    spawnNextMonster() {
        if (this.monsterDeck.length > 0) {
            const m = this.monsterDeck.pop();
            this.dungeonHall.rank3 = m;
            this.processBreachEffect(m); // 觸發進場效果
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
            this.addLog(`⚠️ ${escaped.name} 逃出地城，村莊受損！`, 'danger');
            this.villageHP -= 2;
        }

        this.dungeonHall.rank1 = this.dungeonHall.rank2;
        this.dungeonHall.rank2 = this.dungeonHall.rank3;
        this.dungeonHall.rank3 = null;

        this.spawnNextMonster(); // 補位並觸發進場

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

    // --- 工具 ---

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
        if (this.ui) this.updateUI();
    }

    updateUI() {
        if (this.ui) this.ui.updateUI();
    }
}

window.game = new GuardiansDefenceGame();
