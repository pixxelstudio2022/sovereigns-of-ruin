// Godmode.js - Divine Authority Over Sovereigns of Ruin
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { SYSTEM_CONFIG } from "./system.js";
import { MONSTER_DATABASE } from "./monsters.js"; 
import { CombatEngine } from "./battle.js";

export const GodMode = {
    clicks: 0,
    isAdmin: false,
    adminUID: "v6M5KflMjQam6M9LUeZym666fKw1", 

    init(player, db, auth) {
        this.player = player;
        this.db = db;
        this.auth = auth;
        this.setupEventListeners();
    },

    handleTrigger() {
        if (this.auth.currentUser?.uid !== this.adminUID) return;
        
        this.clicks++;
        if (this.clicks >= 5) {
            document.getElementById('godMenu').style.display = 'block';
            this.refreshDisplay();
            this.populateMonsterList(); 
            this.clicks = 0;
        }
    },

    populateMonsterList() {
        const select = document.getElementById('godMonsterSelect');
        if (!select) return;
        select.innerHTML = '<option value="">-- Select Monster --</option>';
        
        const zoneMonsters = MONSTER_DATABASE["THRESHOLD_OF_SOULS"];
        Object.values(zoneMonsters).forEach(m => {
            select.innerHTML += `<option value="${m.id}">${m.name} (Lvl ${m.level})</option>`;
        });
    },

    async sync() {
        await updateDoc(doc(this.db, "players", this.auth.currentUser.uid), this.player);
        this.refreshDisplay();
    },

    refreshDisplay() {
        const display = document.getElementById('godStatsDisplay');
        if (!display || !this.player) return;
        display.innerHTML = `
            <div style="font-size:0.7rem; color:#888">UID: ${this.auth.currentUser.uid}</div>
            <div style="display:flex; justify-content:space-between; margin-top:5px; font-weight:bold;">
                <span>LVL: ${this.player.level}</span>
                <span style="color:var(--gold)">GOLD: ${this.player.gold}</span>
            </div>
        `;
    },

    setupEventListeners() {
        document.getElementById('closeGod').onclick = () => {
            document.getElementById('godMenu').style.display = 'none';
        };

        document.getElementById('godSpawnBtn').onclick = () => {
            const monsterId = document.getElementById('godMonsterSelect').value;
            if (!monsterId) return;

            const monsterData = MONSTER_DATABASE["THRESHOLD_OF_SOULS"][monsterId];
            if (monsterData) {
                if (CombatEngine.ui.clearLog) CombatEngine.ui.clearLog();
                CombatEngine.monster = JSON.parse(JSON.stringify(monsterData));
                CombatEngine.monster.curHp = monsterData.hp;
                CombatEngine.ui.addLog(`[DIVINE SPAWN] ${monsterData.name} summoned!`, "var(--gold)");
                CombatEngine.ui.update();
                document.getElementById('godMenu').style.display = 'none';
            }
        };

        document.getElementById('godHeal').onclick = async () => {
            this.player.stats.hp = this.player.stats.maxHp;
            this.player.stats.mana = this.player.stats.maxMana;
            await this.sync();
        };

        document.getElementById('godLevelUp').onclick = async () => {
            this.player.level++;
            this.player.exp = 0;
            this.player.stats.maxHp += SYSTEM_CONFIG.HP_PER_LVL;
            this.player.stats.maxMana += SYSTEM_CONFIG.MP_PER_LVL;
            this.player.stats.atk += SYSTEM_CONFIG.ATK_PER_LVL;
            this.player.stats.def += SYSTEM_CONFIG.DEF_PER_LVL;
            this.player.stats.hp = this.player.stats.maxHp;
            this.player.stats.mana = this.player.stats.maxMana;
            await this.sync();
        };

        document.getElementById('godAddGold').onclick = async () => {
            this.player.gold = (Number(this.player.gold) || 0) + 5000;
            await this.sync();
        };

        document.getElementById('godSubGold').onclick = async () => {
            this.player.gold = Math.max(0, (Number(this.player.gold) || 0) - 5000);
            await this.sync();
        };

        // --- NUCLEAR HARD RESET (Self) ---
        document.getElementById('godHardReset').onclick = async () => {
            if(!confirm("PERMANENT HARD RESET? This wipes everything except your Origin.")) return;
            this.wipeData(this.player);
            await this.sync();
            location.reload(); 
        };

        // --- TARGETED PLAYER WIPE ---
        document.getElementById('godResetTargetBtn').onclick = async () => {
            const targetUID = document.getElementById('godTargetUID').value.trim();
            if (!targetUID) return alert("Enter Target UID");
            if (targetUID === this.auth.currentUser.uid) return alert("Use standard Reset for yourself.");
            
            if(!confirm(`PERMANENTLY WIPE PLAYER ${targetUID}?`)) return;

            const freshData = {
                level: 1,
                exp: 0,
                gold: 100,
                inventory: [],
                gear: { weapon: null, armor: null, accessory: null },
                stats: { hp: 100, maxHp: 100, mana: 50, maxMana: 50, atk: 10, def: 10, luck: 5 },
                completedQuests: [],
                activeQuest: null,
                dailyGoldCount: 0,
                training: { str: 0, agi: 0, int: 0 },
                trainingLevels: { maxHp: 0, maxMana: 0 },
                trainingStat: null,
                trainingUntil: null,
                trainingTotalTime: 0
            };

            try {
                await updateDoc(doc(this.db, "players", targetUID), freshData);
                alert("Target successfully wiped to Level 1.");
            } catch (e) {
                alert("Error: UID not found or Permission Denied.");
            }
        };
    },

    // Helper to keep reset logic consistent
    wipeData(p) {
        p.level = 1; p.exp = 0; p.gold = 100;
        p.inventory = [];
        p.gear = { weapon: null, armor: null, accessory: null };
        p.stats = { hp: 100, maxHp: 100, mana: 50, maxMana: 50, atk: 10, def: 10, luck: 5 };
        p.completedQuests = []; p.activeQuest = null; p.dailyGoldCount = 0;
        p.training = { str: 0, agi: 0, int: 0 };
        p.trainingLevels = { maxHp: 0, maxMana: 0 };
        p.trainingStat = null; p.trainingUntil = null; p.trainingTotalTime = 0;
    }
};