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
     * 創建怪物牌庫 (v3.11：每族群 10 張卡，隨機雷霆之石)
     */
    createMonsterDeck() {
        const groups = ['Vermin', 'Undead', 'Darkness', 'Ancient'];
        let deck = [];

        groups.forEach(groupName => {
            // Assuming CARDPOOL.monsters is the source for all monsters
            const groupMonsters = CARDPOOL.monsters.filter(m => m.monster.subTypes.includes(groupName));
            groupMonsters.forEach(template => {
                // Assuming 'count' property exists on monster templates, default to 1 if not
                for (let i = 0; i < (template.monster.count || 1); i++) {
                    // Deep copy the template and assign a unique ID
                    const newMonster = JSON.parse(JSON.stringify(template));
                    newMonster.id = `${template.id}_${i}`;
                    deck.push(newMonster);
                }
            });
        });

        // Shuffle the entire deck
        deck = this.game.shuffleArray(deck); // Assuming game.shuffleArray is the correct method

        // 雷霆之石邏輯：牌庫最底層 10 張隨機選一張
        if (deck.length >= 10) {
            const last10Index = deck.length - 10 + Math.floor(Math.random() * 10);
            deck[last10Index].hasThunderstone = true;
            console.log(`[CardEngine] 雷霆之石已埋藏於索引 ${last10Index} (${deck[last10Index].name})`);
        }

        return deck;
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
