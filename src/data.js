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
            desc: '受過基礎訓練的民兵，隨時準備保衛家園。',
            hero: { level: 0, series: 'Regular', magicAttack: 0, strength: 1, xpToUpgrade: 1 },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若裝備長矛，攻擊力+1', onBattle: 'synergy_spear' }
        },
        {
            id: 'basic_torch', name: '火把', type: 'LightItem', subTypes: ['Light'],
            cost: 2, vp: 0, goldValue: 2, light: 1,
            desc: '燃燒的火把，能在黑暗中提供些許安全感。'
        },

        {
            id: 'basic_spear', name: '長矛', type: 'Weapon', subTypes: ['Polearm', 'Sharp'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '標準的制式長柄武器，適合新手使用。',
            equipment: { attack: 1, magicAttack: 0, weight: 1 }
        },
        {
            id: 'basic_rations', name: '乾糧', type: 'Food', subTypes: ['Supply'],
            cost: 1, vp: 0, goldValue: 1, light: 0,
            desc: '方便攜帶的乾糧，冒險者補充體力的最愛。',
            abilities: { abilities_desc: '⚔️ 戰鬥中：裝備的英雄獲得力量+1', onBattle: 'boost_str_1' }
        }
    ],

    // --- 英雄系列 ---
    heroes: [
        {
            id: 'hero_sevin_lv1', name: '塞維恩戰術家', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '塞維恩家族的戰術指導，擅長團隊作戰。',
            hero: { level: 1, series: 'Sevin', magicAttack: 0, strength: 3, xpToUpgrade: 4, upgradeToId: 'hero_sevin_lv2' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：手牌中有其他英雄時，攻擊力+1', onBattle: 'synergy_hero_group' }
        },
        {
            id: 'hero_sevin_lv2', name: '塞維恩指揮官', type: 'Hero', subTypes: ['Fighter'],
            cost: 7, vp: 2, goldValue: 0, light: 1,
            desc: '身經百戰的指揮官，能激發隊友的潛能。',
            hero: { level: 2, series: 'Sevin', magicAttack: 0, strength: 4, xpToUpgrade: 6, upgradeToId: 'hero_sevin_lv3' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：手牌中有其他英雄時，攻擊力+3', onBattle: 'synergy_hero_group_2' }
        },
        {
            id: 'hero_sevin_lv3', name: '塞維恩君主', type: 'Hero', subTypes: ['Fighter'],
            cost: 10, vp: 3, goldValue: 0, light: 2,
            desc: '塞維恩的統治者，其威名足以震懾敵軍。',
            hero: { level: 3, series: 'Sevin', magicAttack: 0, strength: 5, xpToUpgrade: 0 },
            abilities: { abilities_desc: '⚔️ 戰鬥中：手牌中有其他英雄時，攻擊力+5', onBattle: 'synergy_hero_group_3' }
        },
        {
            id: 'hero_amazon_lv1', name: '亞馬遜弓箭手', type: 'Hero', subTypes: ['Fighter', 'Ranger'],
            cost: 5, vp: 1, goldValue: 0, light: 0,
            desc: '來自密林的矯健射手，精通弓術。',
            hero: { level: 1, series: 'Amazon', magicAttack: 0, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_amazon_lv2' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若裝備獵弓，攻擊力+1\n🏆 戰勝後：戰勝怪物得 1 VP', onBattle: 'synergy_bow', onVictory: 'gain_1vp' }
        },
        {
            id: 'hero_amazon_lv2', name: '亞馬遜獵手', type: 'Hero', subTypes: ['Fighter', 'Ranger'],
            cost: 8, vp: 2, goldValue: 1, light: 0,
            desc: '狩獵技巧已臻化境，能精準命中目標。',
            hero: { level: 2, series: 'Amazon', magicAttack: 0, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_amazon_lv3' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若裝備獵弓，攻擊力+2\n🏆 戰勝後：戰勝怪物得 2 VP', onBattle: 'synergy_bow_2', onVictory: 'gain_2vp' }
        },
        {
            id: 'hero_amazon_lv3', name: '亞馬遜女王', type: 'Hero', subTypes: ['Archer'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '亞馬遜部落的女王，她的箭矢如同審判之光。',
            hero: { level: 3, series: 'Amazon', magicAttack: 0, strength: 4, xpToUpgrade: 0 },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若裝備獵弓，攻擊力+3\n🏆 戰勝後：戰勝怪物得 3 VP', onBattle: 'synergy_bow_3', onVictory: 'gain_3vp' }
        },
        {
            id: 'hero_elf_lv1', name: '精靈術士', type: 'Hero', subTypes: ['Wizard'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '操縱自然魔力的精靈，體質較為纖弱。',
            hero: { level: 1, series: 'Elf', magicAttack: 1, strength: 1, xpToUpgrade: 4, upgradeToId: 'hero_elf_lv2' },
            abilities: { abilities_desc: '🏆 戰勝後：戰勝怪物得 1 XP', onVictory: 'gain_1xp' }
        },
        {
            id: 'hero_elf_lv2', name: '精靈巫師', type: 'Hero', subTypes: ['Wizard'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '掌握了更深奧的秘法，能感知地城的流動。',
            hero: { level: 2, series: 'Elf', magicAttack: 2, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_elf_lv3' },
            abilities: { abilities_desc: '� 戰勝後：戰勝怪物得 2 XP', onVictory: 'gain_2xp' }
        },
        {
            id: 'hero_elf_lv3', name: '精靈大魔導', type: 'Hero', subTypes: ['Wizard'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '魔力充盈的大魔導師，智慧照亮前路。',
            hero: { level: 3, series: 'Elf', magicAttack: 3, strength: 3, xpToUpgrade: 0 },
            abilities: { abilities_desc: '🏆 戰勝後：戰勝怪物得 3 XP', onVictory: 'gain_3xp' }
        },
        {
            id: 'hero_dwarf_lv1', name: '矮人守護者', type: 'Hero', subTypes: ['Fighter'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '頑強的矮人，對武器有著天生的熱愛。',
            hero: { level: 1, series: 'Dwarf', magicAttack: 0, strength: 2, xpToUpgrade: 4, upgradeToId: 'hero_dwarf_lv2' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若有裝備武器，攻擊力+1', onBattle: 'dwarf_weapon_bonus' }
        },
        {
            id: 'hero_dwarf_lv2', name: '矮人戰士', type: 'Hero', subTypes: ['Fighter'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '精通戰鬥技巧的矮人戰士。',
            hero: { level: 2, series: 'Dwarf', magicAttack: 0, strength: 3, xpToUpgrade: 6, upgradeToId: 'hero_dwarf_lv2' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若有裝備武器，攻擊力+2', onBattle: 'dwarf_weapon_bonus_2' }
        },
        {
            id: 'hero_dwarf_lv3', name: '矮人領主', type: 'Hero', subTypes: ['Fighter'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '矮人一族的領袖，無人能擋其鋒。',
            hero: { level: 3, series: 'Dwarf', magicAttack: 0, strength: 4, xpToUpgrade: 0 },
            abilities: { abilities_desc: '⚔️ 戰鬥中：若有裝備武器，攻擊力+3', onBattle: 'dwarf_weapon_bonus_3' }
        },

        {
            id: 'hero_loric_lv1', name: '羅域盜賊', type: 'Hero', subTypes: ['Thief'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '善於在陰影中行動的盜賊。',
            hero: { level: 1, series: 'Loric', magicAttack: 0, strength: 1, xpToUpgrade: 4, upgradeToId: 'hero_loric_lv2' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：光照不足時，攻擊力+2', onBattle: 'light_compensation_loric' }
        },
        {
            id: 'hero_loric_lv2', name: '羅域刺客', type: 'Hero', subTypes: ['Thief'],
            cost: 7, vp: 2, goldValue: 0, light: 0,
            desc: '冷酷無情的刺客，黑暗是他的盟友。',
            hero: { level: 2, series: 'Loric', magicAttack: 0, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_loric_lv3' },
            abilities: { abilities_desc: '⚔️ 戰鬥中：光照不足時，攻擊力+3', onBattle: 'light_compensation_loric_2' }
        },
        {
            id: 'hero_loric_lv3', name: '羅域暗影大師', type: 'Hero', subTypes: ['Thief'],
            cost: 10, vp: 3, goldValue: 0, light: 0,
            desc: '陰影中的大師，無聲無息地解決敵人。',
            hero: { level: 3, series: 'Loric', magicAttack: 0, strength: 3, xpToUpgrade: 0 },
            abilities: { abilities_desc: '⚔️ 戰鬥中：光照不足時，攻擊力+4', onBattle: 'light_compensation_loric_3' }
        },

        {
            id: 'hero_grail_lv1', name: '聖杯探求者', type: 'Hero', subTypes: ['Cleric'],
            cost: 4, vp: 1, goldValue: 0, light: 0,
            desc: '致力於治癒世間疾苦的僧侶。',
            hero: { level: 1, series: 'Grail', magicAttack: 1, strength: 1, xpToUpgrade: 4, upgradeToId: 'hero_grail_lv2' },
            abilities: { abilities_desc: '🏠 村莊中：摧毀一張疾病卡', onVillage: 'destroy_disease' }
        },
        {
            id: 'hero_grail_lv2', name: '聖杯騎士', type: 'Hero', subTypes: ['Cleric'],
            cost: 7, vp: 2, goldValue: 0, light: 1,
            desc: '神聖的騎士，守護著村莊的安寧。',
            hero: { level: 2, series: 'Grail', magicAttack: 2, strength: 2, xpToUpgrade: 6, upgradeToId: 'hero_grail_lv3' },
            abilities: { abilities_desc: '🏠 村莊中：摧毀任意一張卡\n🏠 村莊中：修復 1 點魔法護罩', onVillage: 'destroy_any_heal_1' }
        },
        {
            id: 'hero_grail_lv3', name: '聖杯守護者', type: 'Hero', subTypes: ['Cleric'],
            cost: 10, vp: 3, goldValue: 0, light: 2,
            desc: '聖杯的守護者，擁有強大的治癒神力。',
            hero: { level: 3, series: 'Grail', magicAttack: 3, strength: 3, xpToUpgrade: 0 },
            abilities: { abilities_desc: '🏠 村莊中：修復 2 點魔法護罩', onVillage: 'heal_2' }
        }
    ],

    // --- 怪物群 (v3.11 重組：每族群 10 張卡，比例 4:3:3) ---
    monsters: [
        // --- 群落 1: Vermin (毒蟲) ---
        { id: 'mon_rat', name: '腐化老鼠', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 1, hp: 1, xpGain: 1, breachDamage: 1 }, desc: '受到黑暗魔力侵蝕的巨大老鼠，成群結隊地啃食村莊的防禦設施。', count: 4 },
        { id: 'mon_centipede', name: '巨型蜈蚣', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 2, hp: 3, xpGain: 1, breachDamage: 2 }, desc: '擁有堅硬甲殼的多足掠食者，其毒液能麻痺冒險者的心智。', abilities: { abilities_desc: '【進場】隨機棄 1 張手牌。', onBreach: 'discard_1' }, count: 3 },
        { id: 'mon_spider', name: '變異蜘蛛', type: 'Monster', subTypes: ['Vermin'], monster: { tier: 3, hp: 6, xpGain: 2, breachDamage: 3 }, desc: '受到變異影響的蜘蛛，其織出的網帶有劇毒。', abilities: { abilities_desc: '【持續】所有英雄力量 -1', aura: 'str_minus_1' }, count: 3 },

        // --- 群落 2: Undead (不死者) ---
        { id: 'mon_ghost', name: '幽鬼', type: 'Monster', subTypes: ['Undead'], monster: { tier: 1, hp: 2, xpGain: 1, breachDamage: 1 }, desc: '徘徊在戰場上的怨靈，一般的物理攻擊難以對其造成傷害。', count: 4 },
        { id: 'mon_skeleton', name: '骷髏戰士', type: 'Monster', subTypes: ['Undead'], monster: { tier: 2, hp: 3, xpGain: 2, breachDamage: 2 }, desc: '被黑魔法喚醒的古代士兵，手持生鏽的鐵劍無情地斬殺生者。', count: 3 },
        { id: 'mon_wraith', name: '死靈', type: 'Monster', subTypes: ['Undead'], monster: { tier: 3, hp: 5, xpGain: 3, breachDamage: 3 }, desc: '高階的不死生物，其寒冷的氣息能瞬間凍結勇者的裝備。', abilities: { abilities_desc: '【進場】棄 1 張能量或裝備卡。', onBreach: 'discard_magic_or_item' }, count: 3 },

        // --- 群落 3: Darkness (黑暗軍團) ---
        { id: 'mon_shadow', name: '影魔', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 1, hp: 1, xpGain: 1, breachDamage: 1 }, desc: '從陰影中誕生的無形殺手，常在光照不足時發動致命突襲。', count: 4 },
        { id: 'mon_nightmare_knight', name: '夢魘騎士', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 2, hp: 4, xpGain: 3, breachDamage: 3 }, desc: '騎乘著黑馬的恐怖騎士，他的存在本身就會吞噬周圍的光芒。', abilities: { abilities_desc: '【持續】地城照明需求 +1 (最高累計 1)。', aura: 'light_req_plus_1' }, count: 3 },
        { id: 'mon_harbinger', name: '末日使者', type: 'Monster', subTypes: ['Darkness'], monster: { tier: 3, hp: 7, xpGain: 5, breachDamage: 4 }, desc: '毀滅的先驅，他所散發的絕望氣場能削弱最堅強的戰士。', abilities: { abilities_desc: '【持續】所有英雄戰力 -1。', aura: 'atk_minus_1' }, count: 3 },

        // --- 群落 4: Ancient (遠古遺蹟) ---
        { id: 'mon_slime', name: '粘液怪', type: 'Monster', subTypes: ['Ancient', 'Mire'], monster: { tier: 1, hp: 1, xpGain: 1, breachDamage: 1 }, desc: '古老遺跡中常見的有機陷阱，雖然弱小但極難徹底消滅。', count: 4 },
        { id: 'mon_young_dragon', name: '幼龍', type: 'Monster', subTypes: ['Ancient', 'Dragon'], monster: { tier: 2, hp: 4, xpGain: 3, breachDamage: 3 }, desc: '雖然尚未成年，但其吐息的威力已足以融化鋼鐵與岩石。', count: 3 },
        { id: 'mon_black_dragon', name: '大黑龍', type: 'Monster', subTypes: ['Ancient', 'Dragon'], monster: { tier: 3, hp: 8, xpGain: 6, breachDamage: 5 }, desc: '傳說中的災厄化身，其鱗片堅不可摧，唯有強大的魔法才能傷其分毫。', abilities: { abilities_desc: '【戰鬥】僅魔法攻擊有效。', battle: 'magic_only' }, count: 3 },

        // --- 群落 5: Goblin (哥布林) (v3.22.14) ---
        { id: 'mon_goblin_grunt', name: '哥布林雜兵', type: 'Monster', subTypes: ['Goblin'], monster: { tier: 1, hp: 2, xpGain: 1, breachDamage: 1 }, desc: '狡猾且貪婪的小型亞人，擅長偷襲與破壞冒險者的補給。', abilities: { abilities_desc: '【進場】破壞 1 張手牌。', onBreach: 'destroy_hand_1' }, count: 4 },
        { id: 'mon_goblin_raider', name: '哥布林突襲者', type: 'Monster', subTypes: ['Goblin'], monster: { tier: 2, hp: 4, xpGain: 2, breachDamage: 2 }, desc: '裝備更精良的哥布林精英，會優先攻擊攜帶物資的隊員。', abilities: { abilities_desc: '【進場】破壞 2 張手牌。', onBreach: 'destroy_hand_2' }, count: 3 },
        { id: 'mon_goblin_king', name: '哥布林王', type: 'Monster', subTypes: ['Goblin'], monster: { tier: 3, hp: 7, xpGain: 4, breachDamage: 3 }, desc: '統率哥布林大軍的魁梧暴君，其麾下的掠奪行動將更加殘暴。', abilities: { abilities_desc: '【進場】破壞 2 張手牌 + 1 隨機物品。', onBreach: 'destroy_hand_2_plus_1' }, count: 3 },

        // --- 群落 6: Mire (泥漿類) (v3.22.14) ---
        { id: 'mon_green_slime', name: '綠色泥糊', type: 'Monster', subTypes: ['Mire'], monster: { tier: 1, hp: 3, xpGain: 1, breachDamage: 2 }, desc: '帶有強烈腐蝕性的酸性軟泥，散發著令人作嘔的惡臭。', count: 4 },
        { id: 'mon_black_slime', name: '黑色史萊姆', type: 'Monster', subTypes: ['Mire'], monster: { tier: 1, hp: 4, xpGain: 1, breachDamage: 2 }, desc: '猶如焦油般黏稠的黑暗物質，能輕易困住大意的冒險者。', count: 3 },
        { id: 'mon_red_gel', name: '紅色凝膠獸', type: 'Monster', subTypes: ['Mire'], monster: { tier: 2, hp: 6, xpGain: 2, breachDamage: 2 }, desc: '外表晶瑩剔透但極度危險，能吸收衝擊力並削弱武器的鋒利度。', abilities: { abilities_desc: '【持續】所有英雄攻擊力 -1。', aura: 'atk_minus_1' }, count: 3 }
    ],


    // --- 物品與裝備 ---
    // v3.22.4: 市集分類重構
    attackItems: [
        {
            id: 'weap_iron_sword', name: '短劍', type: 'Weapon', subTypes: ['Sharp'],
            cost: 2, vp: 0, goldValue: 1, light: 0,
            desc: '銳利的近身武器，士兵的標準裝備。',
            equipment: { attack: 1, magicAttack: 0, weight: 2 }
        },
        {
            id: 'weap_short_bow', name: '獵弓', type: 'Weapon', subTypes: ['Bow', 'Ranged'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '輕便的遠程武器，適合遊擊作戰。',
            equipment: { attack: 1, magicAttack: 0, weight: 1 }
        },
        {
            id: 'weap_fire_sword', name: '火焰之劍', type: 'Weapon', subTypes: ['Sharp', 'Magical'],
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '燃燒的魔法刃，能灼燒敵人。',
            equipment: { attack: 2, magicAttack: 0, weight: 3 }
        },
        {
            id: 'spell_fireball', name: '火球', type: 'Spell', subTypes: ['Fire'],
            cost: 5, vp: 0, goldValue: 1, light: 1,
            desc: '召喚火球攻擊敵人的基礎法術。',
            equipment: { attack: 0, magicAttack: 2, weight: 0 },
            abilities: { abilities_desc: '⚔️ 戰鬥中：對目標造成 2 點傷害\n💡 增加 1 點照明' }
        }
    ],
    villageItems: [
        {
            id: 'item_antidote', name: '解毒劑', type: 'Item', subTypes: ['Potion'],
            cost: 3, vp: 0, goldValue: 1, light: 0,
            desc: '能解除中毒狀態的藥劑。',
            abilities: { abilities_desc: '🏠 村莊中：移除疾病並抽 1 張牌', onVillage: 'destroy_disease' }
        },
        // Moved from basic cards (User Request)
        {
            id: 'item_light_gem', name: '光輝寶石', type: 'LightItem', subTypes: ['Wonder'],
            cost: 3, vp: 0, goldValue: 3, light: 2,
            desc: '閃耀著光芒的寶石。',
            abilities: { abilities_desc: '💡 提供進階光照與採購力' }
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
