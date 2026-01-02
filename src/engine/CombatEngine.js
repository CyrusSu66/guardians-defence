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
    /**
     * 執行一次戰鬥進攻 (3欄位系統: 輔助/英雄/裝備 對 怪物) (v3.22)
     */
    perform() {
        const g = this.game;
        if (!g.combat.targetRank) return g.addLog('請選擇目標怪物。', 'danger');
        const monster = g.dungeonHall[`rank${g.combat.targetRank}`];
        if (!monster) return;

        const hIdx = g.combat.selectedHeroIdx;
        const dIdx = g.combat.selectedDamageIdx; // Weapon / Spell
        const aIdx = g.combat.selectedAuxIdx;    // Food / Item

        const hero = g.hand[hIdx];
        const damageItem = g.hand[dIdx];
        const auxItem = g.hand[aIdx];

        if (!hero) return g.addLog('請至少選擇一名英雄。', 'danger');

        const auras = this.getActiveAuras();

        // 1. 負重與類型檢查
        if (!hero.hero) {
            return g.addLog(`❌【錯誤】所選卡牌 ${hero.name} 不是有效的英雄單位！`, 'danger');
        }

        // v3.22: 輔助卡片帶來的力量加成 (如乾糧)
        let auxStrBonus = 0;
        if (auxItem && auxItem.abilities && auxItem.abilities.onBattle === 'boost_str_2') {
            auxStrBonus = 2;
        }

        let heroStr = hero.hero.strength + auxStrBonus + (auras.strMod || 0);

        // 如果裝備有重量，檢查負重
        if (damageItem && damageItem.equipment && damageItem.equipment.weight > heroStr) {
            return g.addLog(`❌ 負重不足！${hero.name} (STR ${heroStr}) 無法配備 ${damageItem.name} (WGT ${damageItem.equipment.weight})`, 'danger');
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
        let { finalAtk } = this.calculateStats(hero, damageItem, monster, lightPenalty, totalLight, lightReq, auxItem);

        if (finalAtk <= 0) {
            return g.addLog(`❌ 攻擊力不足以造成傷害 (最終傷害: ${finalAtk})。`, 'warning');
        }

        // 5. 扣除怪物血量
        monster.currentHP -= finalAtk;
        const weaponName = damageItem ? ` 配備 ${damageItem.name}` : '';
        const auxName = auxItem ? ` 使用 ${auxItem.name}` : '';
        g.addLog(`⚔️ ${hero.name}${weaponName}${auxName} 對 ${monster.name} 造成 ${finalAtk} 點傷害！`, 'info');

        if (monster.currentHP <= 0) {
            g.addLog(`✨ 擊斃 ${monster.name}！`, 'success');
            if (hero.abilities && hero.abilities.onVictory) {
                g.triggerCardEffect(hero.abilities.onVictory, hero.name);
            }
            // v3.22: 輔助卡若有勝利效果 (目前無，預留)

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

        // 6. 消耗卡片 (全部投入棄牌堆)
        const toDiscard = [hIdx];
        if (dIdx !== null) toDiscard.push(dIdx);
        if (aIdx !== null) toDiscard.push(aIdx);

        // 從大到小排序刪除，避免索引偏移
        toDiscard.sort((a, b) => b - a).forEach(i => g.discard.push(g.hand.splice(i, 1)[0]));

        // 重置選擇
        g.combat = { selectedHeroIdx: null, selectedDamageIdx: null, selectedAuxIdx: null, targetRank: g.combat.targetRank };
        g.updateUI();
    }

    /**
     * 計算 3 欄位組合的詳細戰鬥數值
     */
    calculateStats(hero, damageItem, monster, lightPenalty, totalLight = 0, lightReq = 0, auxItem = null) {
        const auras = this.getActiveAuras();

        // 基礎數值
        let physAtk = hero.hero.attack + auras.atkMod;
        let magAtk = hero.hero.magicAttack;

        let bonuses = [];
        // 環境
        auras.auraSources.forEach(s => bonuses.push(`環境影響: ${s}`));

        // 裝備數值
        if (damageItem && damageItem.equipment) {
            physAtk += (damageItem.equipment.attack || 0);
            magAtk += (damageItem.equipment.magicAttack || 0);
        }

        // 輔助加成 (v3.22)
        if (auxItem && auxItem.abilities && auxItem.abilities.onBattle === 'boost_str_2') {
            bonuses.push('乾糧補給: 負重 +2');
        }

        // 英雄戰鬥技能
        if (hero.abilities && hero.abilities.onBattle) {
            const effect = hero.abilities.onBattle;
            if (hero.hero.series === 'Dwarf' && damageItem && damageItem.type === 'Weapon') {
                physAtk += 1;
                bonuses.push('矮人武裝: +1 Atk');
            }
            if (effect === 'light_compensation' && lightPenalty > 0) {
                // ...existing logic needed? Yes.
                if (totalLight > 0) { // Using cached totalLight
                    physAtk += totalLight;
                    bonuses.push(`騎士信仰(光照補償): +${totalLight} Atk`);
                }
            }
        }

        // 怪物免疫
        let filteredPhys = physAtk;
        let filteredMag = magAtk;

        if (monster && monster.abilities) {
            if (monster.abilities.battle === 'phys_immune') {
                filteredPhys = 0;
                bonuses.push('物理免疫: 物理傷害歸零');
            } else if (monster.abilities.battle === 'magic_only') {
                filteredPhys = 0;
                bonuses.push('魔法限定: 物理傷害歸零');
            }
        }

        let prePenaltyTotal = filteredPhys + filteredMag;
        let finalAtk = Math.max(0, prePenaltyTotal - lightPenalty);

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
            auras
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
