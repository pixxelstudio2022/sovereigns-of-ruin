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
        
        this.ui.addLog(`${this.monster.name} emerges from the shadows!`, "#eee");
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
            // Wait slightly for the animation then run handleVictory
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
            this.isBusy = false; // Unlock ONLY after sync is done
            this.ui.update();
        }
    },

    async handleVictory() {
        this.isBusy = true; // Stay locked until DB save is confirmed
        this.ui.addLog(`${this.monster.name} has been slain!`, "var(--gold)");
        
        // Update local stats
        this.player.exp += this.monster.xp;
        this.player.gold += this.monster.gold;
        this.ui.addLog(`+${this.monster.xp} XP | +${this.monster.gold} Gold`, "var(--gold)");
        
        // Handle level up locally
        processLevelUp(this.player);
        
        // Save to Firebase and WAIT for it to finish (prevents XP rollback)
        await this.sync();
        
        this.monster = null;
        this.isBusy = false; // Unlock for the next fight
        this.ui.update();
    },

    async sync() {
        if (this.auth.currentUser) {
            try {
                // We send the whole player object to ensure exp/level/stats are all synced at once
                await updateDoc(doc(this.db, "players", this.auth.currentUser.uid), this.player);
            } catch (error) {
                console.error("Firebase Sync Error:", error);
            }
        }
    }
};