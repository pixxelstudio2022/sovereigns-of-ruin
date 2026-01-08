/**
 * monsters.js - The Inhabitants of Ruin
 * Redesigned for Threshold of Souls (Levels 1-10)
 */

export const MONSTER_DATABASE = {
    "THRESHOLD_OF_SOULS": {
        // --- LEVEL 1-3: THE FORGOTTEN OUTSKIRTS ---
        "carrion_fly": { 
            id: "carrion_fly", name: "Carrion Fly", emoji: "🪰", rarity: "common",
            level: 1, hp: 45, maxHp: 45, atk: 10, def: 1, xp: 25, gold: 15 
        },
        "soul_fragment": { 
            id: "soul_fragment", name: "Soul Fragment", emoji: "✨", rarity: "common",
            level: 1, hp: 55, maxHp: 55, atk: 12, def: 2, xp: 35, gold: 20 
        },
        "rotting_shambler": { 
            id: "rotting_shambler", name: "Rotting Shambler", emoji: "🧟", rarity: "common",
            level: 2, hp: 105, maxHp: 105, atk: 19, def: 5, xp: 55, gold: 40 
        },
        "spectral_hound": { 
            id: "spectral_hound", name: "Spectral Hound", emoji: "🐕‍🦺", rarity: "rare",
            level: 3, hp: 140, maxHp: 140, atk: 26, def: 7, xp: 85, gold: 65 
        },

        // --- LEVEL 4-6: THE MISTY VEIL ---
        "veiled_stalker": { 
            id: "veiled_stalker", name: "Veiled Stalker", emoji: "🧥", rarity: "common",
            level: 4, hp: 210, maxHp: 210, atk: 32, def: 12, xp: 120, gold: 90 
        },
        "will_o_wisp": { 
            id: "will_o_wisp", name: "Will-o'-Wisp", emoji: "🏮", rarity: "rare",
            level: 5, hp: 260, maxHp: 260, atk: 38, def: 15, xp: 170, gold: 130 
        },
        "casket_mimic": { 
            id: "casket_mimic", name: "Casket Mimic", emoji: "⚰️", rarity: "elite",
            level: 6, hp: 380, maxHp: 380, atk: 45, def: 25, xp: 240, gold: 200 
        },

        // --- LEVEL 7-9: THE INNER SANCTUM ---
        "void_priest": { 
            id: "void_priest", name: "Void Priest", emoji: "⛪", rarity: "common",
            level: 7, hp: 480, maxHp: 480, atk: 52, def: 30, xp: 310, gold: 250 
        },
        "chain_wraith": { 
            id: "chain_wraith", name: "Chain Wraith", emoji: "⛓️", rarity: "rare",
            level: 8, hp: 590, maxHp: 590, atk: 58, def: 38, xp: 400, gold: 340 
        },
        "soul_reaper": { 
            id: "soul_reaper", name: "Soul Reaper", emoji: "💀", rarity: "elite",
            level: 9, hp: 720, maxHp: 720, atk: 65, def: 45, xp: 520, gold: 450 
        },

        // --- LEVEL 10: THE GATEKEEPER ---
        "malphas_the_guardian": { 
            id: "malphas_the_guardian", name: "Malphas the Guardian", emoji: "🦅", rarity: "boss",
            level: 10, hp: 1200, maxHp: 1200, atk: 85, def: 60, xp: 1000, gold: 1200 
        }
    }
};

/** Get all monsters for a specific map zone */
export function getMonstersByZone(zoneKey) {
    return MONSTER_DATABASE[zoneKey] || {};
}

/** * Randomly select a monster from a zone based on player level.
 */
export function getRandomMonsterFromZone(zoneKey, playerLvl) {
    const zonePool = Object.values(getMonstersByZone(zoneKey));
    
    // Filter logic:
    // 1. Monsters must be at or below Player Level + 1 (for challenge)
    // 2. We allow low level monsters to keep the pool varied, but emphasize current level.
    const eligible = zonePool.filter(m => m.level <= (playerLvl + 1));
    
    // Fallback to the first monster if nothing is found
    if (eligible.length === 0) return { ...zonePool[0] }; 
    
    // Weighting: Higher level monsters in the eligible pool are more likely to appear
    const selected = eligible[Math.floor(Math.random() * eligible.length)];
    
    // Return a structured clone (modern deep copy) to prevent DB contamination
    return JSON.parse(JSON.stringify(selected));
}