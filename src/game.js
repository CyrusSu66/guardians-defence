/**
 * 《守護者防線》核心邏輯模組
 * 負責回合管理、資源計算與戰鬥判定。
 */

import { CARDPOOL, MARKET_CARDS, CRAFTING_RECIPES, GameState } from './data.js';
import { UIManager } from './ui.js';

class GuardiansDefenceGame {
    constructor() {
        this.ui = new UIManager(this);
        this.init();
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

        // 起始牌組
        const startingIds = [
            'eco_copper_coin', 'eco_copper_coin', 'eco_copper_coin',
            'eco_silver_coin', 'hero_warrior_lv1', 'spell_draw_1'
        ];
        this.deck = startingIds.map(id => this.getCardById(id));
        this.shuffle(this.deck);

        // 第 1 步：生成第一隻怪物 (修正 Bug 4)
        this.spawnInitialMonster();

        this.addLog('守護者系統已連線，戰役開始！', 'success');
        this.nextTurn();
    }

    spawnInitialMonster() {
        const tier = 1;
        const pool = CARDPOOL.monsters.filter(m => m.tier <= tier);
        const mData = pool[Math.floor(Math.random() * pool.length)];
        this.lane.push({ ...mData, distance: 5 });
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

        setTimeout(() => {
            this.state = GameState.VILLAGE;
            this.addLog('進入村莊整備階段', 'info');
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
    buyCard(cardId, cost) {
        if (this.currentGold < cost) return;
        this.currentGold -= cost;
        const card = this.getCardById(cardId);
        this.discard.push({ ...card });
        this.addLog(`徵募成功：「${card.name}」加入牌庫`, 'success');
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
        this.state = GameState.COMBAT;
        this.addLog('進入戰鬥階段', 'info');
        this.combat = { heroHandIndex: null, weaponHandIndex: null, targetDistance: null };
        if (this.lane.length === 0) {
            this.addLog('無敵軍蹤跡，準備進軍', 'info');
            setTimeout(() => this.monsterAdvance(), 800);
        } else {
            this.updateUI();
        }
    }

    selectCombatHero(idx) {
        if (this.state !== GameState.COMBAT) return;
        this.combat.heroHandIndex = (this.combat.heroHandIndex === idx) ? null : idx;
        this.updateUI();
    }

    selectCombatWeapon(idx) {
        if (this.state !== GameState.COMBAT) return;
        this.combat.weaponHandIndex = (this.combat.weaponHandIndex === idx) ? null : idx;
        this.updateUI();
    }

    selectCombatTarget(dist) {
        if (this.state !== GameState.COMBAT) return;
        this.combat.targetDistance = (this.combat.targetDistance === dist) ? null : dist;
        this.updateUI();
    }

    performAttack() {
        const { heroHandIndex: hIdx, weaponHandIndex: wIdx, targetDistance: dist } = this.combat;
        if (hIdx === null || !dist) return;

        const hero = this.hand[hIdx];
        const weapon = (wIdx !== null) ? this.hand[wIdx] : null;

        // 檢核
        if (weapon && hero.carry < weapon.weight) return this.addLog('！負重不足', 'danger');
        const rng = Math.max(hero.range, weapon?.range || 0);
        if (dist > rng) return this.addLog('！射程不足', 'danger');

        const atk = hero.attack + (weapon?.attack || 0);
        const target = this.lane.find(m => m.distance === dist);

        this.addLog(`⚔️ ${hero.name} 發動攻擊，造成 ${atk} 傷害`, 'info');
        target.hp -= atk;
        this.ui.showDamage(dist, atk);

        // 消耗
        const idxs = [hIdx];
        if (wIdx !== null && wIdx !== hIdx) idxs.push(wIdx);
        idxs.sort((a, b) => b - a).forEach(i => this.discard.push(this.hand.splice(i, 1)[0]));

        if (target.hp <= 0) this.killMonster(target);

        this.combat = { heroHandIndex: null, weaponHandIndex: null, targetDistance: null };
        this.updateUI();
    }

    skipCombat() {
        this.addLog('戰鬥補給結束，怪物正在逼近', 'info');
        setTimeout(() => this.monsterAdvance(), 500);
    }

    killMonster(m) {
        this.lane = this.lane.filter(mon => mon !== m);
        this.currentXP += m.xp;
        this.crystals += m.crystal;
        this.totalScore += m.score;
        this.addLog(`✨ 擊殺 ${m.name}！獲取 ${m.xp} XP / ${m.crystal} 結晶`, 'success');
    }

    monsterAdvance() {
        this.state = GameState.MONSTER_ADVANCE;
        this.updateUI();

        setTimeout(() => {
            this.lane.forEach(m => m.distance--);
            const entry = this.lane.filter(m => m.distance <= 0);
            entry.forEach(m => {
                this.villageHP -= m.damage;
                this.addLog(`⚠️ 敵襲！${m.name} 衝入村莊，造成 ${m.damage} 損害`, 'danger');
            });
            this.lane = this.lane.filter(m => m.distance > 0);

            // 生成新怪物
            const tier = Math.min(3, Math.ceil(this.turn / 7));
            const pool = CARDPOOL.monsters.filter(m => m.tier <= tier);
            const mData = pool[Math.floor(Math.random() * pool.length)];
            this.lane.push({ ...mData, distance: 5 });

            if (this.villageHP <= 0) this.gameOver();
            else this.endTurn();
        }, 500);
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
