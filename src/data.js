/**
 * 《守護者防線：雷霆遺產》資料庫 (v2.1)
 * 實作規則：精確的效果觸發時機 (Breach, Aura, Battle) 與資料 ID 對接。
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
    // --- 基礎卡牌 ---
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
            id: 'basic_spear', name: '長矛', type: 'Weapon', subTypes: ['Polearm', 'Sharp'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '基本武器',
            equipment: { attack: 1, magicAttack: 0, weight: 1 }
        },
        {
            id: 'basic_rations', name: '乾糧', type: 'Food', subTypes: ['Supply'],
            cost: 1, vp: 0, goldValue: 1, light: 0,
            desc: '【戰鬥】額外 STR+2 (負重加強)',
            abilities: { onBattle: 'boost_str_2' }
        }
    ],

    // --- 英雄系列 ---
    heroes: [
        {
            id: 'hero_sevin_lv1', name: '塞維恩扈從', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '勇往直前的戰士學徒',
            hero: { level: 1, series: 'Sevin', attack: 2, magicAttack: 0, strength: 4, xpToUpgrade: 4, upgradeToId: 'hero_sevin_lv2' }
        },
        {
            id: 'hero_sevin_lv2', name: '塞維恩騎士', type: 'Hero', subTypes: ['Fighter'],
            cost: 7, vp: 2, goldValue: 0, light: 1,
            desc: '受封的騎士。光源不足時提供力道',
            hero: { level: 2, series: 'Sevin', attack: 3, magicAttack: 0, strength: 5, xpToUpgrade: 6, upgradeToId: 'hero_sevin_lv3' },
            abilities: { onBattle: 'light_compensation' }
        },
        {
            id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', type: 'Hero', subTypes: ['Archer'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '身手矯捷的叢林射手',
            hero: { level: 1, series: 'Amazon', attack: 1, magicAttack: 0, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_amazon_lv2' }
        },
        {
            id: 'hero_elf_lv1', name: '精靈術士', type: 'Hero', subTypes: ['Wizard'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '操縱自然魔力的精靈',
            hero: { level: 1, series: 'Elf', attack: 0, magicAttack: 1, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_elf_lv2' }
        }
    ],

    // --- 怪物群 (v2.1 重點：abilities 對接代碼) ---
    monsters: [
        {
            id: 'mon_rat', name: '腐化老鼠', type: 'Monster', subTypes: ['Vermin'],
            cost: 0, vp: 1, goldValue: 0, light: 0,
            desc: '【進場】獲得 1 張疾病卡',
            monster: { tier: 1, hp: 3, xpGain: 1 },
            abilities: { onBreach: 'gain_disease' }
        },
        {
            id: 'mon_centipede', name: '巨型蜈蚣', type: 'Monster', subTypes: ['Vermin'],
            cost: 0, vp: 1, goldValue: 0, light: 0,
            desc: '【進場】若無利刃，棄 1 張手牌',
            monster: { tier: 2, hp: 5, xpGain: 1 },
            abilities: { onBreach: 'discard_1' } // 簡化為直接棄牌
        },
        {
            id: 'mon_spider', name: '變異蜘蛛', type: 'Monster', subTypes: ['Vermin'],
            cost: 0, vp: 2, goldValue: 0, light: 0,
            desc: '【持續】所有英雄力量 -1',
            monster: { tier: 3, hp: 7, xpGain: 2 },
            abilities: { aura: 'str_minus_1' }
        },
        {
            id: 'mon_kobold_shaman', name: '狗頭人薩滿', type: 'Monster', subTypes: ['Humanoid'],
            cost: 0, vp: 1, goldValue: 0, light: 0,
            desc: '【進場】全體棄 1 張非戰鬥卡',
            monster: { tier: 2, hp: 6, xpGain: 1 },
            abilities: { onBreach: 'discard_magic_or_item' }
        },
        {
            id: 'mon_red_gel', name: '紅色凝膠獸', type: 'Monster', subTypes: ['Mire'],
            cost: 0, vp: 2, goldValue: 0, light: 0,
            desc: '【持續】所有英雄物理攻擊力 -1',
            monster: { tier: 2, hp: 6, xpGain: 2 },
            abilities: { aura: 'atk_minus_1' }
        },
        {
            id: 'mon_ghost', name: '幽鬼', type: 'Monster', subTypes: ['Undead'],
            cost: 0, vp: 1, goldValue: 0, light: 0,
            desc: '【戰鬥】物理攻擊無效',
            monster: { tier: 1, hp: 3, xpGain: 1 },
            abilities: { battle: 'phys_immune' }
        },
        {
            id: 'mon_black_dragon', name: '黑龍', type: 'Monster', subTypes: ['Dragon'],
            cost: 0, vp: 8, goldValue: 0, light: 4,
            desc: '【戰鬥】僅魔法攻擊有效',
            monster: { tier: 3, hp: 10, xpGain: 4 },
            abilities: { battle: 'magic_only' }
        },
        {
            id: 'mon_nightmare_knight', name: '夢魘騎士', type: 'Monster', subTypes: ['Doomsayer'],
            cost: 0, vp: 8, goldValue: 0, light: 0,
            desc: '【持續】光照需求增加 2 點',
            monster: { tier: 3, hp: 10, xpGain: 4 },
            abilities: { aura: 'light_req_plus_2' }
        }
    ],

    // --- 物品與裝備 ---
    weapons: [
        {
            id: 'weap_iron_sword', name: '短劍', type: 'Weapon', subTypes: ['Sharp'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '銳利的近身武器',
            equipment: { attack: 1, magicAttack: 0, weight: 2 }
        },
        {
            id: 'weap_fire_sword', name: '火焰之劍', type: 'Weapon', subTypes: ['Sharp', 'Magical'],
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '燃燒的魔法刃',
            equipment: { attack: 2, magicAttack: 0, weight: 3 }
        }
    ],
    spells: [
        {
            id: 'spell_fireball', name: '火球', type: 'Spell', subTypes: ['Fire'],
            cost: 5, vp: 0, goldValue: 1, light: 2,
            desc: '強力的範圍魔法',
            equipment: { attack: 0, magicAttack: 3, weight: 0 }
        }
    ],
    items: [
        {
            id: 'item_antidote', name: '解毒劑', type: 'Item', subTypes: ['Potion'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '【使用】移除疾病並抽 1 張牌',
            abilities: { onVillage: 'destroy_disease' }
        }
    ],
    special: [
        {
            id: 'spec_disease', name: '疾病', type: 'Special', subTypes: ['Negative'],
            cost: 0, vp: -1, goldValue: 0, light: 0,
            desc: '嚴重的體力衰退'
        }
    ]
};
