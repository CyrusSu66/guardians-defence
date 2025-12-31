/**
 * 《守護者防線：雷霆遺產》UI 渲染模組 (v3.1)
 * 實作規則：手動流程控制、分區市集、休息銷毀 UI。
 */

import { GameState } from './data.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        ['market', 'training', 'craft'].forEach(tab => {
            const el = document.getElementById(`tab-${tab}`);
            if (el) el.onclick = () => this.switchPlazaTab(tab);
        });

        document.getElementById('startGameBtn').onclick = () => this.game.startNewGame();
        document.getElementById('btnVisitVillage').onclick = () => this.game.visitVillageAction();
        document.getElementById('btnRest').onclick = () => this.game.restAction();
        document.getElementById('btnEnterDungeon').onclick = () => this.game.enterDungeonAction();
        document.getElementById('combatAttackBtn').onclick = () => this.game.performCombat();
    }

    switchPlazaTab(tabName) {
        document.querySelectorAll('.plaza-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.plaza-content').forEach(c => c.classList.remove('active'));
        const tabBtn = document.getElementById(`tab-${tabName}`);
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    }

    updateUI(options = {}) {
        const g = this.game;
        this.setText('villageHP', g.villageHP);
        document.getElementById('villageHP')?.classList.toggle('danger', g.villageHP <= 5);
        this.setText('totalScore', g.totalScore);
        this.setText('currentXP', g.currentXP);
        this.setText('turnNumber', g.turn);
        this.setText('plazaCoinDisplay', g.currentGold);
        this.setText('deckCount', g.deck.length);
        this.setText('discardCount', g.discard.length);
        this.setText('buildVersion', `Build: ${g.version}`);

        const stateLabels = {
            [GameState.DRAW]: '🎲 抽牌與補給',
            [GameState.VILLAGE]: '🏪 村莊區域',
            [GameState.COMBAT]: '⚔️ 前線指揮',
            [GameState.MONSTER_ADVANCE]: '⚠️ 敵軍推進',
            [GameState.GAME_OVER]: '💀 戰役結束'
        };
        this.setText('gameState', stateLabels[g.state] || '通訊中斷');

        // 面板顯示邏輯 (v3.1)
        this.show('startGameBtn', g.state === GameState.IDLE);
        this.show('gameStepButtons', g.state !== GameState.IDLE);
        this.show('actionSelectPanel', g.state === GameState.VILLAGE && g.currentAction === null);
        this.show('combatPanel', g.state === GameState.COMBAT);
        this.show('restPanel', g.currentAction === 'REST');
        this.show('villageFinishControl', g.currentAction === 'VILLAGE');

        // 核心行動按鈕狀態
        const isWaitingForAction = g.state === GameState.VILLAGE && g.currentAction === null;
        ['btnVisitVillage', 'btnRest', 'btnEnterDungeon'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !isWaitingForAction;
        });

        this.renderHand(options);
        this.renderDungeonRanks();
        this.renderMarket();
        this.renderTraining();
        this.renderLog();
        this.updateCombatSummary();
    }

    renderHand(options = {}) {
        const container = document.getElementById('handDisplay');
        if (!container) return;
        container.innerHTML = '';

        this.game.hand.forEach((card, idx) => {
            const el = document.createElement('div');
            el.className = 'card';
            let infoText = '';
            if (card.type === 'Hero') {
                infoText = `<div class="card-stats">⚔️ ${card.hero.attack} | ⚡ ${card.hero.magicAttack} | 💪 ${card.hero.strength}</div>`;
            } else if (card.type === 'Weapon') {
                infoText = `<div class="card-stats">⚔️ ${card.equipment.attack} | ⚡ ${card.equipment.magicAttack} | ⚖️ ${card.equipment.weight}</div>`;
            } else if (card.goldValue) {
                infoText = `<div class="card-stats">💰 +${card.goldValue}</div>`;
            }

            el.innerHTML = `
                <div class="card-type-tag">${card.type}</div>
                <div class="card-name">${card.name}</div>
                ${infoText}
                <div class="card-desc">${card.desc || ''}</div>
            `;

            if (this.game.combat && (this.game.combat.selectedHeroIdx === idx || this.game.combat.selectedWeaponIdx === idx)) {
                el.classList.add('selected');
            }

            // v3.1 休息銷毀點擊
            if (this.game.currentAction === 'REST') {
                el.style.border = '1px dashed #ff5a59';
                el.innerHTML += `<div style="text-align:center; color:#ff5a59; font-size:10px; margin-top:5px;">[點擊銷毀]</div>`;
                el.onclick = () => this.game.destroyCard(card.id);
            } else {
                el.onclick = () => {
                    if (this.game.state === GameState.COMBAT) {
                        if (card.type === 'Hero') this.game.combat.selectedHeroIdx = idx;
                        else if (card.type === 'Weapon') this.game.combat.selectedWeaponIdx = idx;
                        this.updateUI();
                    }
                };
            }
            container.appendChild(el);
        });
    }

    renderDungeonRanks() {
        const container = document.getElementById('dungeonRankSlots');
        if (!container) return;
        container.innerHTML = '';
        [1, 2, 3].forEach(rank => {
            const el = document.createElement('div');
            el.className = 'lane-slot dungeon-rank';
            const monster = this.game.dungeonHall[`rank${rank}`];
            const lightPenalty = -rank;
            if (monster) {
                el.classList.add('occupied');
                if (monster.hasThunderstone) el.classList.add('boss-marked');
                el.innerHTML = `
                    <div class="rank-label">Rank ${rank} (💡 ${lightPenalty})</div>
                    <div class="monster-name">${monster.name}</div>
                    <div class="monster-hp">❤️ HP: ${monster.monster.hp}</div>
                    <div class="monster-reward">XP: ${monster.monster.xpGain}</div>
                `;
                if (this.game.state === GameState.COMBAT) {
                    el.style.cursor = 'pointer';
                    if (this.game.combat && this.game.combat.targetRank === rank) el.classList.add('target-locked');
                    el.onclick = () => this.game.selectCombatTarget(rank);
                }
            } else {
                el.innerHTML = `<div class="rank-label">Rank ${rank}</div><div class="empty-slot">空</div>`;
            }
            container.appendChild(el);
        });
    }

    renderMarket() {
        const grid = document.getElementById('marketGrid');
        if (!grid) return;
        grid.innerHTML = '';
        const m = this.game.marketItems;
        if (!m || !m.heroes) return;

        // 渲染英雄、道具、基礎
        const sections = [
            { label: '--- 等級 1 英雄 ---', cards: m.heroes },
            { label: '--- 法術與物資 ---', cards: m.items },
            { label: '--- 常備軍需 ---', cards: m.basics }
        ];

        sections.forEach(sec => {
            const header = document.createElement('div');
            header.style = 'grid-column: 1/-1; padding: 10px; color: #888; font-size: 12px; text-align: center;';
            header.textContent = sec.label;
            grid.appendChild(header);

            sec.cards.forEach(card => {
                const canAfford = this.game.currentGold >= card.cost;
                const el = document.createElement('div');
                el.className = `market-item ${canAfford ? '' : 'disabled'}`;
                el.innerHTML = `
                    <div class="market-item-name">${card.name}</div>
                    <div class="market-item-cost">💰 ${card.cost}</div>
                    <div class="market-item-desc">${card.desc || ''}</div>
                `;
                el.onclick = () => { if (canAfford) this.game.buyCard(card.id, card.cost); };
                grid.appendChild(el);
            });
        });
    }

    renderTraining() {
        const container = document.getElementById('trainingHeroes');
        if (!container) return;
        container.innerHTML = '';
        const upgradable = this.game.hand.filter(c => c.type === 'Hero' && c.hero.upgradeToId);
        if (upgradable.length === 0) {
            container.innerHTML = '<div class="empty-msg">手牌中目前無可晉升的英雄</div>';
            return;
        }
        upgradable.forEach(h => {
            const canAfford = this.game.currentXP >= h.hero.xpToUpgrade;
            const el = document.createElement('div');
            el.className = 'training-hero-item';
            el.innerHTML = `
                <div class="hero-info"><strong>${h.name}</strong> ➔ 需 ${h.hero.xpToUpgrade} XP</div>
                <button class="btn btn-primary" ${canAfford ? '' : 'disabled'} 
                    onclick="window.game.upgradeHero('${h.id}')">升級</button>
            `;
            container.appendChild(el);
        });
    }

    renderLog() {
        const container = document.getElementById('gameLog');
        if (!container) return;
        container.innerHTML = '';
        this.game.log.forEach(l => {
            const el = document.createElement('div');
            el.className = `log-entry ${l.type}`;
            el.textContent = `> ${l.message}`;
            container.appendChild(el);
        });
    }

    updateCombatSummary() {
        const summary = document.getElementById('combatSummary');
        if (!summary || this.game.state !== GameState.COMBAT) return;
        const { selectedHeroIdx, selectedWeaponIdx, targetRank } = this.game.combat;
        const hero = this.game.hand[selectedHeroIdx];
        const weapon = this.game.hand[selectedWeaponIdx];
        const monster = targetRank ? this.game.dungeonHall[`rank${targetRank}`] : null;

        if (!hero) {
            summary.innerHTML = '<span style="color: #ff5a59;">👉 請選擇英雄</span>';
            return;
        }
        const baseAtk = hero.hero.attack + (weapon ? weapon.equipment.attack : 0);
        summary.innerHTML = `
            <strong>已選：</strong> ${hero.name} ${weapon ? ' + ' + weapon.name : ''}<br>
            預估戰力：${baseAtk} | 負重：${hero.hero.strength}/${weapon ? weapon.equipment.weight : 0}<br>
            目標：${monster ? monster.name : '（未選目標）'}
        `;
        const btn = document.getElementById('combatAttackBtn');
        if (btn) btn.disabled = !hero || !targetRank;
    }

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    show(id, isShow) {
        const el = document.getElementById(id);
        if (el) el.style.display = isShow ? 'block' : 'none';
        if (el && id === 'gameStepButtons') el.style.display = isShow ? 'flex' : 'none';
        if (el && id === 'villageFinishControl') el.style.display = isShow ? 'flex' : 'none';
    }
}
