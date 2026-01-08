import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Correct path resolution
import { HEROES_DATA } from '../../src/data/heroes.js';
import { MONSTERS_DATA } from '../../src/data/monsters.js';
import { ITEMS_DATA, SPECIAL_DATA } from '../../src/data/items.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORT_DIR = path.join(__dirname, '../../_DEV_CONFIG/exports');

if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function toCSV(data, headers, rowMapper) {
    const headerRow = headers.join(',');
    const rows = data.map(item => {
        const rowData = rowMapper(item);
        return rowData.map(val => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',');
    });
    return [headerRow, ...rows].join('\n');
}

// 1. Heroes
// Heroes do not have Count field
const heroHeaders = [
    'ID', 'Name', 'Type', 'SubTypes', 'Cost', 'VP', 'Gold', 'Light',
    'STR', 'MagATK', 'Desc',
    'Hero_Series', 'Hero_Level', 'Ability_Text',
    'Ability_Key_Battle', 'Ability_Key_Victory', 'Ability_Key_Village',
    'Upgrade_Cost', 'Next_ID'
];
const heroMapper = (d) => [
    d.id, d.name, d.type, d.subTypes ? d.subTypes.join(';') : '', d.cost, d.vp, d.goldValue || 0, d.light || 0,
    d.hero.strength, d.hero.magicAttack || 0, d.desc,
    d.hero.series, d.hero.level, d.abilities?.abilities_desc || '',
    d.abilities?.onBattle || '', d.abilities?.onVictory || '', d.abilities?.onVillage || '',
    d.hero.xpToUpgrade, d.hero.upgradeToId || ''
];
const heroesCSV = toCSV(HEROES_DATA, heroHeaders, heroMapper);
fs.writeFileSync(path.join(EXPORT_DIR, 'heroes.csv'), heroesCSV);
console.log('Exported heroes.csv');

// 2. Monsters
const monsterHeaders = [
    'ID', 'Name', 'Type', 'SubTypes', 'Cost', 'VP', 'Gold', 'Light',
    'Tier', 'HP', 'XP', 'Breach_Dmg', 'Desc',
    'Ability_Text', 'Ability_Key_Breach', 'Ability_Key_Aura', 'Ability_Key_Battle', 'Count'
];
const monsterMapper = (d) => [
    d.id, d.name, d.type, d.subTypes ? d.subTypes.join(';') : '', 0, 0, 0, 0, // Cost, VP, Gold, Light defaults for Monsters
    d.monster.tier, d.monster.hp, d.monster.xpGain, d.monster.breachDamage, d.desc,
    d.abilities?.abilities_desc || '', d.abilities?.onBreach || '', d.abilities?.aura || '', d.abilities?.battle || '',
    d.monster.count || 0
];
const monstersCSV = toCSV(MONSTERS_DATA, monsterHeaders, monsterMapper);
fs.writeFileSync(path.join(EXPORT_DIR, 'monsters.csv'), monstersCSV);
console.log('Exported monsters.csv');

// 3. Items (Merged with SPECIAL_DATA)
// Removed Count
const itemHeaders = [
    'ID', 'Name', 'Type', 'SubTypes', 'Cost', 'VP', 'Gold', 'Light',
    'Equip_ATK', 'Equip_MagATK', 'Equip_Weight', 'Desc',
    'Ability_Text', 'Ability_Key_Battle', 'Ability_Key_Village', 'Ability_Key_Victory', 'Ability_Key_Dungeon'
];
const itemMapper = (d) => [
    d.id, d.name, d.type, d.subTypes ? d.subTypes.join(';') : '', d.cost, d.vp || 0, d.goldValue, d.light,
    d.equipment?.attack || 0, d.equipment?.magicAttack || 0, d.equipment?.weight || 0, d.desc,
    d.abilities?.abilities_desc || '', d.abilities?.onBattle || '', d.abilities?.onVillage || '',
    d.abilities?.onVictory || '', d.abilities?.onDungeon || ''
];
// Combine regular items and special data
const allItems = [...ITEMS_DATA, ...(SPECIAL_DATA || [])];
const itemsCSV = toCSV(allItems, itemHeaders, itemMapper);
fs.writeFileSync(path.join(EXPORT_DIR, 'items.csv'), itemsCSV);
console.log('Exported items.csv (including Special Data)');
