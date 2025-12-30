/**
 * 《守護者防線》核心邏輯模組
 * 負責回合管理、資源計算與戰鬥判定。
 */

import { CARDPOOL, MARKET_CARDS, CRAFTING_RECIPES, GameState } from './data.js';
import { UIManager } from './ui.js';

class GuardiansDefenceGame {
    constructor() {
        this.version = "v1.1.251230E"; // 實作怪物分階
        this.ui = new UIManager(this);
        this.init();
        this.setupErrorHandler();
    }

    setupErrorHandler() {
        window.onerror = (msg, url, line) => {
            this.addLog(`[ERROR] ${msg} (Line ${line})`, 'danger');
            console.error(msg, url, line);
        };
    }

    init() {
        this.state = GameState.IDLE;
        this.turn = 0;
        this.villageHP = 20;
        this.maxVillageHP = 20;
        this.currentGold = 0;
        this.currentXP = 0;
        this.crystals = 0;
        this.totalScore = 0;
        this.deck = [];
        this.hand = [];
        this.discard = [];
        this.lane = [];
        this.selectedCards = [];
        this.playedCards = [];
        this.combat = null;
        this.log = [];
        this.marketItems = []; // 當前市場商品
    }

    getCardById(cardId) {
        for (const category in CARDPOOL) {
            const card = CARDPOOL[category].find(c => c.id === cardId);
            if (card) {
                // 自動附加類型資訊
                let type = 'Item';
                if (category === 'heroes') type = 'Hero';
                else if (category === 'weapons') type = 'Weapon';
                else if (category === 'economy') type = 'Economy';
                else if (category === 'spells') type = 'Spell';
                return { ...card, type };
            }
        }
        return null;
    }

    startNewGame() {
        this.init();

        // 起始牌組: 5銅幣, 3農民, 2木棍 (修正設定)
        const startingIds = [
            'eco_copper_coin', 'eco_copper_coin', 'eco_copper_coin', 'eco_copper_coin', 'eco_copper_coin',
            'hero_peasant_lv1', 'hero_peasant_lv1', 'hero_peasant_lv1',
            'weapon_stick', 'weapon_stick'
        ];
        this.deck = startingIds.map(id => this.getCardById(id));
        this.shuffle(this.deck);

        // 第 1 步：生成第一隻怪物 (修正 Bug 4)
        this.spawnInitialMonster();

        this.addLog('守護者系統已連線，戰役開始！', 'success');
        this.refreshMarket(); // 初始市場
        this.nextTurn();
    }

    spawnInitialMonster() {
        // 分階邏輯：1-7回 Tier 1, 8-14回 Tier 1~2, 15回起 Tier 1~3
        const turn = this.turn || 1;
        let maxTier = 1;
        if (turn >= 15) maxTier = 3;
        else if (turn >= 8) maxTier = 2;

        // 隨機抽組該階級以下的怪物
        const pool = CARDPOOL.monsters.filter(m => m.tier <= maxTier);
        if (pool.length === 0) return;

        const mData = pool[Math.floor(Math.random() * pool.length)];
        // 賦予更豐富的動態屬性，例如隨難度微調 HP
        const hpMultiplier = 1 + Math.floor(turn / 20) * 0.2;
        const hp = Math.ceil(mData.hp * hpMultiplier);

        const spawned = {
            ...mData,
            hp: hp,
            maxHp: hp,
            distance: 5
        };

        this.lane.push(spawned);
        return spawned;
    }

