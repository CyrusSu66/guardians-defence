/**
 * 《守護者防線》資料庫 (Data Pool)
 * 包含所有卡牌、怪物與配方的原始數據。
 */

export const CARDPOOL = {
    heroes: [
        { id: 'hero_warrior_lv1', name: '戰士(Lv1)', class: 'Warrior', attack: 2, range: 1, carry: 4, xpToUpgrade: 3, upgradeToId: 'hero_warrior_lv2', desc: '近戰硬打型' },
        { id: 'hero_warrior_lv2', name: '戰士(Lv2)', class: 'Warrior', attack: 3, range: 1, carry: 5, xpToUpgrade: 5, upgradeToId: 'hero_warrior_lv3', desc: '更強的近戰戰士' },
        { id: 'hero_warrior_lv3', name: '戰士(Lv3)', class: 'Warrior', attack: 4, range: 1, carry: 6, desc: '終極近戰戰士' },
        { id: 'hero_ranger_lv1', name: '射手(Lv1)', class: 'Ranger', attack: 1, range: 3, carry: 3, xpToUpgrade: 3, upgradeToId: 'hero_ranger_lv2', desc: '遠程精準射手' },
        { id: 'hero_ranger_lv2', name: '射手(Lv2)', class: 'Ranger', attack: 2, range: 4, carry: 3, xpToUpgrade: 5, upgradeToId: 'hero_ranger_lv3', desc: '更遠的射程' },
        { id: 'hero_ranger_lv3', name: '射手(Lv3)', class: 'Ranger', attack: 3, range: 5, carry: 3, desc: '終極遠程狙擊' },
        { id: 'hero_mage_lv1', name: '法師(Lv1)', class: 'Mage', attack: 1, range: 4, carry: 2, xpToUpgrade: 3, upgradeToId: 'hero_mage_lv2', desc: '魔法遠距法師' },
        { id: 'hero_mage_lv2', name: '法師(Lv2)', class: 'Mage', attack: 2, range: 4, carry: 2, xpToUpgrade: 5, upgradeToId: 'hero_mage_lv3', desc: '更強的魔法威力' },
        { id: 'hero_mage_lv3', name: '法師(Lv3)', class: 'Mage', attack: 3, range: 5, carry: 2, desc: '終極魔法大師' },
        { id: 'hero_rogue_lv1', name: '盜賊(Lv1)', class: 'Rogue', attack: 1, range: 2, carry: 3, passiveGold: 1, xpToUpgrade: 3, upgradeToId: 'hero_rogue_lv2', desc: '金流型盜賊' },
        { id: 'hero_rogue_lv2', name: '盜賊(Lv2)', class: 'Rogue', attack: 2, range: 2, carry: 3, passiveGold: 2, xpToUpgrade: 5, upgradeToId: 'hero_rogue_lv3', desc: '更強的金流掌控' },
        { id: 'hero_rogue_lv3', name: '盜賊(Lv3)', class: 'Rogue', attack: 2, range: 3, carry: 3, passiveGold: 3, desc: '終極金流掌控者' },
        { id: 'hero_magic_sword', name: '魔法戰士', class: 'Warrior', attack: 4, range: 1, carry: 6, desc: '鍛造出的強力戰士' }
    ],
    weapons: [
        { id: 'weapon_iron_sword', name: '鐵劍', attack: 2, range: 1, weight: 3, desc: '堅固的鐵劍' },
        { id: 'weapon_wooden_bow', name: '木弓', attack: 2, range: 3, weight: 2, desc: '輕巧的弓' },
        { id: 'weapon_fire_staff', name: '火焰法杖', attack: 2, range: 4, weight: 1, desc: '炎熱的法杖' },
        { id: 'weapon_dagger', name: '匕首', attack: 1, range: 1, weight: 1, desc: '輕快的匕首' },
        { id: 'weapon_magic_blade', name: '魔法劍', attack: 4, range: 1, weight: 3, desc: '蘊含魔力的利刃' }
    ],
    economy: [
        { id: 'eco_copper_coin', name: '銅幣', coin: 1, desc: '基礎貨幣 +1' },
        { id: 'eco_silver_coin', name: '銀幣', coin: 2, desc: '常見貨幣 +2' },
        { id: 'eco_ruby', name: '紅寶石', coin: 2, desc: '寶石 +2' }
    ],
    spells: [
        { id: 'spell_draw_1', name: '抽牌術', usage: 'village', desc: '【村莊】抽 2 張牌' },
        { id: 'spell_damage', name: '爆裂火焰', usage: 'combat', damage: 3, desc: '【戰鬥】造成 3 傷害' },
        { id: 'spell_big_fire', name: '大火球術', usage: 'combat', damage: 5, desc: '【戰鬥】造成 5 傷害' }
    ],
    items: [
        { id: 'item_heal', name: '治療藥水', usage: 'village', desc: '恢復 3 血' },
        { id: 'item_xp_scroll', name: '經驗捲軸', xp: 2, desc: '+2 XP' }
    ],
    monsters: [
        { id: 'mon_goblin', name: '哥布林', hp: 3, maxHp: 3, damage: 1, xp: 1, score: 2, crystal: 1, tier: 1 },
        { id: 'mon_skeleton', name: '骷髏兵', hp: 2, maxHp: 2, damage: 1, xp: 1, score: 2, crystal: 1, tier: 1 },
        { id: 'mon_zombie', name: '殭屍', hp: 4, maxHp: 4, damage: 2, xp: 2, score: 3, crystal: 1, tier: 1 },
        { id: 'mon_wolf', name: '野狼', hp: 3, maxHp: 3, damage: 1, xp: 2, score: 2, crystal: 1, tier: 1 },
        { id: 'mon_spider', name: '巨大蜘蛛', hp: 5, maxHp: 5, damage: 2, xp: 2, score: 3, crystal: 1, tier: 1 },
        { id: 'mon_orc', name: '獸人戰士', hp: 6, maxHp: 6, damage: 2, xp: 3, score: 5, crystal: 1, tier: 2 },
        { id: 'mon_dragon', name: '幼龍', hp: 12, maxHp: 12, damage: 5, xp: 8, score: 15, crystal: 2, tier: 3 }
    ]
};

