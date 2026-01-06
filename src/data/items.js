export const ITEMS_DATA = [
    {
        "id": "basic_torch",
        "name": "火把",
        "type": "LightItem",
        "subTypes": [
            "Light"
        ],
        "cost": 2,
        "vp": 0,
        "goldValue": 2,
        "light": 1,
        "desc": "燃燒的火把，能在黑暗中提供些許安全感。",
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    },
    {
        "id": "basic_spear",
        "name": "長矛",
        "type": "Weapon",
        "subTypes": [
            "Polearm",
            "Sharp"
        ],
        "cost": 2,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "標準的制式長柄武器，適合新手使用。",
        "equipment": {
            "attack": 1,
            "magicAttack": 0,
            "weight": 1
        }
    },
    {
        "id": "basic_rations",
        "name": "乾糧",
        "type": "Food",
        "subTypes": [
            "Supply"
        ],
        "cost": 1,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "方便攜帶的乾糧，冒險者補充體力的最愛。",
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：裝備的英雄獲得力量+1",
            "onBattle": "boost_str_1"
        },
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    },
    {
        "id": "item_beef_jerky",
        "name": "優質肉乾",
        "type": "Food",
        "subTypes": [
            "Supply"
        ],
        "cost": 3,
        "vp": 0,
        "goldValue": 2,
        "light": 0,
        "desc": "經過醃製的優質肉類，能提供充足的能量。",
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：裝備的英雄獲得力量+2",
            "onBattle": "boost_str_2"
        },
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    },
    {
        "id": "weap_iron_sword",
        "name": "短劍",
        "type": "Weapon",
        "subTypes": [
            "Sharp"
        ],
        "cost": 3,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "銳利的近身武器，士兵的標準裝備。",
        "equipment": {
            "attack": 2,
            "magicAttack": 0,
            "weight": 2
        }
    },
    {
        "id": "weap_short_bow",
        "name": "獵弓",
        "type": "Weapon",
        "subTypes": [
            "Bow",
            "Ranged"
        ],
        "cost": 2,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "輕便的遠程武器，適合遊擊作戰。",
        "equipment": {
            "attack": 1,
            "magicAttack": 0,
            "weight": 1
        }
    },
    {
        "id": "weap_oak_staff",
        "name": "橡木法杖",
        "type": "Weapon",
        "subTypes": [
            "Staff",
            "Blunt"
        ],
        "cost": 3,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "以堅硬橡木製成的法杖，雖是施法媒介，敲人也很痛。",
        "equipment": {
            "attack": 1,
            "magicAttack": 1,
            "weight": 1
        }
    },
    {
        "id": "weap_fire_sword",
        "name": "火焰之劍",
        "type": "Weapon",
        "subTypes": [
            "Sharp",
            "Magical"
        ],
        "cost": 5,
        "vp": 0,
        "goldValue": 1,
        "light": 1,
        "desc": "燃燒的魔法刃，能灼燒敵人。",
        "equipment": {
            "attack": 2,
            "magicAttack": 1,
            "weight": 3
        }
    },
    {
        "id": "book_fire",
        "name": "火焰魔導書",
        "type": "MagicBook",
        "subTypes": [
            "Fire"
        ],
        "cost": 5,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "記載著火焰法術的魔導書。",
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：對目標造成 2 點傷害"
        },
        "equipment": {
            "attack": 0,
            "magicAttack": 2,
            "weight": 0
        }
    },
    {
        "id": "item_antidote",
        "name": "解毒劑",
        "type": "Item",
        "subTypes": [
            "Potion"
        ],
        "cost": 3,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "能解除中毒狀態的藥劑。",
        "abilities": {
            "abilities_desc": "🏠 村莊中：移除疾病並抽 1 張牌",
            "onVillage": "destroy_disease"
        },
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    },
    {
        "id": "item_lantern",
        "name": "提燈",
        "type": "LightItem",
        "subTypes": [
            "Wonder"
        ],
        "cost": 3,
        "vp": 0,
        "goldValue": 3,
        "light": 2,
        "desc": "照明用的簡易提燈。",
        "abilities": {
            "abilities_desc": "💡 提供光照與採購力"
        },
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    },
    {
        "id": "item_light_gem",
        "name": "光輝寶石",
        "type": "LightItem",
        "subTypes": [
            "Wonder"
        ],
        "cost": 4,
        "vp": 0,
        "goldValue": 4,
        "light": 3,
        "desc": "閃耀著光芒的寶石。",
        "abilities": {
            "abilities_desc": "💡 提供光照與採購力"
        },
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    },
    // --- New Spells & NPC (v3.26) ---
    {
        "id": "spell_arcane_scroll",
        "name": "秘法卷軸",
        "type": "Spell",
        "subTypes": ["Arcane"],
        "cost": 3, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "記載著基礎秘法的卷軸。",
        "abilities": { "abilities_desc": "🏠 村莊中：抽 1 張牌", "onVillage": "draw_1" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    {
        "id": "spell_arcane_tome",
        "name": "秘法寶典",
        "type": "Spell",
        "subTypes": ["Arcane"],
        "cost": 5, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "蘊含深奧知識的魔法書籍。",
        "abilities": { "abilities_desc": "🏠 村莊中：抽 2 張牌", "onVillage": "draw_2" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    {
        "id": "npc_black_merchant",
        "name": "黑市商人",
        "type": "NPC",
        "subTypes": ["Merchant"],
        "cost": 4, "vp": 0, "goldValue": 1, "light": 0,
        "desc": "只要有錢，什麼都可以交易...包括你的垃圾。",
        "abilities": { "abilities_desc": "💰 提供 1 金幣\\n🏠 村莊中：【非法交易】銷毀一張手牌，獲得其 2 倍金幣 (最少 1 金)", "onVillage": "trade_trash_for_gold" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    // --- Batch 2 Items (v3.26) ---
    {
        "id": "item_pickaxe",
        "name": "礦工鎬",
        "type": "Item", "subTypes": ["Tool"],
        "cost": 3, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "村莊中銷毀此卡，可一次性挖掘大量金幣。",
        "abilities": { "abilities_desc": "🏠 村莊中：銷毀此卡並獲得 4 金幣", "onVillage": "mining_4" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    {
        "id": "npc_priest",
        "name": "祭司",
        "type": "NPC", "subTypes": ["Cleric"],
        "cost": 4, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "能淨化詛咒與疾病的神職人員。",
        "abilities": { "abilities_desc": "🏠 村莊中：免費移除一張詛咒或疾病卡", "onVillage": "cleanse_curse" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    {
        "id": "item_treasure_map",
        "name": "藏寶圖",
        "type": "Wonder", "subTypes": ["Map"],
        "cost": 4, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "標記著隱藏寶藏的位置。",
        "abilities": { "abilities_desc": "戰鬥獲勝且手牌持有此卡時，額外獲得 2 金幣", "onVictory": "gain_2_gold" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    {
        "id": "device_sentry_turret",
        "name": "自動衛哨",
        "type": "Device", "subTypes": ["Machine"],
        "cost": 5, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "古代科技遺留的防禦裝置。",
        "abilities": { "abilities_desc": "進入戰鬥階段時，自動對 Rank 1 怪物造成 1 點傷害", "onDungeon": "turret_damage_1" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    },
    {
        "id": "item_bag_of_holding",
        "name": "次元背包",
        "type": "MagicTool", "subTypes": ["Bag"],
        "cost": 4, "vp": 0, "goldValue": 0, "light": 0,
        "desc": "內部空間比外觀大得多的神奇背包。",
        "abilities": { "abilities_desc": "🏠 村莊中：【打包】將一張手牌存入背包，下回合取回", "onVillage": "retain_card" },
        "equipment": { "attack": 0, "magicAttack": 0, "weight": 0 }
    }
];


export const SPECIAL_DATA = [
    {
        "id": "spec_disease",
        "name": "疾病",
        "type": "Debuff",
        "subTypes": [
            "Disease"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "desc": "令人衰弱的病痛。佔用手牌空間。",
        "equipment": {
            "attack": 0,
            "magicAttack": 0,
            "weight": 0
        }
    }
];