    nextTurn() {
        this.turn++;
        this.currentGold = 0;
        this.selectedCards = [];
        this.playedCards = [];
        this.combat = null;

        this.state = GameState.DRAW;
        this.addLog(`【第 ${this.turn} 回合】`, 'info');
        this.drawCards(6);
        this.updateUI(); // 確保抽牌後立刻顯示

        setTimeout(() => {
            this.state = GameState.VILLAGE;
            this.addLog('進入村莊整備階段', 'info');

            // 每 3 回合刷新一次市場，或提供刷新按鈕？先設定為自動刷新
            if (this.turn % 3 === 1) {
                this.refreshMarket();
            }

            this.updateUI();
        }, 300);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                if (this.discard.length === 0) break;
                this.deck = [...this.discard];
                this.discard = [];
                this.shuffle(this.deck);
                this.addLog('牌庫空，重新洗回棄牌堆', 'info');
            }
            const card = this.deck.pop();
            this.hand.push(card);
        }
        this.updateUI();
    }

    // 資源管理
    toggleCardSelection(index) {
        if (this.state !== GameState.VILLAGE) return;
        const card = this.hand[index];
        const existIdx = this.selectedCards.findIndex(s => s.index === index);

        if (existIdx >= 0) this.selectedCards.splice(existIdx, 1);
        else this.selectedCards.push({ index, card });
        this.updateUI();
    }

    confirmCoin() {
        if (this.selectedCards.length === 0) return;
        let totalCoin = 0;
        this.selectedCards.forEach(item => {
            if (item.card.coin) totalCoin += item.card.coin;
            if (item.card.xp) this.currentXP += item.card.xp;
        });

        this.currentGold += totalCoin;
        if (totalCoin > 0) this.addLog(`獲得資產: ${totalCoin}`, 'success');

        const indicesToRemove = this.selectedCards.map(s => s.index).sort((a, b) => b - a);
        indicesToRemove.forEach(idx => {
            this.discard.push(this.hand[idx]);
            this.hand.splice(idx, 1);
        });
        this.selectedCards = [];
        this.updateUI();
    }

    clearSelection() {
        this.selectedCards = [];
        this.updateUI();
    }

    // 法術與道具
    playVillageSpell(index) {
        const card = this.hand[index];
        if (card.id === 'spell_draw_1') {
            this.addLog(`使用「${card.name}」：額外抽 2 張牌`, 'success');
            this.discard.push(this.hand.splice(index, 1)[0]);
            this.drawCards(2);
        } else if (card.id === 'item_heal') {
            this.villageHP = Math.min(this.maxVillageHP, this.villageHP + 3);
            this.addLog(`使用「${card.name}」：恢復村莊血量`, 'success');
            this.discard.push(this.hand.splice(index, 1)[0]);
        }
        this.updateUI();
    }

    playCombatSpell(index) {
        if (this.state !== GameState.COMBAT) return;
        if (!this.combat.targetDistance) return this.addLog('請先點選目標怪物', 'danger');

        const card = this.hand[index];
        const target = this.lane.find(m => m.distance === this.combat.targetDistance);
        if (!target) return;

        const dmg = card.damage || 0;
        this.addLog(`🔥 發動「${card.name}」：對 ${target.name} 造成 ${dmg} 傷害`, 'success');
        target.hp -= dmg;
        this.ui.showDamage(target.distance, dmg);

        this.discard.push(this.hand.splice(index, 1)[0]);
        if (target.hp <= 0) this.killMonster(target);
        this.updateUI();
    }

    // 市場與升級
    refreshMarket() {
        // 從 CARDPOOL 中隨機抽取卡片
        // 規則：2 英雄, 2 武器, 1 經濟, 1 道具/法術
        const newMarket = [];

        const categories = {
            heroes: { pool: CARDPOOL.heroes.filter(h => h.id !== 'hero_peasant_lv1' && !h.id.includes('lv3')), count: 2 },
            weapons: { pool: CARDPOOL.weapons.filter(w => w.id !== 'weapon_stick'), count: 2 },
            economy: { pool: CARDPOOL.economy, count: 1 },
            spells: { pool: [...CARDPOOL.spells, ...CARDPOOL.items.filter(i => i.usage === 'village')], count: 1 }
        };

        for (const key in categories) {
            const { pool, count } = categories[key];
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count).map(card => {
                // 設定預設價格 (未來可從資料庫讀取)
                let cost = 3;
                if (card.type === 'Hero') cost = 4;
                if (card.type === 'Weapon') cost = 5;
                if (card.coin > 1) cost = 3;
                return { id: card.id, name: card.name, cost };
            });
            newMarket.push(...selected);
        }

        this.marketItems = newMarket;
        this.addLog('市場物資已更新', 'info');
    }

    buyCard(cardId, cost) {
        if (this.currentGold < cost) return;
        this.currentGold -= cost;
        const card = this.getCardById(cardId);
        this.discard.push({ ...card });
        this.addLog(`徵募成功：「${card.name}」加入牌庫`, 'success');

        // 買完後該位置移除或補空？這裡暫定買完就消失
        this.marketItems = this.marketItems.filter(item => !(item.id === cardId && item.cost === cost));

        this.updateUI();
    }

    upgradeHero(cardId) {
        const hIdx = this.hand.findIndex(c => c.id === cardId);
        if (hIdx === -1) return;
        const hero = this.hand[hIdx];
        if (this.currentXP < hero.xpToUpgrade) return;

        this.currentXP -= hero.xpToUpgrade;
        const upgraded = this.getCardById(hero.upgradeToId);
        this.hand.splice(hIdx, 1); // 舊牌永久消失（轉化）
        this.discard.push({ ...upgraded });
        this.addLog(`英雄晉升：「${hero.name}」→「${upgraded.name}」`, 'success');
        this.updateUI();
    }

    craftCard(cardId, costCoin, costCrystal) {
        if (this.currentGold < costCoin || this.crystals < costCrystal) return;
        this.currentGold -= costCoin;
        this.crystals -= costCrystal;
        const card = this.getCardById(cardId);
        this.discard.push({ ...card });
        this.addLog(`🔨 鍛造完成：獲得「${card.name}」`, 'success');
        this.updateUI();
    }

    // 戰鬥邏輯
    nextPhase() {
        if (this.state !== GameState.VILLAGE) return;

        // 重要：必須先初始化對象，再切換狀態，避免 updateUI 被日誌觸發時抓到 null
        this.combat = { heroHandIndex: null, weaponHandIndex: null, targetDistance: null };
        this.state = GameState.COMBAT;

        this.addLog('進入戰鬥階段：請點選英雄與目標進行攻擊', 'info');

        if (this.lane.length === 0) {
            this.addLog('前方無敵軍，直接進軍', 'info');
            setTimeout(() => this.monsterAdvance(), 600);
        } else {
            this.updateUI();
        }
    }

    selectCombatHero(idx) {
        if (this.state !== GameState.COMBAT || !this.combat) return;
        // 如果點選已選中的，則取消
        if (this.combat.heroHandIndex === idx) this.combat.heroHandIndex = null;
        else this.combat.heroHandIndex = idx;
        this.updateUI();
    }

    selectCombatWeapon(idx) {
        if (this.state !== GameState.COMBAT || !this.combat) return;
        if (this.combat.weaponHandIndex === idx) this.combat.weaponHandIndex = null;
        else this.combat.weaponHandIndex = idx;
        this.updateUI();
    }

    selectCombatTarget(dist) {
        if (this.state !== GameState.COMBAT || !this.combat) return;
        if (this.combat.targetDistance === dist) this.combat.targetDistance = null;
        else this.combat.targetDistance = dist;
        this.updateUI();
    }

    performAttack() {
        if (this.state !== GameState.COMBAT) return;
        const { heroHandIndex: hIdx, weaponHandIndex: wIdx, targetDistance: dist } = this.combat;

        if (hIdx === null) return this.addLog('請先點選一名英雄！', 'danger');
        if (!dist) return this.addLog('請點選目標怪物（1~5 槽位）！', 'danger');

        const hero = this.hand[hIdx];
        const weapon = (wIdx !== null) ? this.hand[wIdx] : null;
        const target = this.lane.find(m => m.distance === dist);

        if (!target) return this.addLog('目標位置已無怪物', 'danger');

        // 規則檢核
        const carry = hero.carry || 0;
        const weight = weapon ? (weapon.weight || 0) : 0;
        if (weapon && carry < weight) return this.addLog(`！負重不足 (需求 ${weight}, 剩餘 ${carry})`, 'danger');

        const range = Math.max(hero.range || 0, weapon ? (weapon.range || 0) : 0);
        if (dist > range) return this.addLog(`！射程不足 (目標距離 ${dist}, 最大射程 ${range})`, 'danger');

        const atk = (hero.attack || 0) + (weapon ? (weapon.attack || 0) : 0);

        this.addLog(`⚔️ ${hero.name} 攻擊 ${target.name}，造成 ${atk} 傷害`, 'info');
        target.hp -= atk;
        this.ui.showDamage(dist, atk);

        // 消耗卡牌（先記錄要移除的索引）
        const toRemove = [hIdx];
        if (wIdx !== null && wIdx !== hIdx) toRemove.push(wIdx);

        // 依照索引由大到小移除，避免索引位移
        toRemove.sort((a, b) => b - a).forEach(i => {
            const card = this.hand[i];
            this.discard.push(card);
            this.hand.splice(i, 1);
        });

        // 擊殺判定
        if (target.hp <= 0) this.killMonster(target);

        // 重設選擇
        this.combat = { heroHandIndex: null, weaponHandIndex: null, targetDistance: null };
        this.updateUI();
    }

    skipCombat() {
        if (this.state !== GameState.COMBAT) return;
        this.addLog('戰鬥結束，怪物正在進逼！', 'info');
        this.monsterAdvance();
    }

    killMonster(m) {
        const idx = this.lane.indexOf(m);
        if (idx > -1) this.lane.splice(idx, 1);

        this.currentXP += (m.xp || 0);
        this.crystals += (m.crystal || 0);
        this.totalScore += (m.score || 0);
        this.addLog(`✨ 擊退 ${m.name}！獲得 ${m.xp} XP / ${m.crystal} 結晶`, 'success');
    }

    monsterAdvance() {
        this.state = GameState.MONSTER_ADVANCE;
        this.addLog('怪物開始進軍...', 'info');
        this.updateUI();

        // 簡化流程，避免過多嵌套定時器導致鎖死
        setTimeout(() => {
            // 怪物移動
            this.lane.forEach(m => m.distance--);

            // 判定進入村莊
            const entry = this.lane.filter(m => m.distance <= 0);
            entry.forEach(m => {
                this.villageHP -= (m.damage || 1);
                this.addLog(`⚠️ 敵襲！${m.name} 衝入村莊，造成 ${m.damage} 損害`, 'danger');
            });
            this.lane = this.lane.filter(m => m.distance > 0);

            // 生成下一波
            this.spawnInitialMonster();

            this.updateUI();

            if (this.villageHP <= 0) {
                this.gameOver();
            } else {
                this.addLog('防線重新整補中...', 'info');
                setTimeout(() => this.endTurn(), 800);
            }
        }, 800);
    }

    endTurn() {
        this.state = GameState.END_TURN;
        this.updateUI();
        setTimeout(() => {
            this.hand.forEach(c => this.discard.push(c));
            this.hand = [];
            this.nextTurn();
        }, 500);
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        document.getElementById('endGameMessage').textContent = `最後得分：${this.totalScore} | 守護回合：${this.turn}`;
        document.getElementById('endGameModal').classList.add('active');
        this.updateUI();
    }

    addLog(msg, type) {
        this.log.unshift({ message: msg, type });
        if (this.log.length > 20) this.log.pop();
        this.updateUI();
    }

    // UI 代理方法 (修正 Bug 1)
    showDeckModal(type) {
        this.ui.showDeckModal(type);
    }

    updateUI() {
        this.ui.updateUI();
    }
}

window.game = new GuardiansDefenceGame();
