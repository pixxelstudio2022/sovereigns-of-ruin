/**
 * monsters.js - The Inhabitants of Ruin
 * Monsters are grouped by Zone to lock them to specific maps.
 */

export const MONSTER_DATABASE = {
    // --- ZONE: THRESHOLD OF SOULS (Levels 1-10) ---
    "THRESHOLD_OF_SOULS": {
        "lost_wisp": { 
            id: "lost_wisp", name: "Lost Wisp", emoji: "👻", 
            level: 1, hp: 60, maxHp: 60, atkMin: 8, atkMax: 14, def: 2, xp: 30, gold: 20 
        },
        "grave_rat": { 
            id: "grave_rat", name: "Grave Rat", emoji: "🐀", 
            level: 2, hp: 110, maxHp: 110, atkMin: 14, atkMax: 22, def: 4, xp: 50, gold: 35 
        },
        "void_walker": { 
            id: "void_walker", name: "Void Walker", emoji: "👣", 
            level: 3, hp: 160, maxHp: 160, atkMin: 20, atkMax: 28, def: 8, xp: 75, gold: 50 
        },
        "bone_scavenger": { 
            id: "bone_scavenger", name: "Bone Scavenger", emoji: "🦴", 
            level: 4, hp: 220, maxHp: 220, atkMin: 25, atkMax: 35, def: 12, xp: 110, gold: 75 
        },
        "shadow_husk": { 
            id: "shadow_husk", name: "Shadow Husk", emoji: "👤", 
            level: 5, hp: 290, maxHp: 290, atkMin: 30, atkMax: 42, def: 16, xp: 150, gold: 110 
        },
        "mist_horror": { 
            id: "mist_horror", name: "Mist Horror", emoji: "🌫️", 
            level: 6, hp: 370, maxHp: 370, atkMin: 36, atkMax: 48, def: 22, xp: 200, gold: 160 
        },
        "soul_eater": { 
            id: "soul_eater", name: "Soul Eater", emoji: "👾", 
            level: 7, hp: 460, maxHp: 460, atkMin: 42, atkMax: 54, def: 28, xp: 270, gold: 220 
        },
        "wailing_knight": { 
            id: "wailing_knight", name: "Wailing Knight", emoji: "⚔️", 
            level: 8, hp: 560, maxHp: 560, atkMin: 48, atkMax: 60, def: 35, xp: 350, gold: 300 
        },
        "reaper_acolyte": { 
            id: "reaper_acolyte", name: "Reaper Acolyte", emoji: "🧙", 
            level: 9, hp: 670, maxHp: 670, atkMin: 54, atkMax: 66, def: 42, xp: 450, gold: 400 
        },
        "threshold_warden": { 
            id: "threshold_warden", name: "Threshold Warden", emoji: "🐲", 
            level: 10, hp: 800, maxHp: 800, atkMin: 62, atkMax: 74, def: 50, xp: 600, gold: 550 
        }
    }
};

/** Get all monsters for a specific map zone */
export function getMonstersByZone(zoneKey) {
    return MONSTER_DATABASE[zoneKey] || {};
}

/** * Randomly select a monster from a zone based on player level.
 * This returns a shallow copy of the monster to prevent modifying 
 * the source database during combat.
 */
export function getRandomMonsterFromZone(zoneKey, playerLvl) {
    const zonePool = Object.values(getMonstersByZone(zoneKey));
    
    /** * UPDATED LOGIC: 
     * We filter for any monster where level is <= (Player Level + 2).
     * This allows lower level monsters to remain in the pool, while preventing 
     * Level 1 players from fighting Level 10 bosses too early.
     */
    const eligible = zonePool.filter(m => m.level <= (playerLvl + 2));
    
    // Fallback: If no monsters match (should not happen), return a copy of the first monster
    if (eligible.length === 0) return { ...zonePool[0] }; 
    
    const selected = eligible[Math.floor(Math.random() * eligible.length)];
    
    // Use spread operator to return a NEW object instance so original DB is safe
    return { ...selected };
}