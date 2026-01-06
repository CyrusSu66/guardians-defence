import { GameState } from '../data.js';

/**
 * DungeonEngine - 負責地城內部怪物的分佈、移動與突進效果。
 */
export class DungeonEngine {
    constructor(game) {
        this.game = game;
    }

    /**
     * 從牌庫補充怪物到 Rank 3
     */
    spawn() {
        const g = this.game;
        if (g.monsterDeck.length === 0) return;

        const monster = g.monsterDeck.pop();
        monster.currentHP = monster.monster.hp; // v3.5: 初始化 HP

        // 找出最遠的空位 (遞減嘗試)
        if (!g.dungeonHall.rank3) {
            g.dungeonHall.rank3 = monster;
            this.processBreach(monster); // Trigger Enter/Spawn Effect
        }
        else if (!g.dungeonHall.rank2) {
            g.dungeonHall.rank2 = monster;
            this.processBreach(monster);
        }
        else if (!g.dungeonHall.rank1) {
            g.dungeonHall.rank1 = monster;
            this.processBreach(monster);
        }
        else {
            g.monsterDeck.push(monster);
            g.addLog('⚠️ 地城已滿，怪物暫時無法進入。', 'warning');
        }
    }

    /**
     * 回合結束時怪物向村莊推進
     */
    advance() {
        const g = this.game;
        g.state = GameState.MONSTER_ADVANCE;

        // 檢查 Rank 1 怪物是否衝出地城 (逃脫)
        if (g.dungeonHall.rank1) {
            const escaped = g.dungeonHall.rank1;
            if (escaped.hasThunderstone) {
                g.addLog('☢️ 雷霆之石被怪物帶離地城！', 'danger');
                return g.gameOver();
            }
            g.addLog(`⚠️ ${escaped.name} 已逃出地城，村莊受損！`, 'danger');
            g.villageHP -= (escaped.monster.breachDamage || 2);
        }

        // 推移
        g.dungeonHall.rank1 = g.dungeonHall.rank2;
        g.dungeonHall.rank2 = g.dungeonHall.rank3;
        g.dungeonHall.rank3 = null;

        // 補充新怪物
        // v3.27 Optimization: Spawn is moved to nextTurn() start
        // to ensure breach effects target the NEW hand.
        // this.spawn();
        g.updateUI();

        if (g.villageHP <= 0) {
            g.gameOver();
        } else {
            // 延遲一段時間後進入下一抽牌回合
            setTimeout(() => {
                g.hand.forEach(c => g.discard.push(c));
                g.hand = [];
                g.nextTurn();
            }, 800);
        }
    }

    /**
     * 處理怪物的突進 (進場) 效果
     */
    processBreach(monster) {
        const g = this.game;
        if (!monster || !monster.abilities || !monster.abilities.onBreach) return;

        this.game.addLog(`⚠️ ${monster.name} 進場發動突襲！`, 'warning');
        const effect = monster.abilities.onBreach;

        if (effect === 'gain_disease' || effect === 'add_disease_1') {
            const disease = g.getCardPoolItem('spec_disease');
            if (disease) {
                g.discard.push(disease);
                g.addLog(`🤢 ${monster.name}：散播了疾病！(疾病卡已加入棄牌堆)`, 'danger');
            }
        } else if (effect === 'discard_1') {
            g.forcePlayerDiscard(1);
        } else if (effect === 'discard_magic_or_item') {
            g.forceTypeDiscard(['Spell', 'Item', 'Weapon'], 1);
        } else if (effect === 'destroy_hand_1') {
            g.forcePlayerDestroy(1);
        } else if (effect === 'destroy_hand_2') {
            g.forcePlayerDestroy(2);
        } else if (effect === 'destroy_hand_2_plus_1') {
            g.forcePlayerDestroy(2);
            g.forcePlayerDestroy(1, ['Item', 'Weapon', 'Food', 'LightItem', 'Spell']);
        }
    }

    /**
     * 獲取目前場上怪物的所有光環效果 (v3.26)
     */
    getActiveAuras() {
        const auras = {
            reduceLight: 0,
            increaseCost: 0,
            strMod: 0
        };

        const ranks = ['rank1', 'rank2', 'rank3'];
        ranks.forEach(r => {
            const m = this.game.dungeonHall[r];
            if (m && m.abilities && m.abilities.aura) {
                const effect = m.abilities.aura;
                if (effect === 'aura_darkness_1') auras.reduceLight += 1;
                if (effect === 'aura_darkness_2') auras.reduceLight += 2;
                if (effect === 'aura_fear_cost_1') auras.increaseCost += 1;
                if (effect === 'aura_weakness_1') auras.strMod -= 1;
            }
        });
        return auras;
    }
}
