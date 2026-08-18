// Game Core State Object
let gameData = {
    subscribers: 0,
    views: 0,
    money: 0.00,
    totalVideos: 0,
    upgrades: {
        mic: false,
        camera: false,
        software: false
    },
    milestones: {
        m100: false,
        m1000: false,
        m10000: false
    }
};

// Upgrade pricing definitions
const prices = {
    mic: 50,
    camera: 200,
    software: 500
};

// DOM Node References
const subsEl = document.getElementById('subs');
const viewsEl = document.getElementById('views');
const moneyEl = document.getElementById('money');
const videoCountEl = document.getElementById('video-count');
const logEl = document.getElementById('log');
const uploadBtn = document.getElementById('upload-btn');

const topics = ["Tech Unboxing", "Spicy Noodle Challenge", "Day in the Life Vlog", "Speedrun Record", "Deep Fried Recipes"];

// --- 1. LOCAL STORAGE: SAVE & LOAD LOGIC ---
function saveGame() {
    localStorage.setItem('youtubeSimulatorSave', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('youtubeSimulatorSave');
    if (savedData) {
        gameData = JSON.parse(savedData);
        updateUI();
        checkMilestonesVisuals();
    }
}

function resetGame() {
    if(confirm("Are you sure you want to delete your entire channel progress?")) {
        localStorage.removeItem('youtubeSimulatorSave');
        location.reload();
    }
}

// --- 2. GAME ACTION LOGIC ---
function makeVideo() {
    uploadBtn.disabled = true;
    
    // Calculate Multipliers based on bought items
    let viewMultiplier = 1.0;
    if (gameData.upgrades.mic) viewMultiplier += 0.20;
    if (gameData.upgrades.camera) viewMultiplier += 0.50;

    // View generation math formula
    const baseViews = Math.floor(Math.random() * 80) + 20;
    const subInfluence = Math.floor(gameData.subscribers * 0.4);
    const newViews = Math.floor((baseViews + subInfluence) * viewMultiplier);
    
    // Conversions
    const newSubs = Math.floor(Math.random() * (newViews * 0.12)); 
    const newMoney = (newViews * 0.0025); 

    // Update global variables
    gameData.views += newViews;
    gameData.subscribers += newSubs;
    gameData.money += newMoney;
    gameData.totalVideos += 1;

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    addLog(`🎬 Posted <strong>${randomTopic}</strong>! Got +${newViews.toLocaleString()} views, +${newSubs.toLocaleString()} subs.`);
    
    runChecksAndRefresh();

    // 1.2 Second Cooldown time
    setTimeout(() => { uploadBtn.disabled = false; }, 1200);
}

function buyUpgrade(item) {
    const cost = prices[item];
    
    if (gameData.money >= cost && !gameData.upgrades[item]) {
        gameData.money -= cost;
        gameData.upgrades[item] = true;
        addLog(`🛍️ Purchased Upgrade: <strong>${item.toUpperCase()}</strong>!`);
        runChecksAndRefresh();
    } else if (gameData.upgrades[item]) {
        alert("You already own this upgrade item!");
    } else {
        alert("Insufficient funds in your developer account!");
    }
}

// --- 3. CHECKING SYSTEM ---
function runChecksAndRefresh() {
    checkMilestonesLogic();
    updateUI();
    saveGame(); // Auto-save on every vital change
}

function checkMilestonesLogic() {
    // 100 Subscribers milestone check
    if (gameData.subscribers >= 100 && !gameData.milestones.m100) {
        gameData.milestones.m100 = true;
        gameData.money += 50; // Cash bonus award
        addLog("🎉 <strong>Milestone!</strong> Reached 100 subs! Earned a $50 cash bonus.");
    }
    // 1,000 Subscribers milestone check
    if (gameData.subscribers >= 1000 && !gameData.milestones.m1000) {
        gameData.milestones.m1000 = true;
        gameData.money += 250;
        addLog("🎉 <strong>Milestone!</strong> Reached 1,000 subs! Partner Program unlocked ($250 bonus).");
    }
    // 10,000 Subscribers milestone check
    if (gameData.subscribers >= 10000 && !gameData.milestones.m10000) {
        gameData.milestones.m10000 = true;
        gameData.money += 1000;
        addLog("🎉 <strong>Milestone!</strong> Reached 10,000 subs! Received the Silver Play Button ($1,000 bonus).");
    }
    checkMilestonesVisuals();
}

function checkMilestonesVisuals() {
    if (gameData.milestones.m100) updateBadge('m-100', '✅ 100 Subs: Unlocked +$50');
    if (gameData.milestones.m1000) updateBadge('m-1000', '✅ 1,000 Subs: Unlocked +$250');
    if (gameData.milestones.m10000) updateBadge('m-10000', '✅ 10,000 Subs: Silver Play Button');
}

function updateBadge(id, text) {
    const el = document.getElementById(id);
    el.className = "milestone-badge unlocked";
    el.textContent = text;
}

// --- 4. RENDER & ENGINE LOOPS ---
function updateUI() {
    subsEl.textContent = gameData.subscribers.toLocaleString();
    viewsEl.textContent = gameData.views.toLocaleString();
    moneyEl.textContent = gameData.money.toFixed(2);
    videoCountEl.textContent = gameData.totalVideos;

    // Toggle button shop disabled flags if bought or un-affordable
    updateShopButton('mic');
    updateShopButton('camera');
    updateShopButton('software');
}

function updateShopButton(item) {
    const btn = document.getElementById(`shop-${item}`);
    if (gameData.upgrades[item]) {
        btn.textContent = "Owned";
        btn.disabled = true;
    } else {
        btn.textContent = `Buy ($${prices[item]})`;
        btn.disabled = false;
    }
}

function addLog(message) {
    const p = document.createElement('p');
    p.innerHTML = message;
    logEl.insertBefore(p, logEl.firstChild);
}

// Passive Algorithm Loop Engine (Runs every 4 seconds)
setInterval(() => {
    if (gameData.totalVideos > 0) {
        let passiveMultiplier = 1.0;
        if (gameData.upgrades.software) passiveMultiplier += 1.0; // doubles algorithm views

        const passiveViews = Math.floor((Math.floor(gameData.subscribers * 0.04) + gameData.totalVideos) * passiveMultiplier);
        const passiveMoney = passiveViews * 0.0025;

        gameData.views += passiveViews;
        gameData.money += passiveMoney;

        updateUI();
        saveGame(); // Automated background saving
    }
}, 4000);

// Run on page launch startup
loadGame();
