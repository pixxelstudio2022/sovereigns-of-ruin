// Godmode.js - Divine Authority Over Sovereigns of Ruin
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { SYSTEM_CONFIG } from "./system.js";
import { MONSTER_DATABASE } from "./monsters.js"; // Import DB to populate spawner
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
            this.populateMonsterList(); // Fill the dropdown
            this.clicks = 0;
        }
    },

    // New: Populates the dropdown with monsters from the current zone
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

        // NEW: Monster Spawner Logic
        document.getElementById('godSpawnBtn').onclick = () => {
            const monsterId = document.getElementById('godMonsterSelect').value;
            if (!monsterId) return;

            const monsterData = MONSTER_DATABASE["THRESHOLD_OF_SOULS"][monsterId];
            if (monsterData) {
                // Manually inject the monster into the engine
                if (CombatEngine.ui.clearLog) CombatEngine.ui.clearLog();
                CombatEngine.monster = JSON.parse(JSON.stringify(monsterData));
                CombatEngine.monster.curHp = monsterData.hp;
                CombatEngine.ui.addLog(`[DIVINE SPAWN] ${monsterData.name} summoned!`, "var(--gold)");
                CombatEngine.ui.update();
                document.getElementById('godMenu').style.display = 'none';
            }
        };

        // INSTANT RESTORE
        document.getElementById('godHeal').onclick = async () => {
            this.player.stats.hp = this.player.stats.maxHp;
            this.player.stats.mana = this.player.stats.maxMana;
            await this.sync();
        };

        // LEVEL UP
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

        // LEVEL DOWN
        document.getElementById('godLevelDown').onclick = async () => {
            if (this.player.level <= 1) return;
            this.player.level--;
            this.player.exp = 0;
            this.player.stats.maxHp -= SYSTEM_CONFIG.HP_PER_LVL;
            this.player.stats.maxMana -= SYSTEM_CONFIG.MP_PER_LVL;
            this.player.stats.atk -= SYSTEM_CONFIG.ATK_PER_LVL;
            this.player.stats.def -= SYSTEM_CONFIG.DEF_PER_LVL;
            this.player.stats.hp = this.player.stats.maxHp;
            this.player.stats.mana = this.player.stats.maxMana;
            await this.sync();
        };

        // GOLD +5K
        document.getElementById('godAddGold').onclick = async () => {
            this.player.gold = (Number(this.player.gold) || 0) + 5000;
            await this.sync();
        };

        // GOLD -5K
        document.getElementById('godSubGold').onclick = async () => {
            this.player.gold = Math.max(0, (Number(this.player.gold) || 0) - 5000);
            await this.sync();
        };

        // HARD RESET
        document.getElementById('godHardReset').onclick = async () => {
            if(!confirm("PERMANENT HARD RESET?")) return;
            this.player.level = 1;
            this.player.exp = 0;
            this.player.gold = 100;
            this.player.inventory = [];
            this.player.gear = { weapon: null, armor: null, accessory: null };
            this.player.stats = {
                hp: 100, maxHp: 100,
                mana: 50, maxMana: 50,
                atk: 10, def: 10, luck: 5
            };
            await this.sync();
            location.reload(); 
        };
    }
};