# 🔄 資料同步指南 (Google Sheets to JSON)

本專案使用 Google Sheets 作為卡牌數值平衡的外部編輯器，請參照以下流程進行同步。

## 1. Google Sheets 連結
[Primal Sun - Card Data](https://docs.google.com/spreadsheets/d/1ThbZrssjkdZHHY__mxu_pakMSpXZC431ePoZUVjvDw4/edit?gid=1755505430#gid=1755505430)

*   **Heroes**: `gid=0`
*   **Monsters**: `gid=2112158519`
*   **Items**: `gid=1755505430`


## 2. 欄位結構 (Schema)

以下定義 CSV 欄位名稱與 JavaScript 物件屬性的對應關係。
*   JSON 屬性名稱 (Key) 嚴格遵循 `src/data/*.js` 中的定義。
*   CSV Header 為 Google Sheets 中的欄位名稱。

### Heroes (英雄)
| CSV Header | JSON Key (src/data/heroes.js) | 說明 |
| :--- | :--- | :--- |
| `ID` | `id` | 唯一識別碼 |
| `Name` | `name` | 名稱 |
| `Type` | `type` | 類型 (Hero) |
| `SubTypes` | `subTypes` | 子類型 (分號分隔) |
| `Cost` | `cost` | 招募費用 |
| `VP` | `vp` | 勝利點數 |
| `Gold` | `goldValue` | 金幣價值 |
| `Light` | `light` | 光照提供的光亮值 |
| `Desc` | `desc` | 描述 |
| `Hero_Series` | `hero.series` | 英雄系列 |
| `Hero_Level` | `hero.level` | 英雄等級 |
| `MagATK` | `hero.magicAttack` | 魔法攻擊力 |
| `STR` | `hero.strength` | 力量 |
| `Upgrade_Cost` | `hero.xpToUpgrade` | 升級所需 XP |
| `Next_ID` | `hero.upgradeToId` | 升級後 ID |
| `Ability_Text` | `abilities.abilities_desc` | 能力描述文字 |
| `Ability_Key_Battle` | `abilities.onBattle` | 戰鬥觸發 Key |
| `Ability_Key_Victory` | `abilities.onVictory` | 勝利觸發 Key |
| `Ability_Key_Village` | `abilities.onVillage` | 村莊觸發 Key |
*注意：Hero 物件不包含 `Count` 屬性。*

### Monsters (怪物)
| CSV Header | JSON Key (src/data/monsters.js) | 說明 |
| :--- | :--- | :--- |
| `ID` | `id` | 唯一識別碼 |
| `Name` | `name` | 名稱 |
| `Type` | `type` | 類型 (Monster) |
| `SubTypes` | `subTypes` | 子類型 |
| `Tier` | `monster.tier` | 階級 |
| `HP` | `monster.hp` | 生命值 |
| `XP` | `monster.xpGain` | 擊殺經驗值 |
| `Breach_Dmg` | `monster.breachDamage` | 突破傷害 |
| `Desc` | `desc` | 描述 |
| `Count` | `monster.count` | 牌庫數量 |
| `Ability_Text` | `abilities.abilities_desc` | 能力描述 |
| `Ability_Key_Breach` | `abilities.onBreach` | 突破觸發 Key |
| `Ability_Key_Aura` | `abilities.aura` | 光環 Key |
| `Ability_Key_Battle` | `abilities.battle` | 戰鬥 Key |
*注意：怪物含有 `Count` 屬性。Cost/VP/Gold/Light 預設為 0。*

### Items (道具)
| CSV Header | JSON Key (src/data/items.js) | 說明 |
| :--- | :--- | :--- |
| `ID` | `id` | 唯一識別碼 |
| `Name` | `name` | 名稱 |
| `Type` | `type` | 類型 |
| `SubTypes` | `subTypes` | 子類型 |
| `Cost` | `cost` | 購買價格 |
| `VP` | `vp` | 勝利點數 |
| `Gold` | `goldValue` | 金幣價值 |
| `Light` | `light` | 光照值 |
| `Desc` | `desc` | 描述 |
| `Equip_ATK` | `equipment.attack` | 裝備攻擊力 |
| `Equip_MagATK` | `equipment.magicAttack` | 裝備魔攻 |
| `Equip_Weight` | `equipment.weight` | 裝備重量 |
| `Ability_Text` | `abilities.abilities_desc` | 能力描述 |
| `Ability_Key_Battle`| `abilities.onBattle` | 戰鬥觸發 Key |
| `Ability_Key_Village`| `abilities.onVillage` | 村莊觸發 Key |
| `Ability_Key_Victory`| `abilities.onVictory` | 勝利觸發 Key |
| `Ability_Key_Dungeon`| `abilities.onDungeon` | 地城/回合效果 Key |
*注意：道具不包含 `Count` 屬性。*

## 3. 同步指令
當數值調整完畢後，執行以下指令：

### 匯出 (JS -> CSV)
```bash
node tools/data_sync/export_to_sheet.mjs
```

### 匯入/同步 (Google Sheets -> JS)
```bash
node tools/data_sync/import_sheet_to_js.mjs sync
```

**代理人執行邏輯**:
1.  讀取上述 GID 對應的 CSV Export URL。
2.  將 CSV 解析為 JSON 物件。
3.  覆蓋寫入 `src/data/heroes.js`, `src/data/monsters.js`, `src/data/items.js`。

## 4. 注意事項
*   **不要修改 ID 欄位**: 程式碼邏輯依賴這些 ID，修改可能導致錯誤。
*   **Ability Keys**: 這些 Key 對應到程式碼中的邏輯函數，若要新增能力，需同時修改程式碼。
