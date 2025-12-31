/**
 * 《守護者防線：雷霆遺產》核心邏輯 (v2.0)
 * 依照 GDD 2.0 規範重構：地城推進、負重系統、光源懲罰與隨機 Boss 標記。
 */

import { CARDPOOL, GameState } from './data.js';
import { UIManager } from './ui.js';

class GuardiansDefenceGame {
    constructor() {
        this.version = "v2.0.251231A"; // 重構規則：負重、光源、分層地城
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

        this.monsterDeck = [];    // 分層怪物牌庫
        this.dungeonHall = {      // 地城大廳
            rank1: null,
            rank2: null,
            rank3: null
        };

        this.marketItems = [];
        this.log = [];
        this.combat = null;
    }

    // --- 遊戲初始化 (Setup) ---

    startNewGame() {
        this.init();

        // 1. 初始化玩家牌組 (6正規軍, 2火把, 2長矛, 2乾糧)
        const startingIds = [
            'basic_regular_army', 'basic_regular_army', 'basic_regular_army',
            'basic_regular_army', 'basic_regular_army', 'basic_regular_army',
            'basic_torch', 'basic_torch',
            'basic_spear', 'basic_spear',
            'basic_rations', 'basic_rations'
        ];
        this.deck = startingIds.map(id => this.getCardPoolItem(id));
        this.shuffle(this.deck);

        // 2. 建立分層怪物牌庫 (T3底 > T2中 > T1頂)
        this.createMonsterDeck();

        // 3. 地城起手：Rank 3 翻開第一張
        this.spawnNextMonster();

        this.addLog('守護者防線 v2.0 已啟動，雷霆遺產戰役開始！', 'success');
        this.refreshMarket();
        this.nextTurn();
    }

    getCardPoolItem(id) {
        // 在 CARDPOOL 的各個分類中尋找
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

        // 隨機選出的牌庫 (例如總共 30 張)
        const selectedT1 = t1.slice(0, 10);
        const selectedT2 = t2.slice(0, 10);
        const selectedT3 = t3.slice(0, 10);

        // 分配雷霆標記 (Boss)：從底層 10 張中隨機選一
        const bossIdx = Math.floor(Math.random() * selectedT3.length);
        selectedT3[bossIdx].hasThunderstone = true;
        selectedT3[bossIdx].monster.hp += 3;
        selectedT3[bossIdx].name += " (雷霆之石)";

        // 堆疊：T1(頂) -> T2(中) -> T3(底)
        this.monsterDeck = [...selectedT1, ...selectedT2, ...selectedT3].reverse();
        // 註：用 pop() 拿牌，所以 reverse 之
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
            this.addLog('整備階段：可購買、升級或準備進入地城。', 'info');
            this.updateUI();
        }, 300);
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                if (this.discard.length === 0) break;
                this.deck = this.shuffleArray([...this.discard]);
                this.discard = [];
                this.addLog('重新洗回棄牌堆到牌庫。', 'info');
            }
            this.hand.push(this.deck.pop());
        }
        this.updateUI();
    }

    // --- 行動選擇 ---

    visitVillageAction() {
        // 造訪村莊邏輯
        this.refreshMarket();
        this.addLog('造訪村莊市場。', 'info');
        this.endTurnWithAdvance();
    }

    restAction() {
        // 休息：得 1 XP，可選摧毀 1 卡
        this.currentXP += 1;
        this.addLog('休息整補，獲得 1 XP。', 'success');
        // TODO: UI 顯示摧毀選擇
        this.endTurnWithAdvance();
    }

    enterDungeonAction() {
        // 進入地城
        this.state = GameState.COMBAT;
        this.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: null };
        this.addLog('進入地城！請分配英雄、裝備與目標。', 'info');
        this.updateUI();
    }

    // --- 村莊與市場 ---

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
        if (!monster) return;

        // 計算攻擊力 (物理/魔法)
        let totalAtk = 0;
        let totalMagic = 0;
        let totalLight = 0;
        let totalStr = 0;

        // 計算手牌/已打出卡的資源 (簡化實作：這裏直接計算當前回合所有打出卡)
        // TODO: 建立正確的戰鬥快照

        // 戰鬥判定邏輯...
        this.addLog(`挑戰 ${monster.name}...`, 'info');
        // (此處省略詳細公式實作，後續補完)

        this.endTurnWithAdvance();
    }

    // --- 地城進度與結束 ---

    spawnNextMonster() {
        if (this.monsterDeck.length > 0) {
            this.dungeonHall.rank3 = this.monsterDeck.pop();
        }
    }

    endTurnWithAdvance() {
        this.monsterAdvance();
    }

    monsterAdvance() {
        this.state = GameState.MONSTER_ADVANCE;

        // 1. Rank 1 逃脫
        if (this.dungeonHall.rank1) {
            const escaped = this.dungeonHall.rank1;
            if (escaped.hasThunderstone) {
                this.addLog('⚠️ 災難！雷霆之石攜帶者已逃離，防線潰散！', 'danger');
                return this.gameOver();
            }
            this.addLog(`⚠️ ${escaped.name} 逃向村莊！`, 'danger');
            this.villageHP -= 2; // 逃脫扣分
        }

        // 2. 推進
        this.dungeonHall.rank1 = this.dungeonHall.rank2;
        this.dungeonHall.rank2 = this.dungeonHall.rank3;
        this.dungeonHall.rank3 = null;

        // 3. 補充
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
