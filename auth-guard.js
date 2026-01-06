// auth-guard.js
import { onSnapshot, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export async function initSecurity(db, auth, user) {
    const playerRef = doc(db, "players", user.uid);
    const sessionStartTime = Date.now();

    // 1. INITIAL FETCH
    const docSnap = await getDoc(playerRef);
    if (!docSnap.exists()) {
        window.location.href = "index.html";
        return null;
    }

    let pData = docSnap.data();

    // REMOVED THE HP <= 0 AUTO-HEAL 
    // Players must handle death via death.html specifically.

    if (pData.element) {
        document.body.className = `theme-${pData.element}`;
    }

    // 2. REAL-TIME WATCHDOG
    onSnapshot(playerRef, async (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        
        // --- SESSION SECURITY ---
        const localSessionId = localStorage.getItem('currentSessionId');
        if (Date.now() - sessionStartTime > 10000) { 
            if (data.activeSessionId && data.activeSessionId !== localSessionId) {
                alert("Session expired.");
                signOut(auth).then(() => { window.location.href = "index.html"; });
                return;
            }
        }

        // --- LEVEL UP (STRICT) ---
        const xpNeeded = (data.level + 1) * 100;
        if (data.xp >= xpNeeded && data.level < 100) {
            await updateDoc(playerRef, {
                level: increment(1),
                xp: 0, 
                "stats.maxHp": increment(50),  
                "stats.maxMana": increment(20)
            });
            showNotification(`LEVEL UP! Now Level ${data.level + 1}`);
        }

        // --- TRAINING MONITOR ---
        if (data.trainingUntil && Date.now() >= data.trainingUntil) {
            const stat = data.trainingStat; 
            const boost = stat === "maxHp" ? 20 : 10;
            
            await updateDoc(playerRef, {
                [`stats.${stat}`]: increment(boost),
                trainingUntil: null, 
                trainingStat: null,
                [`trainingLevels.${stat}`]: increment(1)
            });
            showNotification(`TRAINING COMPLETE!`);
        }
    });

    return pData;
}

function showNotification(text) {
    let note = document.getElementById('global-notify');
    if (!note) {
        note = document.createElement('div');
        note.id = 'global-notify';
        note.style = `position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); color:#fff; padding:12px; border:1px solid #62ffe1; z-index:10001; font-size:0.7rem; border-radius:4px; pointer-events:none;`;
        document.body.appendChild(note);
    }
    note.innerText = text;
    note.style.display = "block";
    setTimeout(() => { note.style.display = "none"; }, 5000);
}