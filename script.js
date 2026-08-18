// Game Core State Object
let gameData = {
    channelName: "",
    subscribers: 0,
    views: 0,
    money: 0.00,
    totalVideos: 0,
    currentTrend: "Gaming",
    upgrades: { mic: false, camera: false, software: false },
    milestones: { m100: false, m1000: false, m10000: false, m100000: false },
    
    // NEW: Analytics Category History Object counters
    statsHistory: {
        Gaming: 0,
        Tech: 0,
        Vlog: 0,
        Comedy: 0,
        Education: 0,
        trendVideos: 0 // Counter for matching the trend
    }
};

const prices = { mic: 50, camera: 200, software: 500 };
const availableCategories = ["Gaming", "Tech", "Vlog", "Comedy", "Education"];
let activeSponsorDeal = null;

// DOM Node References
const subsEl = document.getElementById('subs');
const viewsEl = document.getElementById('views');
const moneyEl = document.getElementById('money');
const videoCountEl = document.getElementById('video-count');
const logEl = document.getElementById('log');
const uploadBtn = document.getElementById('upload-btn');
const trendEl = document.getElementById('current-trend');
const commentsBox = document.getElementById('comments-box');
const nameModal = document.getElementById('name-modal');
const channelDisplay = document.getElementById('channel-display');
const sponsorBox = document.getElementById('sponsor-box');
const sponsorText = document.getElementById('sponsor-text');

// Input Field DOM References
const titleInp = document.getElementById('video-title');
const categoryInp = document.getElementById('video-category');
const descInp = document.getElementById('video-desc');
const nameInp = document.getElementById('channel-name-input');

// Comment vocabularies
const commentUsernames = ["AlphaGamer", "TechReviewer99", "Sarah_Vlogs", "CouchPotato", "StudyBuddy", "MemeLord", "NoobMaster", "QuantumThinker"];
const genericComments = {
    positive: ["Wow, great production quality!", "Subbed! Can't wait for the next video.", "This deserves way more views.", "Incredible video, keep it up!"],
    negative: ["Clickbait layout...", "The audio sounds a bit fuzzy.", "Unsubbing after this one.", "Meh, I've seen better videos on this."]
};
const categoryComments = {
    Gaming: ["Insane gameplay clutch right there!", "What platform are you playing on?", "Let's do a co-op stream sometime!"],
    Tech: ["Is this gear worth upgrading to?", "Great specs breakdown.", "My budget cannot afford this device right now."],
    Vlog: ["Your lifestyle setup looks so cozy!", "Thanks for sharing your day with us.", "Loved the background music tracks."],
    Comedy: ["I literally burst out laughing at the end!", "Top tier comedic timing.", "This script layout is pure gold."],
    Education: ["Wow, I actually learned a lot from this essay.", "Clear explanations, thanks teacher!", "Mind-blowing perspective context."]
};

// NEW: Dynamic Dashboard Tab Controller Switch Function
function switchTab(targetTab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`panel-${targetTab}`).classList.remove('hidden');
    document.getElementById(`tab-${targetTab}`).classList.add('active');
    
    if(targetTab === 'analytics') {
        updateAnalyticsScreen(); // Recalculate statistics values on tab view
    }
}

function submitChannelName() {
    const textValue = nameInp.value.trim();
    if(textValue === "") { alert("Please enter a valid channel name!"); return; }
    gameData.channelName = "@" + textValue;
    nameModal.classList.add('hidden');
    runChecksAndRefresh();
    addLog(`✨ Welcome to YouTube! Your channel <strong>${gameData.channelName}</strong> has been created.`);
}

