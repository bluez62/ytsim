// Mock Database
const videoDatabase = [
    {
        id: 1,
        title: "Elephant Dream",
        url: "https://w3schools.com",
        likes: 89,
        views: "1.2K views"
    },
    {
        id: 2,
        title: "Big Buck Bunny",
        url: "https://w3schools.com",
        likes: 124,
        views: "5.4K views"
    }
];

const videoPlayer = document.getElementById("main-video");
const videoTitle = document.getElementById("video-title");
const likeCount = document.getElementById("like-count");
const likeBtn = document.getElementById("like-btn");
const subBtn = document.getElementById("sub-btn");
const feedContainer = document.getElementById("video-feed");

// Load Sidebar Videos
function loadFeed() {
    feedContainer.innerHTML = "";
    videoDatabase.forEach(video => {
        const card = document.createElement("div");
        card.className = "thumbnail-card";
        card.innerHTML = `
            <img src="" alt="Thumb">
            <div>
                <h4>${video.title}</h4>
                <p style="font-size:12px; color:#aaa;">${video.views}</p>
            </div>
        `;
        card.addEventListener("click", () => playVideo(video));
        feedContainer.appendChild(card);
    });
}

// Change Video Player Source
function playVideo(video) {
    videoPlayer.src = video.url;
    videoTitle.innerText = video.title;
    likeCount.innerText = video.likes;
    videoPlayer.play();
}

// Interactive Elements
likeBtn.addEventListener("click", () => {
    let currentLikes = parseInt(likeCount.innerText);
    likeCount.innerText = currentLikes + 1;
});

subBtn.addEventListener("click", () => {
    subBtn.innerText = subBtn.innerText === "Subscribe" ? "Subscribed" : "Subscribe";
    subBtn.style.backgroundColor = subBtn.innerText === "Subscribed" ? "#383838" : "#cc0000";
});

// Initialize
loadFeed();
