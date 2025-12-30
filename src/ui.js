/**
 * 《守護者防線》UI 渲染模組
 * 負責所有 DOM 操作與畫面更新。
 */

import { GameState, MARKET_CARDS, CRAFTING_RECIPES } from './data.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 分頁切換
        ['market', 'training', 'craft'].forEach(tab => {
            document.getElementById(`tab-${tab}`).onclick = () => this.switchPlazaTab(tab);
        });

        // 按鈕綁定
        document.getElementById('startGameBtn').onclick = () => this.game.startNewGame();
        document.getElementById('nextPhaseBtn').onclick = () => this.game.nextPhase();
        document.getElementById('combatAttackBtn').onclick = () => this.game.performAttack();
    }

    switchPlazaTab(tabName) {
        document.querySelectorAll('.plaza-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.plaza-content').forEach(c => c.classList.remove('active'));

        document.getElementById(`tab-${tabName}`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    updateUI() {
        const g = this.game;

        // 基礎數值
        document.getElementById('villageHP').textContent = g.villageHP;
        document.getElementById('villageHP').classList.toggle('danger', g.villageHP <= 5);
        document.getElementById('totalScore').textContent = g.totalScore;
        document.getElementById('crystals').textContent = g.crystals;
        document.getElementById('currentXP').textContent = g.currentXP;
        document.getElementById('turnNumber').textContent = g.turn;
        document.getElementById('plazaCoinDisplay').textContent = g.currentGold;
        document.getElementById('deckCount').textContent = g.deck.length;
        document.getElementById('discardCount').textContent = g.discard.length;

        const stateLabels = {
            [GameState.DRAW]: '資源補給中',
            [GameState.VILLAGE]: '村莊整備',
            [GameState.COMBAT]: '前線交戰',
            [GameState.MONSTER_ADVANCE]: '怪物突擊',
            [GameState.END_TURN]: '重整旗鼓'
        };
        document.getElementById('gameState').textContent = stateLabels[g.state] || '通訊中斷';

        // 控制面板可見性
        const startBtn = document.getElementById('startGameBtn');
        const stepBtns = document.getElementById('gameStepButtons');
        if (g.state === GameState.IDLE) {
            startBtn.style.display = 'block';
            stepBtns.style.display = 'none';
        } else {
            startBtn.style.display = 'none';
            stepBtns.style.display = 'flex';
        }

        // 階段按鈕狀態
        document.getElementById('nextPhaseBtn').disabled = g.state !== GameState.VILLAGE;
        document.getElementById('combatPanel').style.display = g.state === GameState.COMBAT ? 'block' : 'none';

        this.renderHand();
        this.renderLane();
        this.renderMarket();
        this.renderTraining();
        this.renderCrafting();
        this.renderLog();
        this.updateCombatSummary();
    }

    renderHand() {
        const container = document.getElementById('handDisplay');
        container.innerHTML = '';

        this.game.hand.forEach((card, idx) => {
            const el = document.createElement('div');
            el.className = 'card';

            // 是否選中（資源卡）
            if (this.game.selectedCards.some(s => s.index === idx)) el.classList.add('selected');
            // 是否選中（戰鬥卡）
            if (this.game.combat && (this.game.combat.heroHandIndex === idx || this.game.combat.weaponHandIndex === idx)) {
                el.classList.add('selected');
            }

            let val = card.type;
            if (card.coin) val = `+${card.coin}$`;
            else if (card.xp) val = `+${card.xp}XP`;
            else if (card.damage) val = `${card.damage}DMG`;
            else if (card.attack) val = `${card.attack}ATK`;

            el.innerHTML = `<div class="card-name">${card.name}</div><div class="card-value">${val}</div>`;

            // 互動限制
            let playable = false;
            if (this.game.state === GameState.VILLAGE) {
                if (card.coin || card.xp || card.usage === 'village') playable = true;
            } else if (this.game.state === GameState.COMBAT) {
                if (card.type === 'Hero' || card.type === 'Weapon' || card.usage === 'combat') playable = true;
            }
            if (!playable) el.classList.add('disabled');

            // 點擊事件
            el.onclick = () => {
                if (this.game.state === GameState.VILLAGE) {
                    if (card.coin || card.xp) this.game.toggleCardSelection(idx);
                    else if (card.usage === 'village') this.game.playVillageSpell(idx);
                } else if (this.game.state === GameState.COMBAT) {
                    if (card.type === 'Hero') {
                        this.game.selectCombatHero(idx);
                        this.updateCombatSummary(); // 強制更新摘要
                    }
                    if (card.type === 'Weapon') {
                        this.game.selectCombatWeapon(idx);
                        this.updateCombatSummary(); // 強制更新摘要
                    }
                    if (card.usage === 'combat') this.game.playCombatSpell(idx);
                }
            };

            // 法術按鈕
            if ((card.usage === 'village' && this.game.state === GameState.VILLAGE) ||
                (card.usage === 'combat' && this.game.state === GameState.COMBAT)) {
                const btn = document.createElement('button');
                btn.className = 'card-action-btn';
                btn.textContent = (card.usage === 'village') ? '打出' : '發動';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (card.usage === 'village') this.game.playVillageSpell(idx);
                    if (card.usage === 'combat') this.game.playCombatSpell(idx);
                };
                el.appendChild(btn);
            }

            container.appendChild(el);
        });

        // 資源確認區
        const confirmArea = document.getElementById('confirmationArea');
        if (this.game.selectedCards.length > 0) {
            confirmArea.style.display = 'block';
            const cardsList = document.getElementById('confirmationCards');
            cardsList.innerHTML = '';
            this.game.selectedCards.forEach(item => {
                const c = item.card;
                cardsList.innerHTML += `<div class="status-item" style="padding: 5px 10px; margin-bottom: 0; min-width: 80px;"><div class="status-label">${c.name}</div></div>`;
            });
        } else {
            confirmArea.style.display = 'none';
        }
    }

    renderLane() {
        const laneSlots = document.getElementById('laneSlots');
        laneSlots.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'lane-slot';
            const mon = this.game.lane.find(m => m.distance === i);

            if (mon) {
                slot.classList.add('occupied');
                if (mon.hp < mon.maxHp) slot.classList.add('damaged');
                slot.innerHTML = `
                    <div class="lane-slot-monster-name">${mon.name}</div>
                    <div class="lane-slot-hp">HP: ${mon.hp}/${mon.maxHp}</div>
                    <div class="lane-slot-distance">距 ${i}</div>
                `;
                if (this.game.state === GameState.COMBAT) {
                    slot.style.border = '2px dashed var(--color-primary)';
                    if (this.game.combat && this.game.combat.targetDistance === i) slot.style.borderColor = '#fff';
                    slot.onclick = () => this.game.selectCombatTarget(i);
                }
            } else {
                slot.innerHTML = `<span style="color: #444; font-size: 10px;">距離 ${i}</span>`;
            }
            laneSlots.appendChild(slot);
        }
    }

    renderMarket() {
        const grid = document.getElementById('marketGrid');
        grid.innerHTML = '';
        MARKET_CARDS.early.forEach(item => {
            const card = this.game.getCardById(item.id);
            const disabled = this.game.currentGold < item.cost;
            const el = document.createElement('div');
            el.className = `market-item ${disabled ? 'disabled' : ''}`;
            el.innerHTML = `
                <div class="market-item-name">${item.name}</div>
                <div class="market-item-cost">💰 ${item.cost}</div>
                <div class="market-item-desc">${card.desc || ''}</div>
            `;
            el.onclick = () => { if (!disabled) this.game.buyCard(item.id, item.cost); };
            grid.appendChild(el);
        });
    }

    renderTraining() {
        const container = document.getElementById('trainingHeroes');
        container.innerHTML = '';
        const uniqueHeroes = new Map();
        this.game.hand.filter(c => c.type === 'Hero' && c.upgradeToId).forEach(h => {
            if (!uniqueHeroes.has(h.class)) uniqueHeroes.set(h.class, h);
        });

        if (uniqueHeroes.size === 0) {
            container.innerHTML = '<div style="color:#555; text-align:center; padding: 20px;">目前手牌中無可升級英雄</div>';
        } else {
            uniqueHeroes.forEach(h => {
                const disabled = this.game.currentXP < h.xpToUpgrade;
                const el = document.createElement('div');
                el.className = 'training-hero-item';
                el.innerHTML = `
                    <div>
                        <span class="training-hero-name">${h.name}</span>
                        <span class="training-hero-cost">升級需 ${h.xpToUpgrade} XP</span>
                    </div>
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;" ${disabled ? 'disabled' : ''} onclick="window.game.upgradeHero('${h.id}')">升級</button>
                `;
                container.appendChild(el);
            });
        }
    }

    renderCrafting() {
        const container = document.getElementById('craftingList');
        container.innerHTML = '';
        CRAFTING_RECIPES.forEach(r => {
            const disabled = this.game.currentGold < r.costCoin || this.game.crystals < r.costCrystal;
            const el = document.createElement('div');
            el.className = 'crafting-item';
            el.innerHTML = `
                <div>
                    <span class="crafting-name">${r.name}</span>
                    <span class="crafting-cost">${r.desc}</span>
                </div>
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 11px;" ${disabled ? 'disabled' : ''} onclick="window.game.craftCard('${r.id}', ${r.costCoin}, ${r.costCrystal})">鍛造</button>
            `;
            container.appendChild(el);
        });
    }

    renderLog() {
        const logContent = document.getElementById('gameLog');
        logContent.innerHTML = '';
        this.game.log.forEach(l => {
            const el = document.createElement('div');
            el.className = `log-entry ${l.type}`;
            el.textContent = `> ${l.message}`;
            logContent.appendChild(el);
        });
    }

    updateCombatSummary() {
        const summary = document.getElementById('combatSummary');
        if (this.game.state !== GameState.COMBAT) return;

        const { heroHandIndex, weaponHandIndex, targetDistance } = this.game.combat;
        const h = heroHandIndex !== null ? this.game.hand[heroHandIndex] : null;
        const w = weaponHandIndex !== null ? this.game.hand[weaponHandIndex] : null;
        const atk = (h?.attack || 0) + (w?.attack || 0);
        const rng = Math.max(h?.range || 0, w?.range || 0);

        if (!h) {
            summary.innerHTML = '<span style="color: #ff5a59;">！請先從手牌中點選一名英雄</span>';
        } else {
            summary.innerHTML = `
                💥 已就緒：<strong>${h.name}</strong> ${w ? '+ ' + w.name : ''}<br>
                火力：${atk} | 射程：${rng}<br>
                目標：${targetDistance ? `距離 ${targetDistance}` : '<span style="color:var(--color-warning)">請選怪物目標</span>'}
            `;
        }

        document.getElementById('combatAttackBtn').disabled = !h || !targetDistance;
    }

    showDeckModal(type) {
        const list = type === 'deck' ? this.game.deck : this.game.discard;
        const container = document.getElementById('deckViewList');
        const title = document.getElementById('deckViewTitle');

        title.textContent = (type === 'deck' ? '通訊牌庫' : '已棄置區域') + ` [${list.length}]`;
        container.innerHTML = '';

        list.forEach(c => {
            const el = document.createElement('div');
            el.style.cssText = 'background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px; font-size: 11px; color: #aaa;';
            el.textContent = c.name;
            container.appendChild(el);
        });

        document.getElementById('deckViewModal').classList.add('active');
    }

    showDamage(dist, amount) {
        const lanes = document.getElementById('laneSlots').children;
        const slot = lanes[dist - 1];
        if (slot) {
            const el = document.createElement('div');
            el.className = 'damage-number';
            el.textContent = `-${amount}`;
            slot.appendChild(el);
            setTimeout(() => el.remove(), 1000);
        }
    }
}
