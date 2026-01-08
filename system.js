// system.js - The Brain of Sovereigns of Ruin

export const SYSTEM_CONFIG = {
    // Progression Stats
    XP_BASE: 125,         
    HP_PER_LVL: 25,       
    MP_PER_LVL: 15,       
    ATK_PER_LVL: 3,       
    DEF_PER_LVL: 2,       
    
    // Combat Balance
    BASE_ACCURACY: 92,    
    CRIT_CHANCE: 5,       
    CRIT_MULTI: 1.5,      
    VARIANCE: 0.10,       

    // Training Math
    TRAIN_BASE_COST: 50,
    TRAIN_COST_INC: 10,
    TRAIN_STAT_PERCENT: 0.05 // 5% gain per session
};

/** * Synchronized Combat Damage Calculator 
 * Accepts either raw numbers or the full entities (Player/Monster)
 */
export function calculateCombatResult(attacker, defender) {
    // Extract Stats: Handles both Player (.stats.atk) and Monster (.atk)
    const aAtk = Number(attacker?.stats?.atk || attacker?.atk || 0);
    const dDef = Number(defender?.stats?.def || defender?.def || 0);
    const lck = Number(attacker?.stats?.luck || 0);

    // 1. Accuracy Check
    const hitRoll = Math.random() * 100;
    if (hitRoll > SYSTEM_CONFIG.BASE_ACCURACY) {
        return { damage: 0, isCrit: false, isMiss: true };
    }

    // 2. Critical Hit Check
    const critRoll = Math.random() * 100;
    const isCrit = critRoll <= (SYSTEM_CONFIG.CRIT_CHANCE + (lck * 0.5));

    // 3. Base Damage Calculation (Min 1)
    let damage = Math.max(1, aAtk - (dDef * 0.5));

    // 4. Apply Random Variance (+/- 10%)
    const variance = 1 + (Math.random() * (SYSTEM_CONFIG.VARIANCE * 2) - SYSTEM_CONFIG.VARIANCE);
    damage *= variance;

    // 5. Apply Crit Multiplier
    if (isCrit) damage *= SYSTEM_CONFIG.CRIT_MULTI;

    return { 
        damage: Math.floor(damage), 
        isCrit, 
        isMiss: false 
    };
}

/** Progression: XP needed for next level */
export function getRequiredXP(level) {
    const lvl = Number(level) || 1;
    return lvl * SYSTEM_CONFIG.XP_BASE;
}

/** Global Level Up Logic - REINFORCED FOR DATA INTEGRITY */
export function processLevelUp(pData) {
    if (!pData || !pData.stats) return false;

    let leveled = false;
    let currentExp = Number(pData.exp) || 0;
    let currentLvl = Number(pData.level) || 1;

    while (currentExp >= getRequiredXP(currentLvl)) {
        currentExp -= getRequiredXP(currentLvl);
        currentLvl += 1;

        // Apply Stat Increases
        pData.stats.maxHp = (Number(pData.stats.maxHp) || 100) + SYSTEM_CONFIG.HP_PER_LVL;
        pData.stats.maxMana = (Number(pData.stats.maxMana) || 50) + SYSTEM_CONFIG.MP_PER_LVL;
        pData.stats.atk = (Number(pData.stats.atk) || 10) + SYSTEM_CONFIG.ATK_PER_LVL;
        pData.stats.def = (Number(pData.stats.def) || 10) + SYSTEM_CONFIG.DEF_PER_LVL;
        
        // Full Heal
        pData.stats.hp = pData.stats.maxHp;
        pData.stats.mana = pData.stats.maxMana;
        
        leveled = true;
    }

    if (leveled) {
        pData.level = currentLvl;
        pData.exp = currentExp;
    }
    return leveled;
}

/** Calculates final stats including gear bonuses */
export function getPlayerTotals(pData) {
    if (!pData || !pData.stats) return { atk: 0, def: 0, maxHp: 0, maxMana: 0, luck: 0 };
    
    const gear = pData.gear || {};
    const totals = {
        atk: Number(pData.stats.atk) || 0,
        def: Number(pData.stats.def) || 0,
        maxHp: Number(pData.stats.maxHp) || 0,
        maxMana: Number(pData.stats.maxMana) || 0,
        luck: Number(pData.stats.luck) || 0
    };

    if (gear.weapon?.atk) totals.atk += Number(gear.weapon.atk);
    if (gear.armor?.def) totals.def += Number(gear.armor.def);
    if (gear.accessory?.luck) totals.luck += Number(gear.accessory.luck);

    return totals;
}

/** Helper: Roll range */
export function rollRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Formula Engine for Training */
export const GameFormulas = {
    calculateTrainingTime: (currentLvl) => {
        const lvl = Number(currentLvl) || 1;
        return Math.floor(2 + Math.log2(lvl + 1));
    },
    calculateTrainingCost: (currentLvl) => {
        const lvl = Number(currentLvl) || 1;
        return SYSTEM_CONFIG.TRAIN_BASE_COST + (lvl * SYSTEM_CONFIG.TRAIN_COST_INC);
    },
    calculateStatGain: (currentMaxStat, statType) => {
        const stat = Number(currentMaxStat) || 0;
        const gain = Math.ceil(stat * SYSTEM_CONFIG.TRAIN_STAT_PERCENT);
        const minGain = (statType === 'maxHp' || statType === 'hp') ? 20 : 10;
        return Math.max(gain, minGain);
    }
};

/** Global Inventory Slot Counter */
export function getInventoryWeight(inventory) {
    if (!inventory) return 0;
    const groupedIds = new Set();
    let totalSlots = 0;
    inventory.forEach(item => {
        if (item.type === 'potion') {
            if (!groupedIds.has(item.id)) {
                groupedIds.add(item.id);
                totalSlots++;
            }
        } else { totalSlots++; }
    });
    return totalSlots;
}

/** Death Penalty */
export function getDeathPenalty(currentGold) {
    return Math.floor((Number(currentGold) || 0) * 0.15); 
}