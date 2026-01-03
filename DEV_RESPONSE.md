# 開發進度回報

## ✅ 執行項目 No. [2856]

1.  **UI 優化**:
    *   **移除放大效果**: 市集與手牌點擊時不再放大，改為顯示 **白色邊框**。
    *   **手牌區高度**: 已縮減高度並調整間距，保留橫向捲動以支援大量手牌。
2.  **偵查功能 (UI)**:
    *   已在地城大廳 Rank 3 右側新增 **「偵查預覽」** 欄位。
    *   目前顯示為虛線框 (未知)，待功能實作後將顯示下一張怪物。

## 📋 亞馬遜英雄 (Amazon) 設定資料

以下是從資料庫 (`src/data.js`) 提取的設定：

```javascript
[
    {
        id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', type: 'Hero', subTypes: ['Fighter', 'Ranger'],
        cost: 5, vp: 1, goldValue: 0, light: 0,
        desc: '【地下城】若裝備弓，攻擊力+1',
        hero: { level: 1, series: 'Amazon', magicAttack: 0, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_amazon_lv2' },
        abilities: { onBattle: 'synergy_bow' }
    },
    {
        id: 'hero_amazon_lv2', name: '亞馬遜獵手', type: 'Hero', subTypes: ['Fighter', 'Ranger'],
        cost: 8, vp: 2, goldValue: 1, light: 0,
        desc: '【地下城】若裝備弓，攻擊力+2',
        hero: { level: 2, series: 'Amazon', magicAttack: 0, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_amazon_lv3' },
        id: 'hero_amazon_lv3', name: '亞馬遜女王', type: 'Hero', subTypes: ['Archer'],
        cost: 10, vp: 3, goldValue: 0, light: 0,
        desc: '【地城】進入時抽 2 張牌；戰勝得 1 XP。',
        hero: { level: 3, series: 'Amazon', magicAttack: 0, strength: 4, xpToUpgrade: 0 },
        abilities: { onDungeon: 'draw_2', onVictory: 'gain_1xp' }
    }
]
```

## 🛠️ 下一步：實作偵查道具「望遠鏡」

既然您決定以 **道具 (Item)** 形式實作偵查，我將進行以下規劃：

1.  **新增卡牌**:
    *   **名稱**: 望遠鏡 (Spyglass)
    *   **類型**: Item / Tool
    *   **效果**: 【村莊/休息】使用後，揭示地城牌庫頂端的 1 張怪物卡，並將其顯示於「預覽區」。
    *   **獲得方式**: 加入市集隨機供應區？還是基礎供應？(基礎供應較適合讓玩家隨時購買)

2.  **引擎邏輯**:
    *   `DungeonEngine.peekNextMonster()`: 回傳牌庫頂卡片但不移除。
    *   `Scout Slot UI`: 接收怪物資料並渲染 (類似地城怪物的 Mini Card)。

請確認 **望遠鏡** 的購買費用與供應方式！
