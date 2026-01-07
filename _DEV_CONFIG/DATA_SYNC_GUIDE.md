# 🔄 資料同步指南 (Google Sheets to JSON)

本專案使用 Google Sheets 作為卡牌數值平衡的外部編輯器，請參照以下流程進行同步。

## 1. Google Sheets 資訊
*   **試算表連結**: [Guardians Defence Card Data](https://docs.google.com/spreadsheets/d/1ThbZrssjkdZHHY__mxu_pakMSpXZC431ePoZUVjvDw4/edit?usp=sharing)
*   **分頁 ID (GID)**:
    *   **Heroes**: `gid=0`
    *   **Monsters**: `gid=2112158519`
    *   **Items**: `gid=1755505430`

## 2. 欄位結構 (Schema)
為了確保轉換正確，Google Sheets 的欄位必須保持以下名稱 (Header)：

*   **Heroes**: `ID`, `Name`, `Cost`, `VP`, `STR`, `MagATK`, `Light`, `Desc`, `Hero_Series`, `Hero_Level`, `Ability_Text`, `Ability_Key_Battle`, `Ability_Key_Victory`, `Ability_Key_Village`, `Upgrade_Cost`, `Next_ID`
*   **Monsters**: `ID`, `Name`, `Tier`, `HP`, `XP`, `Breach_Dmg`, `Type`, `Desc`, `Ability_Text`, `Ability_Key_Breach`, `Ability_Key_Aura`, `Ability_Key_Battle`, `Count`
*   **Items**: `ID`, `Name`, `Type`, `SubTypes`, `Cost`, `Gold`, `Light`, `Equip_ATK`, `Equip_MagATK`, `Equip_Weight`, `Desc`, `Ability_Text`, `Ability_Key_Battle`, `Ability_Key_Village`

## 3. 同步指令
當數值調整完畢後，發送以下指令給 AI 代理人：
> "同步 data" 或 "更新卡牌數值" (將自動執行 `node tools/data_sync/csv_manager.mjs sync`)

**代理人執行邏輯**:
1.  讀取上述 GID 對應的 CSV Export URL。
2.  將 CSV 解析為 JSON 物件。
3.  覆蓋寫入 `src/data/heroes.js`, `src/data/monsters.js`, `src/data/items.js`。

## 4. 注意事項
*   **不要修改 ID 欄位**: 程式碼邏輯依賴這些 ID，修改可能導致錯誤。
*   **Ability Keys**: 這些 Key 對應到程式碼中的邏輯函數，若要新增能力，需同時修改程式碼。