export const MARKET_CARDS = {
    early: [
        { id: 'hero_warrior_lv1', name: '戰士(Lv1)', cost: 3 },
        { id: 'hero_ranger_lv1', name: '射手(Lv1)', cost: 3 },
        { id: 'hero_mage_lv1', name: '法師(Lv1)', cost: 3 },
        { id: 'hero_rogue_lv1', name: '盜賊(Lv1)', cost: 3 },
        { id: 'weapon_iron_sword', name: '鐵劍', cost: 4 },
        { id: 'weapon_wooden_bow', name: '木弓', cost: 4 },
        { id: 'eco_silver_coin', name: '銀幣', cost: 2 },
        { id: 'eco_ruby', name: '紅寶石', cost: 3 },
        { id: 'spell_draw_1', name: '抽牌術', cost: 2 },
        { id: 'spell_damage', name: '爆裂火焰', cost: 3 },
        { id: 'item_heal', name: '治療藥水', cost: 3 }
    ]
};

export const CRAFTING_RECIPES = [
    { id: 'weapon_magic_blade', name: '魔法劍', costCoin: 5, costCrystal: 1, desc: '需 5 Coin + 1 結晶' },
    { id: 'spell_big_fire', name: '大火球術', costCoin: 3, costCrystal: 1, desc: '需 3 Coin + 1 結晶' }
];

export const GameState = {
    IDLE: 'IDLE',
    DRAW: 'DRAW',
    VILLAGE: 'VILLAGE',
    COMBAT: 'COMBAT',
    MONSTER_ADVANCE: 'MONSTER_ADVANCE',
    END_TURN: 'END_TURN',
    GAME_OVER: 'GAME_OVER'
};
