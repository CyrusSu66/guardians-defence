import { CARDPOOL } from '../data.js?v=3.29';

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
     * 創建怪物牌庫 (v3.11：每族群 10 張卡，隨機雷霆之石)
     */
    createMonsterDeck() {
        // 1. 隨機選出 3 個種族
        // 1. 動態取得所有可用種族 (v3.30 Dynamic Race Selection)
        const allRaces = [...new Set(CARDPOOL.monsters.flatMap(m => m.subTypes))];
        console.log(`[CardEngine] 可選種族池 (${allRaces.length}): ${allRaces.join(', ')}`);

        // 2. 隨機選出 3 個種族
        const groups = this.game.shuffleArray(allRaces).slice(0, 3);
        console.log(`[CardEngine] 本局選定種族: ${groups.join(', ')}`);

        let deckT1 = [];
        let deckT2 = [];
        let deckT3 = [];

        // 2. 依照種族撈取卡片並按階級分類
        // 規則: T1 x4, T2 x3, T3 x3 (每個種族)
        groups.forEach(groupName => {
            const groupMonsters = CARDPOOL.monsters.filter(m => m.subTypes.includes(groupName));

            groupMonsters.forEach(template => {
                const tier = template.monster.tier;
                // T1: 4張, T2: 3張, T3: 3張 (Default if not specified)
                // v3.3x: Use data-driven count if available
                let count = template.monster.count || (tier === 1 ? 4 : 3);
                for (let i = 0; i < count; i++) {
                    const newMonster = JSON.parse(JSON.stringify(template));
                    newMonster.id = `${template.id}_${i}`; // 生成唯一 ID

                    if (tier === 1) deckT1.push(newMonster);
                    else if (tier === 2) deckT2.push(newMonster);
                    else if (tier === 3) deckT3.push(newMonster);
                }
            });
        });

        // 3. 各階級獨立洗牌
        deckT1 = this.game.shuffleArray(deckT1);
        deckT2 = this.game.shuffleArray(deckT2);
        deckT3 = this.game.shuffleArray(deckT3);

        // 4. 雷霆之石埋藏於 T3 (最深處)
        if (deckT3.length > 0) {
            const stoneIndex = Math.floor(Math.random() * deckT3.length);
            deckT3[stoneIndex].hasThunderstone = true;
            console.log(`[CardEngine] 雷霆之石埋藏於 T3 層: ${deckT3[stoneIndex].name}`);
        }

        // 5. 堆疊牌庫
        // 因為 DungeonEngine 使用 pop() 從尾端取牌，所以順序應為:
        // [底部: T3] -> [中層: T2] -> [頂部: T1]
        // 這樣 pop() 會先拿出 T1
        const finalDeck = [...deckT3, ...deckT2, ...deckT1];

        console.log(`[CardEngine] 怪物牌庫建構完成，總張數: ${finalDeck.length}`);
        return finalDeck;
    }

    /**
     * 刷新市集內容
     */
    refreshMarket() {
        // 1. 基礎卡 (Basic) - 始終供應
        const basics = [...CARDPOOL.basic];

        // 2. 英雄 (Heroes) - 隨機 4 名 Level 1
        const heroes = this.game.shuffleArray(CARDPOOL.heroes.filter(h => h.hero.level === 1)).slice(0, 4);

        // 3. 物品/法術 (Items/Spells) 
        // New Logic v3.27.NavFix:
        // - Attack: 2 (Weapon, MagicBook)
        // - Dungeon: 2 (Food, LightItem)
        // - Other: 4 (Everything else)

        const attackPool = [...CARDPOOL.attackItems];
        const dungeonPool = [...CARDPOOL.dungeonSupport];
        const otherPool = [...CARDPOOL.otherSupport];

        const randomAttack = this.game.shuffleArray(attackPool).slice(0, 2);
        const randomDungeon = this.game.shuffleArray(dungeonPool).slice(0, 2);
        const randomOther = this.game.shuffleArray(otherPool).slice(0, 4);

        // Return structured object for UI to render in sections
        return {
            basics: basics.slice(0, 4),
            heroes,
            attackItems: randomAttack,
            dungeonItems: randomDungeon,
            otherItems: randomOther
        };
    }
}
