// auth-guard.js
import { onSnapshot, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * Initializes security, session checks, and real-time game logic.
 * @returns {Promise<Object>} The player's data object.
 */
export async function initSecurity(db, auth, user) {
    const playerRef = doc(db, "players", user.uid);

    // 1. Initial Load & Theme Application
    const docSnap = await getDoc(playerRef);
    let playerData = null;

    if (docSnap.exists()) {
        playerData = docSnap.data();
        
        // Apply Element Class (e.g., "Fire", "Shadow") to body for CSS variables
        // This makes var(--accent) work immediately in chat.html
        if (playerData.element) {
            document.body.className = playerData.element;
        }
    } else {
        // Safety: If no player record exists, go to selection/index
        window.location.href = "index.html";
        return null;
    }

    // 2. Real-Time Watchdog (Session, Training, and Leveling)
    onSnapshot(playerRef, async (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            
            // --- SESSION CHECK (Anti-Hijack) ---
            const localSessionId = localStorage.getItem('currentSessionId');
            if (data.activeSessionId && data.activeSessionId !== localSessionId) {
                alert("Session expired. Account logged in elsewhere.");
                signOut(auth).then(() => {
                    window.location.href = "index.html";
                });
                return;
            }

            // --- AUTOMATIC LEVEL-UP SYSTEM ---
            const xpNeeded = (data.level + 1) * 100;
            if (data.xp >= xpNeeded && data.level < 100) {
                try {
                    const nextLevel = data.level + 1;
                    await updateDoc(playerRef, {
                        level: increment(1),
                        xp: 0, 
                        "stats.maxHp": increment(50),  
                        "stats.maxMana": increment(20),
                        "stats.hp": increment(50),
                        "stats.mana": increment(20)
                    });
                    showNotification(`LEVEL UP! You are now Level ${nextLevel}.`);
                } catch (e) {
                    console.error("Level up failed:", e);
                }
            }

            // --- BACKGROUND TRAINING MONITOR ---
            if (data.trainingUntil && Date.now() >= data.trainingUntil) {
                const statToBoost = data.trainingStat; 
                const boostAmount = statToBoost === "maxHp" ? 20 : 10;
                const newStatLevel = (data.trainingLevels?.[statToBoost] || 0) + 1;

                try {
                    await updateDoc(playerRef, {
                        [`stats.${statToBoost}`]: increment(boostAmount),
                        [`stats.${statToBoost === 'maxHp' ? 'hp' : 'mana'}`]: increment(boostAmount),
                        [`trainingLevels.${statToBoost}`]: increment(1),
                        trainingUntil: null, 
                        trainingStat: null,
                        trainingTotalTime: null
                    });
                    showNotification(`TRAINING COMPLETE: ${statToBoost.toUpperCase()} reached Level ${newStatLevel}!`);
                } catch (error) {
                    console.error("Failed to finalize training:", error);
                }
            }
        }
    });

    // CRITICAL: Return the data so Chat.html's "myProfile" variable is populated.
    return playerData;
}

/**
 * Creates and shows a temporary on-screen notification
 */
function showNotification(text) {
    let note = document.getElementById('global-notify');
    if (!note) {
        note = document.createElement('div');
        note.id = 'global-notify';
        note.style = `
            position: fixed; 
            top: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            background: rgba(0, 0, 0, 0.9); 
            color: #fff; 
            padding: 12px 24px; 
            border: 1px solid var(--accent, #62ffe1); 
            z-index: 10001; 
            font-size: 0.7rem; 
            border-radius: 4px; 
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            pointer-events: none;
        `;
        document.body.appendChild(note);
    }

    note.innerText = text;
    note.style.display = "block";

    setTimeout(() => {
        note.style.display = "none";
    }, 5000);
}