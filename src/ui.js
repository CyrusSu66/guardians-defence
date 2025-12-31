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
        ['market', 'training'].forEach(tab => {
            const el = document.getElementById(`tab-${tab}`);
            if (el) el.onclick = () => this.switchPlazaTab(tab);
        });

        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) startBtn.onclick = () => this.game.startNewGame();

        document.getElementById('btnVisitVillage').onclick = () => this.game.visitVillageAction();
        document.getElementById('btnRest').onclick = () => this.game.restAction();
        document.getElementById('btnEnterDungeon').onclick = () => this.game.enterDungeonAction();
        document.getElementById('combatAttackBtn').onclick = () => this.game.performCombat();

        // v3.3: 偵測階段按鈕如果還在
        const nextPhaseBtn = document.getElementById('nextPhaseBtn');
        if (nextPhaseBtn) nextPhaseBtn.onclick = () => this.game.nextPhase ? this.game.nextPhase() : null;
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

        // v3.3: 修正計數器刷新 (全面同步)
        this.setText('deckCount', g.deck.length);
        this.setText('discardCount', g.discard.length);
        this.setText('btnDeckCount', g.deck.length);
        this.setText('btnDiscardCount', g.discard.length);

        // v3.3: 版號直接更新到標題
        const titleEl = document.getElementById('gameTitle');
        if (titleEl) titleEl.innerText = `⚔️ 守護者防線 Guardians Defence ${g.version}`;

        const stateLabels = {
            [GameState.DRAW]: '🎲 抽牌與補給',
            [GameState.VILLAGE]: '🏪 村莊區域',
            [GameState.COMBAT]: '⚔️ 前線指揮',
            [GameState.MONSTER_ADVANCE]: '⚠️ 敵軍推進',
            [GameState.GAME_OVER]: '💀 戰役結束'
        };
        this.setText('gameState', stateLabels[g.state] || '通訊中斷');

        // v3.3: 面板與啟動按鈕顯示邏輯
        const isIdle = g.state === GameState.IDLE || g.state === GameState.GAME_OVER;
        this.show('startGameBtn', isIdle);
        this.show('headerActions', isIdle);

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
        let stats = '';
        if (card.type === 'Hero') {
            stats = `<div class="card-stats">⚔️ ${card.hero.attack} | ⚡ ${card.hero.magicAttack} | 💪 ${card.hero.strength}</div>`;
            // v3.3 技能標籤
            if (card.abilities) {
                if (card.abilities.onVillage) stats += `<div class="skill-tag village">🏠 村莊</div>`;
                if (card.abilities.onDungeon) stats += `<div class="skill-tag dungeon">🌲 地城</div>`;
                if (card.abilities.onBattle) stats += `<div class="skill-tag battle">⚔️ 戰鬥</div>`;
                if (card.abilities.onVictory) stats += `<div class="skill-tag victory">🏆 戰勝</div>`;
            }
        } else if (card.type === 'Weapon') {
            stats = `<div class="card-stats">⚔️ ${card.equipment.attack} | ⚡ ${card.equipment.magicAttack} | ⚖️ ${card.equipment.weight}</div>`;
        } else if (card.goldValue) {
            stats = `<div class="card-stats">💰 +${card.goldValue}</div>`;
        }
        return stats;
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

        // 1. 正規軍轉職 (v3.2)
        const regulars = this.game.hand.map((c, i) => ({ card: c, idx: i })).filter(x => x.card.id === 'basic_regular_army');
        if (regulars.length > 0) {
            const promoSection = document.createElement('div');
            promoSection.className = 'training-promo-section';
            promoSection.innerHTML = `<h4>🛡 正規軍轉職 (需 1 XP)</h4>`;

            regulars.forEach(reg => {
                const regEl = document.createElement('div');
                regEl.className = 'training-promo-item';
                regEl.innerHTML = `<div><strong>正規軍 (#${reg.idx + 1})</strong> 可轉職為：</div>`;

                const btnGroup = document.createElement('div');
                btnGroup.style.display = 'flex';
                btnGroup.style.gap = '5px';
                btnGroup.style.marginTop = '5px';

                this.game.marketItems.heroes.forEach(marketHero => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-primary small';
                    btn.style.fontSize = '10px';
                    btn.style.padding = '5px';
                    btn.textContent = marketHero.name;
                    btn.disabled = this.game.currentXP < 1;
                    btn.onclick = () => this.game.promoteRegularArmy(reg.idx, marketHero.id);
                    btnGroup.appendChild(btn);
                });
                regEl.appendChild(btnGroup);
                promoSection.appendChild(regEl);
            });
            container.appendChild(promoSection);
        }

        // 2. 英雄升級
        const upgradable = this.game.hand.filter(c => c.type === 'Hero' && c.hero && c.hero.upgradeToId);
        if (upgradable.length > 0) {
            const upgradeHeader = document.createElement('div');
            upgradeHeader.innerHTML = `<h4 style="margin-top:15px;">🌟 英雄晉階</h4>`;
            container.appendChild(upgradeHeader);

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

        if (regulars.length === 0 && upgradable.length === 0) {
            container.innerHTML = '<div class="empty-msg">手牌中無可訓練或轉職的單位</div>';
        }
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

        // v3.3：使用精確計算邏輯顯示加成
        let totalLight = 0;
        this.game.hand.forEach(c => totalLight += (c.light || 0));
        const auras = this.game.getActiveAuras();
        const lightReq = targetRank + auras.lightReqMod;
        const lightPenalty = Math.max(0, lightReq - totalLight) * 2;

        const { physAtk, magAtk, bonuses } = this.game.calculateHeroCombatStats(hero, weapon, monster, lightPenalty);
        const totalAtk = physAtk + magAtk;

        summary.innerHTML = `
            <div style="border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 5px;">
                <strong>已選：</strong> ${hero.name} ${weapon ? ' + ' + weapon.name : ''}
            </div>
            <div style="font-size: 15px; color: var(--color-primary); font-weight: bold;">
                預估總戰力：${totalAtk}
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 5px; line-height: 1.4;">
                ${bonuses.length > 0 ? '🔹 ' + bonuses.join('<br>🔹 ') : '（無額外修正）'}
            </div>
            <div style="margin-top: 5px; font-weight: bold;">
                目標：${monster ? monster.name + ' (HP: ' + monster.monster.hp + ')' : '<span style="color:#ff5a59;">（未選目標）</span>'}
            </div>
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
