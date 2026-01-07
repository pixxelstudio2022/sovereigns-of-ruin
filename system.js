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

/** * Calculates the final stats of a player including all gear bonuses.
 * Use this on EVERY page to ensure stats are consistent across the game.
 */
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

    // Add Weapon Attack
    if (gear.weapon && gear.weapon.atk) totals.atk += Number(gear.weapon.atk);

    // Add Armor Defense
    if (gear.armor && gear.armor.def) totals.def += Number(gear.armor.def);

    // Add Accessory Luck
    if (gear.accessory && gear.accessory.luck) totals.luck += Number(gear.accessory.luck);

    return totals;
}

/** Helper: Roll a random number between range */
export function rollRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Progression: XP needed for next level */
export function getRequiredXP(level) {
    // Ensure level is a number before math
    const lvl = Number(level) || 1;
    return lvl * SYSTEM_CONFIG.XP_BASE;
}

/** Formula Engine for Training & Forge */
export const GameFormulas = {
    // Logarithmic scale to keep time reasonable (3-8 mins usually)
    calculateTrainingTime: (currentLvl) => {
        const lvl = Number(currentLvl) || 1;
        const baseMin = 2;
        const growth = Math.log2(lvl + 1);
        return Math.floor(baseMin + growth);
    },
    // Linear scaling cost
    calculateTrainingCost: (currentLvl) => {
        const lvl = Number(currentLvl) || 1;
        return SYSTEM_CONFIG.TRAIN_BASE_COST + (lvl * SYSTEM_CONFIG.TRAIN_COST_INC);
    },
    // Percentage-based rewards (Fixed to feel meaningful at high levels)
    calculateStatGain: (currentMaxStat, statType) => {
        const stat = Number(currentMaxStat) || 0;
        const gain = Math.ceil(stat * SYSTEM_CONFIG.TRAIN_STAT_PERCENT);
        const minGain = (statType === 'maxHp' || statType === 'hp') ? 20 : 10;
        return Math.max(gain, minGain);
    }
};

/** Global Level Up Logic - REINFORCED FOR DATA INTEGRITY */
export function processLevelUp(pData) {
    if (!pData || !pData.stats) return false;

    let leveled = false;
    
    // Force current values to Numbers to prevent string concatenation bugs
    let currentExp = Number(pData.exp) || 0;
    let currentLvl = Number(pData.level) || 1;

    // While loop checks if the current XP exceeds the requirement for the current level
    while (currentExp >= getRequiredXP(currentLvl)) {
        
        // Subtract the cost of the level just achieved
        currentExp -= getRequiredXP(currentLvl);
        
        // Increment Level number
        currentLvl += 1;

        // Apply Stat Increases (Ensuring everything remains a Number)
        pData.stats.maxHp = (Number(pData.stats.maxHp) || 100) + SYSTEM_CONFIG.HP_PER_LVL;
        pData.stats.maxMana = (Number(pData.stats.maxMana) || 50) + SYSTEM_CONFIG.MP_PER_LVL;
        pData.stats.atk = (Number(pData.stats.atk) || 10) + SYSTEM_CONFIG.ATK_PER_LVL;
        pData.stats.def = (Number(pData.stats.def) || 10) + SYSTEM_CONFIG.DEF_PER_LVL;
        
        // Heal to full on level up
        pData.stats.hp = pData.stats.maxHp;
        pData.stats.mana = pData.stats.maxMana;
        
        leveled = true;
    }

    // Write back the clean numbers to the pData object
    if (leveled) {
        pData.level = currentLvl;
        pData.exp = currentExp;
    }

    return leveled;
}

/** Combat Damage Calculator */
export function calculateCombatResult(attackerAtk, defenderDef, luck = 0) {
    const aAtk = Number(attackerAtk) || 0;
    const dDef = Number(defenderDef) || 0;
    const lck = Number(luck) || 0;

    const hitRoll = Math.random() * 100;
    if (hitRoll > SYSTEM_CONFIG.BASE_ACCURACY) return { damage: 0, isCrit: false, isMiss: true };

    const critRoll = Math.random() * 100;
    const isCrit = critRoll <= (SYSTEM_CONFIG.CRIT_CHANCE + (lck * 0.5));

    let damage = Math.max(1, aAtk - (dDef * 0.5));
    const variance = 1 + (Math.random() * (SYSTEM_CONFIG.VARIANCE * 2) - SYSTEM_CONFIG.VARIANCE);
    damage *= variance;
    if (isCrit) damage *= SYSTEM_CONFIG.CRIT_MULTI;

    return { damage: Math.floor(damage), isCrit, isMiss: false };
}

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

/** Death Penalty Calculation */
export function getDeathPenalty(currentGold) {
    const gold = Number(currentGold) || 0;
    return Math.floor(gold * 0.15); 
}