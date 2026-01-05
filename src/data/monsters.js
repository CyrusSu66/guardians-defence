export const MONSTERS_DATA = [
    {
        "id": "mon_rat",
        "name": "腐化老鼠",
        "type": "Monster",
        "subTypes": [
            "Vermin"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 2,
            "xpGain": 1,
            "breachDamage": 1
        },
        "desc": "受到黑暗魔力侵蝕的巨大老鼠，成群結隊地啃食村莊的防禦設施。",
        "count": 4
    },
    {
        "id": "mon_centipede",
        "name": "巨型蜈蚣",
        "type": "Monster",
        "subTypes": [
            "Vermin"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 2,
            "hp": 3,
            "xpGain": 2,
            "breachDamage": 2
        },
        "desc": "擁有堅硬甲殼的多足掠食者，其毒液能麻痺冒險者的心智。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【進場】隨機棄 1 張手牌。",
            "onBreach": "discard_1"
        }
    },
    {
        "id": "mon_spider",
        "name": "變異蜘蛛",
        "type": "Monster",
        "subTypes": [
            "Vermin"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 3,
            "hp": 6,
            "xpGain": 4,
            "breachDamage": 3
        },
        "desc": "受到變異影響的蜘蛛，其織出的網帶有劇毒。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【持續】所有英雄力量 -1",
            "aura": "str_minus_1"
        }
    },
    {
        "id": "mon_ghost",
        "name": "幽鬼",
        "type": "Monster",
        "subTypes": [
            "Undead"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 2,
            "xpGain": 1,
            "breachDamage": 1
        },
        "desc": "徘徊在戰場上的怨靈，一般的物理攻擊難以對其造成傷害。",
        "count": 4
    },
    {
        "id": "mon_skeleton",
        "name": "骷髏戰士",
        "type": "Monster",
        "subTypes": [
            "Undead"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 2,
            "hp": 3,
            "xpGain": 2,
            "breachDamage": 2
        },
        "desc": "被黑魔法喚醒的古代士兵，手持生鏽的鐵劍無情地斬殺生者。",
        "count": 3
    },
    {
        "id": "mon_wraith",
        "name": "死靈",
        "type": "Monster",
        "subTypes": [
            "Undead"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 3,
            "hp": 5,
            "xpGain": 4,
            "breachDamage": 3
        },
        "desc": "高階的不死生物，其寒冷的氣息能瞬間凍結勇者的裝備。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【進場】棄 1 張能量或裝備卡。",
            "onBreach": "discard_magic_or_item"
        }
    },
    {
        "id": "mon_shadow",
        "name": "影魔",
        "type": "Monster",
        "subTypes": [
            "Darkness"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 2,
            "xpGain": 1,
            "breachDamage": 1
        },
        "desc": "從陰影中誕生的無形殺手，常在光照不足時發動致命突襲。",
        "count": 4
    },
    {
        "id": "mon_nightmare_knight",
        "name": "夢魘騎士",
        "type": "Monster",
        "subTypes": [
            "Darkness"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 2,
            "hp": 4,
            "xpGain": 3,
            "breachDamage": 3
        },
        "desc": "騎乘著黑馬的恐怖騎士，他的存在本身就會吞噬周圍的光芒。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【持續】地城照明需求 +1 (最高累計 1)。",
            "aura": "light_req_plus_1"
        }
    },
    {
        "id": "mon_harbinger",
        "name": "末日使者",
        "type": "Monster",
        "subTypes": [
            "Darkness"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 3,
            "hp": 7,
            "xpGain": 5,
            "breachDamage": 4
        },
        "desc": "毀滅的先驅，他所散發的絕望氣場能削弱最堅強的戰士。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【持續】所有英雄戰力 -1。",
            "aura": "atk_minus_1"
        }
    },
    {
        "id": "mon_slime",
        "name": "粘液怪",
        "type": "Monster",
        "subTypes": [
            "Ancient"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 1,
            "xpGain": 1,
            "breachDamage": 1
        },
        "desc": "古老遺跡中常見的有機陷阱，雖然弱小但極難徹底消滅。",
        "count": 4
    },
    {
        "id": "mon_young_dragon",
        "name": "幼龍",
        "type": "Monster",
        "subTypes": [
            "Ancient"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 2,
            "hp": 5,
            "xpGain": 4,
            "breachDamage": 3
        },
        "desc": "雖然尚未成年，但其吐息的威力已足以融化鋼鐵與岩石。",
        "count": 3
    },
    {
        "id": "mon_black_dragon",
        "name": "大黑龍",
        "type": "Monster",
        "subTypes": [
            "Ancient"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 3,
            "hp": 8,
            "xpGain": 6,
            "breachDamage": 5
        },
        "desc": "傳說中的災厄化身，其鱗片堅不可摧，唯有強大的魔法才能傷其分毫。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【戰鬥】僅魔法攻擊有效。",
            "battle": "magic_only"
        }
    },
    {
        "id": "mon_goblin_grunt",
        "name": "哥布林雜兵",
        "type": "Monster",
        "subTypes": [
            "Goblin"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 2,
            "xpGain": 1,
            "breachDamage": 1
        },
        "desc": "狡猾且貪婪的小型亞人，擅長偷襲與破壞冒險者的補給。",
        "count": 4,
        "abilities": {
            "abilities_desc": "【進場】破壞 1 張手牌。",
            "onBreach": "destroy_hand_1"
        }
    },
    {
        "id": "mon_goblin_raider",
        "name": "哥布林突襲者",
        "type": "Monster",
        "subTypes": [
            "Goblin"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 2,
            "hp": 4,
            "xpGain": 2,
            "breachDamage": 2
        },
        "desc": "裝備更精良的哥布林精英，會優先攻擊攜帶物資的隊員。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【進場】破壞 2 張手牌。",
            "onBreach": "destroy_hand_2"
        }
    },
    {
        "id": "mon_goblin_king",
        "name": "哥布林王",
        "type": "Monster",
        "subTypes": [
            "Goblin"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 3,
            "hp": 7,
            "xpGain": 4,
            "breachDamage": 3
        },
        "desc": "統率哥布林大軍的魁梧暴君，其麾下的掠奪行動將更加殘暴。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【進場】破壞 2 張手牌 + 1 隨機物品。",
            "onBreach": "destroy_hand_2_plus_1"
        }
    },
    {
        "id": "mon_green_slime",
        "name": "綠色泥糊",
        "type": "Monster",
        "subTypes": [
            "Mire"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 2,
            "xpGain": 1,
            "breachDamage": 2
        },
        "desc": "帶有強烈腐蝕性的酸性軟泥，散發著令人作嘔的惡臭。",
        "count": 4
    },
    {
        "id": "mon_black_slime",
        "name": "黑色史萊姆",
        "type": "Monster",
        "subTypes": [
            "Mire"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 1,
            "hp": 4,
            "xpGain": 2,
            "breachDamage": 2
        },
        "desc": "猶如焦油般黏稠的黑暗物質，能輕易困住大意的冒險者。",
        "count": 3
    },
    {
        "id": "mon_red_gel",
        "name": "紅色凝膠獸",
        "type": "Monster",
        "subTypes": [
            "Mire"
        ],
        "cost": 0,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "monster": {
            "tier": 2,
            "hp": 6,
            "xpGain": 4,
            "breachDamage": 2
        },
        "desc": "外表晶瑩剔透但極度危險，能吸收衝擊力並削弱武器的鋒利度。",
        "count": 3,
        "abilities": {
            "abilities_desc": "【持續】所有英雄攻擊力 -1。",
            "aura": "atk_minus_1"
        }
    }
];
