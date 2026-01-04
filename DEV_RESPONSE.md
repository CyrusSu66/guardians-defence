# 開發進度回報

## ✅ 執行項目 No. [2886]

1.  **偵查功能/道具**: 已依照指示廢棄，並將地城大廳的預覽欄位刪除。
2.  **亞馬遜英雄調整**:
    *   **能力變更**:
        *   戰鬥時裝備 **獵弓**，攻擊力依等級提升 (+1 / +2 / +3)。
        *   **統一被動**: 戰勝怪物後獲得額外 1 XP。
    *   **名稱變更**: 「短弓」已更名為 **「獵弓 (Hunter Bow)」**。

## 📋 亞馬遜英雄 (Amazon) 新設定資料

```javascript
[
    {
        id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', 
        desc: '【地下城】若裝備獵弓，攻擊力+1；戰勝得 1 XP。',
        abilities: { onBattle: 'synergy_bow', onVictory: 'gain_1xp' }
    },
    {
        id: 'hero_amazon_lv2', name: '亞馬遜獵手', 
        desc: '【地下城】若裝備獵弓，攻擊力+2；戰勝得 1 XP。',
        abilities: { onBattle: 'synergy_bow_2', onVictory: 'gain_1xp' }
    },
    {
        id: 'hero_amazon_lv3', name: '亞馬遜女王', 
        desc: '【地下城】若裝備獵弓，攻擊力+3；戰勝得 1 XP。',
        abilities: { onBattle: 'synergy_bow_3', onVictory: 'gain_1xp' }
    }
]
```

請確認設定是否符合您的需求！
