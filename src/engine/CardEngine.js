import { CARDPOOL } from '../data.js';

/**
 * CardEngine - 負責卡牌庫查詢、隨機數值生成、市集刷新與怪物牌庫初始化。
 */
export class CardEngine {
    constructor(game) {
        this.game = game;
    }

    /**
     * 根據 ID 從卡池中獲取卡片深拷貝
     */
    getItem(id) {
        for (const cat in CARDPOOL) {
            const found = CARDPOOL[cat].find(c => c.id === id);
            if (found) return JSON.parse(JSON.stringify(found));
        }
        return null;
    }

    /**
     * 初始化怪物牌庫 (含 Boss 與雷霆之石)
     */
    createMonsterDeck() {
        const pool = CARDPOOL.monsters;
        const t1 = this.game.shuffleArray(pool.filter(m => m.monster.tier === 1));
        const t2 = this.game.shuffleArray(pool.filter(m => m.monster.tier === 2));
        const t3 = this.game.shuffleArray(pool.filter(m => m.monster.tier === 3));
        const s1 = t1.slice(0, 10);
        const s2 = t2.slice(0, 10);
        const s3 = t3.slice(0, 10);

        const bossIdx = Math.floor(Math.random() * s3.length);
        s3[bossIdx].hasThunderstone = true;
        s3[bossIdx].monster.hp += 3;
        s3[bossIdx].name += " ⚡";

        return [...s1, ...s2, ...s3].reverse();
    }

    /**
     * 刷新市集內容
     */
    refreshMarket() {
        const basics = JSON.parse(JSON.stringify(CARDPOOL.basic));
        const heroes = this.game.shuffleArray(CARDPOOL.heroes.filter(h => h.hero.level === 1)).slice(0, 4);
        const randomPool = [
            ...(CARDPOOL.items || []),
            ...(CARDPOOL.weapons || []),
            ...(CARDPOOL.spells || [])
        ];
        const items = this.game.shuffleArray(randomPool).slice(0, 4);

        return {
            basics: basics.slice(0, 4),
            heroes: heroes,
            items: items
        };
    }
}
