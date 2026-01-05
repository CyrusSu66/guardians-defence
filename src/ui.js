/**
 * 《守護者防線：雷霆遺產》UI 渲染模組 (v3.24.0)
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
        ['market'].forEach(tab => {
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

        // v3.23: Shield Progress Bar
        const barEl = document.getElementById('shieldBar');
        if (barEl) {
            const pct = Math.max(0, Math.min(100, (g.villageHP / 20) * 100));
            barEl.style.width = `${pct}%`;
            barEl.style.background = g.villageHP < 5 ? '#e74c3c' : 'linear-gradient(90deg, #9b59b6, #8e44ad)';
        }
        this.setText('totalScore', g.totalScore);
        this.setText('currentXP', g.currentXP);
        this.setText('turnNumber', g.turn);
        this.setText('plazaCoinDisplay', g.currentGold);

        // v3.3: 修正計數器刷新 (Hand Count toggled off by user request v3.26)
        this.setText('deckCount', g.deck.length);
        this.setText('discardCount', g.discard.length);
        this.setText('btnDeckCountBtn', g.deck.length);
        this.setText('btnDiscardCountBtn', g.discard.length);

        // v3.21.2: 控制村莊核心(Market)顯示，僅在閒置(選擇行動)或造訪村莊時顯示
        const plazaPanel = document.querySelector('.village-plaza');
        if (plazaPanel) {
            const shouldShow = (!g.currentAction || g.currentAction === 'VILLAGE');
            plazaPanel.style.display = shouldShow ? 'block' : 'none';
        }

        // v3.23.2: 版號移至左上角
        this.setText('appVersion', g.version);

        // v3.3: 標題不再顯示版號


        const stateLabels = {
            [GameState.DRAW]: '🎲 抽牌與補給',
            [GameState.VILLAGE]: '🏪 村莊區域',
            [GameState.COMBAT]: '⚔️ 前線指揮',
            [GameState.MONSTER_ADVANCE]: '⚠️ 敵軍推進',
            [GameState.GAME_OVER]: '💀 戰役結束'
        };
        // gameState display removed per user request

        // v3.3: 面板與啟動按鈕顯示邏輯
        const isIdle = g.state === GameState.IDLE || g.state === GameState.GAME_OVER;
        this.show('startGameBtn', isIdle);
        this.show('headerActions', isIdle);

        this.show('actionSelectPanel', g.state === GameState.VILLAGE && g.currentAction === null);
        this.show('combatPanel', g.state === GameState.COMBAT);
        this.show('restPanel', g.currentAction === 'REST');
        this.show('villageFinishControl', g.currentAction === 'VILLAGE');

        // v3.22.9: 訓練場顯示控制
        // v3.25: Auto Activate Button
        this.show('btnAutoActivate', g.state === GameState.VILLAGE && g.currentAction === 'VILLAGE');
        const trainingPanel = document.getElementById('trainingPanel');
        if (trainingPanel) trainingPanel.style.display = (g.currentAction === 'VILLAGE') ? 'block' : 'none';

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
            // 戰鬥選中標記 (v3.22)
            if (g.combat && (
                g.combat.selectedHeroIdx === idx ||
                g.combat.selectedDamageIdx === idx ||
                g.combat.selectedAuxIdx === idx
            )) {
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
                    // v3.22: 3欄位選擇邏輯
                    if (card.type === 'Hero') {
                        g.combat.selectedHeroIdx = (g.combat.selectedHeroIdx === idx) ? null : idx;
                    }
                    else if (card.type === 'Weapon' || card.type === 'Spell') {
                        g.combat.selectedDamageIdx = (g.combat.selectedDamageIdx === idx) ? null : idx;
                    }
                    else if (card.type === 'Item' || card.type === 'Food') {
                        g.combat.selectedAuxIdx = (g.combat.selectedAuxIdx === idx) ? null : idx;
                    }
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
                hintEl.innerHTML = '[點擊銷毀]';
                cardEl.appendChild(hintEl);
            } else if (g.pendingGrailEffect) {
                const hintEl = document.createElement('div');
                hintEl.className = 'card-hint magic'; // New class or reuse/add style
                hintEl.style.color = '#00e5ff';
                hintEl.style.borderColor = '#00e5ff';
                hintEl.innerHTML = '[聖杯銷毀]';
                cardEl.appendChild(hintEl);
                cardEl.style.border = '2px dashed #00e5ff';
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

        this.game.playedCards.forEach((c, i) => {
            const el = document.createElement('div');
            el.className = 'card small played';
            el.title = '點擊還原 (僅限資源卡)';
            el.style.cursor = 'pointer';
            el.onclick = () => this.game.unplayCard(i);
            el.innerHTML = `
                <div class="card-type-tag">${c.type}</div>
                <div class="card-name">${c.name}</div>
                <div class="card-val" style="color:#ffd700;">${c.goldValue ? '💰' + c.goldValue : ''}</div>
            `;
            container.appendChild(el);
        });
    }

    getStatsHtml(card, isMarket = false) {
        let stats = '';
        if (card.type === 'Hero') {
            stats = `<div class="card-stats">🪄 ${card.hero.magicAttack} | 💪 ${card.hero.strength}</div>`;
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

    // v3.23.5: Refactored Card Layout
    renderCard(card, onClick, isSelected = false, isMarket = false) {
        const div = document.createElement('div');
        div.className = `card ${card.type.toLowerCase()} ${isSelected ? 'selected' : ''}`;

        // Top Row: Type | Info
        const topRow = document.createElement('div');
        topRow.className = 'card-top-row';
        topRow.innerHTML = `
            <span class="card-type">${card.type}</span>
            <div class="card-info-btn" onclick="event.stopPropagation(); window.game.ui.showCardDetail('${card.id}')">ⓘ</div>
        `;

        // Name (Middle)
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.innerText = card.name;

        // Stats (Below Name)
        const statsRow = document.createElement('div');
        statsRow.className = 'card-stats-row';

        const lines = []; // Used for stats now
        // Line 1: Basic Stats (Icons Only - Combined)
        if (card.type === 'Hero') {
            lines.push(`💪${card.hero.strength} 🪄${card.hero.magicAttack}`);
        } else if (card.type === 'Weapon') {
            lines.push(`⚔️${card.equipment.attack} 🪄${card.equipment.magicAttack} ⚖️${card.equipment.weight}`);
        } else if (card.type === 'Spell') {
            // Spells usually just have magic attack or effect.
            if (card.equipment) {
                lines.push(`🪄${card.equipment.magicAttack}`);
            } else {
                lines.push(`✨`);
            }
        }
        // If card has light, show it
        if (card.light > 0) lines.push(`💡${card.light}`);

        statsRow.innerHTML = lines.join(' '); // Single line for stats

        // Append Stats Row
        div.append(topRow, nameDiv, statsRow);

        // Description Row (Effect Text OR Flavor Fallback)
        let descText = '';
        if (card.abilities && card.abilities.abilities_desc) {
            descText = card.abilities.abilities_desc;
        } else if (card.desc) {
            descText = card.desc;
        }

        if (descText) {
            const descEl = document.createElement('div');
            descEl.className = 'card-desc-text';
            descEl.style.fontSize = '9px';
            descEl.style.color = '#ccc';
            descEl.style.textAlign = 'center';
            descEl.style.marginTop = '4px';
            descEl.style.lineHeight = '1.2';
            descEl.style.whiteSpace = 'pre-wrap';
            descEl.textContent = descText;
            div.appendChild(descEl);
        }

        // Market Price (Only if in Market)
        if (isMarket) {
            const priceEl = document.createElement('div');
            priceEl.className = 'card-price-tag';
            priceEl.style.marginTop = 'auto'; // Push to bottom
            priceEl.style.textAlign = 'center';
            priceEl.style.color = '#ffd700';
            priceEl.style.fontSize = '12px';
            priceEl.style.fontWeight = 'bold';
            priceEl.innerHTML = `💰 ${card.cost}`;
            div.appendChild(priceEl);
        } else {
            if (card.goldValue > 0) {
                const valEl = document.createElement('div');
                valEl.style.marginTop = 'auto';
                valEl.style.textAlign = 'center';
                valEl.style.color = '#f1c40f';
                valEl.style.fontSize = '10px';
                valEl.innerHTML = `🪙 ${card.goldValue}`;
                div.appendChild(valEl);
            }
        }

        div.onclick = onClick;
        return div;
    }



    // v3.4 顯示卡牌詳情 Tooltip
    // v3.4 顯示卡牌詳情 Tooltip (Fixed v3.23.19)
    showCardDetail(cardId) {
        const card = this.game.getCardPoolItem(cardId);
        if (!card) return;

        let content = `
            <div style="margin-bottom: 10px;">
                <span class="badge badge-primary">${card.type}</span>
                <strong style="font-size: 1.2em; margin-left: 8px;">${card.name}</strong>
            </div>
            
            <!-- Flavor Text (desc) -->
            <p style="color: #888; font-style: italic; margin-bottom: 10px; font-size: 0.9em;">
                ${card.desc || '（無描述）'}
            </p>

            <!-- Special Abilities (abilities_desc) -->
            <div style="margin-top:10px; border-top:1px solid #444; padding-top:10px; text-align: left;">
                <strong>特殊能力：</strong>
                <div style="margin-top:5px; white-space: pre-wrap; line-height: 1.6; color: #ddd;">${(card.abilities && card.abilities.abilities_desc) ? card.abilities.abilities_desc : '（無）'}</div>
            </div>
        `;

        // Generate stats HTML
        let statsHtml = '<div style="margin-top:10px; border-top:1px solid #444; padding-top:10px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">';
        if (card.hero) {
            statsHtml += `<div>💪 力量: ${card.hero.strength}</div><div>🪄 魔攻: ${card.hero.magicAttack}</div>`;
        } else if (card.equipment) {
            statsHtml += `<div>⚔️ 攻擊: ${card.equipment.attack}</div><div>🪄 魔攻: ${card.equipment.magicAttack}</div>`;
            if (card.equipment.weight !== undefined) statsHtml += `<div>⚖️ 負重: ${card.equipment.weight}</div>`;
        }
        if (card.cost) statsHtml += `<div>💰 費用: ${card.cost}</div>`;
        if (card.goldValue) statsHtml += `<div>🪙 價值: ${card.goldValue}</div>`;
        if (card.light) statsHtml += `<div>💡 照明: ${card.light}</div>`;
        statsHtml += '</div>';

        content += statsHtml;

        const modalTitle = document.getElementById('infoModalTitle');
        const modalContent = document.getElementById('infoModalContent');
        const modal = document.getElementById('infoModal');

        if (modalTitle) modalTitle.innerText = ''; // User requested to remove title
        if (modalContent) modalContent.innerHTML = content;
        if (modal) modal.classList.add('active');
    }

    // v3.5 顯示怪物詳情 (Re-added v3.23.22)
    showMonsterDetail(monsterInstanceId) {
        console.log('[UI] showMonsterDetail', monsterInstanceId);
        // 先嘗試從地城 slots 找 (dungeonHall)
        let monster = null;
        if (this.game.dungeonHall) {
            monster = Object.values(this.game.dungeonHall).find(m => m && m.id === monsterInstanceId);
        }

        // Fallback: 如果不在場上 (可能剛死?)，試著從 monsterDeck 找 (如果是 Debug 用途)
        if (!monster && this.game.monsterDeck) {
            monster = this.game.monsterDeck.find(m => m.id === monsterInstanceId);
        }

        if (!monster) {
            console.warn('Monster not found:', monsterInstanceId);
            return;
        }

        const hpColor = monster.currentHP <= monster.monster.hp / 4 ? '#e74c3c' : '#2ecc71';
        const content = `
            <div style="text-align: center;">
                <h3 style="color: #ff5a59; margin-bottom: 10px;">${monster.name}</h3>
                <div style="font-size: 1.2em; margin-bottom: 15px;">
                    <div>❤️ 生命: <span style="color:${hpColor}">${monster.currentHP}/${monster.monster.hp}</span></div>
                    <div style="color: #ff9800;">🛡️ 護盾傷害: -${monster.monster.breachDamage}</div>
                    <div style="color: #2ecc71;">✨ 擊殺獎勵: +${monster.monster.xpGain} XP</div>
                </div>
                
                <!-- Special Abilities -->
                <div style="margin-top:15px; border-top:1px solid #444; padding-top:10px; text-align: left;">
                    <strong>特殊能力：</strong>
                    <div style="margin-top:5px; white-space: pre-wrap; line-height: 1.6; color: #ddd;">${(monster.abilities && monster.abilities.abilities_desc) ? monster.abilities.abilities_desc : '（無）'}</div>
                </div>

                <!-- Flavor Text -->
                <p style="color: #888; font-style: italic; margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; font-size: 0.9em; text-align: left;">
                    ${monster.desc || '（無描述）'}
                </p>
            </div>
        `;
        const modalTitle = document.getElementById('infoModalTitle');
        const modalContent = document.getElementById('infoModalContent');
        const modal = document.getElementById('infoModal');

        if (modalTitle) modalTitle.innerText = '';
        if (modalContent) modalContent.innerHTML = content;
        if (modal) modal.classList.add('active');
    }

    showGameOver(score) {
        const modal = document.getElementById('endGameModal');
        const title = document.getElementById('endGameTitle');
        const msg = document.getElementById('endGameMessage');

        if (title) title.innerText = '💀 戰役結束';
        if (msg) msg.innerHTML = `最終得分: <strong style="color:#ffd700; font-size:1.5em;">${score}</strong> VP<br><br>雖然此次防線失守，但您的英勇事蹟將被銘記。`;

        if (modal) {
            modal.style.display = 'flex'; // Use flex to center
            modal.classList.add('active'); // Just in case CSS uses class
        }
    }

    showDeck() {
        console.log('[UI] showDeck clicked');
        if (!this.game.deck) {
            console.error('[UI] Deck is undefined');
            return;
        }
        const deck = this.game.deck;
        console.log('[UI] Deck count:', deck.length);
        this.showCardListModal('牌庫檢視', deck);
    }

    showDiscard() {
        console.log('[UI] showDiscard clicked');
        if (!this.game.discard) {
            console.error('[UI] Discard is undefined');
            return;
        }
        const discard = this.game.discard;
        console.log('[UI] Discard count:', discard.length);
        this.showCardListModal('棄牌堆檢視', discard);
    }

    showCardListModal(title, cards) {
        const modalTitle = document.getElementById('infoModalTitle');
        const modalContent = document.getElementById('infoModalContent');
        const modal = document.getElementById('infoModal');

        if (modalTitle) modalTitle.innerText = title + ` (${cards ? cards.length : 0})`;

        if (!cards || cards.length === 0) {
            modalContent.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">（空）</p>';
        } else {
            // Group cards by name
            const groups = {};
            cards.forEach(c => {
                if (!groups[c.name]) groups[c.name] = { ...c, count: 0 };
                groups[c.name].count++;
            });

            let html = '<div style="display: grid; gap: 10px;">';
            for (const name in groups) {
                const c = groups[name];
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 4px;">
                        <span>${c.name}</span>
                        <span>x${c.count}</span>
                    </div>
                `;
            }
            html += '</div>';
            modalContent.innerHTML = html;
        }

        if (modal) modal.classList.add('active');
    }



    renderMarket() {
        const marketGrid = document.getElementById('marketGrid');
        if (!marketGrid) return;
        marketGrid.innerHTML = '';
        const g = this.game;

        const allItems = [
            ...g.marketItems.heroes,
            ...g.marketItems.items,
            ...g.marketItems.basics,
            ...(g.marketItems.spells || [])
        ];

        allItems.forEach(card => {
            const canAfford = g.currentGold >= card.cost;
            const onClick = () => {
                if (canAfford && !g.hasBought) this.game.buyCard(card.id, card.cost);
            };

            const cardEl = this.renderCard(card, onClick, false, true);
            if (!canAfford) cardEl.classList.add('disabled');
            if (g.hasBought) cardEl.classList.add('bought');

            marketGrid.appendChild(cardEl);
        });
    }

    renderTraining() {
        const container = document.getElementById('trainingContent');
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
        // v3.21.3: 自動捲動至最底部 (Auto-scroll to bottom)
        container.scrollTop = container.scrollHeight;
    }

    renderDungeonRanks() {
        const container = document.getElementById('dungeonRankSlots');
        if (!container) return;
        container.innerHTML = '';

        [1, 2, 3].forEach(rank => {
            // Container for the whole slot (Rank Header + Content)
            const slotEl = document.createElement('div');
            slotEl.className = 'dungeon-rank-wrapper'; // New wrapper class

            const monster = this.game.dungeonHall[`rank${rank}`];
            const lightPenalty = -rank;

            // Header: Rank X
            const headerHtml = `<div class="rank-header-text">Rank ${rank}</div>`;

            // Content Box: Dashed placeholder OR Monster Card
            let contentHtml = '';
            let additionalClass = '';

            if (!monster) {
                // Empty Dashed Box
                contentHtml = `<div class="rank-placeholder dashed"></div>`;
            } else {
                // Monster Info
                additionalClass = 'occupied';
                if (monster.hasThunderstone) additionalClass += ' boss-marked';

                // v3.5: Dynamic HP
                const hpPercent = (monster.currentHP / monster.monster.hp) * 100;
                const hpColor = hpPercent > 50 ? '#4caf50' : (hpPercent > 25 ? '#ff9800' : '#f44336');
                const tsMarker = monster.hasThunderstone ? '<span class="ts-icon">💠</span>' : '';

                contentHtml = `
                    <div class="rank-placeholder monster-active" style="display: flex; flex-direction: column; justify-content: flex-start; padding: 4px;">
                        <div class="monster-mini-card" style="width: 100%; height: 100%; display: flex; flex-direction: column; text-align: center;">
                            <div class="monster-name" style="margin-bottom: 2px; flex-shrink: 0;">${tsMarker} ${monster.name}</div>
                            
                            <!-- Stacked Stats -->
                            <div class="monster-hp" style="font-size: 10px; line-height: 1.2; color:${hpColor}; flex-shrink: 0;">❤️ ${monster.currentHP}/${monster.monster.hp}</div>
                            <div class="monster-breach" style="font-size: 10px; line-height: 1.2; color: #ff5a59; flex-shrink: 0;">🛡️ -${monster.monster.breachDamage || 1}</div>
                            <div class="monster-xp" style="font-size: 10px; line-height: 1.2; color: #2ecc71; flex-shrink: 0; margin-bottom: 4px;">✨ +${monster.monster.xpGain} XP</div>

                            <!-- Ability or Flavor (Fill Remaining Space) -->
                            <div style="font-size: 9px; color: #ccc; line-height: 1.1; white-space: pre-wrap; overflow: hidden; flex-grow: 1; display: flex; align-items: flex-start; justify-content: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2px;">
                                ${(monster.abilities && monster.abilities.abilities_desc) ? monster.abilities.abilities_desc : (monster.desc || '')}
                            </div>

                            <div class="info-icon" style="flex-shrink: 0;" onclick="event.stopPropagation(); window.ui.showMonsterDetail('${monster.id}')">ⓘ</div>
                        </div>
                    </div>
                `;
            }

            slotEl.innerHTML = headerHtml + contentHtml;

            if (additionalClass) slotEl.classList.add(additionalClass);

            // Click handling for combat
            if (monster && this.game.state === GameState.COMBAT) {
                slotEl.style.cursor = 'pointer';
                if (this.game.combat && this.game.combat.targetRank === rank) {
                    slotEl.classList.add('target-locked');
                }
                slotEl.onclick = () => this.game.selectCombatTarget(rank);
            }

            container.appendChild(slotEl);
        });

        this.renderMonsterDeckInspector();
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


    updateCombatSummary() {
        const summary = document.getElementById('combatSummary');
        if (!summary || this.game.state !== GameState.COMBAT) return;

        const { selectedHeroIdx, selectedDamageIdx, selectedAuxIdx, targetRank } = this.game.combat;
        const hero = this.game.hand[selectedHeroIdx];
        const damageItem = this.game.hand[selectedDamageIdx];
        const auxItem = this.game.hand[selectedAuxIdx];
        const monster = targetRank ? this.game.dungeonHall[`rank${targetRank}`] : null;

        let totalLight = 0;
        this.game.hand.forEach(c => totalLight += (c.light || 0));
        this.game.playedCards.forEach(c => totalLight += (c.light || 0));

        // v3.22.13: 計算 HeroStr (包含 Aux 和 Aura) 以傳遞給 CombatEngine
        let heroStr = hero ? hero.hero.strength : 0;
        if (auxItem && auxItem.abilities && auxItem.abilities.onBattle === 'boost_str_1') heroStr += 1;
        const activeAurasStruct = this.game.getActiveAuras();
        heroStr += (activeAurasStruct.strMod || 0);

        // 第一次計算 (取得光照懲罰)
        const results = this.game.calculateHeroCombatStats(
            hero || { hero: { attack: 0, magicAttack: 0 } },
            damageItem,
            monster,
            0,
            totalLight,
            targetRank ? targetRank : 0,
            auxItem,
            heroStr
        );
        const auras = results.auras || { lightReqMod: 0 };
        const lightReq = targetRank ? (targetRank + (auras.lightReqMod || 0)) : 0;
        const lightPenalty = targetRank ? Math.max(0, lightReq - totalLight) * 2 : 0;

        // 第二次計算 (取得最終數值)
        const finalResults = this.game.calculateHeroCombatStats(
            hero || { hero: { attack: 0, magicAttack: 0 } },
            damageItem,
            monster,
            lightPenalty,
            totalLight,
            lightReq,
            auxItem,
            heroStr
        );
        const { finalAtk, bonuses, physAtk, magAtk, rawPhysAtk } = finalResults;

        // 公式與細節顯示
        const base = heroStr;
        const weapon = (damageItem && damageItem.equipment) ? damageItem.equipment.attack : 0;
        const magic = magAtk;
        const otherBonus = rawPhysAtk - base - weapon; // 剩餘的物理加成 (如連動、Aura AtkMod)

        const formulaHtml = `
            <div style="margin-top: 8px; font-family: monospace; font-size: 13px; color: #fff; background: rgba(0,0,0,0.6); padding: 8px; border-radius: 4px; border: 1px solid #555;">
                <div style="color: #aaa; margin-bottom: 4px;">傷害公式預覽:</div>
                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span>[</span>
                    <span style="color:#ff9800;">${base}(英雄)</span> + 
                    <span style="color:#2196f3;">${weapon}(武器)</span>
                    ${magic > 0 ? `+ <span style="color:#9c27b0;">${magic}(魔法)</span>` : ''}
                    ${otherBonus !== 0 ? `+ <span style="color:#e91e63;">${otherBonus}(特效)</span>` : ''}
                    <span>]</span>
                    <span style="color:#ff5a59;"> - [ ${lightPenalty} (懲罰) ]</span>
                    <span> = </span>
                    <strong style="font-size:15px; color:#fff;">${finalAtk}</strong>
                </div>
            </div>
        `;

        const calcGridHtml = `
            <div class="combat-calc-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; border: 1px solid #444;">
                <div style="color: #ffeb3b;">💡 手牌總照明: ${totalLight}</div>
                <div style="color: #00e5ff;">🕯️ 地城需求: ${targetRank ? lightReq : '(未選目標)'}${auras.lightReqMod > 0 ? ` (+${auras.lightReqMod})` : ''}</div>
                <div style="grid-column: 1/-1; padding-top: 5px; border-top: 1px solid #333; color: ${lightPenalty > 0 ? '#ff5a59' : '#4caf50'}; font-weight: bold;">
                    ⚖️ 當前照明影響: -${lightPenalty} 戰力 (x2 懲罰)
                </div>
                <!-- 插入公式 -->
                <div style="grid-column: 1/-1;">${formulaHtml}</div>
            </div>
        `;

        // const auraListHtml = this.renderAuras(); // Removed: causing crash, using inline logic below

        // 3-Slot Visual Display
        const renderSlot = (label, card, placeholder) => `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid ${card ? '#4caf50' : '#444'}; border-radius: 4px; padding: 6px; text-align: center; height: 100%;">
                <div style="font-size: 10px; color: #888; margin-bottom: 4px;">${label}</div>
                ${card ? `
                    <div style="font-weight: bold; color: #fff; font-size: 12px;">${card.name}</div>
                    <div style="font-size: 9px; color: #aaa;">${card.subTypes ? card.subTypes.join('/') : card.type}</div>
                ` : `<div style="font-size: 11px; color: #555; padding: 5px;">${placeholder}</div>`}
            </div>
        `;

        const slotsHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 10px;">
                ${renderSlot('🟢 輔助物品', auxItem, '選擇食物/道具')}
                ${renderSlot('🔴 英雄', hero, '選擇英雄')}
                ${renderSlot('🔵 傷害裝備', damageItem, '選擇武器/法術')}
            </div>
        `;

        // Render Auras inline for now (since helper doesn't exist yet)
        const activeAuras = [];
        for (let i = 1; i <= 3; i++) {
            const m = this.game.dungeonHall[`rank${i}`];
            if (m && m.abilities && m.abilities.aura) {
                activeAuras.push({ name: m.name, desc: m.abilities.aura });
            }
        }
        const auraHtml = activeAuras.length > 0 ? `
            <div style="font-size: 11px; background: rgba(255,100,0,0.1); border: 1px solid rgba(255,100,0,0.2); padding: 5px; border-radius: 4px; margin-bottom: 8px;">
                <strong style="color: #ff9800;">⚠️ 環境 (Aura):</strong><br>
                ${activeAuras.map(a => `<span style="color: #eee;">• [${a.name}] ${a.desc}</span>`).join('<br>')}
            </div>
        ` : '';

        summary.innerHTML = `
            ${calcGridHtml}
            ${auraHtml}
            ${slotsHtml}
            
            <div style="font-size: 16px; color: var(--color-primary); font-weight: bold; text-align: center; background: rgba(0,255,136,0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(0,255,136,0.3); box-shadow: 0 0 10px rgba(0,255,136,0.1);">
                💪 預估總傷害：${hero ? finalAtk : '-'}
            </div>
            
            <div style="font-size: 11px; color: #888; text-align: center; margin-top: 6px; font-family: monospace; padding: 5px;">
                ${hero ? `(⚔️ ${physAtk} + 🪄 ${magAtk}) - ⚖️ ${lightPenalty} = ${finalAtk}` : '請配置英雄進行計算'}
            </div>

            <div style="font-size: 11px; color: #aaa; margin-top: 10px; line-height: 1.4; max-height: 80px; overflow-y: auto; padding-left: 5px; border-left: 2px solid #555;">
                ${bonuses.length > 0 ? '🔹 ' + bonuses.join('<br>🔹 ') : '（無特殊效果）'}
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
