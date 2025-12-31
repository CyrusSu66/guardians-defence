/**
 * 《守護者防線：雷霆遺產》UI 渲染模組 (v3.1.1)
 * 實作規則：分區市集渲染、手動啟用卡片顯示、點擊啟用切換。
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

    updateUI() {
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

        // 面板顯示邏輯
        this.show('startGameBtn', g.state === GameState.IDLE);
        this.show('gameStepButtons', g.state !== GameState.IDLE);
        this.show('actionSelectPanel', g.state === GameState.VILLAGE && g.currentAction === null);
        this.show('combatPanel', g.state === GameState.COMBAT);
        this.show('restPanel', g.currentAction === 'REST');
        this.show('villageFinishControl', g.currentAction === 'VILLAGE');

        // 更新休息按鈕文字 (v3.1.3)
        const btnRestConfirm = document.querySelector('#restPanel .btn-secondary');
        if (btnRestConfirm) {
            btnRestConfirm.textContent = g.selectedDestroyIdx !== null ? '銷毀並結束行動' : '直接完成休息';
            btnRestConfirm.onclick = () => this.game.confirmRestAndDestroy();
        }

        // 核心行動按鈕狀態
        const isWaitingForAction = g.state === GameState.VILLAGE && g.currentAction === null;
        ['btnVisitVillage', 'btnRest', 'btnEnterDungeon'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !isWaitingForAction;
        });

        this.renderHand();
        this.renderPlayedCards(); // v3.1.1 已啟用卡片
        this.renderDungeonRanks();
        this.renderMarket();
        this.renderTraining();
        this.renderLog();
        this.updateCombatSummary();
    }

    renderHand() {
        const container = document.getElementById('handDisplay');
        if (!container) return;
        container.innerHTML = '';

        this.game.hand.forEach((card, idx) => {
            const el = document.createElement('div');
            el.className = 'card';

            // 點擊提示
            let clickHint = '';
            if (this.game.currentAction === 'VILLAGE') clickHint = '<div class="card-hint">[啟用資源]</div>';
            else if (this.game.currentAction === 'REST' && !this.game.hasDestroyed) clickHint = '<div class="card-hint danger">[點擊銷毀]</div>';

            el.innerHTML = `
                <div class="card-type-tag">${card.type}</div>
                <div class="card-name">${card.name}</div>
                ${this.getStatsHtml(card)}
                <div class="card-desc">${card.desc || ''}</div>
                ${clickHint}
            `;

            if (this.game.combat && (this.game.combat.selectedHeroIdx === idx || this.game.combat.selectedWeaponIdx === idx)) {
                el.classList.add('selected');
            }

            // v3.1.3 休息選中標記
            if (this.game.currentAction === 'REST' && this.game.selectedDestroyIdx === idx) {
                el.classList.add('selected');
                el.style.border = '2px solid #ff5a59';
            }

            el.onclick = () => {
                if (this.game.currentAction === 'VILLAGE' || this.game.currentAction === 'REST') {
                    this.game.playCard(idx);
                } else if (this.game.state === GameState.COMBAT) {
                    if (card.type === 'Hero') this.game.combat.selectedHeroIdx = idx;
                    else if (card.type === 'Weapon') this.game.combat.selectedWeaponIdx = idx;
                    this.updateUI();
                }
            };
            container.appendChild(el);
        });
    }

    renderPlayedCards() {
        const container = document.getElementById('playedCardsDisplay');
        if (!container) return;
        container.innerHTML = '';

        if (this.game.playedCards.length === 0) {
            container.innerHTML = '<div style="color:#666; font-size:12px; width:100%; text-align:center;">--- 尚未啟動手牌 (放置區) ---</div>';
            return;
        }

        this.game.playedCards.forEach(card => {
            const el = document.createElement('div');
            el.className = 'card small active';
            el.innerHTML = `
                <div class="card-name" style="font-size:11px;">${card.name}</div>
                <div class="card-stats" style="font-size:10px;">✅ 已啟用</div>
            `;
            container.appendChild(el);
        });
    }

    getStatsHtml(card) {
        if (card.type === 'Hero') {
            return `<div class="card-stats">⚔️ ${card.hero.attack} | ⚡ ${card.hero.magicAttack} | 💪 ${card.hero.strength}</div>`;
        } else if (card.type === 'Weapon') {
            return `<div class="card-stats">⚔️ ${card.equipment.attack} | ⚡ ${card.equipment.magicAttack} | ⚖️ ${card.equipment.weight}</div>`;
        } else if (card.goldValue) {
            return `<div class="card-stats">💰 +${card.goldValue}</div>`;
        }
        return '';
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

        const sections = [
            { label: '--- 等級 1 英雄 (Random 4) ---', cards: m.heroes },
            { label: '--- 隨機道具與裝備 (Random 4) ---', cards: m.items },
            { label: '--- 常備基礎軍需 ---', cards: m.basics }
        ];

        sections.forEach(sec => {
            const header = document.createElement('div');
            header.className = 'market-section-header';
            header.textContent = sec.label;
            grid.appendChild(header);

            sec.cards.forEach(card => {
                const canAfford = this.game.currentGold >= card.cost;
                const el = document.createElement('div');
                el.className = `market-item ${canAfford ? '' : 'disabled'} ${this.game.hasBought ? 'bought' : ''}`;
                el.innerHTML = `
                    <div class="market-item-name">${card.name}</div>
                    <div class="market-item-cost">💰 ${card.cost}</div>
                    <div class="market-item-desc">${card.desc || ''}</div>
                `;
                el.onclick = () => {
                    if (canAfford && !this.game.hasBought) this.game.buyCard(card.id, card.cost);
                };
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
            container.innerHTML = '<div class="empty-msg">手動啟用前，請保留英雄在手中以進行訓練</div>';
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

    // --- 查看功能 ---
    renderDeckView(title, list) {
        const modal = document.getElementById('deckViewModal');
        const titleEl = document.getElementById('deckViewTitle');
        const listEl = document.getElementById('deckViewList');
        if (!modal || !titleEl || !listEl) return;

        titleEl.textContent = title;
        listEl.innerHTML = '';

        if (list.length === 0) {
            listEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888;">此區域目前無任何卡片</div>';
        } else {
            list.forEach(card => {
                const el = document.createElement('div');
                el.className = 'card small';
                el.innerHTML = `
                    <div class="card-type-tag" style="font-size: 8px;">${card.type}</div>
                    <div class="card-name" style="font-size: 11px;">${card.name}</div>
                    <div class="card-desc" style="font-size: 9px;">${card.desc || ''}</div>
                `;
                listEl.appendChild(el);
            });
        }
        modal.classList.add('active');
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
