import fs from 'fs';
import path from 'path';

// --- Configuration ---
const SHEET_ID = '1ThbZrssjkdZHHY__mxu_pakMSpXZC431ePoZUVjvDw4';
const GIDS = {
    heroes: '0',
    monsters: '2112158519',
    items: '1755505430'
};

const DEST_DIR = 'src/data';
const FILES = {
    heroes: 'heroes.js',
    monsters: 'monsters.js',
    items: 'items.js'
};

// --- Schema Definitions (for type conversion) ---
const FIELD_TYPES = {
    // Common
    cost: 'number', vp: 'number', goldValue: 'number', light: 'number', count: 'number',
    // Hero
    Hero_Level: 'number', Hero_STR: 'number', Hero_MagATK: 'number', Hero_XP_Cost: 'number',
    // Monster
    Mon_Tier: 'number', Mon_HP: 'number', Mon_XP: 'number', Mon_Breach: 'number',
    // Equipment
    Equip_ATK: 'number', Equip_MagATK: 'number', Equip_Weight: 'number'
};

// --- Helper Functions ---

async function fetchCSV(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    console.log(`Fetching from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    return await response.text();
}

function parseCSV(csvContent) {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle quoted strings (simple regex match)
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        // Note: The simple regex might miss empty columns between commas if not careful, 
        // but Google Sheets export usually handles this reasonably well. 
        // For robustness without a library, we'll split by comma but respect quotes is harder.
        // Let's use a slightly more robust split approach or just basic split if quotes aren't heavy.
        // The previous regex was: /(".*?"|[^",]+)(?=\s*,|\s*$)/g

        // Better manual parser to handle "a,b", c
        let currentRow = [];
        let inQuote = false;
        let currentCell = '';
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        currentRow.push(currentCell.trim());

        const obj = {};
        headers.forEach((header, index) => {
            let value = currentRow[index];
            if (value) {
                // Remove wrapping quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1).replace(/""/g, '"');
                }
            } else {
                value = '';
            }
            obj[header] = value;
        });
        data.push(obj);
    }
    return data;
}

function convertValue(key, value) {
    if (FIELD_TYPES[key] === 'number') {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }
    if (value === 'null') return null;
    return value;
}

function mapToHero(row) {
    const hero = {
        id: row.ID,
        name: row.Name,
        type: 'Hero',
        subTypes: row.SubTypes ? row.SubTypes.split(',').map(s => s.trim()) : [],
        cost: convertValue('cost', row.Cost),
        vp: convertValue('vp', row.VP),
        goldValue: convertValue('goldValue', row.Gold),
        light: convertValue('light', row.Light),
        desc: row.Desc,
        hero: {
            level: convertValue('Hero_Level', row.Hero_Level),
            series: row.Hero_Series,
            magicAttack: convertValue('Hero_MagATK', row.Hero_MagATK),
            strength: convertValue('Hero_STR', row.Hero_STR),
            xpToUpgrade: convertValue('Hero_XP_Cost', row.Hero_XP_Cost),
            upgradeToId: row.Hero_Upgrade_ID === 'null' || !row.Hero_Upgrade_ID ? null : row.Hero_Upgrade_ID
        },
        abilities: {}
    };

    // Abilities
    if (row.Ability_Text) hero.abilities.abilities_desc = row.Ability_Text;
    if (row.Ability_Key_Battle) hero.abilities.onBattle = row.Ability_Key_Battle;
    if (row.Ability_Key_Victory) hero.abilities.onVictory = row.Ability_Key_Victory;
    if (row.Ability_Key_Village) hero.abilities.onVillage = row.Ability_Key_Village;

    if (Object.keys(hero.abilities).length === 0) delete hero.abilities; // Normalized: keep if not empty, or use null? Schema says null usually but code uses check. Let's delete to be clean.

    return hero;
}

function mapToMonster(row) {
    const monster = {
        id: row.ID,
        name: row.Name,
        type: 'Monster',
        subTypes: row.SubTypes ? row.SubTypes.split(',').map(s => s.trim()) : [],
        cost: convertValue('cost', 0), // Default
        vp: convertValue('vp', 0),
        goldValue: convertValue('goldValue', 0),
        light: convertValue('light', 0),
        monster: {
            tier: convertValue('Mon_Tier', row.Mon_Tier),
            hp: convertValue('Mon_HP', row.Mon_HP),
            xpGain: convertValue('Mon_XP', row.Mon_XP),
            breachDamage: convertValue('Mon_Breach', row.Mon_Breach)
        },
        desc: row.Desc,
        count: convertValue('count', row.Count),
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
        subTypes: row.SubTypes ? row.SubTypes.split(',').map(s => s.trim()) : [],
        cost: convertValue('cost', row.Cost),
        vp: convertValue('vp', row.VP),
        goldValue: convertValue('goldValue', row.Gold),
        light: convertValue('light', row.Light),
        desc: row.Desc,
        abilities: {}
    };

    // Equipment
    if (row.Equip_ATK || row.Equip_MagATK || row.Equip_Weight) {
        item.equipment = {
            attack: convertValue('Equip_ATK', row.Equip_ATK),
            magicAttack: convertValue('Equip_MagATK', row.Equip_MagATK),
            weight: convertValue('Equip_Weight', row.Equip_Weight)
        };
    }

    if (row.Ability_Text) item.abilities.abilities_desc = row.Ability_Text;
    if (row.Ability_Key_Battle) item.abilities.onBattle = row.Ability_Key_Battle;
    if (row.Ability_Key_Village) item.abilities.onVillage = row.Ability_Key_Village;

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

        // Separate Items and Special
        const allItems = itemsRaw.map(mapToItem);
        const regularItems = allItems.filter(i => i.type !== 'Special');
        const specialItems = allItems.filter(i => i.type === 'Special');

        let itemContent = `export const ITEMS_DATA = ${JSON.stringify(regularItems, null, 4)};\n\n`;
        itemContent += `export const SPECIAL_DATA = ${JSON.stringify(specialItems, null, 4)};\n`;

        fs.writeFileSync(path.join(DEST_DIR, FILES.items), itemContent);
        console.log(`✅ Updated ${FILES.items} (${regularItems.length} Items, ${specialItems.length} Special)`);
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
    console.log('Usage: node tools/csv_manager.mjs sync');
}
