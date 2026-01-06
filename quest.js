/**
 * QUEST_LIBRARY
 * * Logic:
 * 1. 'Threshold Novice' is a Main/One-off quest.
 * 2. 'Soul Reaper' only appears after 'Threshold Novice' is finished.
 * 3. 'Soul Reaper' is a One-off quest (returns null for category reset logic).
 */

export const QUEST_LIBRARY = {
    // 1. THE DAILY QUEST (Repeatable)
    "dly_noob_001": {
        id: "dly_noob_001",
        category: "daily",
        title: "I am a noob",
        description: "Working hard is not a 1 day job. Start by clearing the whispers of the past.",
        rank: "F",
        minLevel: 1,
        locationId: "threshold_of_souls",
        type: "kill",
        target: "Lost Wisp",
        goalAmount: 10,
        rewardGold: 500,
        rewardExp: 100,
        rewardItem: null
    },

    // 2. THE INTRO STORY QUEST (Must do this first)
    "main_threshold_001": {
        id: "main_threshold_001",
        category: "main", // Categorized as Main Story
        title: "Threshold Novice",
        description: "Prove your worth by defeating any spirits wandering the Threshold.",
        rank: "F",
        minLevel: 1,
        locationId: "threshold_of_souls",
        type: "kill",
        target: "ANY", // Logic in combat will check if location matches
        goalAmount: 20,
        rewardGold: 1000,
        rewardExp: 500,
        rewardItem: null,
        prerequisiteId: null // Available to everyone
    },

    // 3. THE REWARD STORY QUEST (Unlocks after quest above)
    "main_soulreaper_002": {
        id: "main_soulreaper_002",
        category: "main",
        title: "Soul Reaper",
        description: "You have proven your skill. Take this blade and thin the herd of spirits properly.",
        rank: "D",
        minLevel: 5,
        locationId: "threshold_of_souls",
        type: "kill",
        target: "Lost Wisp",
        goalAmount: 50,
        rewardGold: 2500,
        rewardExp: 1000,
        rewardItem: { 
            id: 6, 
            name: "Steel Blade", 
            qty: 1, 
            type: "weapon", 
            atk: 15 
        },
        prerequisiteId: "main_threshold_001" // Only shows if this quest is in 'completedQuests' array
    }
};