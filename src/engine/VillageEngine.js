/**
 * VillageEngine - 負責村莊內的採購、訓練、轉職與休息邏輯。
 */
export class VillageEngine {
    constructor(game) {
        this.game = game;
    }

    /**
     * 造訪村莊購買卡片
     */
    buy(cardId, cost) {
        const g = this.game;
        if (g.currentGold < cost) return g.addLog('金幣不足！', 'danger');
        if (g.hasBought) return g.addLog('造訪期間僅限執行一次購買。', 'warning');

        g.currentGold -= cost;
        g.hasBought = true;
        const card = g.getCardPoolItem(cardId);
        g.discard.push(card);
        g.addLog(`購入「${card.name}」。`, 'success');
        g.updateUI();
    }

    /**
     * 英雄花費 XP 進行晉階
     */
    upgrade(cardId) {
        const g = this.game;
        const idx = g.hand.findIndex(c => c.id === cardId);
        const hero = g.hand[idx];

        if (!hero || !hero.hero || !hero.hero.upgradeToId || g.currentXP < hero.hero.xpToUpgrade) return;

        g.currentXP -= hero.hero.xpToUpgrade;
        const nextLv = g.getCardPoolItem(hero.hero.upgradeToId);
        g.hand.splice(idx, 1);
        g.discard.push(nextLv);
        g.addLog(`英雄升級：${hero.name} ➔ ${nextLv.name}`, 'success');
        g.updateUI();
    }

    /**
     * 正規軍轉職為市集 1 級英雄
     */
    promoteRegular(handIdx, marketHeroId) {
        const g = this.game;
        const card = g.hand[handIdx];
        if (!card || card.id !== 'basic_regular_army' || g.currentXP < 1) return;

        const marketHero = g.marketItems.heroes.find(h => h.id === marketHeroId);
        if (!marketHero) return g.addLog('市集中無此英雄可供轉職。', 'warning');

        g.currentXP -= 1;
        g.hand.splice(handIdx, 1);
        const newHero = g.getCardPoolItem(marketHeroId);
        g.discard.push(newHero);
        g.addLog(`✨ 轉職成功！正規軍 ➔ ${newHero.name} (花費 1 XP)`, 'success');
        g.updateUI();
    }

    /**
     * 執行休息確認與銷毀
     */
    confirmRest() {
        const g = this.game;
        if (g.currentAction !== 'REST') return;

        if (g.selectedDestroyIdx !== null) {
            const removed = g.hand.splice(g.selectedDestroyIdx, 1)[0];
            g.hasDestroyed = true;
            g.selectedDestroyIdx = null;
            g.addLog(`🔥 已銷毀卡片：「${removed.name}」，休息行動結束。`, 'warning');
        } else {
            g.addLog('直接結束休息行動，未銷毀任何卡片。', 'info');
        }
        g.finishAction();
    }

    /**
     * 自動啟用手牌所有產金資源
     */
    activateAllResources() {
        const g = this.game;
        if (g.currentAction !== 'VILLAGE') return;

        let activatedCount = 0;
        for (let i = g.hand.length - 1; i >= 0; i--) {
            if (g.hand[i].goldValue > 0) {
                g.playCard(i);
                activatedCount++;
            }
        }
        if (activatedCount > 0) g.addLog(`自動啟用了 ${activatedCount} 張資源卡。`, 'info');
        g.updateUI();
    }
}
