// battle.js
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const CombatEngine = {
    isBusy: false,
    isBattleStarted: false,
    monster: null,

    init(pData, db, auth, ui) {
        this.pData = pData;
        this.db = db;
        this.auth = auth;
        this.ui = ui;
    },

    async sync() {
        if (this.auth.currentUser) {
            await updateDoc(doc(this.db, "players", this.auth.currentUser.uid), this.pData);
        }
    },

    generateMonster(zoneName, database) {
        this.ui.clearLog();
        const playerLvl = Number(this.pData.level) || 1;
        const zonePool = Object.values(database[zoneName]);
        
        let filteredPool = zonePool.filter(m => m.level <= (playerLvl + 2));
        if (filteredPool.length === 0) {
            filteredPool = zonePool.sort((a, b) => a.level - playerLvl).slice(0, 3);
        }

        const selected = filteredPool[Math.floor(Math.random() * filteredPool.length)];
        this.monster = JSON.parse(JSON.stringify(selected));
        this.monster.curHp = Number(this.monster.hp);
        this.isBattleStarted = false;
        
        this.ui.addLog(`Manifested ${this.monster.name}! (Level ${this.monster.level})`, "#eee");
        this.ui.update();
    },

    async handleAttack(calculateCombatResult) {
        if (!this.monster || this.isBusy) return;
        this.isBusy = true;
        this.isBattleStarted = true;

        let gearAtk = 0;
        (this.pData.inventory || []).forEach(i => { if(i.equipped) gearAtk += (Number(i.atk) || 0); });
        
        const result = calculateCombatResult((Number(this.pData.stats?.atk) || 10) + gearAtk, Number(this.monster.def), Number(this.pData.stats?.luck) || 0);

        if (!result.isMiss) {
            this.monster.curHp -= result.damage;
            this.ui.addLog(`Hit for ${result.damage} DMG.`, result.isCrit ? "var(--gold)" : "var(--teal)");
            this.ui.shake('mSprite');
        } else {
            this.ui.addLog(`Missed!`, "#555");
        }

        if (this.monster.curHp <= 0) setTimeout(() => this.handleVictory(), 400);
        else setTimeout(() => this.monsterTurn(calculateCombatResult), 600);
        this.ui.update();
    },

    async useSkill(calculateCombatResult) {
        if (!this.monster || this.isBusy || !this.pData.skills?.length) return;
        const manaCost = 15;
        if (this.pData.stats.mana < manaCost) { this.ui.addLog("Low MP!", "var(--mana)"); return; }

        this.isBusy = true;
        this.isBattleStarted = true;
        this.pData.stats.mana -= manaCost;

        let gearAtk = 0;
        (this.pData.inventory || []).forEach(i => { if(i.equipped) gearAtk += (Number(i.atk) || 0); });
        const result = calculateCombatResult(Math.floor(((Number(this.pData.stats.atk) || 10) + gearAtk) * 1.8), Number(this.monster.def), (Number(this.pData.stats.luck) || 0) + 5);

        this.ui.addLog(`Cast ${this.pData.skills[0]}!`, "var(--mana)");
        if (!result.isMiss) {
            this.monster.curHp -= result.damage;
            this.ui.addLog(`Skill deals ${result.damage} DMG.`, "var(--teal)");
            this.ui.shake('mSprite');
        }

        if (this.monster.curHp <= 0) setTimeout(() => this.handleVictory(), 400);
        else setTimeout(() => this.monsterTurn(calculateCombatResult), 600);
        this.ui.update();
        await this.sync();
    },

    async usePotion(id) {
        if (!this.pData || this.isBusy) return;
        const idx = (this.pData.inventory || []).findIndex(i => i.id === id);
        if (idx === -1) { this.ui.addLog("No potions!", "var(--red)"); return; }
        
        const item = this.pData.inventory[idx];
        if (id === '7') this.pData.stats.hp = Math.min(this.pData.stats.maxHp, this.pData.stats.hp + (Number(item.heal) || 50));
        else this.pData.stats.mana = Math.min(this.pData.stats.maxMana, this.pData.stats.mana + (Number(item.restore) || 30));
        
        this.pData.inventory.splice(idx, 1);
        this.ui.update();
        await this.sync();
    },

    async monsterTurn(calculateCombatResult) {
        if (!this.monster) { this.isBusy = false; return; }
        let gearDef = 0;
        (this.pData.inventory || []).forEach(i => { if(i.equipped) gearDef += (Number(i.def) || 0); });
        
        const mAtk = Math.floor(Math.random() * (this.monster.atkMax - this.monster.atkMin + 1) + this.monster.atkMin);
        const result = calculateCombatResult(mAtk, (Number(this.pData.stats.def) || 5) + gearDef, 0);

        if (!result.isMiss) {
            this.pData.stats.hp = Math.max(0, this.pData.stats.hp - result.damage);
            this.ui.addLog(`${this.monster.name} deals ${result.damage} DMG.`, "var(--red)");
            this.ui.shake('mainScene');
        }

        this.isBusy = false;
        if (this.pData.stats.hp <= 0) this.ui.onDeath();
        else { await this.sync(); this.ui.update(); }
    },

    async handleVictory() {
        const xpGained = Math.floor(Number(this.monster.xp) || 0);
        const goldGained = Math.floor(Number(this.monster.gold) || 0);

        // 1. ADD REWARDS TO LOCAL DATA
        this.pData.exp = (Number(this.pData.exp) || 0) + xpGained;
        this.pData.gold = (Number(this.pData.gold) || 0) + goldGained;

        // 2. IMMEDIATE LEVEL UP LOGIC
        // This ensures the 850/800 visual bug doesn't happen
        let levelUps = 0;
        while (this.pData.exp >= (Number(this.pData.level) * 100)) {
            this.pData.exp -= (Number(this.pData.level) * 100);
            this.pData.level = (Number(this.pData.level) || 1) + 1;
            levelUps++;
        }

        // 3. LOG REWARDS TO PLAYER
        this.ui.addLog(`Victory! +${xpGained} XP`, "var(--gold)");
        this.ui.addLog(`Found ${goldGained} Gold!`, "var(--gold)");
        
        if (levelUps > 0) {
            this.ui.addLog(`✨ LEVELED UP to ${this.pData.level}!`, "var(--mana)");
            // Optional: Full heal on level up
            if(this.pData.stats) this.pData.stats.hp = this.pData.stats.maxHp;
        }

        // 4. QUEST PROGRESS
        if (this.pData.activeQuest && !this.pData.activeQuest.isCompleted) {
            if (this.pData.activeQuest.target === this.monster.name || this.pData.activeQuest.target === "ANY") {
                this.pData.activeQuest.progress = (Number(this.pData.activeQuest.progress) || 0) + 1;
                if (this.pData.activeQuest.progress >= this.pData.activeQuest.goalAmount) {
                    this.pData.activeQuest.isCompleted = true;
                }
            }
        }

        // 5. CLEAN UP STATE
        this.monster = null;
        this.isBattleStarted = false;
        this.isBusy = false;
        
        // 6. SYNC AND REFRESH
        // We await the sync specifically so the database has the new level and XP
        // before we allow the UI to transition back to the home page.
        try {
            await this.sync();
            this.ui.update();
            this.ui.onVictory(this.pData); 
        } catch (error) {
            console.error("Critical Save Error:", error);
            this.ui.addLog("Save Failed! Re-try finding an enemy.", "var(--red)");
        }
    }
};