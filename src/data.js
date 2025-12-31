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
            desc: '基本步兵單位。可花費 1 XP 晉升為 1 級英雄。',
            hero: { level: 0, series: 'Regular', attack: 1, magicAttack: 0, strength: 2, xpToUpgrade: 1 },
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
            desc: '【戰鬥】光照不足時，每多一光源攻擊力 +1',
            hero: { level: 2, series: 'Sevin', attack: 3, magicAttack: 0, strength: 5, xpToUpgrade: 6, upgradeToId: 'hero_sevin_lv3' },
            abilities: { onBattle: 'light_compensation' }
        },
        {
            id: 'hero_sevin_lv3', name: '塞維恩君主', type: 'Hero', subTypes: ['Fighter'],
            cost: 10, vp: 3, goldValue: 0, light: 2,
            desc: '【戰鬥】光照不足時 Magic+2；戰勝可額外購買光源。',
            hero: { level: 3, series: 'Sevin', attack: 3, magicAttack: 0, strength: 6, xpToUpgrade: 0 },
            abilities: { onBattle: 'light_compensation_lv3', onVictory: 'buy_light' }
        },
        {
            id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', type: 'Hero', subTypes: ['Archer'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '身手矯捷的叢林射手',
            hero: { level: 1, series: 'Amazon', attack: 1, magicAttack: 0, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_amazon_lv2' }
        },
        {
            id: 'hero_amazon_lv2', name: '亞馬遜女獵人', type: 'Hero', subTypes: ['Archer'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【地城】進入時抽 1 張牌。',
            hero: { level: 2, series: 'Amazon', attack: 2, magicAttack: 0, strength: 4, xpToUpgrade: 6, upgradeToId: 'hero_amazon_lv3' },
            abilities: { onDungeon: 'draw_1' }
        },
        {
            id: 'hero_amazon_lv3', name: '亞馬遜女王', type: 'Hero', subTypes: ['Archer'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【地城】進入時抽 2 張牌；戰勝得 1 XP。',
            hero: { level: 3, series: 'Amazon', attack: 3, magicAttack: 0, strength: 5, xpToUpgrade: 0 },
            abilities: { onDungeon: 'draw_2', onVictory: 'gain_1xp' }
        },
        {
            id: 'hero_elf_lv1', name: '精靈術士', type: 'Hero', subTypes: ['Wizard'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '操縱自然魔力的精靈',
            hero: { level: 1, series: 'Elf', attack: 0, magicAttack: 1, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_elf_lv2' }
        },
        {
            id: 'hero_elf_lv2', name: '精靈巫師', type: 'Hero', subTypes: ['Wizard'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【地城】進入時抽 1 張牌。',
            hero: { level: 2, series: 'Elf', attack: 0, magicAttack: 2, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_elf_lv3' },
            abilities: { onDungeon: 'draw_1' }
        },
        {
            id: 'hero_dwarf_lv1', name: '矮人守護者', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【能力】若有裝備，額外 Attack+1',
            hero: { level: 1, series: 'Dwarf', attack: 2, magicAttack: 0, strength: 5, xpToUpgrade: 4 }
        },
        {
            id: 'hero_loric_lv1', name: '羅域盜賊', type: 'Hero', subTypes: ['Thief'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '擅長在陰影中襲取的盜賊',
            hero: { level: 1, series: 'Loric', attack: 2, magicAttack: 0, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_loric_lv2' }
        },
        {
            id: 'hero_grail_lv1', name: '聖杯探求者', type: 'Hero', subTypes: ['Cleric'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【村莊】摧毀一張疾病卡。',
            hero: { level: 1, series: 'Chail', attack: 0, magicAttack: 1, strength: 3, xpToUpgrade: 4 },
            abilities: { onVillage: 'destroy_disease' }
        }
    ],

    // --- 怪物群 (v3.11 重組：每族群 10 張卡，比例 4:3:3) ---
    monsters: [
        // --- 群落 1: Vermin (毒蟲) ---
        { id: 'mon_rat', name: '腐化老鼠', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 1, hp: 2, xpGain: 1, breachDamage: 1 }, desc: '【進場】獲得 1 張疾病卡', abilities: { onBreach: 'gain_disease' }, count: 4 },
        { id: 'mon_centipede', name: '巨型蜈蚣', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 2, hp: 5, xpGain: 1, breachDamage: 2 }, desc: '【進場】隨機棄 1 張手牌', abilities: { onBreach: 'discard_1' }, count: 3 },
        { id: 'mon_spider', name: '變異蜘蛛', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 3, hp: 7, xpGain: 2, breachDamage: 3 }, desc: '【持續】所有英雄力量 -1', abilities: { aura: 'str_minus_1' }, count: 3 },

        // --- 群落 2: Undead (不死者) ---
        { id: 'mon_ghost', name: '幽鬼', type: 'Monster', subTypes: ['Undead'], monster: { tier: 1, hp: 2, xpGain: 1, breachDamage: 1 }, desc: '【戰鬥】物理攻擊無效', abilities: { battle: 'phys_immune' }, count: 4 },
        { id: 'mon_skeleton', name: '骷髏戰士', type: 'Monster', subTypes: ['Undead'], monster: { tier: 2, hp: 6, xpGain: 2, breachDamage: 2 }, desc: '嘎吱作響的骸骨', count: 3 },
        { id: 'mon_wraith', name: '死靈', type: 'Monster', subTypes: ['Undead'], monster: { tier: 3, hp: 9, xpGain: 3, breachDamage: 3 }, desc: '【進場】棄 1 張能量或裝備卡', abilities: { onBreach: 'discard_magic_or_item' }, count: 3 },

        // --- 群落 3: Darkness (黑暗軍團) ---
        { id: 'mon_shadow', name: '影魔', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 1, hp: 3, xpGain: 1, breachDamage: 1 }, desc: '潛伏於陰影中的威脅', count: 4 },
        { id: 'mon_nightmare_knight', name: '夢魘騎士', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 2, hp: 8, xpGain: 3, breachDamage: 3 }, desc: '【持續】地城照明需求 +1 (最高累計 1)', abilities: { aura: 'light_req_plus_1' }, count: 3 },
        { id: 'mon_harbinger', name: '末日使者', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 3, hp: 12, xpGain: 5, breachDamage: 4 }, desc: '【持續】所有英雄戰力 -1', abilities: { aura: 'atk_minus_1' }, count: 3 },

        // --- 群落 4: Ancient (遠古遺蹟) ---
        { id: 'mon_slime', name: '粘液怪', type: 'Monster', subTypes: ['Ancient', 'Mire'], monster: { tier: 1, hp: 3, xpGain: 1, breachDamage: 1 }, desc: '難以捉摸的液狀生物', count: 4 },
        { id: 'mon_young_dragon', name: '幼龍', type: 'Monster', subTypes: ['Ancient', 'Dragon'], monster: { tier: 2, hp: 7, xpGain: 3, breachDamage: 3 }, desc: '年幼但具備威脅的巨龍', count: 3 },
        { id: 'mon_black_dragon', name: '大黑龍', type: 'Monster', subTypes: ['Ancient', 'Dragon'], monster: { tier: 3, hp: 15, xpGain: 6, breachDamage: 5 }, desc: '【戰鬥】僅魔法攻擊有效', abilities: { battle: 'magic_only' }, count: 3 }
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
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '【地城】增加 1 點照明，對目標造成 2 點傷害（計算照明懲罰）',
            equipment: { attack: 0, magicAttack: 2, weight: 0 }
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
