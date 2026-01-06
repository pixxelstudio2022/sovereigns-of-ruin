/**
 * items.js - Master Library for Sovereigns of Ruin
 */

export const ITEM_LIBRARY = {
    // --- INNATE ABILITIES ---
    "start_fire": { id: "start_fire", name: "Ember", type: "spell", atk: 10, manaCost: 5, emoji: "🔥", price: 0, currency: "none", element: "fire", store: "innate" },
    "start_water": { id: "start_water", name: "Splash", type: "spell", atk: 10, manaCost: 5, emoji: "💧", price: 0, currency: "none", element: "water", store: "innate" },
    "start_wind": { id: "start_wind", name: "Gale", type: "spell", atk: 10, manaCost: 5, emoji: "💨", price: 0, currency: "none", element: "wind", store: "innate" },
    "start_earth": { id: "start_earth", name: "Pebble Toss", type: "spell", atk: 10, manaCost: 5, emoji: "🌿", price: 0, currency: "none", element: "earth", store: "innate" },
    "start_light": { id: "start_light", name: "Holy Glow", type: "spell", heal: 10, manaCost: 5, emoji: "✨", price: 0, currency: "none", element: "soul", store: "innate" },
    "start_shadow": { id: "start_shadow", name: "Soul Strike", type: "spell", atk: 10, manaCost: 5, emoji: "🌑", price: 0, currency: "none", element: "shadow", store: "innate" },

    // --- THE IRON EXCHANGE (Armory Gear + Potions) ---
    "1": { id: "1", name: "Broken Crown", type: "helm", def: 2, emoji: "👑", price: 150, currency: "gold", store: "iron_exchange" },
    "2": { id: "2", name: "Iron Visor", type: "helm", def: 5, emoji: "🪖", price: 400, currency: "gold", store: "iron_exchange" },
    "3": { id: "3", name: "Ragged Cloak", type: "armor", def: 1, luck: 1, emoji: "🧥", price: 100, currency: "gold", store: "iron_exchange" },
    "4": { id: "4", name: "Soldier Plate", type: "armor", def: 8, emoji: "🛡️", price: 850, currency: "gold", store: "iron_exchange" },
    "5": { id: "5", name: "Rusty Dirk", type: "weapon", atk: 3, emoji: "🗡️", price: 200, currency: "gold", store: "iron_exchange" },
    "6": { id: "6", name: "Steel Blade", type: "weapon", atk: 10, emoji: "⚔️", price: 1200, currency: "gold", store: "iron_exchange" },
    
    // Potions moved to Iron Exchange
    "7": { id: "7", name: "Health Tonic", type: "potion", hp_heal: 50, emoji: "🍷", price: 50, currency: "gold", store: "iron_exchange" },
    "8": { id: "8", name: "Mana Core", type: "potion", mp_heal: 30, emoji: "🧪", price: 80, currency: "gold", store: "iron_exchange" },

    // --- ARCANE LIBRARY: SPELLS ---
    // Fire
    "f1": { id: "f1", name: "Fireball", type: "spell", atk: 20, manaCost: 20, emoji: "🔥", price: 300, currency: "gold", element: "fire", store: "arcane_library" },
    "f2": { id: "f2", name: "Inferno Blast", type: "spell", atk: 55, manaCost: 55, emoji: "💥", price: 1200, currency: "gold", element: "fire", store: "arcane_library" },
    // Water
    "w1": { id: "w1", name: "Tidal Wave", type: "spell", atk: 25, manaCost: 25, emoji: "🌊", price: 400, currency: "gold", element: "water", store: "arcane_library" },
    "w2": { id: "w2", name: "Frost Bite", type: "spell", atk: 40, manaCost: 40, emoji: "❄️", price: 900, currency: "gold", element: "water", store: "arcane_library" },
    // Wind
    "wi1": { id: "wi1", name: "Cyclone", type: "spell", atk: 30, manaCost: 25, emoji: "🌪️", price: 500, currency: "gold", element: "wind", store: "arcane_library" },
    // Earth
    "e1": { id: "e1", name: "Quake", type: "spell", atk: 35, manaCost: 30, emoji: "⛰️", price: 600, currency: "gold", element: "earth", store: "arcane_library" },
    // Soul
    "so1": { id: "so1", name: "Spirit Beam", type: "spell", atk: 45, manaCost: 40, emoji: "☄️", price: 1000, currency: "gold", element: "soul", store: "arcane_library" },
    // Shadow
    "sh1": { id: "sh1", name: "Abyss Bolt", type: "spell", atk: 50, manaCost: 45, emoji: "🔮", price: 1100, currency: "gold", element: "shadow", store: "arcane_library" },

    // --- VOID EXCHANGE ---
    "scythe": { id: "scythe", name: "VOID-REAPER'S SCYTHE", type: "weapon", atk: 250, emoji: "⚔️", price: 4, currency: "shards", store: "void_exchange" },
    "crown": { id: "crown", name: "CROWN OF CHAOS", type: "helm", def: 50, maxHp: 500, maxMana: 50, emoji: "👑", price: 6, currency: "shards", store: "void_exchange" }
};

export const getItemsByStore = (storeId) => {
    return Object.values(ITEM_LIBRARY).filter(item => item.store === storeId);
};

export const getGearStats = (itemId) => {
    const item = ITEM_LIBRARY[itemId];
    if (!item) return { atk: 0, def: 0, maxHp: 0, maxMana: 0, luck: 0 };
    return {
        atk: item.atk || 0,
        def: item.def || 0,
        maxHp: item.maxHp || 0,
        maxMana: item.maxMana || 0,
        luck: item.luck || 0
    };
};