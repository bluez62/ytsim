// Game Core State Object
let gameData = {
    subscribers: 0,
    views: 0,
    money: 0.00,
    totalVideos: 0,
    currentTrend: "Gaming",
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

const prices = { mic: 50, camera: 200, software: 500 };
const availableCategories = ["Gaming", "Tech", "Vlog", "Comedy", "Education"];

// DOM Node References
const subsEl = document.getElementById('subs');
const viewsEl = document.getElementById('views');
const moneyEl = document.getElementById('money');
const videoCountEl = document.getElementById('video-count');
const logEl = document.getElementById('log');
const uploadBtn = document.getElementById('upload-btn');
const trendEl = document.getElementById('current-trend');
const commentsBox = document.getElementById('comments-box');

// Input Field DOM References
const titleInp = document.getElementById('video-title');
const categoryInp = document.getElementById('video-category');
const descInp = document.getElementById('video-desc');

// Comment components vocabulary arrays for procedural generation
const commentUsernames = ["AlphaGamer", "TechReviewer99", "Sarah_Vlogs", "CouchPotato", "StudyBuddy", "MemeLord", "NoobMaster", "QuantumThinker"];
const genericComments = {
    positive: ["Wow, great production quality!", "Subbed! Can't wait for the next video.", "This deserves way more views.", "Incredible video, keep it up!"],
    negative: ["Clickbait layout...", "The audio sounds a bit fuzzy.", "Unsubbing after this one.", "Meh, I've seen better videos on this."]
};
const categoryComments = {
    Gaming: ["Insane gameplay clutch right there!", "What platform are you playing on?", "Let's do a co-op stream sometime!"],
    Tech: ["Is this gear worth upgrading to?", "Great specs breakdown.", "My budget cannot afford this device right now."],
    Vlog: ["Your lifestyle setup looks so cozy!", "Thanks for sharing your day with us.", "Loved the background background music tracks."],
    Comedy: ["I literally burst out laughing at the end!", "Top tier comedic timing.", "This script layout is pure gold."],
    Education: ["Wow, I actually learned a lot from this essay.", "Clear explanations, thanks teacher!", "Mind-blowing perspective context."]
};

// --- LOCAL STORAGE LOGIC ---
function saveGame() {
    localStorage.setItem('youtubeSimulatorSavePro', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('youtubeSimulatorSavePro');
    if (savedData) {
        gameData = JSON.parse(savedData);
    } else {
        updateTrend(); // Pick an initial trend if no save file exists
    }
    updateUI();
    checkMilestonesVisuals();
}

function resetGame() {
    if(confirm("Are you sure you want to delete your entire channel progress?")) {
        localStorage.removeItem('youtubeSimulatorSavePro');
        location.reload();
    }
}

// --- DYNAMIC TREND SYSTEM ---
function updateTrend() {
    const currentIndex = availableCategories.indexOf(gameData.currentTrend);
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * availableCategories.length);
    } while (nextIndex === currentIndex); // Ensure the trend actually changes
    
    gameData.currentTrend = availableCategories[nextIndex];
}

