/**
 * 《守護者防線：雷霆遺產》資料庫 (v3.27 Modularized)
 * Refactored to import from sub-modules for easier management.
 */

import { HEROES_DATA } from './data/heroes.js';
import { MONSTERS_DATA } from './data/monsters.js';
import { ITEMS_DATA, SPECIAL_DATA } from './data/items.js';

export const GameState = {
    IDLE: 'IDLE',
    DRAW: 'DRAW',
    VILLAGE: 'VILLAGE',
    COMBAT: 'COMBAT',
    MONSTER_ADVANCE: 'MONSTER_ADVANCE',
    END_TURN: 'END_TURN',
    GAME_OVER: 'GAME_OVER'
};

// Reconstruct CARDPOOL for GameEngine compatibility
// Basic Deck: 6 Regular Army + 2 Torch + 2 Spear + 2 Rations
// We need to pick them from their respective lists based on ID

function find(list, id) {
    return list.find(c => c.id === id);
}

const regularArmy = find(HEROES_DATA, 'basic_regular_army');
const torch = find(ITEMS_DATA, 'basic_torch');
const spear = find(ITEMS_DATA, 'basic_spear');
const rations = find(ITEMS_DATA, 'basic_rations');

// Separate Market Lists
// Heroes: All except basic_regular_army
const marketHeroes = HEROES_DATA.filter(c => c.id !== 'basic_regular_army');

// Items: All except basics
// Items: All except basics
// 1. Attack: Weapon, MagicBook
const marketAttackItems = ITEMS_DATA.filter(c =>
    (c.type === 'Weapon' || c.type === 'MagicBook') && c.id !== 'basic_spear'
);

// 2. Dungeon Support: Food, LightItem
const marketDungeonSupport = ITEMS_DATA.filter(c =>
    (c.type === 'Food' || c.type === 'LightItem') &&
    c.id !== 'basic_torch' && c.id !== 'basic_rations'
);

// 3. Other Support: Item, Spell, NPC, Wonder, Device, MagicTool
const marketOtherSupport = ITEMS_DATA.filter(c =>
    ['Item', 'Spell', 'NPC', 'Wonder', 'Device', 'MagicTool', 'Debuff'].includes(c.type) &&
    c.id !== 'basic_torch' && c.id !== 'basic_rations' && c.id !== 'basic_spear'
);

console.log('[Data DEBUG] Market Pools Init:', marketAttackItems.length, marketDungeonSupport.length, marketOtherSupport.length);

export const CARDPOOL = {
    // --- 基礎卡牌 ---
    basic: [
        regularArmy,
        torch,
        spear,
        rations
    ],

    // --- 英雄系列 ---
    heroes: marketHeroes,

    // --- 怪物群 ---
    monsters: MONSTERS_DATA,

    // --- 物品與裝備 ---
    attackItems: marketAttackItems,
    dungeonSupport: marketDungeonSupport,
    otherSupport: marketOtherSupport,

    // --- 特殊 ---
    special: SPECIAL_DATA
};

export function getCardById(id) {
    const all = [
        ...HEROES_DATA,
        ...MONSTERS_DATA,
        ...ITEMS_DATA,
        ...SPECIAL_DATA
    ];
    return all.find(c => c.id === id);
}