function saveGame() {
    localStorage.setItem('youtubeSimulatorSaveUltimate', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('youtubeSimulatorSaveUltimate');
    if (savedData) {
        gameData = JSON.parse(savedData);
        // Safety check for legacy saves missing the new analytics object keys
        if(!gameData.statsHistory) {
            gameData.statsHistory = { Gaming: 0, Tech: 0, Vlog: 0, Comedy: 0, Education: 0, trendVideos: 0 };
        }
        if(gameData.channelName) { nameModal.classList.add('hidden'); }
    } else { updateTrend(); }
    updateUI();
    checkMilestonesVisuals();
}

function resetGame() {
    if (confirm("Are you sure you want to delete your entire channel progress?")) {
        localStorage.removeItem('youtubeSimulatorSaveUltimate');
        location.reload();
    }
}

function updateTrend() {
    const currentIndex = availableCategories.indexOf(gameData.currentTrend);
    let nextIndex;
    do { nextIndex = Math.floor(Math.random() * availableCategories.length); } while (nextIndex === currentIndex);
    gameData.currentTrend = availableCategories[nextIndex];
}

function rollForSponsorOffer() {
    if(gameData.subscribers < 500 || !sponsorBox.classList.contains('hidden')) return;
    if(Math.random() < 0.25) {
        const brandNames = ["Raid: Shadow Gear", "ExpressVPN-ish", "Nordic Wallet", "SquareSpace-Out"];
        const chosenBrand = brandNames[Math.floor(Math.random() * brandNames.length)];
        const payoutOffer = Math.floor(gameData.subscribers * 0.15) + 50;
        activeSponsorDeal = { brand: chosenBrand, reward: payoutOffer };
        sponsorText.innerHTML = `<strong>${chosenBrand}</strong> offers you <strong>$${payoutOffer}</strong> to sponsor your next video.`;
        sponsorBox.classList.remove('hidden');
    }
}

function acceptSponsor() {
    if(!activeSponsorDeal) return;
    addLog(`🤝 Contract signed! Your upcoming video will be sponsored by <strong>${activeSponsorDeal.brand}</strong>.`);
    sponsorBox.classList.add('hidden');
}

function declineSponsor() { activeSponsorDeal = null; sponsorBox.classList.add('hidden'); }
function makeVideo() {
    const title = titleInp.value.trim();
    const category = categoryInp.value;
    const desc = descInp.value.trim();

    if (title === "" || desc === "") {
        alert("⚠️ You must fill out both the Title and Description before uploading your video!");
        return;
    }

    uploadBtn.disabled = true;
    
    let baseViewsMin = 20, baseViewsMax = 80;
    let payPerView = 0.0025; 

    if (category === "Gaming") { baseViewsMin = 50; baseViewsMax = 120; payPerView = 0.001; } 
    else if (category === "Tech") { baseViewsMin = 20; baseViewsMax = 60; payPerView = 0.006; } 
    else if (category === "Comedy") { baseViewsMin = 10; baseViewsMax = 150; payPerView = 0.002; } 
    else if (category === "Education") { baseViewsMin = 5; baseViewsMax = 30; payPerView = 0.008; }

    let viewMultiplier = 1.0;
    if (gameData.upgrades.mic) viewMultiplier += 0.20;
    if (gameData.upgrades.camera) viewMultiplier += 0.50;

    // Audience Demand / Trend Check
    if (category === gameData.currentTrend) { 
        viewMultiplier += 1.50; 
        gameData.statsHistory.trendVideos += 1; // Increment history metric
    }

    let effortBonus = 1.0;
    if (title.length > 15) effortBonus += 0.15;
    if (desc.length > 40) effortBonus += 0.25;

    const baseViews = Math.floor(Math.random() * (baseViewsMax - baseViewsMin + 1)) + baseViewsMin;
    const subInfluence = Math.floor(gameData.subscribers * 0.45);
    let newViews = Math.floor((baseViews + subInfluence) * viewMultiplier * effortBonus);
    
    let sponsorPayoutBonus = 0;
    if(activeSponsorDeal) {
        sponsorPayoutBonus = activeSponsorDeal.reward;
        newViews = Math.floor(newViews * 0.85); 
        addLog(`💰 Sponsor Payout! <strong>${activeSponsorDeal.brand}</strong> wired you $${sponsorPayoutBonus}!`);
    }

    const newSubs = Math.floor(Math.random() * (newViews * 0.12)); 
    const newMoney = (newViews * payPerView) + sponsorPayoutBonus; 

    // Increments Analytics Category History
    gameData.statsHistory[category] += 1;

    gameData.views += newViews;
    gameData.subscribers += newSubs;
    gameData.money += newMoney;
    gameData.totalVideos += 1;

    let logMessage = `🚀 Uploaded: "<em>${title}</em>" (${category}). Views: +${newViews.toLocaleString()}`;
    if (activeSponsorDeal) logMessage += ` (Sponsored by ${activeSponsorDeal.brand})`;
    addLog(logMessage);
    
    generateComments(category, newViews);
    activeSponsorDeal = null;
    rollForSponsorOffer();

    if (gameData.totalVideos % 3 === 0) {
        updateTrend();
        addLog(`📉 <strong>Algorithm Update:</strong> The audience interests have shifted!`);
    }

    titleInp.value = "";
    descInp.value = "";

    runChecksAndRefresh();
    setTimeout(() => { uploadBtn.disabled = false; }, 1500);
}

// NEW: Analytics Math Renderer Processing Engine
function updateAnalyticsScreen() {
    // 1. Calculate Estimated RPM / Growth values
    const passiveBaseRate = gameData.totalVideos > 0 ? (gameData.subscribers * 0.04) + gameData.totalVideos : 0;
    const passiveMultiplier = gameData.upgrades.software ? 2.0 : 1.0;
    const estimatedViewsPerLoop = Math.floor(passiveBaseRate * passiveMultiplier);
    
    // Convert 4-second game ticks into hypothetical "Monthly Payouts"
    const estimatedMonthlyEarnings = estimatedViewsPerLoop * 0.0025 * 30; 
    document.getElementById('analytics-rpm').textContent = estimatedMonthlyEarnings.toFixed(2);

    // 2. Generate an effort Click-Through-Rate percentage
    const baseCTR = gameData.upgrades.camera ? 7.4 : 4.2;
    const randomVariance = (Math.random() * 2.5);
    document.getElementById('analytics-ctr').textContent = (baseCTR + randomVariance).toFixed(1);

    // 3. Render Graph Progress Bars based on upload distributions
    const totalCount = gameData.totalVideos || 1; 
    availableCategories.forEach(cat => {
        const count = gameData.statsHistory[cat] || 0;
        const percentage = Math.min(100, Math.floor((count / totalCount) * 100));
        
        document.getElementById(`count-${cat.toLowerCase()}`).textContent = count;
        document.getElementById(`bar-${cat.toLowerCase()}`).style.width = `${percentage}%`;
    });

    // 4. Calculate Audience retention distributions percentages
    const trendUploads = gameData.statsHistory.trendVideos || 0;
    const trendPercentage = Math.min(100, Math.floor((trendUploads / totalCount) * 100));
    const organicPercentage = 100 - trendPercentage;

    document.getElementById('demo-organic').textContent = `${organicPercentage}%`;
    document.getElementById('demo-trend').textContent = `${trendPercentage}%`;
}

function generateComments(category, viewsGenerated) {
    commentsBox.innerHTML = ""; 
    let commentCount = 1;
    if (viewsGenerated > 50) commentCount = 2;
    if (viewsGenerated > 200) commentCount = 3;
    if (viewsGenerated > 1000) commentCount = 4;

    for (let i = 0; i < commentCount; i++) {
        const username = commentUsernames[Math.floor(Math.random() * commentUsernames.length)] + Math.floor(Math.random() * 99);
        let textPool = [...categoryComments[category]];
        if (Math.random() > 0.5) {
            textPool = textPool.concat(gameData.upgrades.mic ? genericComments.positive : genericComments.negative);
        } else {
            textPool = textPool.concat(genericComments.positive);
        }
        const randomCommentText = textPool[Math.floor(Math.random() * textPool.length)];

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
    } else { alert("Insufficient funds!"); }
}

function runChecksAndRefresh() {
    checkMilestonesLogic();
    updateUI();
    saveGame();
}

function checkMilestonesLogic() {
    if (gameData.subscribers >= 100 && !gameData.milestones.m100) {
        gameData.milestones.m100 = true; gameData.money += 50;
        addLog("🎉 <strong>Milestone!</strong> Reached 100 subs! Earned a $50 cash bonus.");
    }
    if (gameData.subscribers >= 1000 && !gameData.milestones.m1000) {
        gameData.milestones.m1000 = true; gameData.money += 250;
        addLog("🎉 <strong>Milestone!</strong> Reached 1,000 subs! Partner Program unlocked ($250 bonus).");
    }
    if (gameData.subscribers >= 10000 && !gameData.milestones.m10000) {
        gameData.milestones.m10000 = true; gameData.money += 1000;
        addLog("🎉 <strong>Milestone!</strong> Reached 10,000 subs! Received the Silver Play Button ($1,000 bonus).");
    }
    if (gameData.subscribers >= 100000 && !gameData.milestones.m100000) {
        gameData.milestones.m100000 = true;
        addLog("🎉 <strong>Milestone!</strong> Reached 100,000 subs! Your channel is now officially verified!");
    }
    checkMilestonesVisuals();
}

function checkMilestonesVisuals() {
    if (gameData.milestones.m100) updateBadge('m-100', '✅ 100 Subs: Unlocked +$50');
    if (gameData.milestones.m1000) updateBadge('m-1000', '✅ 1,000 Subs: Unlocked +$250');
    if (gameData.milestones.m10000) updateBadge('m-10000', '✅ 10,000 Subs: Silver Play Button');
    if (gameData.milestones.m100000) updateBadge('m-100000', '✅ 100,000 Subs: Verified Creator');
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

    if(gameData.channelName) {
        let badgeHTML = gameData.channelName;
        if(gameData.milestones.m100000) {
            badgeHTML += ` <span class="verified-badge" title="Verified Channel">✓</span>`;
        }
        channelDisplay.innerHTML = badgeHTML;
    } else {
        channelDisplay.textContent = "YouTube Simulator";
    }

    updateShopButton('mic');
    updateShopButton('camera');
    updateShopButton('software');
}

function updateShopButton(item) {
    const btn = document.getElementById(`shop-${item}`);
    if (gameData.upgrades[item]) {
        btn.textContent = "Owned"; btn.disabled = true;
    } else {
        btn.textContent = `Buy ($${prices[item]})`; btn.disabled = false;
    }
}

function addLog(message) {
    const p = document.createElement('p');
    p.innerHTML = message;
    logEl.insertBefore(p, logEl.firstChild);
}

// Passive Algorithm Loop Engine
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
        
        // Dynamic Update if looking at the Analytics view
        const analyticsPanel = document.getElementById('panel-analytics');
        if(analyticsPanel && !analyticsPanel.classList.contains('hidden')) {
            updateAnalyticsScreen();
        }
    }
}, 4000);

loadGame();
