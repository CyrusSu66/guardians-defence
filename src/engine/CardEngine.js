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
            const groupMonsters = CARDPOOL.monsters.filter(m => m.subTypes.includes(groupName));
            groupMonsters.forEach(template => {
                for (let i = 0; i < (template.count || 1); i++) {
                    const newMonster = JSON.parse(JSON.stringify(template));
                    newMonster.id = `${template.id}_${i}`;
                    deck.push(newMonster);
                }
            });
        });

        deck = this.game.shuffleArray(deck);

        // 雷霆之石邏輯：埋藏於牌庫最底層的 10 張 (索引 0~9, 因為使用 pop())
        if (deck.length >= 10) {
            // v3.13: 為了絕對沈底，我們將其限制在索引 0~2 之間
            const burialIndex = Math.floor(Math.random() * 3);
            deck[burialIndex].hasThunderstone = true;
            console.log(`[CardEngine] 雷霆之石已埋藏於索引 ${burialIndex} (${deck[burialIndex].name})，將在最後被抽出。`);
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
