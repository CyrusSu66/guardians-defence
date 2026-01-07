export const HEROES_DATA = [
    {
        "id": "basic_regular_army",
        "name": "正規軍",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 2,
        "vp": 0,
        "goldValue": 0,
        "light": 0,
        "desc": "受過基礎訓練的民兵，隨時準備保衛家園。",
        "hero": {
            "level": 0,
            "series": "Regular",
            "magicAttack": 0,
            "strength": 1,
            "xpToUpgrade": 1,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若裝備長矛，攻擊力+1",
            "onBattle": "synergy_spear"
        }
    },
    {
        "id": "hero_sevin_lv1",
        "name": "塞維恩戰術家",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 4,
        "vp": 1,
        "goldValue": 0,
        "light": 0,
        "desc": "塞維恩家族的戰術指導，擅長團隊作戰。",
        "hero": {
            "level": 1,
            "series": "Sevin",
            "magicAttack": 0,
            "strength": 2,
            "xpToUpgrade": 3,
            "upgradeToId": "hero_sevin_lv2"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：手牌中有其他英雄時，攻擊力+1",
            "onBattle": "synergy_hero_group"
        }
    },
    {
        "id": "hero_sevin_lv2",
        "name": "塞維恩指揮官",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 7,
        "vp": 2,
        "goldValue": 0,
        "light": 1,
        "desc": "身經百戰的指揮官，能激發隊友的潛能。",
        "hero": {
            "level": 2,
            "series": "Sevin",
            "magicAttack": 0,
            "strength": 3,
            "xpToUpgrade": 6,
            "upgradeToId": "hero_sevin_lv3"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：手牌中有其他英雄時，攻擊力+3",
            "onBattle": "synergy_hero_group_2"
        }
    },
    {
        "id": "hero_sevin_lv3",
        "name": "塞維恩君主",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 10,
        "vp": 3,
        "goldValue": 0,
        "light": 2,
        "desc": "塞維恩的統治者，其威名足以震懾敵軍。",
        "hero": {
            "level": 3,
            "series": "Sevin",
            "magicAttack": 0,
            "strength": 4,
            "xpToUpgrade": 0,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：手牌中有其他英雄時，攻擊力+5",
            "onBattle": "synergy_hero_group_3"
        }
    },
    {
        "id": "hero_amazon_lv1",
        "name": "亞馬遜弓箭手",
        "type": "Hero",
        "subTypes": [
            "Fighter",
            "Ranger"
        ],
        "cost": 5,
        "vp": 1,
        "goldValue": 0,
        "light": 0,
        "desc": "來自密林的矯健射手，精通弓術。",
        "hero": {
            "level": 1,
            "series": "Amazon",
            "magicAttack": 0,
            "strength": 2,
            "xpToUpgrade": 3,
            "upgradeToId": "hero_amazon_lv2"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若裝備獵弓，攻擊力+1\\n🏆 戰勝後：戰勝怪物得 1 VP",
            "onBattle": "synergy_bow",
            "onVictory": "gain_1vp"
        }
    },
    {
        "id": "hero_amazon_lv2",
        "name": "亞馬遜獵手",
        "type": "Hero",
        "subTypes": [
            "Fighter",
            "Ranger"
        ],
        "cost": 8,
        "vp": 2,
        "goldValue": 0,
        "light": 0,
        "desc": "狩獵技巧已臻化境，能精準命中目標。",
        "hero": {
            "level": 2,
            "series": "Amazon",
            "magicAttack": 0,
            "strength": 3,
            "xpToUpgrade": 6,
            "upgradeToId": "hero_amazon_lv3"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若裝備獵弓，攻擊力+2\\n🏆 戰勝後：戰勝怪物得 2 VP",
            "onBattle": "synergy_bow_2",
            "onVictory": "gain_2vp"
        }
    },
    {
        "id": "hero_amazon_lv3",
        "name": "亞馬遜女王",
        "type": "Hero",
        "subTypes": [
            "Archer"
        ],
        "cost": 10,
        "vp": 3,
        "goldValue": 0,
        "light": 0,
        "desc": "亞馬遜部落的女王，她的箭矢如同審判之光。",
        "hero": {
            "level": 3,
            "series": "Amazon",
            "magicAttack": 0,
            "strength": 4,
            "xpToUpgrade": 0,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若裝備獵弓，攻擊力+3\\n🏆 戰勝後：戰勝怪物得 3 VP",
            "onBattle": "synergy_bow_3",
            "onVictory": "gain_3vp"
        }
    },
    {
        "id": "hero_elf_lv1",
        "name": "精靈術士",
        "type": "Hero",
        "subTypes": [
            "Wizard"
        ],
        "cost": 4,
        "vp": 1,
        "goldValue": 0,
        "light": 0,
        "desc": "操縱自然魔力的精靈，體質較為纖弱。",
        "hero": {
            "level": 1,
            "series": "Elf",
            "magicAttack": 2,
            "strength": 1,
            "xpToUpgrade": 3,
            "upgradeToId": "hero_elf_lv2"
        },
        "abilities": {
            "abilities_desc": "🏆 戰勝後：戰勝怪物得 1 XP",
            "onVictory": "gain_1xp"
        }
    },
    {
        "id": "hero_elf_lv2",
        "name": "精靈巫師",
        "type": "Hero",
        "subTypes": [
            "Wizard"
        ],
        "cost": 7,
        "vp": 2,
        "goldValue": 0,
        "light": 0,
        "desc": "掌握了更深奧的秘法，能感知地城的流動。",
        "hero": {
            "level": 2,
            "series": "Elf",
            "magicAttack": 3,
            "strength": 1,
            "xpToUpgrade": 6,
            "upgradeToId": "hero_elf_lv3"
        },
        "abilities": {
            "abilities_desc": "🏆 戰勝後：戰勝怪物得 2 XP",
            "onVictory": "gain_2xp"
        }
    },
    {
        "id": "hero_elf_lv3",
        "name": "精靈大魔導",
        "type": "Hero",
        "subTypes": [
            "Wizard"
        ],
        "cost": 10,
        "vp": 3,
        "goldValue": 0,
        "light": 0,
        "desc": "魔力充盈的大魔導師，智慧照亮前路。",
        "hero": {
            "level": 3,
            "series": "Elf",
            "magicAttack": 4,
            "strength": 2,
            "xpToUpgrade": 0,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "🏆 戰勝後：戰勝怪物得 3 XP",
            "onVictory": "gain_3xp"
        }
    },
    {
        "id": "hero_dwarf_lv1",
        "name": "矮人守護者",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 4,
        "vp": 1,
        "goldValue": 0,
        "light": 0,
        "desc": "頑強的矮人，對武器有著天生的熱愛。",
        "hero": {
            "level": 1,
            "series": "Dwarf",
            "magicAttack": 0,
            "strength": 2,
            "xpToUpgrade": 3,
            "upgradeToId": "hero_dwarf_lv2"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若有裝備武器，攻擊力+1",
            "onBattle": "dwarf_weapon_bonus"
        }
    },
    {
        "id": "hero_dwarf_lv2",
        "name": "矮人戰士",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 7,
        "vp": 2,
        "goldValue": 0,
        "light": 0,
        "desc": "精通戰鬥技巧的矮人戰士。",
        "hero": {
            "level": 2,
            "series": "Dwarf",
            "magicAttack": 0,
            "strength": 3,
            "xpToUpgrade": 6,
            "upgradeToId": "hero_dwarf_lv2"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若有裝備武器，攻擊力+2",
            "onBattle": "dwarf_weapon_bonus_2"
        }
    },
    {
        "id": "hero_dwarf_lv3",
        "name": "矮人領主",
        "type": "Hero",
        "subTypes": [
            "Fighter"
        ],
        "cost": 10,
        "vp": 3,
        "goldValue": 0,
        "light": 0,
        "desc": "矮人一族的領袖，無人能擋其鋒。",
        "hero": {
            "level": 3,
            "series": "Dwarf",
            "magicAttack": 0,
            "strength": 4,
            "xpToUpgrade": 0,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：若有裝備武器，攻擊力+3",
            "onBattle": "dwarf_weapon_bonus_3"
        }
    },
    {
        "id": "hero_loric_lv1",
        "name": "羅域盜賊",
        "type": "Hero",
        "subTypes": [
            "Thief"
        ],
        "cost": 4,
        "vp": 1,
        "goldValue": 0,
        "light": 0,
        "desc": "善於在陰影中行動的盜賊。",
        "hero": {
            "level": 1,
            "series": "Loric",
            "magicAttack": 0,
            "strength": 1,
            "xpToUpgrade": 3,
            "upgradeToId": "hero_loric_lv2"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：光照不足時，攻擊力+2",
            "onBattle": "light_compensation_loric"
        }
    },
    {
        "id": "hero_loric_lv2",
        "name": "羅域刺客",
        "type": "Hero",
        "subTypes": [
            "Thief"
        ],
        "cost": 7,
        "vp": 2,
        "goldValue": 0,
        "light": 0,
        "desc": "冷酷無情的刺客，黑暗是他的盟友。",
        "hero": {
            "level": 2,
            "series": "Loric",
            "magicAttack": 0,
            "strength": 2,
            "xpToUpgrade": 6,
            "upgradeToId": "hero_loric_lv3"
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：光照不足時，攻擊力+3",
            "onBattle": "light_compensation_loric_2"
        }
    },
    {
        "id": "hero_loric_lv3",
        "name": "羅域暗影大師",
        "type": "Hero",
        "subTypes": [
            "Thief"
        ],
        "cost": 10,
        "vp": 3,
        "goldValue": 0,
        "light": 0,
        "desc": "陰影中的大師，無聲無息地解決敵人。",
        "hero": {
            "level": 3,
            "series": "Loric",
            "magicAttack": 0,
            "strength": 3,
            "xpToUpgrade": 0,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "⚔️ 戰鬥中：光照不足時，攻擊力+4",
            "onBattle": "light_compensation_loric_3"
        }
    },
    {
        "id": "hero_grail_lv1",
        "name": "聖杯探求者",
        "type": "Hero",
        "subTypes": [
            "Cleric"
        ],
        "cost": 4,
        "vp": 1,
        "goldValue": 0,
        "light": 0,
        "desc": "致力於治癒世間疾苦的僧侶。",
        "hero": {
            "level": 1,
            "series": "Grail",
            "magicAttack": 1,
            "strength": 1,
            "xpToUpgrade": 3,
            "upgradeToId": "hero_grail_lv2"
        },
        "abilities": {
            "abilities_desc": "🏠 村莊中：摧毀一張疾病卡",
            "onVillage": "destroy_disease"
        }
    },
    {
        "id": "hero_grail_lv2",
        "name": "聖杯騎士",
        "type": "Hero",
        "subTypes": [
            "Cleric"
        ],
        "cost": 7,
        "vp": 2,
        "goldValue": 0,
        "light": 1,
        "desc": "神聖的騎士，守護著村莊的安寧。",
        "hero": {
            "level": 2,
            "series": "Grail",
            "magicAttack": 2,
            "strength": 2,
            "xpToUpgrade": 6,
            "upgradeToId": "hero_grail_lv3"
        },
        "abilities": {
            "abilities_desc": "🏠 村莊中：摧毀任意一張卡\\n🏠 村莊中：修復 1 點魔法護罩",
            "onVillage": "destroy_any_heal_1"
        }
    },
    {
        "id": "hero_grail_lv3",
        "name": "聖杯守護者",
        "type": "Hero",
        "subTypes": [
            "Cleric"
        ],
        "cost": 10,
        "vp": 3,
        "goldValue": 0,
        "light": 2,
        "desc": "聖杯的守護者，擁有強大的治癒神力。",
        "hero": {
            "level": 3,
            "series": "Grail",
            "magicAttack": 3,
            "strength": 3,
            "xpToUpgrade": 0,
            "upgradeToId": null
        },
        "abilities": {
            "abilities_desc": "🏠 村莊中：修復 2 點魔法護罩",
            "onVillage": "heal_2"
        }
    },
    // --- Paladin Series (聖騎士) ---
    {
        "id": "hero_paladin_lv1",
        "name": "告解者",
        "type": "Hero", "subTypes": ["Cleric", "Fighter"],
        "cost": 4, "vp": 1, "goldValue": 0, "light": 0,
        "desc": "發誓剷除邪惡的信徒，對不死生物毫不留情。",
        "hero": { "level": 1, "series": "Paladin", "magicAttack": 1, "strength": 2, "xpToUpgrade": 3, "upgradeToId": "hero_paladin_lv2" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：對不死/惡魔系怪物攻擊力+1", "onBattle": "synergy_undead_demon" }
    },
    {
        "id": "hero_paladin_lv2",
        "name": "審判官",
        "type": "Hero", "subTypes": ["Cleric", "Fighter"],
        "cost": 7, "vp": 2, "goldValue": 0, "light": 1,
        "desc": "執行神聖審判的騎士，他的存在本身就是一種光芒。",
        "hero": { "level": 2, "series": "Paladin", "magicAttack": 2, "strength": 3, "xpToUpgrade": 6, "upgradeToId": "hero_paladin_lv3" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：對不死/惡魔系怪物攻擊力+3", "onBattle": "synergy_undead_demon_2" }
    },
    {
        "id": "hero_paladin_lv3",
        "name": "聖十字軍",
        "type": "Hero", "subTypes": ["Cleric", "Fighter"],
        "cost": 10, "vp": 3, "goldValue": 0, "light": 2,
        "desc": "被聖光環繞的傳奇英雄，任何邪惡都無法在他面前遁形。",
        "hero": { "level": 3, "series": "Paladin", "magicAttack": 3, "strength": 4, "xpToUpgrade": 0, "upgradeToId": null },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：對不死/惡魔系怪物攻擊力+5", "onBattle": "synergy_undead_demon_3" }
    },
    // --- Monk Series (武道家) ---
    {
        "id": "hero_monk_lv1",
        "name": "武僧",
        "type": "Hero", "subTypes": ["Fighter"],
        "cost": 4, "vp": 1, "goldValue": 0, "light": 0,
        "desc": "修煉身心的武者，他的拳頭能擊穿盔甲與靈體。",
        "hero": { "level": 1, "series": "Monk", "magicAttack": 0, "strength": 1, "xpToUpgrade": 3, "upgradeToId": "hero_monk_lv2" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：無視怪物的免疫屬性 (物理/魔法)", "onBattle": "ignore_immunity" }
    },
    {
        "id": "hero_monk_lv2",
        "name": "拳法家",
        "type": "Hero", "subTypes": ["Fighter"],
        "cost": 7, "vp": 2, "goldValue": 0, "light": 0,
        "desc": "精通氣功的高手，任何防禦在他眼中都如同薄紙。",
        "hero": { "level": 2, "series": "Monk", "magicAttack": 1, "strength": 2, "xpToUpgrade": 6, "upgradeToId": "hero_monk_lv3" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：無視免疫，且額外+1 攻擊力", "onBattle": "ignore_immunity_bonus_1" }
    },
    {
        "id": "hero_monk_lv3",
        "name": "武神",
        "type": "Hero", "subTypes": ["Fighter"],
        "cost": 10, "vp": 3, "goldValue": 0, "light": 0,
        "desc": "武道的極致，他的每一擊都蘊含著破壞法則的力量。",
        "hero": { "level": 3, "series": "Monk", "magicAttack": 2, "strength": 3, "xpToUpgrade": 0, "upgradeToId": null },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：無視免疫，且額外+2 攻擊力", "onBattle": "ignore_immunity_bonus_2" }
    },
    // --- Alchemist Series (鍊金術士) ---
    {
        "id": "hero_alchemist_lv1",
        "name": "鍊金學徒",
        "type": "Hero", "subTypes": ["Wizard"],
        "cost": 4, "vp": 1, "goldValue": 0, "light": 0,
        "desc": "熱衷於研究物品性質的學者，能發揮道具的最大效能。",
        "hero": { "level": 1, "series": "Alchemist", "magicAttack": 1, "strength": 1, "xpToUpgrade": 3, "upgradeToId": "hero_alchemist_lv2" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：裝備的道具數值加倍 (X2)", "onBattle": "synergy_item_2x" }
    },
    {
        "id": "hero_alchemist_lv2",
        "name": "鍊金師",
        "type": "Hero", "subTypes": ["Wizard"],
        "cost": 7, "vp": 2, "goldValue": 0, "light": 0,
        "desc": "能瞬間轉化物質結構，將普通的劍變成神兵利器。",
        "hero": { "level": 2, "series": "Alchemist", "magicAttack": 2, "strength": 2, "xpToUpgrade": 6, "upgradeToId": "hero_alchemist_lv3" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：裝備道具數值加倍，且自身魔力+1", "onBattle": "synergy_item_2x_plus_1" }
    },
    {
        "id": "hero_alchemist_lv3",
        "name": "賢者",
        "type": "Hero", "subTypes": ["Wizard"],
        "cost": 10, "vp": 3, "goldValue": 0, "light": 1,
        "desc": "解開了真理的智者，萬物在他手中皆可化為奇蹟。",
        "hero": { "level": 3, "series": "Alchemist", "magicAttack": 3, "strength": 2, "xpToUpgrade": 0, "upgradeToId": null },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：裝備道具數值加倍，且自身魔力+2", "onBattle": "synergy_item_2x_plus_2" }
    },
    // --- Bard Series (吟遊詩人) ---
    {
        "id": "hero_bard_lv1",
        "name": "詩人",
        "type": "Hero", "subTypes": ["Thief"], // Use Thief for high DEX/CHA flavor
        "cost": 4, "vp": 1, "goldValue": 0, "light": 0,
        "desc": "流浪的歌者，他的歌聲能隨著敵人的強大而越發激昂。",
        "hero": { "level": 1, "series": "Bard", "magicAttack": 1, "strength": 1, "xpToUpgrade": 3, "upgradeToId": "hero_bard_lv2" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：魔攻增加量 = 當前地城階級 (Rank)", "onBattle": "scale_magic_rank" }
    },
    {
        "id": "hero_bard_lv2",
        "name": "吟遊詩人",
        "type": "Hero", "subTypes": ["Thief"],
        "cost": 7, "vp": 2, "goldValue": 0, "light": 1,
        "desc": "他的英雄史詩能激勵人心，面對越強的地城，戰力越高。",
        "hero": { "level": 2, "series": "Bard", "magicAttack": 1, "strength": 2, "xpToUpgrade": 6, "upgradeToId": "hero_bard_lv3" },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：魔攻增加量 = 地城階級 (Rank) + 1", "onBattle": "scale_magic_rank_plus_1" }
    },
    {
        "id": "hero_bard_lv3",
        "name": "藝術家",
        "type": "Hero", "subTypes": ["Thief"],
        "cost": 10, "vp": 3, "goldValue": 0, "light": 1,
        "desc": "傳說中的演奏家，連巨龍都會被他的樂曲所震撼。",
        "hero": { "level": 3, "series": "Bard", "magicAttack": 2, "strength": 2, "xpToUpgrade": 0, "upgradeToId": null },
        "abilities": { "abilities_desc": "⚔️ 戰鬥中：魔攻增加量 = 地城階級 (Rank) + 2", "onBattle": "scale_magic_rank_plus_2" }
    }
];