// --- CORE ACTION LOGIC ---
function makeVideo() {
    const title = titleInp.value.trim();
    const category = categoryInp.value;
    const desc = descInp.value.trim();

    if (title === "" || desc === "") {
        alert("⚠️ You must fill out both the Title and Description before uploading your video!");
        return;
    }

    uploadBtn.disabled = true;
    
    // 1. BASE STAT CATEGORY SYSTEM MODIFIERS
    let baseViewsMin = 20, baseViewsMax = 80;
    let payPerView = 0.0025; // CPM rate base

    if (category === "Gaming") {
        baseViewsMin = 50; baseViewsMax = 120; // High reach volume
        payPerView = 0.001;                   // Low payout conversion
    } else if (category === "Tech") {
        baseViewsMin = 20; baseViewsMax = 60;
        payPerView = 0.006;                   // Premium tech advertiser ads
    } else if (category === "Comedy") {
        baseViewsMin = 10; baseViewsMax = 150; // Highly chaotic volatility
        payPerView = 0.002;
    } else if (category === "Education") {
        baseViewsMin = 5; baseViewsMax = 30;   // Niche baseline exposure
        payPerView = 0.008;                   // Maximum informational advertiser CPM
    }

    // 2. GEAR MULTIPLIERS
    let viewMultiplier = 1.0;
    if (gameData.upgrades.mic) viewMultiplier += 0.20;
    if (gameData.upgrades.camera) viewMultiplier += 0.50;

    // 3. AUDIENCE DEMAND / TREND VALUE MODIFIER
    if (category === gameData.currentTrend) {
        viewMultiplier += 1.50; // Huge 150% viewership boost if matching trend
    }

    // 4. METADATA CHARACTER EFFORT CHECK
    let effortBonus = 1.0;
    if (title.length > 15) effortBonus += 0.15;
    if (desc.length > 40) effortBonus += 0.25;

    // View core generator formulas
    const baseViews = Math.floor(Math.random() * (baseViewsMax - baseViewsMin + 1)) + baseViewsMin;
    const subInfluence = Math.floor(gameData.subscribers * 0.45);
    const newViews = Math.floor((baseViews + subInfluence) * viewMultiplier * effortBonus);
    
    // Sub conversion scales directly off total views generated
    const newSubs = Math.floor(Math.random() * (newViews * 0.12)); 
    const newMoney = (newViews * payPerView); 

    // Adjust state metrics
    gameData.views += newViews;
    gameData.subscribers += newSubs;
    gameData.money += newMoney;
    gameData.totalVideos += 1;

    addLog(`🚀 Uploaded: "<em>${title}</em>" (${category}). Views: +${newViews.toLocaleString()} | Earnings: +$${newMoney.toFixed(2)}`);
    
    // Generate AI Comments based on the data context
    generateComments(category, newViews);

    // Randomize trend every 3 uploads
    if (gameData.totalVideos % 3 === 0) {
        updateTrend();
        addLog(`📉 <strong>Algorithm Update:</strong> The audience interests have shifted!`);
    }

    titleInp.value = "";
    descInp.value = "";

    runChecksAndRefresh();
    setTimeout(() => { uploadBtn.disabled = false; }, 1500);
}

// --- NEW: PROCEDURAL COMMENTS GENERATION ---
function generateComments(category, viewsGenerated) {
    commentsBox.innerHTML = ""; // Clear last feed container contents
    
    // Determine number of comments based on performance tier
    let commentCount = 1;
    if (viewsGenerated > 50) commentCount = 2;
    if (viewsGenerated > 200) commentCount = 3;
    if (viewsGenerated > 1000) commentCount = 4;

    for (let i = 0; i < commentCount; i++) {
        const username = commentUsernames[Math.floor(Math.random() * commentUsernames.length)] + Math.floor(Math.random() * 99);
        
        // Randomly pick context text block from general pools or category arrays
        let textPool = [...categoryComments[category]];
        if (Math.random() > 0.5) {
            textPool = textPool.concat(gameData.upgrades.mic ? genericComments.positive : genericComments.negative);
        } else {
            textPool = textPool.concat(genericComments.positive);
        }

        const randomCommentText = textPool[Math.floor(Math.random() * textPool.length)];

        // Append to UI component container layout
        const commentDiv = document.createElement('div');
        commentDiv.className = "comment-item";
        commentDiv.innerHTML = `<span class="comment-user">@${username}:</span> <span class="comment-text">${randomCommentText}</span>`;
        commentsBox.appendChild(commentDiv);
    }
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
        alert("Insufficient funds!");
    }
}

// --- CHECKING & RENDER ENGINE ---
function runChecksAndRefresh() {
    checkMilestonesLogic();
    updateUI();
    saveGame();
}

function checkMilestonesLogic() {
    if (gameData.subscribers >= 100 && !gameData.milestones.m100) {
        gameData.milestones.m100 = true;
        gameData.money += 50;
        addLog("🎉 <strong>Milestone!</strong> Reached 100 subs! Earned a $50 cash bonus.");
    }
    if (gameData.subscribers >= 1000 && !gameData.milestones.m1000) {
        gameData.milestones.m1000 = true;
        gameData.money += 250;
        addLog("🎉 <strong>Milestone!</strong> Reached 1,000 subs! Partner Program unlocked ($250 bonus).");
    }
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

function updateUI() {
    subsEl.textContent = gameData.subscribers.toLocaleString();
    viewsEl.textContent = gameData.views.toLocaleString();
    moneyEl.textContent = gameData.money.toFixed(2);
    videoCountEl.textContent = gameData.totalVideos;
    trendEl.textContent = gameData.currentTrend;

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
        if (gameData.upgrades.software) passiveMultiplier += 1.0; 

        const passiveViews = Math.floor((Math.floor(gameData.subscribers * 0.04) + gameData.totalVideos) * passiveMultiplier);
        const passiveMoney = passiveViews * 0.0025;

        gameData.views += passiveViews;
        gameData.money += passiveMoney;

        updateUI();
        saveGame();
    }
}, 4000);

loadGame();
