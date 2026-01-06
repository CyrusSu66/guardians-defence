# 🛠️ System Status & Version Check

**Current Version**: `v3.27.1 (Hotfix)`
**Branch**: `feature-card-stat-adjustments`
**Last Updated**: 2026-01-06

## 📋 Recent Changes
1.  **Fixed** `getCardPoolItem` error:
    - Added `getCardById` to `src/data.js`.
    - Implemented `getCardPoolItem` in `src/game.js`.
2.  **Tools**:
    - `csv_manager.mjs`: Added Export capability & new fields (`onVictory`, `onDungeon`).
    - `Remote Bridge`: Tunnel testing successful (Port 8888).

## 🚀 Deployment Status
- **GitHub**: Pushing changes...
- **Local Server**: Running on Port 8080.
- **Bridge**: Active on Port 8888.

## 📢 更新說明
- 修正首頁「遊戲玩法介紹」按鈕的手冊路徑，改為 `Game_Rule/Game_Manual_v3.26.md`。
- 已提交並推送至 `feature-card-stat-adjustments` 分支。
- 修正 `visitVillageAction` 與 `restAction` 遺失的問題，確保點擊「進入村莊」與「休息」按鈕正常運作。
- **全面檢測與修復**：掃描 UI 呼叫並補齊了所有遺失的 Engine 委派方法（含 `confirmRestAndDestroy`, `buyCard`, `performCombat` 等 7 個方法），解決所有 "is not a function" 潛在錯誤。
- 修正 `endTurnWithAdvance` 遺失問題，確保回合結束與怪物推移邏輯正常執行。
- 修正 **戰鬥部署失效**：在 `playCard` 中實作了 `DUNGEON` 模式的邏輯，現在點擊英雄、武器或道具可以正確切換選取狀態。
- 修正 `dungeonEngine.getActiveAuras` is not a function 錯誤，並校正資料結構 Key 值 (`aura` vs `onAura`)。
- **架構優化**：移除針對「自動衛哨」與「藏寶圖」的硬編碼 (Hardcoded) 邏輯，改為通用的資料驅動 (Data-Driven) 觸發機制 (`turret_damage_1`, `gain_2_gold`)。
- 修正 `calculateCombatStats` is not a function 錯誤，已將 `game.js` 的轉接方法名稱與參數修正為對應 `CombatEngine.calculateStats`。

Ready for next tasks!
