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
            desc: '【地下城】若裝備長矛，攻擊力+1',
            hero: { level: 0, series: 'Regular', magicAttack: 0, strength: 1, xpToUpgrade: 1 },
            abilities: { onBattle: 'synergy_spear' }
        },
        {
            id: 'basic_torch', name: '火把', type: 'LightItem', subTypes: ['Light'],
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
            desc: '【地下城】額外 STR+1 (同時提升負重與傷害)',
            abilities: { onBattle: 'boost_str_1' }
        }
    ],

    // --- 英雄系列 ---
    heroes: [
        {
            id: 'hero_sevin_lv1', name: '塞維恩戰術家', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【地下城】手牌中有其他英雄時，攻擊力+1',
            hero: { level: 1, series: 'Sevin', magicAttack: 0, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_sevin_lv2' },
            abilities: { onBattle: 'synergy_hero_group' }
        },
        {
            id: 'hero_sevin_lv2', name: '塞維恩指揮官', type: 'Hero', subTypes: ['Fighter'],
            cost: 7, vp: 2, goldValue: 0, light: 1,
            desc: '【地下城】手牌中有其他英雄時，攻擊力+3',
            hero: { level: 2, series: 'Sevin', magicAttack: 0, strength: 4, xpToUpgrade: 6, upgradeToId: 'hero_sevin_lv3' },
            abilities: { onBattle: 'synergy_hero_group_2' }
        },
        {
            id: 'hero_sevin_lv3', name: '塞維恩君主', type: 'Hero', subTypes: ['Fighter'],
            cost: 10, vp: 3, goldValue: 0, light: 2,
            desc: '【地下城】手牌中有其他英雄時，攻擊力+5',
            hero: { level: 3, series: 'Sevin', magicAttack: 0, strength: 5, xpToUpgrade: 0 },
            abilities: { onBattle: 'synergy_hero_group_3' }
        },
        {
            id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', type: 'Hero', subTypes: ['Fighter', 'Ranger'],
            cost: 5, vp: 1, goldValue: 0, light: 0,
            desc: '【地下城】若裝備獵弓，攻擊力+1；戰勝得 1 XP。',
            hero: { level: 1, series: 'Amazon', magicAttack: 0, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_amazon_lv2' },
            abilities: { onBattle: 'synergy_bow', onVictory: 'gain_1xp' }
        },
        {
            id: 'hero_amazon_lv2', name: '亞馬遜獵手', type: 'Hero', subTypes: ['Fighter', 'Ranger'],
            cost: 8, vp: 2, goldValue: 1, light: 0,
            desc: '【地下城】若裝備獵弓，攻擊力+2；戰勝得 1 XP。',
            hero: { level: 2, series: 'Amazon', magicAttack: 0, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_amazon_lv3' },
            abilities: { onBattle: 'synergy_bow_2', onVictory: 'gain_1xp' }
        },
        {
            id: 'hero_amazon_lv3', name: '亞馬遜女王', type: 'Hero', subTypes: ['Archer'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【地下城】若裝備獵弓，攻擊力+3；戰勝得 1 XP。',
            hero: { level: 3, series: 'Amazon', magicAttack: 0, strength: 4, xpToUpgrade: 0 },
            abilities: { onBattle: 'synergy_bow_3', onVictory: 'gain_1xp' }
        },
        {
            id: 'hero_elf_lv1', name: '精靈術士', type: 'Hero', subTypes: ['Wizard'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '操縱自然魔力的精靈',
            hero: { level: 1, series: 'Elf', magicAttack: 1, strength: 1, xpToUpgrade: 4, upgradeToId: 'hero_elf_lv2' }
        },
        {
            id: 'hero_elf_lv2', name: '精靈巫師', type: 'Hero', subTypes: ['Wizard'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【地城】進入時抽 1 張牌。',
            hero: { level: 2, series: 'Elf', magicAttack: 2, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_elf_lv3' },
            abilities: { onDungeon: 'draw_1' }
        },
        {
            id: 'hero_elf_lv3', name: '精靈大魔導', type: 'Hero', subTypes: ['Wizard'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【地城】進入時抽 2 張牌；戰勝得 1 XP。',
            hero: { level: 3, series: 'Elf', magicAttack: 3, strength: 3, xpToUpgrade: 0 },
            abilities: { onDungeon: 'draw_2', onVictory: 'gain_1xp' }
        },
        {
            id: 'hero_dwarf_lv1', name: '矮人守護者', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【地下城】若有裝備武器，攻擊力+1',
            hero: { level: 1, series: 'Dwarf', magicAttack: 0, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_dwarf_lv2' },
            abilities: { onBattle: 'dwarf_weapon_bonus' }
        },
        {
            id: 'hero_dwarf_lv2', name: '矮人戰士', type: 'Hero', subTypes: ['Fighter'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【能力】若有裝備，額外 Attack+2',
            hero: { level: 2, series: 'Dwarf', magicAttack: 0, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_dwarf_lv3' },
            abilities: { onBattle: 'dwarf_weapon_bonus_2' }
        },
        {
            id: 'hero_dwarf_lv3', name: '矮人領主', type: 'Hero', subTypes: ['Fighter'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【能力】若有裝備，額外 Attack+3',
            hero: { level: 3, series: 'Dwarf', magicAttack: 0, strength: 4, xpToUpgrade: 0 },
            abilities: { onBattle: 'dwarf_weapon_bonus_3' }
        },

        {
            id: 'hero_loric_lv1', name: '羅域盜賊', type: 'Hero', subTypes: ['Thief'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【地下城】光照不足時，攻擊力+2',
            hero: { level: 1, series: 'Loric', magicAttack: 0, strength: 1, xpToUpgrade: 4, upgradeToId: 'hero_loric_lv2' },
            abilities: { onBattle: 'light_compensation_loric' }
        },
        {
            id: 'hero_loric_lv2', name: '羅域刺客', type: 'Hero', subTypes: ['Thief'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '【地城】光照不足時攻擊力+3',
            hero: { level: 2, series: 'Loric', magicAttack: 0, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_loric_lv3' },
            abilities: { onBattle: 'light_compensation_loric_2' }
        },
        {
            id: 'hero_loric_lv3', name: '羅域暗影大師', type: 'Hero', subTypes: ['Thief'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '【地城】光照不足時攻擊力+4',
            hero: { level: 3, series: 'Loric', magicAttack: 0, strength: 3, xpToUpgrade: 0 },
            abilities: { onBattle: 'light_compensation_loric_3' }
        },

        {
            id: 'hero_grail_lv1', name: '聖杯探求者', type: 'Hero', subTypes: ['Cleric'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '【村莊】摧毀一張疾病卡。',
            hero: { level: 1, series: 'Grail', magicAttack: 1, strength: 1, xpToUpgrade: 4, upgradeToId: 'hero_grail_lv2' },
            abilities: { onVillage: 'destroy_disease' }
        },
        {
            id: 'hero_grail_lv2', name: '聖杯騎士', type: 'Hero', subTypes: ['Cleric'],
            cost: 7, vp: 2, goldValue: 0, light: 1,
            desc: '【村莊】摧毀任意一張卡；修復 1 點魔法護罩',
            hero: { level: 2, series: 'Grail', magicAttack: 2, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_grail_lv3' },
            abilities: { onVillage: 'destroy_any_heal_1' }
        },
        {
            id: 'hero_grail_lv3', name: '聖杯守護者', type: 'Hero', subTypes: ['Cleric'],
            cost: 10, vp: 3, goldValue: 0, light: 2,
            desc: '【村莊】修復 2 點魔法護罩',
            hero: { level: 3, series: 'Grail', magicAttack: 3, strength: 3, xpToUpgrade: 0 },
            abilities: { onVillage: 'heal_2' }
        }
    ],

    // --- 怪物群 (v3.11 重組：每族群 10 張卡，比例 4:3:3) ---
    monsters: [
        // --- 群落 1: Vermin (毒蟲) ---
        { id: 'mon_rat', name: '腐化老鼠', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 1, hp: 1, xpGain: 1, breachDamage: 1 }, desc: '受到黑暗魔力侵蝕的巨大老鼠，成群結隊地啃食村莊的防禦設施。', count: 4 },
        { id: 'mon_centipede', name: '巨型蜈蚣', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 2, hp: 3, xpGain: 1, breachDamage: 2 }, desc: '【進場】隨機棄 1 張手牌。<br>擁有堅硬甲殼的多足掠食者，其毒液能麻痺冒險者的心智。', abilities: { onBreach: 'discard_1' }, count: 3 },
        { id: 'mon_spider', name: '變異蜘蛛', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 3, hp: 6, xpGain: 2, breachDamage: 3 }, desc: '【持續】所有英雄力量 -1', abilities: { aura: 'str_minus_1' }, count: 3 },

        // --- 群落 2: Undead (不死者) ---
        { id: 'mon_ghost', name: '幽鬼', type: 'Monster', subTypes: ['Undead'], monster: { tier: 1, hp: 2, xpGain: 1, breachDamage: 1 }, desc: '徘徊在戰場上的怨靈，一般的物理攻擊難以對其造成傷害。', count: 4 },
        { id: 'mon_skeleton', name: '骷髏戰士', type: 'Monster', subTypes: ['Undead'], monster: { tier: 2, hp: 3, xpGain: 2, breachDamage: 2 }, desc: '被黑魔法喚醒的古代士兵，手持生鏽的鐵劍無情地斬殺生者。', count: 3 },
        { id: 'mon_wraith', name: '死靈', type: 'Monster', subTypes: ['Undead'], monster: { tier: 3, hp: 5, xpGain: 3, breachDamage: 3 }, desc: '【進場】棄 1 張能量或裝備卡。<br>高階的不死生物，其寒冷的氣息能瞬間凍結勇者的裝備。', abilities: { onBreach: 'discard_magic_or_item' }, count: 3 },

        // --- 群落 3: Darkness (黑暗軍團) ---
        { id: 'mon_shadow', name: '影魔', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 1, hp: 1, xpGain: 1, breachDamage: 1 }, desc: '從陰影中誕生的無形殺手，常在光照不足時發動致命突襲。', count: 4 },
        { id: 'mon_nightmare_knight', name: '夢魘騎士', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 2, hp: 4, xpGain: 3, breachDamage: 3 }, desc: '【持續】地城照明需求 +1 (最高累計 1)。<br>騎乘著黑馬的恐怖騎士，他的存在本身就會吞噬周圍的光芒。', abilities: { aura: 'light_req_plus_1' }, count: 3 },
        { id: 'mon_harbinger', name: '末日使者', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 3, hp: 7, xpGain: 5, breachDamage: 4 }, desc: '【持續】所有英雄戰力 -1。<br>毀滅的先驅，他所散發的絕望氣場能削弱最堅強的戰士。', abilities: { aura: 'atk_minus_1' }, count: 3 },

        // --- 群落 4: Ancient (遠古遺蹟) ---
        { id: 'mon_slime', name: '粘液怪', type: 'Monster', subTypes: ['Ancient', 'Mire'], monster: { tier: 1, hp: 1, xpGain: 1, breachDamage: 1 }, desc: '古老遺跡中常見的有機陷阱，雖然弱小但極難徹底消滅。', count: 4 },
        { id: 'mon_young_dragon', name: '幼龍', type: 'Monster', subTypes: ['Ancient', 'Dragon'], monster: { tier: 2, hp: 4, xpGain: 3, breachDamage: 3 }, desc: '雖然尚未成年，但其吐息的威力已足以融化鋼鐵與岩石。', count: 3 },
        { id: 'mon_black_dragon', name: '大黑龍', type: 'Monster', subTypes: ['Ancient', 'Dragon'], monster: { tier: 3, hp: 8, xpGain: 6, breachDamage: 5 }, desc: '【戰鬥】僅魔法攻擊有效。<br>傳說中的災厄化身，其鱗片堅不可摧，唯有強大的魔法才能傷其分毫。', abilities: { battle: 'magic_only' }, count: 3 },

        // --- 群落 5: Goblin (哥布林) (v3.22.14) ---
        { id: 'mon_goblin_grunt', name: '哥布林雜兵', type: 'Monster', subTypes: ['Goblin'], monster: { tier: 1, hp: 2, xpGain: 1, breachDamage: 1 }, desc: '【進場】破壞 1 張手牌。<br>狡猾且貪婪的小型亞人，擅長偷襲與破壞冒險者的補給。', abilities: { onBreach: 'destroy_hand_1' }, count: 4 },
        { id: 'mon_goblin_raider', name: '哥布林突襲者', type: 'Monster', subTypes: ['Goblin'], monster: { tier: 2, hp: 4, xpGain: 2, breachDamage: 2 }, desc: '【進場】破壞 2 張手牌。<br>裝備更精良的哥布林精英，會優先攻擊攜帶物資的隊員。', abilities: { onBreach: 'destroy_hand_2' }, count: 3 },
        { id: 'mon_goblin_king', name: '哥布林王', type: 'Monster', subTypes: ['Goblin'], monster: { tier: 3, hp: 7, xpGain: 4, breachDamage: 3 }, desc: '【進場】破壞 2 張手牌 + 1 隨機物品。<br>統率哥布林大軍的魁梧暴君，其麾下的掠奪行動將更加殘暴。', abilities: { onBreach: 'destroy_hand_2_plus_1' }, count: 3 },

        // --- 群落 6: Mire (泥漿類) (v3.22.14) ---
        { id: 'mon_green_slime', name: '綠色泥糊', type: 'Monster', subTypes: ['Mire'], monster: { tier: 1, hp: 3, xpGain: 1, breachDamage: 2 }, desc: '帶有強烈腐蝕性的酸性軟泥，散發著令人作嘔的惡臭。', count: 4 },
        { id: 'mon_black_slime', name: '黑色史萊姆', type: 'Monster', subTypes: ['Mire'], monster: { tier: 1, hp: 4, xpGain: 1, breachDamage: 2 }, desc: '猶如焦油般黏稠的黑暗物質，能輕易困住大意的冒險者。', count: 3 },
        { id: 'mon_red_gel', name: '紅色凝膠獸', type: 'Monster', subTypes: ['Mire'], monster: { tier: 2, hp: 6, xpGain: 2, breachDamage: 2 }, desc: '【持續】所有英雄攻擊力 -1。<br>外表晶瑩剔透但極度危險，能吸收衝擊力並削弱武器的鋒利度。', abilities: { aura: 'atk_minus_1' }, count: 3 }
    ],


    // --- 物品與裝備 ---
    // v3.22.4: 市集分類重構
    attackItems: [
        {
            id: 'weap_iron_sword', name: '短劍', type: 'Weapon', subTypes: ['Sharp'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '銳利的近身武器',
            equipment: { attack: 1, magicAttack: 0, weight: 2 }
        },
        {
            id: 'weap_short_bow', name: '短弓', type: 'Weapon', subTypes: ['Bow', 'Ranged'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '輕便的遠程武器',
            equipment: { attack: 1, magicAttack: 0, weight: 1 }
        },
        {
            id: 'weap_fire_sword', name: '火焰之劍', type: 'Weapon', subTypes: ['Sharp', 'Magical'],
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '燃燒的魔法刃',
            equipment: { attack: 2, magicAttack: 0, weight: 3 }
        },
        {
            id: 'spell_fireball', name: '火球', type: 'Spell', subTypes: ['Fire'],
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '【地城】增加 1 點照明，對目標造成 2 點傷害（計算照明懲罰）',
            equipment: { attack: 0, magicAttack: 2, weight: 0 }
        }
    ],
    villageItems: [
        {
            id: 'item_antidote', name: '解毒劑', type: 'Item', subTypes: ['Potion'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '【使用】移除疾病並抽 1 張牌',
            abilities: { onVillage: 'destroy_disease' }
        },
        // Moved from basic cards (User Request)
        {
            id: 'item_light_gem', name: '光輝寶石', type: 'LightItem', subTypes: ['Wonder'],
            cost: 3, vp: 0, goldValue: 3, light: 2,
            desc: '提供進階光照與採購力'
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
