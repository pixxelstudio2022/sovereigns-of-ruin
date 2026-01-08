// battle.js - The Combat Loop for Sovereigns of Ruin
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { processLevelUp, getPlayerTotals } from "./system.js";
import { getRandomMonsterFromZone } from "./monsters.js";

export const CombatEngine = {
    monster: null,
    isBusy: false,
    player: null,
    db: null,
    auth: null,
    ui: null,

    init(player, db, auth, ui) {
        this.player = player;
        this.db = db;
        this.auth = auth;
        this.ui = ui;
    },

    spawn(zoneName) {
        if (this.isBusy || this.monster) return;
        if (this.ui.clearLog) this.ui.clearLog();

        const selected = getRandomMonsterFromZone(zoneName, this.player.level);
        this.monster = selected;
        this.monster.curHp = selected.hp;
        
        // Visual feedback for monster rarity
        let color = "#eee";
        if (this.monster.rarity === "rare") color = "var(--mana)";
        if (this.monster.rarity === "elite") color = "var(--xp)";
        if (this.monster.rarity === "boss") color = "var(--gold)";

        this.ui.addLog(`${this.monster.name} (${this.monster.rarity.toUpperCase()}) emerges!`, color);
        this.ui.update();
    },

    async playerAttack(calcFn) {
        if (!this.monster || this.isBusy) return;
        this.isBusy = true;

        const totals = getPlayerTotals(this.player);
        const combatPlayer = {
            ...this.player,
            stats: { ...this.player.stats, atk: totals.atk, luck: totals.luck }
        };

        const result = calcFn(combatPlayer, this.monster);
        this.applyDamageToMonster(result);
    },

    async useSkill(skillName, calcFn) {
        if (!this.monster || this.isBusy || this.player.stats.mana < 15) return;
        this.isBusy = true;
        this.player.stats.mana -= 15;
        this.ui.addLog(`You cast ${skillName}!`, "var(--mana)");

        const totals = getPlayerTotals(this.player);
        const combatPlayer = {
            ...this.player,
            stats: { ...this.player.stats, atk: totals.atk, luck: totals.luck }
        };

        const result = calcFn(combatPlayer, this.monster);
        result.damage = Math.floor(result.damage * 1.5);
        this.applyDamageToMonster(result);
    },

    applyDamageToMonster(result) {
        if (result.isMiss) {
            this.ui.addLog("Your strike missed!", "#888");
        } else {
            const critText = result.isCrit ? " CRITICAL HIT!" : "";
            this.monster.curHp = Math.max(0, this.monster.curHp - result.damage);
            this.ui.addLog(`You hit ${this.monster.name} for ${result.damage} damage!${critText}`, result.isCrit ? "var(--gold)" : "var(--teal)");
        }
        
        this.ui.update();

        if (this.monster.curHp <= 0) {
            setTimeout(() => this.handleVictory(), 500);
        } else {
            setTimeout(() => this.monsterTurn(), 800);
        }
    },

    async monsterTurn() {
        if (!this.monster) return;
        
        const totals = getPlayerTotals(this.player);
        const damage = Math.max(1, Math.floor(this.monster.atk - (totals.def / 2)));
        
        this.player.stats.hp = Math.max(0, this.player.stats.hp - damage);
        this.ui.addLog(`${this.monster.name} deals ${damage} damage to you!`, "var(--red)");
        
        if (this.player.stats.hp <= 0) {
            this.ui.addLog("You have been defeated...", "var(--red)");
            await this.sync();
            setTimeout(() => this.ui.onDeath(), 1500);
        } else {
            await this.sync();
            this.isBusy = false; 
            this.ui.update();
        }
    },

    async handleVictory() {
        this.isBusy = true; 
        this.ui.addLog(`${this.monster.name} has been slain!`, "var(--gold)");
        
        this.player.exp += this.monster.xp;
        this.player.gold += this.monster.gold;
        this.ui.addLog(`+${this.monster.xp} XP | +${this.monster.gold} Gold`, "var(--gold)");
        
        // --- NEW LOOT SYSTEM ---
        this.rollForLoot();

        processLevelUp(this.player);
        
        await this.sync();
        
        this.monster = null;
        this.isBusy = false; 
        this.ui.update();
    },

    rollForLoot() {
        const totals = getPlayerTotals(this.player);
        const roll = Math.random() * 100;
        const luckBonus = (totals.luck || 0) / 2; // Luck increases drop rates
        
        let drop = null;

        // Bosses always drop something
        if (this.monster.rarity === "boss") {
            drop = { id: "hp_pot", name: "Health Tonic", type: "potion", hp_heal: 50 };
        } 
        // Elites have a 40% base chance
        else if (this.monster.rarity === "elite" && (roll + luckBonus) > 60) {
            drop = Math.random() > 0.5 
                ? { id: "hp_pot", name: "Health Tonic", type: "potion", hp_heal: 50 }
                : { id: "mp_pot", name: "Mana Core", type: "potion", mp_heal: 30 };
        }
        // Rares have a 15% base chance
        else if (this.monster.rarity === "rare" && (roll + luckBonus) > 85) {
            drop = { id: "hp_pot", name: "Health Tonic", type: "potion", hp_heal: 50 };
        }

        if (drop) {
            if (!this.player.inventory) this.player.inventory = [];
            this.player.inventory.push(drop);
            this.ui.addLog(`Loot found: ${drop.name}!`, "var(--teal)");
        }
    },

    async sync() {
        if (this.auth.currentUser) {
            try {
                // Critical Fix: We await the update to prevent the "XP disappearing" bug
                await updateDoc(doc(this.db, "players", this.auth.currentUser.uid), {
                    exp: this.player.exp,
                    gold: this.player.gold,
                    level: this.player.level,
                    stats: this.player.stats,
                    inventory: this.player.inventory
                });
            } catch (error) {
                console.error("Firebase Sync Error:", error);
            }
        }
    }
};