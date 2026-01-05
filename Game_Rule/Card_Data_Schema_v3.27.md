# Card Data Schema (v3.27)

本文件定義了遊戲中所有卡牌資料的正規化結構。
所有的卡牌物件 (JavaScript Object) 都應遵循此規範，以確保資料的一致性與擴充性。

---

## 1. 核心結構 (Base Card)
所有卡牌物件都必須包含以下欄位，若無特殊設定則填入預設值。

| 欄位名稱 (Key) | 類型 (Type) | 預設值 (Default) | 說明 (Description) |
| :--- | :--- | :--- | :--- |
| `id` | String | (Required) | **唯一識別碼**。程式邏輯以此 ID 判定卡牌種類。 |
| `name` | String | `""` | **卡牌名稱**。 |
| `type` | String | (Required) | **主類別**。 |
| `subTypes` | Array<String> | `[]` | **子類別標籤**。 |
| `desc` | String | `""` | **敘述文字**。 |
| `cost` | Number | `0` | **購買/升級花費**。市場購買價格或升級 XP。 |
| `vp` | Number | `0` | **勝利點數**。 |
| `goldValue` | Number | `0` | **金幣價值**。 |
| `light` | Number | `0` | **光照值**。 |
| `count` | Number | `0` | **設置數量**。 (0 代表無限或由邏輯動態生成) |
| `abilities` | Object | `null` | **能力模組**。若無特殊能力則為 null。 |

---

## 2. 英雄擴充 (Hero Extension)
若 `type === 'Hero'`，則包含 `hero` 物件。

| 欄位名稱 (Key) | 類型 (Type) | 預設值 (Default) | 說明 (Description) |
| :--- | :--- | :--- | :--- |
| `hero.level` | Number | `0` | **等級**。 |
| `hero.series` | String | `""` | **系列群組**。 |
| `hero.strength` | Number | `0` | **力量 (STR)**。 |
| `hero.magicAttack` | Number | `0` | **魔攻 (Mag)**。 |
| `hero.xpToUpgrade` | Number | `0` | **升級需求 XP**。 |
| `hero.upgradeToId` | String | `null` | **升級目標 ID**。若以達最高級或不可升級，則為 null。 |

---

## 3. 怪物擴充 (Monster Extension)
若 `type === 'Monster'`，則包含 `monster` 物件。

| 欄位名稱 (Key) | 類型 (Type) | 預設值 (Default) | 說明 (Description) |
| :--- | :--- | :--- | :--- |
| `monster.tier` | Number | `0` | **階級**。 |
| `monster.hp` | Number | `1` | **生命值**。 |
| `monster.xpGain` | Number | `0` | **擊殺獎勵 XP**。 |
| `monster.breachDamage` | Number | `0` | **突破傷害**。 |

---

## 4. 裝備擴充 (Equipment Extension)
若卡牌為裝備類，可包含 `equipment` 物件。

| 欄位名稱 (Key) | 類型 (Type) | 預設值 (Default) | 說明 (Description) |
| :--- | :--- | :--- | :--- |
| `equipment.attack` | Number | `0` | **提供攻擊力**。 |
| `equipment.magicAttack` | Number | `0` | **提供魔攻**。 |
| `equipment.weight` | Number | `0` | **重量**。 |

---

## 5. 能力模組 (Abilities Schema)
若卡牌有特殊效果 (非單純數值加成)，則定義於 `abilities` 物件中。
所有 `Key` 通常對應程式碼中的函數名稱 (Function Name)。

| 欄位名稱 (Key) | 類型 (Type) | 觸發時機 (Trigger) | 說明 (Description) |
| :--- | :--- | :--- | :--- |
| `abilities_desc` | String | UI Display | **能力說明文**。顯示在卡牌中間的具體效果文字。 |
| `onBattle` | String | Combat Phase | **戰鬥時觸發**。計算攻擊力時執行 (例: `synergy_spear` 長矛連動)。 |
| `onVictory` | String | Combat Win | **戰勝時觸發**。擊敗怪物後獲得額外獎勵 (例: `gain_1xp`)。 |
| `onVillage` | String | Village Phase | **村莊行動時觸發**。在村莊使用此卡的效果 (例: `heal_2` 修復護盾)。 |
| `onBreach` | String | Breach | **怪物突破/進場時**。怪物進入戰場或造成傷害時的負面效果 (例: `discard_1`)。 |
| `aura` | String | Passive | **持續光環**。只要怪物在場上就生效的全域效果 (例: `str_minus_1`)。 |
| `battle` | String | Combat Check | **戰鬥限制**。特殊的戰鬥條件判定 (例: `magic_only` 物理免疫)。 |
