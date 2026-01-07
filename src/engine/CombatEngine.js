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
        // v3.22.11: 乾糧改為 boost_str_1 (+1 STR)
        if (auxItem && auxItem.abilities && auxItem.abilities.onBattle === 'boost_str_1') {
            auxStrBonus = 1;
        }

        // v3.22.11: 數值整合 - 力量 (Strength) 同時代表 負重 和 基礎攻擊
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
        let { finalAtk } = this.calculateStats(hero, damageItem, monster, lightPenalty, totalLight, lightReq, auxItem, heroStr);

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

            // v3.26: Generic OnVictory Logic (Supports Treasure Map etc.)
            g.hand.forEach(card => {
                // Ensure we don't trigger the Hero again (already triggered above)
                if (card !== hero && card.abilities && card.abilities.onVictory) {
                    g.triggerCardEffect(card.abilities.onVictory, card.name);
                }
            });

            // v3.22: 輔助卡若有勝利效果 (目前無，預留)

            // v3.26: Base Reward Rule (User Request)
            // Defeating a monster grants 1 VP (Score) by default.
            // XP is determined by monster stats (xpGain).
            g.currentXP += monster.monster.xpGain;
            g.totalScore += 1 + (monster.vp || 0);

            g.addLog(`🎉 獲得 ${monster.monster.xpGain} XP 與 1 VP！`, 'success');
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
        if (Number.isInteger(dIdx)) toDiscard.push(dIdx);
        if (Number.isInteger(aIdx)) toDiscard.push(aIdx);

        console.log(`[Combat] Indices to discard: Hero=${hIdx}, Damage=${dIdx}, Aux=${aIdx}`);
        console.log(`[Combat] toDiscard array (before sort):`, toDiscard);

        // 從大到小排序刪除，避免索引偏移
        toDiscard.sort((a, b) => b - a).forEach(i => g.discard.push(g.hand.splice(i, 1)[0]));

        // 重置選擇
        g.combat = { selectedHeroIdx: null, selectedDamageIdx: null, selectedAuxIdx: null, targetRank: g.combat.targetRank };
        g.updateUI();
    }

    /**
     * 計算 3 欄位組合的詳細戰鬥數值
     */
    calculateStats(hero, damageItem, monster, lightPenalty, totalLight = 0, lightReq = 0, auxItem = null, heroStr = 0) {
        const auras = this.getActiveAuras();

        // 基礎傷害來自力量
        let physAtk = heroStr;
        let magAtk = hero.hero.magicAttack || 0;

        let bonuses = [];
        // 環境
        auras.auraSources.forEach(s => bonuses.push(`環境影響: ${s}`));

        // 裝備數值
        if (damageItem && damageItem.equipment) {
            physAtk += (damageItem.equipment.attack || 0);
            magAtk += (damageItem.equipment.magicAttack || 0);
        }

        // 輔助加成 (v3.22)
        if (auxItem && auxItem.abilities && auxItem.abilities.onBattle === 'boost_str_1') {
            // Already handled in pre-calc, but adding log/tag here if needed
            bonuses.push(`輔助(${auxItem.name}): 力量 +1`);
        }
        if (auxItem && auxItem.abilities && auxItem.abilities.onBattle === 'boost_str_2') {
            const addedAmt = 2; // handled in pre-calc
            bonuses.push(`輔助(${auxItem.name}): 力量 +${addedAmt}`);
        }

        // 英雄戰鬥技能
        if (hero.abilities && hero.abilities.onBattle) {
            const effect = hero.abilities.onBattle;

            // v3.22.13: 正規軍 + 長矛 連動
            if (effect === 'synergy_spear' && damageItem && damageItem.id === 'basic_spear') {
                physAtk += 1;
                bonuses.push('長矛協同(正規軍): +1 Atk');
            }

            // v3.22.14: 亞馬遜 + 弓箭 連動
            if ((effect === 'synergy_bow' || effect === 'synergy_bow_2' || effect === 'synergy_bow_3') && damageItem && damageItem.subTypes && damageItem.subTypes.includes('Bow')) {
                const bonus = effect === 'synergy_bow_3' ? 3 : (effect === 'synergy_bow_2' ? 2 : 1);
                physAtk += bonus;
                bonuses.push(`亞馬遜弓術: +${bonus} Atk`);
            }



            // v3.22.14: 塞維恩 + 隊伍協同
            if ((effect.startsWith('synergy_hero_group'))) {
                const hasOtherHero = this.game.hand.some(c => c.type === 'Hero' && c !== hero);
                if (hasOtherHero) {
                    let bonus = 1; // Lv1 Base: +1
                    if (effect.endsWith('_2')) bonus = 3; // Lv2: +3 (User Request)
                    if (effect.endsWith('_3')) bonus = 5; // Lv3: +5 (User Request)
                    physAtk += bonus;
                    bonuses.push(`隊伍協同(塞維恩): +${bonus} Atk`);
                }
            }

            // v3.22.14: 羅域 + 逆境 (光照不足)
            if ((effect.startsWith('light_compensation_loric')) && totalLight < lightReq) {
                let bonus = 2; // Lv1 Base: +2
                if (effect.endsWith('_2')) bonus = 3; // Lv2: +3
                if (effect.endsWith('_3')) bonus = 4; // Lv3: +4
                physAtk += bonus;
                bonuses.push(`逆境戰鬥(羅域): +${bonus} Atk`);
            }

            if (hero.hero.series === 'Dwarf' && damageItem && damageItem.type === 'Weapon') {
                // Dwarf ability logic updated v3.22.12 desc only, logic remains
                let bonus = 1;
                if (hero.id.includes('_lv2')) bonus = 2;
                if (hero.id.includes('_lv3')) bonus = 3;
                physAtk += bonus;
                bonuses.push(`矮人武裝: +${bonus} Atk`);
            }

            // v3.26 Clean up: Removed old light_compensation_lv3 (Sevin Lv3) as requested.

            // Legacy Light Compensation (for Sevin Lv2 if any old instances exist? No, user updated data)
            if (effect === 'light_compensation' && lightPenalty > 0) {
                if (totalLight > 0) {
                    physAtk += totalLight;
                    bonuses.push(`騎士信仰(光照補償): +${totalLight} Atk`);
                }
            }
            // v3.26: Paladin (Undead/Demon Synergy)
            // Checks if CURRENT monster has 'Undead' or 'Demon' subtype
            if (effect.startsWith('synergy_undead_demon') && monster && monster.subTypes) {
                if (monster.subTypes.includes('Undead') || monster.subTypes.includes('Demon')) {
                    let bonus = 1;
                    if (effect.endsWith('_2')) bonus = 3;
                    if (effect.endsWith('_3')) bonus = 5;
                    physAtk += bonus;
                    bonuses.push(`神聖審判(聖騎士): +${bonus} Atk`);
                }
            }

            // v3.26: Alchemist (Item Synergy 2x)
            if (effect.startsWith('synergy_item_2x') && damageItem && damageItem.equipment) {
                const eqAtk = damageItem.equipment.attack || 0;
                const eqMag = damageItem.equipment.magicAttack || 0;
                physAtk += eqAtk; // Add it AGAIN (so it becomes 2x total)
                magAtk += eqMag;
                bonuses.push(`鍊金轉化: 裝備數值翻倍 (+${eqAtk} Atk / +${eqMag} Mag)`);

                // Bonus for Lv2/Lv3
                if (effect.endsWith('_plus_1')) { magAtk += 1; bonuses.push('鍊金精通: +1 Mag'); }
                if (effect.endsWith('_plus_2')) { magAtk += 2; bonuses.push('賢者智慧: +2 Mag'); }
            }

            // v3.26: Bard (Scale Magic with Rank)
            if (effect.startsWith('scale_magic_rank')) {
                const rankVal = this.game.combat.targetRank || 1; // 1, 2, or 3
                let bonus = rankVal;
                if (effect.endsWith('plus_1')) bonus += 1;
                if (effect.endsWith('plus_2')) bonus += 2;
                magAtk += bonus;
                bonuses.push(`英雄史詩(Rank ${rankVal}): +${bonus} 魔攻`);
            }

            // v3.26: Monk (Ignore Immunity)
            // Implementation note: We handle the logic flag here, effect applied below
            if (effect.startsWith('ignore_immunity')) {
                bonuses.push('氣功: 無視物理/魔法免疫');
                if (effect.endsWith('_bonus_1')) { physAtk += 1; bonuses.push('氣功強化: +1 Atk'); }
                if (effect.endsWith('_bonus_2')) { physAtk += 2; bonuses.push('武神霸氣: +2 Atk'); }
            }

        }

        // 怪物免疫
        let filteredPhys = physAtk;
        let filteredMag = magAtk;

        // v3.26: Monk's Ignore Immunity Check
        let ignoreImmunity = false;
        if (hero.abilities && hero.abilities.onBattle && hero.abilities.onBattle.startsWith('ignore_immunity')) {
            ignoreImmunity = true;
        }

        if (monster && monster.abilities && !ignoreImmunity) {
            if (monster.abilities.battle === 'phys_immune') {
                filteredPhys = 0;
                bonuses.push('物理免疫: 物理傷害歸零');
            } else if (monster.abilities.battle === 'magic_immune') {
                filteredMag = 0;
                bonuses.push('魔法免疫: 魔法傷害歸零');
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
