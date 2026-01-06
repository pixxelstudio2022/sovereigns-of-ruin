// items.js - Master Library for Sovereigns of Ruin
// This file centralizes all item data for Shops, the Forge, and Combat.

export const ITEM_LIBRARY = {
    // --- INNATE ABILITIES (Starting Nature Skills) ---
    // These are granted at birth (The Awakening)
    "start_fire": { id: "start_fire", name: "Ember", type: "spell", baseStat: 10, statType: "mag_atk", manaCost: 5, emoji: "🔥", price: 0, currency: "none", element: "Fire", store: "innate" },
    "start_water": { id: "start_water", name: "Splash", type: "spell", baseStat: 10, statType: "mag_atk", manaCost: 5, emoji: "💧", price: 0, currency: "none", element: "Water", store: "innate" },
    "start_wind": { id: "start_wind", name: "Gale", type: "spell", baseStat: 10, statType: "mag_atk", manaCost: 5, emoji: "💨", price: 0, currency: "none", element: "Wind", store: "innate" },
    "start_earth": { id: "start_earth", name: "Pebble Toss", type: "spell", baseStat: 10, statType: "mag_atk", manaCost: 5, emoji: "🌿", price: 0, currency: "none", element: "Earth", store: "innate" },
    "start_light": { id: "start_light", name: "Holy Glow", type: "spell", baseStat: 10, statType: "mag_heal", manaCost: 5, emoji: "✨", price: 0, currency: "none", element: "Light", store: "innate" },
    "start_shadow": { id: "start_shadow", name: "Soul Strike", type: "spell", baseStat: 10, statType: "mag_atk", manaCost: 5, emoji: "🌑", price: 0, currency: "none", element: "Shadow", store: "innate" },

    // --- THE IRON EXCHANGE (Armory Gear) ---
    "1": { id: "1", name: "Broken Crown", type: "helm", baseStat: 2, statType: "def", emoji: "👑", price: 150, currency: "gold", element: "soul", store: "iron_exchange" },
    "2": { id: "2", name: "Iron Visor", type: "helm", baseStat: 5, statType: "def", emoji: "🪖", price: 400, currency: "gold", element: "earth", store: "iron_exchange" },
    "3": { id: "3", name: "Ragged Cloak", type: "armor", baseStat: 1, statType: "agi", emoji: "🧥", price: 100, currency: "gold", element: "air", store: "iron_exchange" },
    "4": { id: "4", name: "Soldier Plate", type: "armor", baseStat: 8, statType: "def", emoji: "🛡️", price: 850, currency: "gold", element: "earth", store: "iron_exchange" },
    "5": { id: "5", name: "Rusty Dirk", type: "weapon", baseStat: 3, statType: "atk", emoji: "🗡️", price: 200, currency: "gold", element: "void", store: "iron_exchange" },
    "6": { id: "6", name: "Steel Blade", type: "weapon", baseStat: 10, statType: "atk", emoji: "⚔️", price: 1200, currency: "gold", element: "soul", store: "iron_exchange" },
    
    // --- CONSUMABLES (Potions) ---
    "7": { id: "7", name: "Health Tonic", type: "potion", baseStat: 50, statType: "hp_heal", emoji: "🍷", price: 50, currency: "gold", element: "fire", store: "iron_exchange" },
    "8": { id: "8", name: "Mana Core", type: "potion", baseStat: 30, statType: "mp_heal", emoji: "🧪", price: 80, currency: "gold", element: "water", store: "iron_exchange" },

    // --- ARCANE SANCTUM (Learned Spells) ---
    "f1": { id: "f1", name: "Fireball", type: "spell", baseStat: 20, statType: "mag_atk", manaCost: 20, emoji: "🔥", price: 300, currency: "gold", element: "Fire", store: "arcane_sanctum" },
    "f2": { id: "f2", name: "Inferno Blast", type: "spell", baseStat: 55, statType: "mag_atk", manaCost: 55, emoji: "💥", price: 1200, currency: "gold", element: "Fire", store: "arcane_sanctum" },
    "w1": { id: "w1", name: "Tidal Wave", type: "spell", baseStat: 25, statType: "mag_atk", manaCost: 25, emoji: "🌊", price: 400, currency: "gold", element: "Water", store: "arcane_sanctum" },
    "w2": { id: "w2", name: "Frost Bite", type: "spell", baseStat: 40, statType: "mag_atk", manaCost: 40, emoji: "❄️", price: 900, currency: "gold", element: "Water", store: "arcane_sanctum" },
    "v1": { id: "v1", name: "Gale Blade", type: "spell", baseStat: 15, statType: "mag_atk", manaCost: 15, emoji: "🌪️", price: 350, currency: "gold", element: "Wind", store: "arcane_sanctum" },
    "v2": { id: "v2", name: "Cyclone Step", type: "spell", baseStat: 60, statType: "utility", manaCost: 60, emoji: "💨", price: 1500, currency: "gold", element: "Wind", store: "arcane_sanctum" },
    "e1": { id: "e1", name: "Stone Skin", type: "spell", baseStat: 30, statType: "mag_def", manaCost: 30, emoji: "🛡️", price: 500, currency: "gold", element: "Earth", store: "arcane_sanctum" },
    "e2": { id: "e2", name: "Quake", type: "spell", baseStat: 80, statType: "mag_atk", manaCost: 80, emoji: "🌋", price: 2000, currency: "gold", element: "Earth", store: "arcane_sanctum" },
    "l1": { id: "l1", name: "Heal", type: "spell", baseStat: 35, statType: "mag_heal", manaCost: 35, emoji: "✨", price: 600, currency: "gold", element: "Light", store: "arcane_sanctum" },
    "l2": { id: "l2", name: "Purge", type: "spell", baseStat: 70, statType: "utility", manaCost: 70, emoji: "☀️", price: 1800, currency: "gold", element: "Light", store: "arcane_sanctum" },
    "s1": { id: "s1", name: "Void Bolt", type: "spell", baseStat: 40, statType: "mag_atk", manaCost: 40, emoji: "🔮", price: 700, currency: "gold", element: "Shadow", store: "arcane_sanctum" },
    "s2": { id: "s2", name: "Soul Reap", type: "spell", baseStat: 100, statType: "mag_atk", manaCost: 100, emoji: "💀", price: 2500, currency: "gold", element: "Shadow", store: "arcane_sanctum" },

    // --- VOID EXCHANGE (Shard Shop - Legendary Items) ---
    "scythe": { 
        id: "scythe", 
        name: "VOID-REAPER'S SCYTHE", 
        type: "weapon", 
        baseStat: 250, 
        statType: "atk", 
        special: "10% Lifesteal", 
        emoji: "⚔️", 
        price: 4, 
        currency: "shards", 
        store: "void_exchange" 
    },
    "crown": { 
        id: "crown", 
        name: "CROWN OF CHAOS", 
        type: "helm", 
        baseStat: 500, 
        statType: "hp", 
        secondaryStat: 50, 
        secondaryType: "mp", 
        emoji: "👑", 
        price: 6, 
        currency: "shards", 
        store: "void_exchange" 
    }
};

// Helper function to filter items by specific store
export const getItemsByStore = (storeId) => {
    return Object.values(ITEM_LIBRARY).filter(item => item.store === storeId);
};