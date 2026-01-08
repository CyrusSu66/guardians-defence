import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEST_DIR = path.join(__dirname, '../../src/data');

/**
 * Configuration is loaded from sync_config.local.js (gitignored)
 * If you don't have this file, copy sync_config.template.js and fill in your values.
 * 
 * Example format:
 * const GIDS = { heroes: '0', monsters: '...', items: '...' };
 * const DOC_ID = 'YOUR_GOOGLE_SHEET_DOC_ID';
 */
import { SYNC_CONFIG } from './sync_config.local.js';

const GIDS = SYNC_CONFIG.GIDS;
const DOC_ID = SYNC_CONFIG.DOC_ID;

const FILES = {
    heroes: 'heroes.js',
    monsters: 'monsters.js',
    items: 'items.js'
};

// --- Helpers ---

async function fetchCSV(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${gid}`;
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    return await res.text();
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) { // Skip header
        let rowLine = lines[i];
        if (!rowLine.trim()) continue; // Skip empty lines

        const row = {};
        const values = [];
        let currentVal = '';
        let inQuote = false;

        for (let j = 0; j < rowLine.length; j++) {
            const char = rowLine[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim());

        // Map to headers
        headers.forEach((h, index) => {
            let val = values[index];
            if (val && val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
            }
            row[h] = val;
        });

        if (row.ID) {
            result.push(row);
        }
    }
    return result;
}

function convertValue(key, val) {
    if (val === undefined || val === null || val === '') return 0;
    const num = Number(val);
    return isNaN(num) ? val : num;
}

// --- Mappers ---

function mapToHero(row) {
    const hero = {
        id: row.ID,
        name: row.Name,
        type: row.Type || 'Hero',
        subTypes: row.SubTypes ? row.SubTypes.split(';').map(s => s.trim()) : [],
        cost: convertValue('cost', row.Cost),
        vp: convertValue('vp', row.VP),
        goldValue: convertValue('goldValue', row.Gold),
        light: convertValue('light', row.Light),
        desc: row.Desc,
        // No count for Heroes
        hero: {
            level: convertValue('level', row.Hero_Level),
            series: row.Hero_Series,
            magicAttack: convertValue('magicAttack', row.MagATK),
            strength: convertValue('strength', row.STR),
            xpToUpgrade: convertValue('xpToUpgrade', row.Upgrade_Cost),
            upgradeToId: (row.Next_ID && row.Next_ID !== '0') ? row.Next_ID : null
        },
        abilities: {}
    };

    if (row.Ability_Text) hero.abilities.abilities_desc = row.Ability_Text;
    if (row.Ability_Key_Battle) hero.abilities.onBattle = row.Ability_Key_Battle;
    if (row.Ability_Key_Victory) hero.abilities.onVictory = row.Ability_Key_Victory;
    if (row.Ability_Key_Village) hero.abilities.onVillage = row.Ability_Key_Village;

    if (Object.keys(hero.abilities).length === 0) delete hero.abilities;

    return hero;
}

function mapToMonster(row) {
    const monster = {
        id: row.ID,
        name: row.Name,
        type: row.Type || 'Monster',
        subTypes: row.SubTypes ? row.SubTypes.split(';').map(s => s.trim()) : [],
        cost: convertValue('cost', row.Cost),
        vp: convertValue('vp', row.VP),
        goldValue: convertValue('goldValue', row.Gold),
        light: convertValue('light', row.Light),
        monster: {
            tier: convertValue('Tier', row.Tier),
            hp: convertValue('HP', row.HP),
            xpGain: convertValue('XP', row.XP),
            breachDamage: convertValue('Breach_Dmg', row.Breach_Dmg),
            count: convertValue('count', row.Count)
        },
        desc: row.Desc,
        abilities: {}
    };

    if (row.Ability_Text) monster.abilities.abilities_desc = row.Ability_Text;
    if (row.Ability_Key_Breach) monster.abilities.onBreach = row.Ability_Key_Breach;
    if (row.Ability_Key_Aura) monster.abilities.aura = row.Ability_Key_Aura;
    if (row.Ability_Key_Battle) monster.abilities.battle = row.Ability_Key_Battle;

    if (Object.keys(monster.abilities).length === 0) delete monster.abilities;

    return monster;
}

function mapToItem(row) {
    const item = {
        id: row.ID,
        name: row.Name,
        type: row.Type,
        subTypes: row.SubTypes ? row.SubTypes.split(';').map(s => s.trim()) : [],
        cost: convertValue('cost', row.Cost),
        vp: convertValue('vp', row.VP),
        goldValue: convertValue('goldValue', row.Gold),
        light: convertValue('light', row.Light),
        desc: row.Desc,
        // No generic count for Items
        abilities: {}
    };

    // Equipment
    if (Number(row.Equip_ATK) || Number(row.Equip_MagATK) || Number(row.Equip_Weight)) {
        item.equipment = {
            attack: convertValue('Equip_ATK', row.Equip_ATK),
            magicAttack: convertValue('Equip_MagATK', row.Equip_MagATK),
            weight: convertValue('Equip_Weight', row.Equip_Weight)
        };
    }

    if (row.Ability_Text) item.abilities.abilities_desc = row.Ability_Text;
    if (row.Ability_Key_Battle) item.abilities.onBattle = row.Ability_Key_Battle;
    if (row.Ability_Key_Village) item.abilities.onVillage = row.Ability_Key_Village;
    if (row.Ability_Key_Victory) item.abilities.onVictory = row.Ability_Key_Victory;
    if (row.Ability_Key_Dungeon) item.abilities.onDungeon = row.Ability_Key_Dungeon;

    if (Object.keys(item.abilities).length === 0) delete item.abilities;

    return item;
}

// --- Main Sync Function ---

async function syncData() {
    console.log('🔄 Starting Data Sync...');

    // 1. Heroes
    try {
        const heroesCSV = await fetchCSV(GIDS.heroes);
        const heroesRaw = parseCSV(heroesCSV);
        const heroesData = heroesRaw.map(mapToHero);
        const heroContent = `export const HEROES_DATA = ${JSON.stringify(heroesData, null, 4)};\n`;
        fs.writeFileSync(path.join(DEST_DIR, FILES.heroes), heroContent);
        console.log(`✅ Updated ${FILES.heroes} (${heroesData.length} records)`);
    } catch (e) {
        console.error('❌ Error syncing Heroes:', e);
    }

    // 2. Monsters
    try {
        const monstersCSV = await fetchCSV(GIDS.monsters);
        const monstersRaw = parseCSV(monstersCSV);
        const monstersData = monstersRaw.map(mapToMonster);
        const monContent = `export const MONSTERS_DATA = ${JSON.stringify(monstersData, null, 4)};\n`;
        fs.writeFileSync(path.join(DEST_DIR, FILES.monsters), monContent);
        console.log(`✅ Updated ${FILES.monsters} (${monstersData.length} records)`);
    } catch (e) {
        console.error('❌ Error syncing Monsters:', e);
    }

    // 3. Items (and Special)
    try {
        const itemsCSV = await fetchCSV(GIDS.items);
        const itemsRaw = parseCSV(itemsCSV);

        const allItems = itemsRaw.map(mapToItem);

        // Identify Special Data by ID convention 'spec_' or specific Types
        const specialItems = allItems.filter(i => i.id.startsWith('spec_') || i.type === 'Debuff' || i.type === 'Status');
        const standardItems = allItems.filter(i => !specialItems.includes(i));

        let itemContent = `export const ITEMS_DATA = ${JSON.stringify(standardItems, null, 4)};\n\n`;
        itemContent += `export const SPECIAL_DATA = ${JSON.stringify(specialItems, null, 4)};\n`;

        fs.writeFileSync(path.join(DEST_DIR, FILES.items), itemContent);
        console.log(`✅ Updated ${FILES.items} (${standardItems.length} Items, ${specialItems.length} Special)`);
    } catch (e) {
        console.error('❌ Error syncing Items:', e);
    }

    console.log('🎉 Sync Complete!');
}

// --- Execution ---

const args = process.argv.slice(2);
if (args[0] === 'sync') {
    syncData();
} else {
    console.log('Usage: node tools/data_sync/import_sheet_to_js.mjs sync');
}
