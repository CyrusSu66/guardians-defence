/**
 * 《守護者防線：雷霆遺產》UI 渲染模組 (v3.1.1)
 * 實作規則：分區市集渲染、手動啟用卡片顯示、點擊啟用切換。
 */

import { GameState } from './data.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        window.ui = this; // 確保全局可用，支援地城卡片點擊
        this.setupEventListeners();
    }

    setupEventListeners() {
        ['market', 'training'].forEach(tab => {
            const el = document.getElementById(`tab-${tab}`);
            if (el) el.onclick = () => this.switchPlazaTab(tab);
        });

        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) startBtn.onclick = () => this.game.startNewGame();

        this.setupEventListeners();

        // [Deep Debug] Global Click Spy
        document.addEventListener('click', (e) => {
            console.log(`[Global Click] Target:`, e.target, `Classes: ${e.target.className}`);
            if (e.target.classList.contains('monster-info-btn')) {
                console.warn('[Global Click] HIT MONSTER INFO BUTTON!');
            }
        });
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
        const g = this.game;

        g.hand.forEach((card, idx) => {
            let isSelected = false;
            // 戰鬥選中標記
            if (g.combat && (g.combat.selectedHeroIdx === idx || g.combat.selectedWeaponIdx === idx)) {
                isSelected = true;
            }
            // 休息選中標記
            if (g.currentAction === 'REST' && g.selectedDestroyIdx === idx) {
                isSelected = true;
            }

            const onClick = () => {
                if (g.currentAction === 'VILLAGE' || g.currentAction === 'REST') {
                    g.playCard(idx);
                } else if (g.state === GameState.COMBAT) {
                    if (card.type === 'Hero') g.combat.selectedHeroIdx = idx;
                    else if (card.type === 'Weapon') g.combat.selectedWeaponIdx = idx;
                    this.updateUI();
                }
            };

            const cardEl = this.renderCard(card, onClick, isSelected);

            // 點擊提示
            if (g.currentAction === 'VILLAGE') {
                const hintEl = document.createElement('div');
                hintEl.className = 'card-hint';
                hintEl.innerHTML = '[啟用資源]';
                cardEl.appendChild(hintEl);
            } else if (g.currentAction === 'REST' && !g.hasDestroyed) {
                const hintEl = document.createElement('div');
                hintEl.className = 'card-hint danger';
                hintEl.innerHTML = '[點擊銷毀]';
                cardEl.appendChild(hintEl);
            }

            if (g.currentAction === 'REST' && g.selectedDestroyIdx === idx) {
                cardEl.style.border = '2px solid #ff5a59';
            }

            container.appendChild(cardEl);
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

    getStatsHtml(card, isMarket = false) {
        let stats = '';
        if (card.type === 'Hero') {
            stats = `<div class="card-stats">⚔️ ${card.hero.attack} | 🪄 ${card.hero.magicAttack} | 💪 ${card.hero.strength}</div>`;
            if (card.abilities) {
                stats += '<div style="display:flex; gap:2px; margin-top:3px;">';
                if (card.abilities.onVillage) stats += `<div class="skill-tag village">🏠</div>`;
                if (card.abilities.onDungeon) stats += `<div class="skill-tag dungeon">🌲</div>`;
                if (card.abilities.onBattle) stats += `<div class="skill-tag battle">⚔️</div>`;
                if (card.abilities.onVictory) stats += `<div class="skill-tag victory">🏆</div>`;
                stats += '</div>';
            }
        } else if (card.type === 'Weapon') {
            stats = `<div class="card-stats">⚔️ ${card.equipment.attack} | 🪄 ${card.equipment.magicAttack} | ⚖️ ${card.equipment.weight}</div>`;
        } else if (card.goldValue) {
            stats = `<div class="card-stats">🪙 +${card.goldValue}</div>`;
        }

        // v3.7: 增加照明屬性顯示 (💡)
        if (card.light > 0) {
            stats += `<div class="card-stats" style="color:#ffeb3b;">💡 +${card.light}</div>`;
        }

        // v3.4 底部資訊
        let footer = '<div class="card-footer-info">';
        if (isMarket) {
            footer += `<div class="card-stats-badge" style="color:#ffd700;">💰 ${card.cost}</div>`;
        }
        if (card.goldValue > 0) {
            footer += `<div class="card-stats-badge" style="color:#ffd700; margin-left:auto;">🪙 ${card.goldValue}</div>`;
        }
        footer += '</div>';

        return stats + footer;
    }

    // v3.4: 統一的卡牌渲染函數
    renderCard(card, onClick, isSelected = false, isMarket = false) {
        const div = document.createElement('div');
        div.className = `card ${card.type.toLowerCase()} ${isSelected ? 'selected' : ''}`;

        // v3.4: 增加右鍵或雙擊顯示詳情的提示感 (這裡改為點擊名稱或特定區域，或者按住)
        // 為了不影響原有操作，我們在卡片右上角加一個 (i) 按鈕
        div.innerHTML = `
            <div class="card-info-btn" onclick="event.stopPropagation(); window.game.ui.showCardDetail('${card.id}')">ⓘ</div>
            <div class="card-type">${card.type}</div>
            <div class="card-name">${card.name}</div>
            ${this.getStatsHtml(card, isMarket)}
        `;
        div.onclick = onClick;
        return div;
    }

    // v3.4 顯示卡牌詳情 Tooltip
    showCardDetail(cardId) {
        const card = this.game.getCardPoolItem(cardId);
        if (!card) return;

        document.getElementById('ttType').innerText = card.type;
        document.getElementById('ttTitle').innerText = card.name;

        // 生成描述
        let desc = card.description || '（無特殊效果說明）';
        if (card.abilities) {
            desc += '<div style="margin-top:10px; border-top:1px solid #444; padding-top:10px;"><strong>特殊能力：</strong><br>';

            // v3.5：定義未實作或開發中的關鍵字
            const isIncomplete = (text) => text.includes('開發中') || text.includes('待實作');
            const getStyledSkill = (icon, label, text) => {
                const style = isIncomplete(text) ? 'color: #ff5a59; font-weight: bold;' : '';
                return `<span style="${style}">${icon} ${label}：${text}</span><br>`;
            };

            if (card.abilities.onVillage) desc += getStyledSkill('🏠', '於村莊', card.abilities.onVillage);
            if (card.abilities.onDungeon) desc += getStyledSkill('🌲', '入地城', card.abilities.onDungeon);
            if (card.abilities.onBattle) desc += getStyledSkill('⚔️', '戰鬥中', card.abilities.onBattle);
            if (card.abilities.onVictory) desc += getStyledSkill('🏆', '戰勝後', card.abilities.onVictory);
            desc += '</div>';
        }
        document.getElementById('ttDescription').innerHTML = desc;

        // 生成數值網格
        let statsHtml = '';
        if (card.hero) {
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">攻擊力</div><div class="tooltip-stat-value">⚔️ ${card.hero.attack}</div></div>`;
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">魔攻力</div><div class="tooltip-stat-value">🪄 ${card.hero.magicAttack}</div></div>`;
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">力量</div><div class="tooltip-stat-value">💪 ${card.hero.strength}</div></div>`;
        } else if (card.equipment) {
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">攻擊力</div><div class="tooltip-stat-value">⚔️ ${card.equipment.attack}</div></div>`;
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">重量</div><div class="tooltip-stat-value">⚖️ ${card.equipment.weight}</div></div>`;
        }

        if (card.cost) {
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">購買費用</div><div class="tooltip-stat-value" style="color:#ffd700;">💰 ${card.cost}</div></div>`;
        }
        if (card.goldValue) {
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">提供金錢</div><div class="tooltip-stat-value" style="color:#ffd700;">🪙 ${card.goldValue}</div></div>`;
        }
        if (card.light) {
            statsHtml += `<div class="tooltip-stat-item"><div class="tooltip-stat-label">照明點數</div><div class="tooltip-stat-value" style="color:#ffeb3b;">💡 ${card.light}</div></div>`;
        }
        document.getElementById('ttStats').innerHTML = statsHtml;
        document.getElementById('ttLore').innerText = card.lore || "此卡片尚未被歷史記載。";

        document.getElementById('cardTooltipOverlay').classList.add('active');
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

                // v3.5：顯示動態 HP
                const hpPercent = (monster.currentHP / monster.monster.hp) * 100;
                const hpColor = hpPercent > 50 ? '#4caf50' : (hpPercent > 25 ? '#ff9800' : '#f44336');

                el.innerHTML = `
                    <div class="rank-label">Rank ${rank} (💡 ${lightPenalty})</div>
                    <div class="monster-name">${monster.name}</div>
                    <div class="monster-hp" style="color: ${hpColor}; font-weight: bold;">❤️ HP: ${monster.currentHP}/${monster.monster.hp}</div>
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
        const marketGrid = document.getElementById('marketGrid');
        if (!marketGrid) return;
        marketGrid.innerHTML = '';
        const g = this.game;

        const sections = [
            { label: '--- 等級 1 英雄 (Random 4) ---', cards: g.marketItems.heroes },
            { label: '--- 隨機道具與裝備 (Random 4) ---', cards: g.marketItems.items },
            { label: '--- 常備基礎軍需 ---', cards: g.marketItems.basics },
            { label: '--- 魔法卷軸 ---', cards: g.marketItems.spells || [] }
        ];

        sections.forEach(sec => {
            const header = document.createElement('div');
            header.className = 'market-section-header';
            header.textContent = sec.label;
            marketGrid.appendChild(header);

            sec.cards.forEach(card => {
                const canAfford = g.currentGold >= card.cost;
                const onClick = () => {
                    if (canAfford && !g.hasBought) this.game.buyCard(card.id, card.cost);
                };

                const cardEl = this.renderCard(card, onClick, false, true);
                if (!canAfford) cardEl.classList.add('disabled');
                if (g.hasBought) cardEl.classList.add('bought');

                marketGrid.appendChild(cardEl);
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

    renderDungeonRanks() {
        const container = document.getElementById('dungeonRankSlots');
        if (!container) return;
        container.innerHTML = '';
        [1, 2, 3].forEach(rank => {
            const el = document.createElement('div');
            el.className = 'lane-slot dungeon-rank';
            const monster = this.game.dungeonHall[`rank${rank}`];
            const lightPenalty = -rank; // This is the base penalty, not the final one.
            if (!monster) {
                el.innerHTML = `<div class="rank-label">Rank ${rank}</div><div class="empty-slot">空</div>`;
            } else {
                const isSelected = this.game.combat && this.game.combat.targetRank === rank;
                const tsMarker = monster.hasThunderstone ? '<div class="thunderstone-badge">💠</div>' : '';
                // v3.5：顯示動態 HP
                const hpPercent = (monster.currentHP / monster.monster.hp) * 100;
                const hpColor = hpPercent > 50 ? '#4caf50' : (hpPercent > 25 ? '#ff9800' : '#f44336');

                el.classList.add('occupied');
                if (monster.hasThunderstone) el.classList.add('boss-marked');

                el.innerHTML = `
                    <div class="rank-label">Rank ${rank} (💡 ${lightPenalty})</div>
                    ${tsMarker}
                    <div class="monster-name" style="font-weight: bold;">${monster.name}</div>
                    <div class="monster-hp" style="color: ${hpColor}; font-weight: bold;">❤️ HP: ${monster.currentHP}/${monster.monster.hp}</div>
                    <div style="font-size: 11px; color: #ff5a59; margin-top: 4px; font-weight: bold; background: #000; border: 1px solid #ff5a59; padding: 2px 8px; border-radius: 4px; display: inline-block; box-shadow: 0 0 5px rgba(255,90,89,0.3);">⚠️ 村莊受損: ${monster.monster.breachDamage || 1}</div>
                    <div style="font-size: 10px; color: #4caf50; margin-top: 2px;">✨ 獎勵: ${monster.monster.xpGain} XP</div>
                    <div class="card-info-btn monster-info-btn" 
                         title="查看怪物詳情"
                         onclick="event.stopPropagation(); console.log('[UI DEBUG] Inline Click monster ${monster.id}'); window.ui.showMonsterDetail('${monster.id}');">ⓘ</div>
                `;

                if (this.game.state === GameState.COMBAT) {
                    el.style.cursor = 'pointer';
                    if (isSelected) el.classList.add('target-locked');
                    el.onclick = () => this.game.selectCombatTarget(rank);
                }
            }
            container.appendChild(el);
        });
        this.renderMonsterDeckInspector(); // v3.11
    }

    /**
     * 怪物牌庫監查器 (v3.11 Debug Tool)
     */
    renderMonsterDeckInspector() {
        const container = document.getElementById('debugDeckInspector');
        if (!container) return;

        const deck = this.game.monsterDeck;
        container.innerHTML = `
            <div style="font-size: 11px; color: #aaa; margin-top: 15px; border: 1px dashed #555; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>🔎 [DEBUG] 怪物牌庫餘量: <strong>${deck.length}</strong></span>
                    <span style="color:#00e5ff; cursor:pointer; text-decoration: underline;" onclick="const list = this.parentElement.nextElementSibling; list.style.display = (list.style.display==='none'?'block':'none')">顯示/隱藏清單</span>
                </div>
                <div style="display:none; max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.5); padding: 8px; margin-top: 8px; border-top: 1px solid #444; line-height: 1.6;">
                    ${deck.map((m, i) => `
                        <div style="display: flex; justify-content: space-between; ${m.hasThunderstone ? 'color:#00e5ff; font-weight:bold; background: rgba(0,229,255,0.1);' : ''}">
                            <span>${deck.length - i}. ${m.name}${m.hasThunderstone ? ' 💠' : ''}</span>
                            <span style="opacity: 0.5;">(HP: ${m.monster.hp}⚔️${m.monster.breachDamage})</span>
                        </div>
                    `).reverse().join('')}
                </div>
            </div>
        `;
    }

    /**
     * 顯示怪物詳細資訊 Tooltip (v3.10)
     */
    showMonsterDetail(monsterId) {
        console.log(`[UI] showMonsterDetail called with ID: ${monsterId}`);
        // v3.15: 自動校準 ID (例如 mon_rat_0 -> mon_rat)
        const templateId = monsterId.includes('_') ? monsterId.split('_')[0] : monsterId;
        console.log(`[UI] Resolved template ID: ${templateId}`);

        const monster = this.game.getCardPoolItem(templateId);
        if (!monster) {
            console.error(`[UI] Monster data not found for ID: ${templateId}`);
            if (this.game && this.game.logAction) {
                this.game.logAction(`[ERROR] 找不到怪物資料: ${templateId}`);
            }
            return;
        }

        const overlay = document.getElementById('cardTooltipOverlay');
        if (!overlay) return;

        document.getElementById('ttType').innerText = `怪物 - ${monster.subTypes.join('/')}`;
        document.getElementById('ttTitle').innerText = monster.name;
        document.getElementById('ttDescription').innerHTML = `<span style="color:#ff5a59;">[突進傷害: ${monster.monster.breachDamage || 1}]</span><br>${monster.desc || monster.description}`;

        let statsHtml = `
            <div class="tooltip-stat-item"><div class="tooltip-stat-label">原始血量</div><div class="tooltip-stat-value">❤️ ${monster.monster.hp}</div></div>
            <div class="tooltip-stat-item"><div class="tooltip-stat-label">擊敗獎勵</div><div class="tooltip-stat-value">✨ ${monster.monster.xpGain} XP</div></div>
        `;
        document.getElementById('ttStats').innerHTML = statsHtml;
        document.getElementById('ttLore').innerText = monster.lore || "此怪物的來歷充滿謎團。";

        overlay.classList.add('active'); // Changed to add 'active' class for consistency
    }

    updateCombatSummary() {
        const summary = document.getElementById('combatSummary');
        if (!summary || this.game.state !== GameState.COMBAT) return;

        const { selectedHeroIdx, selectedWeaponIdx, targetRank } = this.game.combat;
        const hero = this.game.hand[selectedHeroIdx];
        const weapon = this.game.hand[selectedWeaponIdx];
        const monster = targetRank ? this.game.dungeonHall[`rank${targetRank}`] : null;

        let totalLight = 0;
        this.game.hand.forEach(c => totalLight += (c.light || 0));
        this.game.playedCards.forEach(c => totalLight += (c.light || 0));

        // v3.11：恢復受限照明修正
        const auras = this.game.calculateHeroCombatStats(hero || { hero: { attack: 0, magicAttack: 0 } }, null, null, 0).auras || { lightReqMod: 0 };
        const lightReq = targetRank ? (targetRank + (auras.lightReqMod || 0)) : 0;
        const lightPenalty = targetRank ? Math.max(0, lightReq - totalLight) * 2 : 0;

        const calcGridHtml = `
            <div class="combat-calc-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; border: 1px solid #444;">
                <div style="color: #ffeb3b;">💡 手牌總照明: ${totalLight}</div>
                <div style="color: #00e5ff;">🕯️ 地城需求: ${targetRank ? lightReq : '(未選目標)'}${auras.lightReqMod > 0 ? ` (+${auras.lightReqMod})` : ''}</div>
                <div style="grid-column: 1/-1; padding-top: 5px; border-top: 1px solid #333; color: ${lightPenalty > 0 ? '#ff5a59' : '#4caf50'}; font-weight: bold;">
                    ⚖️ 當前照明影響: -${lightPenalty} 戰力 (x2 懲罰)
                </div>
            </div>
        `;

        // 彙整 Aura 資訊 (v3.10)
        const activeAuras = [];
        // 從地城中掃描所有怪物 Aura
        for (let i = 1; i <= 3; i++) {
            const m = this.game.dungeonHall[`rank${i}`];
            if (m && m.abilities && m.abilities.aura) {
                activeAuras.push({ name: m.name, desc: m.abilities.aura }); // Changed m.desc to m.abilities.aura
            }
        }

        const auraListHtml = activeAuras.length > 0 ? `
            <div style="font-size: 11px; background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.2); padding: 5px; border-radius: 4px; margin-bottom: 8px;">
                <strong style="color: #ff9800;">⚠️ 當前環境效果 (Aura):</strong><br>
                ${activeAuras.map(a => `<span style="color: #eee;">• [${a.name}] ${a.desc}</span>`).join('<br>')}
            </div>
        ` : '';

        if (!hero) {
            summary.innerHTML = `
                ${calcGridHtml}
                ${auraListHtml}
                <div style="text-align: center; color: #ff5a59; padding: 10px; border: 1px dashed #ff5a59; border-radius: 4px;">
                    👉 請從下方手牌選取英雄與武器
                </div>
            `;
            return;
        }

        const results = this.game.calculateHeroCombatStats(hero, weapon, monster, lightPenalty, totalLight, lightReq);
        const { finalAtk, bonuses, rawPhysAtk, rawMagAtk, physAtk, magAtk } = results;
        const adj = Math.max(0, lightReq - totalLight);

        summary.innerHTML = `
            ${calcGridHtml}
            ${auraListHtml}
            <div style="border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 8px;">
                <strong>當前出戰：</strong> ${hero.name} ${weapon ? ' + ' + weapon.name : ''}
            </div>

            <div style="font-size: 16px; color: var(--color-primary); font-weight: bold; text-align: center; background: rgba(0,255,136,0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(0,255,136,0.3); box-shadow: 0 0 10px rgba(0,255,136,0.1);">
                💪 預估總傷害：${finalAtk}
            </div>
            
            <div style="font-size: 11px; color: #888; text-align: center; margin-top: 6px; font-family: monospace; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px;">
                <div>解析: (⚔️ ${physAtk} + 🪄 ${magAtk}) - ⚖️ ${lightPenalty} = ${finalAtk}</div>
                <div style="font-size: 9px; opacity: 0.7; margin-top: 2px;">
                    照明微調: (Req ${lightReq} - Lgt ${totalLight}) = ${adj} (Penalty x2)
                </div>
            </div>

            <div style="font-size: 11px; color: #aaa; margin-top: 10px; line-height: 1.4; max-height: 60px; overflow-y: auto; padding-left: 5px; border-left: 2px solid #555;">
                ${bonuses.length > 0 ? '🔹 ' + bonuses.join('<br>🔹 ') : '（無其他特殊修正）'}
            </div>

            <div style="margin-top: 10px; font-weight: bold; border-top: 1px solid #444; padding-top: 8px;">
                🎯 目標：${monster ? monster.name + ' (❤️ ' + monster.currentHP + ' HP)' : '<span style="color:#ff5a59;">（未選取目標）</span>'}
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
