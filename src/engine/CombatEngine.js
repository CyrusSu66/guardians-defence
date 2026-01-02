import { GameState } from '../data.js';

/**
 * CombatEngine - 負責所有與戰鬥、傷害、光照、Aura 相關的邏輯。
 */
export class CombatEngine {
    constructor(game) {
        this.game = game;
    }

    /**
     * 執行一次戰鬥進攻 (英雄+武器 對 怪物) (v3.11)
     */
    perform() {
        const g = this.game;
        if (!g.combat.targetRank) return g.addLog('請選擇目標怪物。', 'danger');
        const monster = g.dungeonHall[`rank${g.combat.targetRank}`];
        if (!monster) return;

        const hIdx = g.combat.selectedHeroIdx;
        const wIdx = g.combat.selectedWeaponIdx;
        const hero = g.hand[hIdx];
        const weapon = g.hand[wIdx];

        if (!hero) return g.addLog('請至少選擇一名英雄。', 'danger');

        const auras = this.getActiveAuras();

        // 1. 負重檢查
        // 1. 負重與類型檢查
        if (!hero.hero) {
            return g.addLog(`❌【錯誤】所選卡牌 ${hero.name} 不是有效的英雄單位！`, 'danger');
        }

        let heroStr = hero.hero.strength + (auras.strMod || 0);
        if (weapon && heroStr < weapon.equipment.weight) {
            return g.addLog(`❌ 負重不足！${hero.name} 無法使用 ${weapon.name}`, 'danger');
        }

        // 2. 統計總照明
        let totalLight = 0;
        g.hand.forEach(c => totalLight += (c.light || 0));
        g.playedCards.forEach(c => totalLight += (c.light || 0));

        // 3. 計算地城需求與懲罰
        const lightReq = g.combat.targetRank + (auras.lightReqMod || 0);
        // v3.21.2: 修正照明懲罰，每欠缺 1 點照明扣除 2 點戰力
        const lightPenalty = Math.max(0, lightReq - totalLight) * 2;

        // 4. 計算詳情
        let { physAtk, magAtk, bonuses, finalAtk } = this.calculateStats(hero, weapon, monster, lightPenalty, totalLight, lightReq);

        if (finalAtk <= 0) {
            return g.addLog(`❌ 攻擊力不足以造成傷害 (最終傷害: ${finalAtk})。`, 'warning');
        }

        // 5. 扣除怪物血量
        monster.currentHP -= finalAtk;
        g.addLog(`⚔️ ${hero.name}${weapon ? ' 持 ' + weapon.name : ''} 對 ${monster.name} 造成 ${finalAtk} 點傷害！`, 'info');

        if (monster.currentHP <= 0) {
            g.addLog(`✨ 擊斃 ${monster.name}！`, 'success');
            if (hero.abilities && hero.abilities.onVictory) {
                g.triggerCardEffect(hero.abilities.onVictory, hero.name);
            }
            g.currentXP += monster.monster.xpGain;
            g.totalScore += (monster.vp || 0);
            g.dungeonHall[`rank${g.combat.targetRank}`] = null;

            if (monster.hasThunderstone) {
                g.addLog('🏆 您奪得了雷霆之石，防線獲得最終勝利！', 'success');
                g.gameOver();
                return;
            }
        } else {
            g.addLog(`🛡️ ${monster.name} 剩餘 HP: ${monster.currentHP}/${monster.monster.hp}`, 'warning');
        }

        // 6. 消耗卡片
        const toDiscard = [hIdx];
        if (wIdx !== null) toDiscard.push(wIdx);
        toDiscard.sort((a, b) => b - a).forEach(i => g.discard.push(g.hand.splice(i, 1)[0]));

        g.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: g.combat.targetRank };
        g.updateUI();
    }

    /**
     * 計算英雄與武器組合的詳細戰鬥數值 (v3.11 校準)
     */
    calculateStats(hero, weapon, monster, lightPenalty, totalLight = 0, lightReq = 0) {
        const auras = this.getActiveAuras();
        let physAtk = hero.hero.attack + (weapon ? weapon.equipment.attack : 0) + auras.atkMod;
        let magAtk = hero.hero.magicAttack + (weapon ? weapon.equipment.magicAttack : 0);
        let bonuses = [];

        // 包含環境效果描述
        auras.auraSources.forEach(s => bonuses.push(`環境影響: ${s}`));

        // 1. 記錄原始數值
        const rawPhys = physAtk;
        const rawMag = magAtk;

        // 2. 英雄戰鬥技能加成
        if (hero.abilities && hero.abilities.onBattle) {
            const effect = hero.abilities.onBattle;
            if (hero.hero.series === 'Dwarf' && weapon) {
                physAtk += 1;
                bonuses.push('矮人武裝: +1 Atk');
            }
            if (effect === 'light_compensation' && lightPenalty > 0) {
                let currentLight = 0;
                this.game.hand.forEach(c => currentLight += (c.light || 0));
                this.game.playedCards.forEach(c => currentLight += (c.light || 0));
                if (currentLight > 0) {
                    physAtk += currentLight;
                    bonuses.push(`騎士信仰(光照補償): +${currentLight} Atk`);
                }
            }
        }

        // 3. 處理怪物免疫 (Immunity)
        let filteredPhys = physAtk;
        let filteredMag = magAtk;

        if (monster && monster.abilities) {
            if (monster.abilities.battle === 'phys_immune') {
                filteredPhys = 0;
                bonuses.push('物理免疫: 物理傷害歸零');
            } else if (monster.abilities.battle === 'magic_only') {
                filteredPhys = 0; // v3.9修正：原本為 1，現在歸零
                bonuses.push('魔法限定: 物理傷害歸零');
            }
        }

        // 4. 計算照明懲罰
        // 照明調整值 = Math.max(0, 地城需求 - 手牌總照明)
        // 最終照明懲罰 = 照明調整值 * 2
        // 已由參數 lightPenalty 傳入 (此參數在 Game.js 中計算為 (Req - Sum)*2)

        let prePenaltyTotal = filteredPhys + filteredMag;
        let finalAtk = Math.max(0, prePenaltyTotal - lightPenalty);

        // v3.16: 保底傷害機制已移除 (2026-01-02)

        if (lightPenalty > 0) bonuses.push(`照明懲罰: -${lightPenalty} 戰力`);

        return {
            physAtk: filteredPhys,
            magAtk: filteredMag,
            rawPhysAtk: physAtk,
            rawMagAtk: magAtk,
            bonuses,
            finalAtk: finalAtk,
            totalLight,
            lightReq,
            lightPenalty,
            auras // v3.11
        };
    }

    /**
     * 掃描當前地城中的所有 Aura (環境效果) (v3.11)
     */
    getActiveAuras() {
        const sources = {
            atkMod: 0,
            lightReqMod: 0,
            strMod: 0,
            auraSources: []
        };
        const g = this.game;

        [g.dungeonHall.rank1, g.dungeonHall.rank2, g.dungeonHall.rank3].forEach(m => {
            if (!m || !m.abilities || !m.abilities.aura) return;
            const effect = m.abilities.aura;
            if (effect === 'atk_minus_1') {
                sources.atkMod -= 1;
                sources.auraSources.push(`[${m.name}] 英雄戰力-1`);
            }
            if (effect === 'str_minus_1') {
                sources.strMod -= 1;
                sources.auraSources.push(`[${m.name}] 力量需求+1`);
            }
            if (effect === 'light_req_plus_1') {
                sources.lightReqMod = 1; // v3.11: 最高 +1
                sources.auraSources.push(`[${m.name}] 照明需求+1`);
            }
        });
        return sources;
    }
}
