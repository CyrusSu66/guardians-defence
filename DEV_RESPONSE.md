# 文檔重構與更新報告 (Documentation Overhaul)

已依照指示完成 Game_Rule 下的全套文檔更新，現在這些文件能精確反映 v3.26 的開發狀態。

### 1. 🃏 卡牌詳細設定表 (Card Settings)
*   **檔案**: `Guardians_Defence_Card_Settings.md`
*   **更新內容**: 將舊的敘述性文字改為 **結構化表格**。
*   **涵蓋範圍**: 基礎卡、6大英雄系列、市集物品、怪物圖鑑 (依群落分類)。
*   **效益**: 查閱數值 (Cost/ATK/Effect) 一目了然。

### 2. 📝 遊戲設計企劃書 (GDD)
*   **檔案**: `Guardians_Defence_Refactored_GDD.md`
*   **更新內容**:
    *   **系統架構**: 更新為 Controller-Engine 模式說明。
    *   **遊戲流程**: 修正為 Draw -> Village/Dungeon/Rest -> End Turn 的循環。
    *   **機制**: 補上光照懲罰公式與協同效應說明。

### 3. 📖 遊戲說明手冊 (Game Manual v3.26)
*   **檔案**: `Game_Manual_v3.26.md` (原 v3.22 已移除)
*   **風格**: **玩家導向 (Player Guide)**。
*   **內容**:
    *   **介面導覽**: 介紹 Status Bar、Dungeon、Hand 區域。
    *   **三大行動詳解**: 造訪村莊、戰鬥、休息的具體操作。
    *   **實戰範例**: 撰寫了 **Turn 1 ~ Turn 3** 的情境演示，教導玩家如何配裝戰鬥與購買卡牌。

### 4. ✅ 提交確認
*   **Commit ID**: `e06fb73`
*   **Branch**: `main`

所有文檔皆已同步至 GitHub，您可以隨時查閱！
