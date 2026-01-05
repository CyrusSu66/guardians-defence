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
        "id": "weap_iron_sword",
        "name": "短劍",
        "type": "Weapon",
        "subTypes": [
            "Sharp"
        ],
        "cost": 2,
        "vp": 0,
        "goldValue": 1,
        "light": 0,
        "desc": "銳利的近身武器，士兵的標準裝備。",
        "equipment": {
            "attack": 1,
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
        "cost": 3,
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
            "magicAttack": 0,
            "weight": 3
        }
    },
    {
        "id": "spell_fireball",
        "name": "火球",
        "type": "Spell",
        "subTypes": [
            "Fire"
        ],
        "cost": 5,
        "vp": 0,
        "goldValue": 1,
        "light": 1,
        "desc": "召喚火球攻擊敵人的基礎法術。",
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：對目標造成 2 點傷害\\n💡 增加 1 點照明"
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
    }
];

export const SPECIAL_DATA = [];
