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
const marketAttackItems = ITEMS_DATA.filter(c =>
    (c.type === 'Weapon' || c.type === 'Spell') && c.id !== 'basic_spear'
);

const marketVillageItems = ITEMS_DATA.filter(c =>
    (c.type === 'Item' || c.type === 'LightItem' || c.type === 'Food') &&
    c.id !== 'basic_torch' && c.id !== 'basic_rations' && c.id !== 'basic_spear'
);

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
    villageItems: marketVillageItems,

    // --- 特殊 ---
    special: SPECIAL_DATA
};
