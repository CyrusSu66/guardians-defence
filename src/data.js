/**
 * 《守護者防線：雷霆遺產》資料庫 (v2.0)
 * 依照 GDD 規範之 Schema 重構，包含完整的英雄、怪物與物品設定。
 */

export const GameState = {
    IDLE: 'IDLE',
    DRAW: 'DRAW',
    VILLAGE: 'VILLAGE',
    COMBAT: 'COMBAT',
    MONSTER_ADVANCE: 'MONSTER_ADVANCE',
    END_TURN: 'END_TURN',
    GAME_OVER: 'GAME_OVER'
};

export const CARDPOOL = {
    // --- 基礎卡牌 (Starting Hand & Market Staples) ---
    basic: [
        {
            id: 'basic_regular_army', name: '正規軍', type: 'Hero', subTypes: ['Fighter'],
            cost: 2, vp: 0, goldValue: 0, light: 0,
            desc: '【地城】若裝備「長矛」，則額外抽 1 張牌',
            hero: { level: 1, series: 'Regular', attack: 0, magicAttack: 0, strength: 2, xpToUpgrade: 0 },
            abilities: { onDungeon: 'synergy_spear_draw' }
        },
        {
            id: 'basic_torch', name: '火把', type: 'Item', subTypes: ['Light'],
            cost: 2, vp: 0, goldValue: 2, light: 1,
            desc: '提供基礎光照與採購力'
        },
        {
            id: 'basic_spear', name: '長矛', type: 'Weapon', subTypes: ['Polearm'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '基本武器',
            equipment: { attack: 1, magicAttack: 0, weight: 1 }
        },
        {
            id: 'basic_rations', name: '乾糧', type: 'Food', subTypes: ['Supply'],
            cost: 1, vp: 0, goldValue: 1, light: 0,
            desc: '【戰鬥】額外 STR+2 (負重加強)',
            abilities: { onDungeon: 'boost_str_2' }
        }
    ],

    // --- 英雄系列 (Hero Series) ---
    heroes: [
        // A. 塞維恩 (Fighter)
        {
            id: 'hero_sevin_lv1', name: '塞維恩扈從', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '勇往直前的戰士學徒',
            hero: { level: 1, series: 'Sevin', attack: 2, magicAttack: 0, strength: 4, xpToUpgrade: 4, upgradeToId: 'hero_sevin_lv2' }
        },
        {
            id: 'hero_sevin_lv2', name: '塞維恩騎士', type: 'Hero', subTypes: ['Fighter'],
            cost: 7, vp: 2, goldValue: 0, light: 1,
            desc: '受封的騎士。光源不足時提供 Magic Atk',
            hero: { level: 2, series: 'Sevin', attack: 3, magicAttack: 0, strength: 5, xpToUpgrade: 6, upgradeToId: 'hero_sevin_lv3' },
            abilities: { onDungeon: 'light_penalty_magic_1' }
        },
        {
            id: 'hero_sevin_lv3', name: '塞維恩君主', type: 'Hero', subTypes: ['Fighter'],
            cost: 10, vp: 3, goldValue: 0, light: 2,
            desc: '統治級勇者。戰勝後可額外採購光源物品',
            hero: { level: 3, series: 'Sevin', attack: 3, magicAttack: 0, strength: 6 },
            abilities: { onDungeon: 'light_penalty_magic_2', onWin: 'buy_light_item' }
        },
        // B. 亞馬遜 (Archer)
        {
            id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', type: 'Hero', subTypes: ['Archer'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '身手矯捷的叢林射手',
            hero: { level: 1, series: 'Amazon', attack: 1, magicAttack: 0, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_amazon_lv2' }
        },
        {
            id: 'hero_amazon_lv2', name: '亞馬遜女獵人', type: 'Hero', subTypes: ['Archer'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【地城】額外抽 1 張牌',
            hero: { level: 2, series: 'Amazon', attack: 2, magicAttack: 0, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_amazon_lv3' },
            abilities: { onDungeon: 'draw_1' }
        },
        {
            id: 'hero_amazon_lv3', name: '亞馬遜女王', type: 'Hero', subTypes: ['Archer'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【地城】抽 2 張牌；戰勝得 1 XP',
            hero: { level: 3, series: 'Amazon', attack: 3, magicAttack: 0, strength: 3 },
            abilities: { onDungeon: 'draw_2', onWin: 'gain_1xp' }
        },
        // C. 精靈 (Wizard)
        {
            id: 'hero_elf_lv1', name: '精靈術士', type: 'Hero', subTypes: ['Wizard'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '操縱自然魔力的精靈',
            hero: { level: 1, series: 'Elf', attack: 0, magicAttack: 1, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_elf_lv2' }
        },
        {
            id: 'hero_elf_lv2', name: '精靈巫師', type: 'Hero', subTypes: ['Wizard'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【地城】抽取 1 張牌',
            hero: { level: 2, series: 'Elf', attack: 0, magicAttack: 2, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_elf_lv3' },
            abilities: { onDungeon: 'draw_1' }
        },
        {
            id: 'hero_elf_lv3', name: '精靈大法師', type: 'Hero', subTypes: ['Wizard'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【地城】抽 2 張；戰勝可直購法術',
            hero: { level: 3, series: 'Elf', attack: 0, magicAttack: 3, strength: 2 },
            abilities: { onDungeon: 'draw_2', onWin: 'buy_spell_item' }
        },
        // D. 聖杯 (Cleric)
        {
            id: 'hero_grail_lv1', name: '聖杯探求者', type: 'Hero', subTypes: ['Cleric'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【村莊】摧毀一張「疾病」',
            hero: { level: 1, series: 'Grail', attack: 0, magicAttack: 1, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_grail_lv2' },
            abilities: { onVillage: 'destroy_disease' }
        },
        {
            id: 'hero_grail_lv2', name: '聖杯保護者', type: 'Hero', subTypes: ['Cleric'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '摧毀疾病並抽一張牌',
            hero: { level: 2, series: 'Grail', attack: 0, magicAttack: 2, strength: 4, xpToUpgrade: 6, upgradeToId: 'hero_grail_lv3' },
            abilities: { onAny: 'destroy_disease_draw_1' }
        },
        {
            id: 'hero_grail_lv3', name: '聖杯聖騎士', type: 'Hero', subTypes: ['Cleric'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '摧毀疾病並抽兩張；戰勝可買村莊卡',
            hero: { level: 3, series: 'Grail', attack: 0, magicAttack: 3, strength: 5 },
            abilities: { onAny: 'destroy_disease_draw_2', onWin: 'buy_village_item' }
        }
    ],

    // --- 怪物群 (Monster Groups) ---
    monsters: [
        // A. 害蟲類 (Vermin)
        {
            id: 'mon_rat', name: '腐化老鼠', type: 'Monster', subTypes: ['Vermin'],
            cost: 0, vp: 1, goldValue: 2, light: 0,
            desc: '【戰鬥】獲得 1 張疾病卡',
            monster: { tier: 1, hp: 3, xpGain: 1, penalty: 'gain_disease' }
        },
        {
            id: 'mon_centipede', name: '巨型蜈蚣', type: 'Monster', subTypes: ['Vermin'],
            cost: 0, vp: 1, goldValue: 3, light: 0,
            desc: '【戰鬥】若無利刃，英雄受 1 傷',
            monster: { tier: 2, hp: 5, xpGain: 1, penalty: 'sharp_check_damage' }
        },
        {
            id: 'mon_spider', name: '變異蜘蛛', type: 'Monster', subTypes: ['Vermin'],
            cost: 0, vp: 2, goldValue: 3, light: 0,
            desc: '【戰鬥】所有英雄力量 -1',
            monster: { tier: 3, hp: 7, xpGain: 2, penalty: 'all_hero_str_minus_1' }
        },
        // B. 類人類 (Humanoid)
        {
            id: 'mon_kobold_guard', name: '狗頭人衛兵', type: 'Monster', subTypes: ['Humanoid'],
            cost: 0, vp: 1, goldValue: 2, light: 0,
            desc: '群居的地穴守衛',
            monster: { tier: 1, hp: 4, xpGain: 1 }
        },
        {
            id: 'mon_kobold_shaman', name: '狗頭人薩滿', type: 'Monster', subTypes: ['Humanoid'],
            cost: 0, vp: 1, goldValue: 3, light: 0,
            desc: '【戰鬥】全體英雄受 1 點魔法傷害',
            monster: { tier: 2, hp: 6, xpGain: 1, penalty: 'all_magic_damage_1' }
        },
        {
            id: 'mon_orc_brute', name: '獸人蠻兵', type: 'Monster', subTypes: ['Humanoid'],
            cost: 0, vp: 3, goldValue: 3, light: 0,
            desc: '【戰鬥條件】若光照不足 2 則自動戰鬥失敗',
            monster: { tier: 3, hp: 9, xpGain: 2, penalty: 'light_check_2_fail' }
        },
        // C. 泥漿類 (Mire)
        {
            id: 'mon_green_slime', name: '綠色泥糊', type: 'Monster', subTypes: ['Mire'],
            cost: 0, vp: 1, goldValue: 1, light: 0,
            desc: '毫無威脅的黏液',
            monster: { tier: 1, hp: 3, xpGain: 1 }
        },
        {
            id: 'mon_red_gel', name: '紅色凝膠獸', type: 'Monster', subTypes: ['Mire'],
            cost: 0, vp: 4, goldValue: 3, light: 0,
            desc: '所有英雄 Attack -1',
            monster: { tier: 2, hp: 6, xpGain: 2, penalty: 'all_hero_atk_minus_1' }
        },
        // D. 龍類 (Dragon)
        {
            id: 'mon_blue_dragon', name: '青龍', type: 'Monster', subTypes: ['Dragon'],
            cost: 0, vp: 5, goldValue: 2, light: 1,
            desc: '高貴的藍色巨龍',
            monster: { tier: 2, hp: 7, xpGain: 2 }
        },
        {
            id: 'mon_black_dragon', name: '黑龍', type: 'Monster', subTypes: ['Dragon'],
            cost: 0, vp: 8, goldValue: 4, light: 4,
            desc: '【戰鬥】僅魔法攻擊有效',
            monster: { tier: 3, hp: 10, xpGain: 4, penalty: 'magic_only' }
        },
        // F. 末日騎士 (Doomsayer)
        {
            id: 'mon_lich_lord', name: '死靈君主', type: 'Monster', subTypes: ['Doomsayer'],
            cost: 0, vp: 4, goldValue: 2, light: 0,
            desc: '【戰鬥】需要 3+ 位英雄才能進攻',
            monster: { tier: 2, hp: 6, xpGain: 2, penalty: 'req_3_heroes' }
        },
        {
            id: 'mon_nightmare_knight', name: '夢魘騎士', type: 'Monster', subTypes: ['Doomsayer'],
            cost: 0, vp: 8, goldValue: 3, light: 0,
            desc: '【戰鬥】區域光照懲罰額外 +3',
            monster: { tier: 3, hp: 10, xpGain: 4, penalty: 'darkness_plus_3' }
        }
    ],

    // --- 村莊物品 (Village Cards) ---
    weapons: [
        {
            id: 'weap_iron_sword', name: '短劍', type: 'Weapon', subTypes: ['Sharp'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '常見的隨身兵器',
            equipment: { attack: 1, magicAttack: 0, weight: 2 }
        },
        {
            id: 'weap_long_spear', name: '長矛 (高級)', type: 'Weapon', subTypes: ['Polearm'],
            cost: 4, vp: 0, goldValue: 1, light: 0,
            desc: '更長、更鋒利的軍用矛',
            equipment: { attack: 2, magicAttack: 0, weight: 3 }
        },
        {
            id: 'weap_fire_sword', name: '火焰之劍', type: 'Weapon', subTypes: ['Sharp', 'Magical'],
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '燃燒的利刃',
            equipment: { attack: 2, magicAttack: 0, weight: 3 }
        },
        {
            id: 'weap_warhammer', name: '戰鎚', type: 'Weapon', subTypes: ['Blunt'],
            cost: 5, vp: 0, goldValue: 1, light: 0,
            desc: '破開鎧甲的重型武器',
            equipment: { attack: 3, magicAttack: 0, weight: 6 }
        }
    ],
    spells: [
        {
            id: 'spell_aura', name: '魔法靈氣', type: 'Spell', subTypes: ['Energy'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '穩定的魔力供應',
            equipment: { attack: 0, magicAttack: 1, weight: 0 }
        },
        {
            id: 'spell_fireball', name: '火球', type: 'Spell', subTypes: ['Fire'],
            cost: 5, vp: 0, goldValue: 1, light: 2,
            desc: '範圍廣、威力強的光魔法',
            equipment: { attack: 0, magicAttack: 3, weight: 0 }
        },
        {
            id: 'spell_banish', name: '驅除', type: 'Spell', subTypes: ['Banish'],
            cost: 4, vp: 0, goldValue: 1, light: 0,
            desc: '【地城】將怪物逐回牌庫頂',
            abilities: { onDungeon: 'banish_to_top' }
        }
    ],
    items: [
        {
            id: 'item_berries', name: '好漿果', type: 'Food', subTypes: ['Supply'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '抽 1 張牌 + 全英雄 STR+1',
            abilities: { onDungeon: 'draw_1_all_str_1' }
        },
        {
            id: 'item_antidote', name: '解毒劑', type: 'Item', subTypes: ['Potion'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '移除 1 疾病 + 抽 1 張牌',
            abilities: { onAny: 'clean_disease_draw_1' }
        },
        {
            id: 'item_lantern', name: '提燈', type: 'Item', subTypes: ['Light'],
            cost: 3, vp: 0, goldValue: 1, light: 1,
            desc: '穩定的光源'
        },
        {
            id: 'item_gold_bag', name: '金錢袋', type: 'Item', subTypes: ['Economy'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '每回合額外 +1 Gold (永久存入手牌)',
            abilities: { onCleanup: 'keep_in_hand' }
        }
    ],

    // --- 特殊 (Special) ---
    special: [
        {
            id: 'spec_disease', name: '疾病', type: 'Special', subTypes: ['Negative'],
            cost: 0, vp: -1, goldValue: 0, light: 0,
            desc: '污染牌組的負面效果'
        }
    ]
};
