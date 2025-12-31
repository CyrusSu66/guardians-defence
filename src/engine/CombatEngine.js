import { GameState } from '../data.js';

/**
 * CombatEngine - 負責所有與戰鬥、傷害、光照、Aura 相關的邏輯。
 */
export class CombatEngine {
    constructor(game) {
        this.game = game;
    }

    /**
     * 執行一次戰鬥進攻 (英雄+武器 對 怪物)
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
        let heroStr = hero.hero.strength + auras.strMod;

        if (weapon && heroStr < weapon.equipment.weight) {
            return g.addLog(`❌ 負重不足！${hero.name} 無法使用 ${weapon.name}`, 'danger');
        }

        // v3.5：亮度偵測優化 - 自動彙整手牌所有亮度提供者
        let totalLight = 0;
        g.hand.forEach(c => totalLight += (c.light || 0));
        g.playedCards.forEach(c => totalLight += (c.light || 0));

        const lightReq = g.combat.targetRank + auras.lightReqMod;
        const lightPenalty = Math.max(0, lightReq - totalLight) * 2;

        let { physAtk, magAtk, bonuses } = this.calculateStats(hero, weapon, monster, lightPenalty, totalLight, lightReq);
        let finalAtk = physAtk + magAtk;

        if (finalAtk <= 0) {
            return g.addLog(`❌ 攻擊力不足以造成傷害 (最終 Atk: ${finalAtk})。`, 'warning');
        }

        // 扣除怪物血量 (接力打怪)
        monster.currentHP -= finalAtk;
        g.addLog(`⚔️ ${hero.name}${weapon ? ' 持 ' + weapon.name : ''} 對 ${monster.name} 造成 ${finalAtk} 點傷害！`, 'info');

        if (monster.currentHP <= 0) {
            g.addLog(`✨ 擊斃 ${monster.name}！`, 'success');

            // 戰勝效果觸發 (onVictory)
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

        // 消耗卡片
        const toDiscard = [hIdx];
        if (wIdx !== null) toDiscard.push(wIdx);
        toDiscard.sort((a, b) => b - a).forEach(i => g.discard.push(g.hand.splice(i, 1)[0]));

        g.combat = { selectedHeroIdx: null, selectedWeaponIdx: null, targetRank: g.combat.targetRank };
        g.updateUI();
    }

    /**
     * 計算英雄與武器組合的詳細戰鬥數值
     */
    calculateStats(hero, weapon, monster, lightPenalty, totalLight = 0, lightReq = 0) {
        const auras = this.getActiveAuras();
        let physAtk = hero.hero.attack + (weapon ? weapon.equipment.attack : 0) + auras.atkMod;
        let magAtk = hero.hero.magicAttack + (weapon ? weapon.equipment.magicAttack : 0);
        let bonuses = [];

        // 英雄戰鬥技能
        if (hero.abilities && hero.abilities.onBattle) {
            const effect = hero.abilities.onBattle;

            // Dwarf 系列加成
            if (hero.hero.series === 'Dwarf' && weapon) {
                physAtk += 1;
                bonuses.push('矮人武裝: +1 Atk');
            }

            // Sevin 騎士光照補償 (當前版本維持)
            if (effect === 'light_compensation' && lightPenalty > 0) {
                // v3.7: 統一由傳入參數或掃描獲取，這裡為了封裝統一掃描一次
                let currentLight = 0;
                this.game.hand.forEach(c => currentLight += (c.light || 0));
                this.game.playedCards.forEach(c => currentLight += (c.light || 0));
                if (currentLight > 0) {
                    physAtk += currentLight;
                    bonuses.push(`騎士信仰(光照補償): +${currentLight} Atk`);
                }
            }
        }

        // 怪物戰鬥防禦技能
        if (monster && monster.abilities) {
            if (monster.abilities.battle === 'phys_immune') {
                physAtk = 0;
                bonuses.push('物理免疫: Atk 歸零');
            }
            if (monster.abilities.battle === 'magic_only') {
                physAtk = 1; // 物理僅剩 1 點墊底
                bonuses.push('魔法限定: 物理 Atk 無效');
            }
        }

        // 3. 照明懲罰 (v3.6：套用於總戰力，以符合火球術等魔法道具受光照影響的設定)
        let totalAtk = physAtk + magAtk;
        totalAtk = Math.max(0, totalAtk - lightPenalty);
        if (lightPenalty > 0) bonuses.push(`光照懲罰: -${lightPenalty} Atk`);

        return {
            physAtk: Math.max(0, physAtk - lightPenalty),
            magAtk: Math.max(0, magAtk - (lightPenalty > physAtk ? lightPenalty - physAtk : 0)),
            bonuses,
            finalAtk: totalAtk,
            totalLight, // v3.7
            lightReq,    // v3.7
            lightPenalty // v3.7
        };
    }

    /**
     * 掃描當前地城中的所有 Aura (環境效果)
     */
    getActiveAuras() {
        const auras = { strMod: 0, atkMod: 0, lightReqMod: 0 };
        const g = this.game;

        [g.dungeonHall.rank1, g.dungeonHall.rank2, g.dungeonHall.rank3].forEach(m => {
            if (!m || !m.abilities || !m.abilities.aura) return;
            const effect = m.abilities.aura;
            if (effect === 'str_minus_1') auras.strMod -= 1;
            if (effect === 'atk_minus_1') auras.atkMod -= 1;
            if (effect === 'light_req_plus_2') auras.lightReqMod += 2;
        });
        return auras;
    }
}
